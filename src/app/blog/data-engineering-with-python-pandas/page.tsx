import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Engineering with Python and Pandas: Production Patterns | Ryan Kirsch",
  description:
    "Pandas patterns for production data pipelines: memory optimization, chunked processing, method chaining, vectorization vs. apply, type management, and when to reach for Polars or DuckDB instead.",
  openGraph: {
    title: "Data Engineering with Python and Pandas: Production Patterns",
    description:
      "Pandas patterns for production data pipelines: memory optimization, chunked processing, method chaining, vectorization vs. apply, type management, and when to reach for Polars or DuckDB instead.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-with-python-pandas",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Engineering with Python and Pandas: Production Patterns",
    description:
      "Pandas patterns for production data pipelines: memory optimization, chunked processing, method chaining, vectorization vs. apply, type management, and when to reach for Polars or DuckDB instead.",
  },
  alternates: { canonical: "/blog/data-engineering-with-python-pandas" },
};

export default function PandasPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineering-with-python-pandas"
  );
  const postTitle = encodeURIComponent(
    "Data Engineering with Python and Pandas: Production Patterns"
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Blog
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              Python
            </span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Engineering with Python and Pandas: Production Patterns
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Pandas is powerful and easy to misuse. Here are the patterns that separate notebooks that work from pipelines that survive production.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Pandas is the lingua franca of data manipulation in Python. Almost every data engineer knows it. Far fewer know how to use it in a way that does not collapse under production data volumes, consume 10x the necessary memory, or run so slowly that the pipeline misses its window.
          </p>
          <p>
            This post covers the patterns that matter for production pandas work: memory management, chunked processing, method chaining, vectorization, type discipline, and the clear-eyed view of when to stop using pandas entirely.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Memory Optimization: Read Less, Use Less
          </h2>
          <p>
            Pandas default dtype inference is conservative in the wrong direction: it uses int64 for integers and float64 for floats regardless of the actual value range. A column with values 0-100 stored as int64 uses 8x more memory than it needs.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import pandas as pd
import numpy as np

def optimize_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    """Downcast numeric columns to minimize memory usage."""
    for col in df.select_dtypes(include=['int64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='integer')
    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='float')
    # Convert low-cardinality strings to category
    for col in df.select_dtypes(include=['object']).columns:
        if df[col].nunique() / len(df) < 0.1:  # < 10% unique
            df[col] = df[col].astype('category')
    return df

# Specify dtypes at read time (fastest approach)
dtypes = {
    'user_id': 'int32',
    'event_type': 'category',
    'amount': 'float32',
    'is_active': 'bool'
}
df = pd.read_csv('events.csv', dtype=dtypes)`}
          </pre>
          <p>
            Only read the columns you need. If a CSV has 50 columns and your pipeline uses 8, pass usecols to read_csv. This reduces memory and parse time proportionally.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`df = pd.read_csv(
    'events.csv',
    usecols=['event_id', 'user_id', 'event_type', 'occurred_at', 'amount'],
    dtype={'event_type': 'category', 'amount': 'float32'},
    parse_dates=['occurred_at']
)`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Chunked Processing for Large Files
          </h2>
          <p>
            When a file does not fit in memory, process it in chunks. The pandas chunksize parameter returns an iterator over DataFrame chunks rather than loading the full file.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`def process_large_csv(filepath: str, output_path: str) -> None:
    """Process a large CSV in chunks, write results incrementally."""
    chunk_size = 100_000
    results = []
    
    for chunk in pd.read_csv(filepath, chunksize=chunk_size):
        # Process each chunk
        processed = (
            chunk
            .query("amount > 0")
            .assign(
                amount_usd=lambda df: df['amount'] / 100,
                occurred_date=lambda df: pd.to_datetime(df['occurred_at']).dt.date
            )
            .groupby(['user_id', 'occurred_date'])
            .agg(
                daily_spend=('amount_usd', 'sum'),
                transaction_count=('event_id', 'count')
            )
            .reset_index()
        )
        results.append(processed)
    
    # Combine all chunks and aggregate across chunk boundaries
    final = (
        pd.concat(results, ignore_index=True)
        .groupby(['user_id', 'occurred_date'])
        .sum()
        .reset_index()
    )
    final.to_parquet(output_path, index=False)`}
          </pre>
          <p>
            Note the two-stage aggregation: aggregate within each chunk, then re-aggregate across chunks. This handles the case where a user appears in multiple chunks and their daily totals would otherwise be split.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Method Chaining
          </h2>
          <p>
            Method chaining produces readable, debuggable pipelines. Instead of creating intermediate variables for each transformation step, chain operations with a consistent structure:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Instead of this:
df1 = df[df['status'] == 'active']
df2 = df1.dropna(subset=['email'])
df3 = df2.rename(columns={'user_id': 'id'})
df4 = df3.assign(full_name=df3['first_name'] + ' ' + df3['last_name'])

# Write this:
result = (
    df
    .query("status == 'active'")
    .dropna(subset=['email'])
    .rename(columns={'user_id': 'id'})
    .assign(full_name=lambda df: df['first_name'] + ' ' + df['last_name'])
    .reset_index(drop=True)
)

# Debug a chain step without breaking it
def log_shape(df, label=''):
    print(f"{label}: {df.shape}")
    return df

result = (
    df
    .query("status == 'active'")
    .pipe(log_shape, 'after filter')
    .dropna(subset=['email'])
    .pipe(log_shape, 'after dropna')
    .assign(full_name=lambda df: df['first_name'] + ' ' + df['last_name'])
)`}
          </pre>
          <p>
            The .pipe() method is the key to keeping chains clean: it lets you call any function that takes a DataFrame as its first argument within the chain, including logging helpers and custom transformations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Vectorization vs. Apply
          </h2>
          <p>
            The most common pandas performance mistake is using .apply() where a vectorized operation exists. Apply iterates over rows in Python, which is slow. Vectorized operations use NumPy under the hood and run at C speed.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Slow: Python loop via apply
df['revenue_tier'] = df['revenue'].apply(
    lambda x: 'high' if x > 10000 else 'medium' if x > 1000 else 'low'
)

# Fast: vectorized with np.select
conditions = [df['revenue'] > 10000, df['revenue'] > 1000]
choices = ['high', 'medium']
df['revenue_tier'] = np.select(conditions, choices, default='low')

# Slow: string manipulation via apply
df['domain'] = df['email'].apply(lambda x: x.split('@')[1])

# Fast: vectorized string method
df['domain'] = df['email'].str.split('@').str[1]

# Benchmark difference on 1M rows:
# apply: ~3-5 seconds
# vectorized: ~50-100ms`}
          </pre>
          <p>
            When you genuinely need row-level Python logic, apply is sometimes the right call. But check for a vectorized equivalent first. NumPy where, select, and pandas str/dt accessor methods cover a large portion of apply use cases.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Merge Patterns and Performance
          </h2>
          <p>
            Pandas merge is a full in-memory join. For large DataFrames, the memory requirement can be 2-3x the size of both inputs combined. A few patterns that help:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Sort before merge if you will iterate the result in order
# (sort_values is faster than sort after merge)
left = left.sort_values('join_key')
right = right.sort_values('join_key')

# For lookups where right side is small, use map instead of merge
lookup = dict(zip(dim_df['id'], dim_df['name']))
df['name'] = df['entity_id'].map(lookup)

# Reduce memory before merge: only keep needed columns
result = pd.merge(
    left[['id', 'amount', 'date']],
    right[['id', 'category', 'segment']],
    on='id',
    how='left'
)`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            When to Stop Using Pandas
          </h2>
          <p>
            Pandas is single-threaded and loads data into memory. For datasets above a few hundred megabytes, or for queries that are better expressed as SQL, reach for a different tool.
          </p>
          <p>
            <strong>Polars</strong>: a pandas replacement with a Rust backend, lazy evaluation, and multi-threaded execution. The API is similar to pandas but with better performance characteristics for large datasets and a query optimizer for lazy mode. Strongly typed and faster on most benchmarks.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import polars as pl

# Lazy evaluation: Polars optimizes the full query before executing
result = (
    pl.scan_csv("large_events.csv")  # lazy, no data loaded yet
    .filter(pl.col("amount") > 0)
    .with_columns([
        (pl.col("amount") / 100).alias("amount_usd"),
        pl.col("occurred_at").str.to_date().alias("event_date")
    ])
    .group_by(["user_id", "event_date"])
    .agg([
        pl.col("amount_usd").sum().alias("daily_spend"),
        pl.col("event_id").count().alias("tx_count")
    ])
    .collect()  # execute here
)`}
          </pre>
          <p>
            <strong>DuckDB</strong>: in-process SQL analytics engine that can query pandas DataFrames, Parquet files, and CSV files directly via SQL. Ideal when your transformation logic is naturally SQL-shaped.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import duckdb

# Query a pandas DataFrame directly with SQL
result = duckdb.sql("""
    SELECT
        user_id,
        DATE_TRUNC('day', occurred_at) AS event_date,
        SUM(amount / 100.0) AS daily_spend,
        COUNT(*) AS tx_count
    FROM df  -- df is the pandas DataFrame in scope
    WHERE amount > 0
    GROUP BY 1, 2
    ORDER BY 1, 2
""").df()  # returns a pandas DataFrame`}
          </pre>
          <p>
            The practical heuristic: use pandas for datasets under 500MB where Python logic is needed, Polars for larger datasets or performance-critical paths, and DuckDB when the transformation is SQL and the data is files or existing DataFrames. PySpark when you need distributed processing across a cluster.
          </p>
          <p>
            Pandas is not going away. It is too deeply embedded in the ecosystem and too familiar to too many practitioners. But knowing its limits and the alternatives that address those limits is what separates a data engineer who uses pandas from one who can make an informed choice about when not to.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
