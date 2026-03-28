import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Engineering With DuckDB: Fast Local Analytics Without the Cloud | Ryan Kirsch",
  description:
    "DuckDB is the fastest path from a CSV to a query result you will find anywhere. Here is what it is, when to use it, and how it compares to Pandas, Spark, and BigQuery for real data engineering work.",
  openGraph: {
    title:
      "Data Engineering With DuckDB: Fast Local Analytics Without the Cloud",
    description:
      "DuckDB is the fastest path from a CSV to a query result you will find anywhere. Here is what it is, when to use it, and how it compares to Pandas, Spark, and BigQuery for real data engineering work.",
    type: "article",
    url: "https://ryankirsch.dev/blog/duckdb-local-analytics",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Engineering With DuckDB: Fast Local Analytics Without the Cloud",
    description:
      "DuckDB is the fastest path from a CSV to a query result you will find anywhere. Here is what it is, when to use it, and how it compares to Pandas, Spark, and BigQuery for real data engineering work.",
  },
  alternates: { canonical: "/blog/duckdb-local-analytics" },
};

export default function DuckDBPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/duckdb-local-analytics"
  );
  const postTitle = encodeURIComponent(
    "Data Engineering With DuckDB: Fast Local Analytics Without the Cloud"
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
              Data Engineering
            </span>
            <span className="text-sm text-gray-500">March 28, 2026</span>
            <span className="text-sm text-gray-500">8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Engineering With DuckDB: Fast Local Analytics Without the Cloud
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            DuckDB does in seconds on your laptop what used to require a cloud warehouse. Here is what it actually is, when it belongs in your stack, and what you are giving up when you reach for it.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The first time I ran a 500MB CSV through DuckDB, I was expecting to wait. I had been working with Pandas for that class of problem for years, and the mental model was: CSV this size, expect some lag, grab coffee. DuckDB returned in under two seconds. The query was a multi-join aggregation with a window function. No configuration, no spinning up infrastructure, no cluster to wait for.
          </p>
          <p>
            That experience is what DuckDB keeps delivering, and why it has become a standard tool in my local data engineering setup. This post covers what DuckDB is, where it fits in a modern data engineering workflow, how it compares to the tools you are already using, and where it breaks down.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            What DuckDB Actually Is
          </h2>
          <p>
            DuckDB is an in-process analytical database. It runs embedded inside your application or script, with no separate server process, no network connection, and no cluster to manage. You install it as a library, import it, and query data directly. The whole engine lives in your process.
          </p>
          <p>
            The &quot;analytical&quot; part is important. DuckDB is an OLAP database, optimized for column-oriented analytical queries rather than OLTP row-level transactions. It uses a vectorized query execution engine, which processes data in columnar batches rather than row by row. This is why it is so fast on aggregations, joins, and window functions against large flat files.
          </p>
          <p>
            It is free, open source (MIT license), and actively maintained by a team that releases frequently. The Python, R, Node.js, Java, and CLI interfaces are all well-developed.
          </p>
          <p>
            A minimal example of why it is compelling:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import duckdb

# Query a CSV directly, no loading step
result = duckdb.sql("""
  SELECT
    region,
    SUM(revenue)                         AS total_revenue,
    COUNT(DISTINCT customer_id)          AS unique_customers,
    AVG(revenue) OVER (PARTITION BY region
                       ORDER BY order_date
                       ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                      )                  AS rolling_7_avg
  FROM 'orders_2025.csv'
  WHERE order_date >= '2025-01-01'
  GROUP BY region
  ORDER BY total_revenue DESC
""").df()

print(result.head(10))`}
          </pre>
          <p>
            That query runs directly against the CSV file. DuckDB reads only the columns it needs (projection pushdown), filters during scan (predicate pushdown), and returns a Pandas DataFrame. No intermediate load step. No schema definition required.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            When to Use DuckDB
          </h2>
          <p>
            DuckDB is not a replacement for a cloud data warehouse. It is the right tool for a specific set of problems, and knowing that set precisely is what makes it valuable rather than overused.
          </p>
          <p>
            <strong>Local development and prototyping.</strong> This is DuckDB&apos;s strongest use case. When you are developing a dbt model, a data pipeline, or an analytical query, you need a fast feedback loop. Loading data into BigQuery or Snowflake for iterative development is slow, wasteful, and occasionally expensive. DuckDB gives you a local query engine that accepts the same SQL you will run in production. I use it as the local dbt adapter on every new project, running against sampled production data or synthetic test data.
          </p>
          <p>
            <strong>Small-to-medium dataset analytics.</strong> &quot;Small-to-medium&quot; is relative to your hardware, but DuckDB handles datasets up to tens of gigabytes comfortably on a modern laptop with 16GB of RAM. For datasets that fit within that range, DuckDB is typically faster than spinning up cloud infrastructure, and the operational overhead is zero.
          </p>
          <p>
            <strong>Embedded analytics in applications.</strong> DuckDB is designed for embedding. If you are building a data application, a CLI tool that does analytics, or a reporting system that needs to query structured data without a separate database server, DuckDB fits cleanly. The in-process architecture means no dependency on an external service being available.
          </p>
          <p>
            <strong>File format conversions and exploration.</strong> DuckDB reads Parquet, CSV, JSON, and Arrow natively. For the common task of &quot;I have a collection of Parquet files from S3, I need to understand the schema and run some exploratory queries,&quot; DuckDB is the fastest path available. It can also write to Parquet directly, making it useful for format conversion pipelines.
          </p>
          <p>
            <strong>CI/CD pipeline testing.</strong> Running data quality tests, schema validations, and transformation logic checks in a CI pipeline benefits from a lightweight, fast database engine that does not require external service dependencies. DuckDB starts in milliseconds and does not need credentials or network access.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Core Query Patterns Worth Knowing
          </h2>
          <p>
            A few DuckDB-specific patterns that come up repeatedly in data engineering work:
          </p>
          <p>
            <strong>Reading multiple files as a single table:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Read all Parquet files in a directory
SELECT * FROM read_parquet('data/events/**/*.parquet');

-- Read with filename column for partition awareness
SELECT
  filename,
  *
FROM read_parquet('data/events/**/*.parquet', filename=true);`}
          </pre>
          <p>
            <strong>Querying S3 directly (with the httpfs extension):</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`INSTALL httpfs;
LOAD httpfs;

SET s3_region='us-east-1';
SET s3_access_key_id='YOUR_KEY';
SET s3_secret_access_key='YOUR_SECRET';

SELECT COUNT(*), MIN(event_time), MAX(event_time)
FROM read_parquet('s3://your-bucket/events/2025/**/*.parquet');`}
          </pre>
          <p>
            <strong>Fast aggregation with window functions:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- DuckDB handles large window function queries efficiently
SELECT
  customer_id,
  order_date,
  revenue,
  SUM(revenue) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  )                        AS cumulative_revenue,
  ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  )                        AS order_sequence
FROM orders
ORDER BY customer_id, order_date;`}
          </pre>
          <p>
            <strong>Sampling large files for exploration:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Get a reproducible 1% sample for initial exploration
SELECT *
FROM 'large_events.parquet'
USING SAMPLE 1% (bernoulli, 42);`}
          </pre>
          <p>
            <strong>Writing Parquet for downstream use:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`COPY (
  SELECT customer_id, SUM(revenue) AS ltv
  FROM orders
  GROUP BY customer_id
) TO 'customer_ltv.parquet' (FORMAT PARQUET);`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            DuckDB vs. Pandas: The Practical Comparison
          </h2>
          <p>
            Pandas is the default Python tool for DataFrame manipulation, and DuckDB does not replace it entirely. The comparison is more nuanced than &quot;DuckDB is faster.&quot;
          </p>
          <p>
            DuckDB wins on: multi-table join performance, aggregation against large flat files, window functions, and anything requiring SQL semantics. For datasets above a few hundred megabytes, DuckDB&apos;s columnar execution and out-of-core processing (it can handle datasets larger than RAM) gives it a substantial performance advantage over Pandas, which loads everything into memory.
          </p>
          <p>
            Pandas wins on: row-level iteration (when you genuinely need to process row by row), complex custom Python transformations that do not map to SQL, integration with the scientific Python ecosystem (scikit-learn, matplotlib, etc.), and workflows where the input is already a DataFrame and the transformations are complex Python logic rather than SQL expressions.
          </p>
          <p>
            The most practical pattern is using both: DuckDB for the heavy SQL aggregations and joins, returning results to Pandas for Python-side processing or visualization.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import duckdb
import pandas as pd

# Use DuckDB for the heavy lifting
aggregated = duckdb.sql("""
  SELECT
    product_category,
    YEAR(order_date)         AS year,
    SUM(revenue)             AS total_revenue
  FROM 'orders_large.parquet'
  GROUP BY 1, 2
""").df()

# Use Pandas for the Python-side work
pivot = aggregated.pivot(
    index='product_category',
    columns='year',
    values='total_revenue'
)
pivot.plot(kind='bar', figsize=(12, 6))`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            DuckDB vs. Spark: When Scale Actually Matters
          </h2>
          <p>
            Spark is the distributed compute engine of choice for data at scale. The comparison with DuckDB is a question of when distribution is actually necessary.
          </p>
          <p>
            Spark is appropriate when: your dataset is too large to fit on a single node (terabytes and above), your pipeline needs to run on a cluster for throughput reasons, or your organization already has Spark infrastructure and operational expertise.
          </p>
          <p>
            DuckDB is appropriate when: your dataset fits on a single machine, you want fast iteration without cluster startup time (Spark cluster initialization alone can take minutes), or you are in a development and testing context where Spark overhead is disproportionate to the work being done.
          </p>
          <p>
            The most important comparison point: Spark is operationally complex. It requires cluster management, serialization awareness, understanding of shuffle operations and broadcast joins, and distributed debugging skills. DuckDB requires none of that. For the wide class of problems that do not actually require distribution, choosing DuckDB is choosing fewer moving parts, faster development cycles, and substantially lower operational burden.
          </p>
          <p>
            The practical test: if your data fits on a $10/month VM with 32GB of RAM, DuckDB will almost certainly outperform a Spark cluster on that same data, at lower cost and with less operational overhead. Reach for Spark when single-node processing genuinely cannot keep up.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            DuckDB vs. BigQuery: The Cloud Trade-Off
          </h2>
          <p>
            BigQuery is a managed, serverless, column-oriented analytical database at massive scale. The comparison with DuckDB is primarily about scale, cost, and collaboration.
          </p>
          <p>
            BigQuery wins on: petabyte-scale datasets, multi-user concurrent query environments, built-in security and governance, ML integration, and anything requiring a persistent shared data layer across a team or organization.
          </p>
          <p>
            DuckDB wins on: development speed (no loading, no credentials, no API calls), cost (free), offline capability, and scenarios where the data does not need to live in a managed cloud service.
          </p>
          <p>
            The pattern I use in production: dbt with DuckDB locally for model development and unit testing, BigQuery as the production target. Models that work in DuckDB and pass local tests are promoted to BigQuery through CI. The local DuckDB dev loop is dramatically faster than the round-trip to BigQuery for iterative SQL development.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            DuckDB in a dbt Project
          </h2>
          <p>
            dbt has first-class DuckDB support through the dbt-duckdb adapter. Setting up a local development profile is straightforward:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# profiles.yml
my_project:
  target: dev
  outputs:
    dev:
      type: duckdb
      path: /tmp/dev.duckdb
      threads: 4
    prod:
      type: bigquery
      project: my-gcp-project
      dataset: analytics
      threads: 8
      timeout_seconds: 300`}
          </pre>
          <p>
            With this setup, dbt run runs against the local DuckDB instance in development and against BigQuery in production. The SQL compiled by dbt is the same either way, with adapter-specific dialect differences handled by dbt&apos;s macro system.
          </p>
          <p>
            Seed files, snapshots, and tests all work with the DuckDB adapter. The dev cycle becomes: write model, run dbt build --select my_model, inspect results in DuckDB, iterate. No waiting for warehouse slots, no query cost, no network latency.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Where DuckDB Falls Short
          </h2>
          <p>
            DuckDB is not the right tool in every situation. The limitations worth knowing:
          </p>
          <p>
            <strong>Concurrent writes.</strong> DuckDB supports one writer at a time. If you have multiple processes attempting concurrent inserts or updates to a DuckDB database file, you will hit locking errors. This is by design: DuckDB is not built for OLTP or multi-writer workloads.
          </p>
          <p>
            <strong>Dataset size limits.</strong> DuckDB can process datasets larger than RAM through its out-of-core execution, but it is still a single-node engine. For genuinely large datasets (multiple terabytes) that need to fit within a reasonable query time budget, a distributed system remains necessary.
          </p>
          <p>
            <strong>Persistent shared storage.</strong> A DuckDB database is a file. It does not have a network interface, connection pooling, or built-in replication. If you need a shared persistent data store that multiple services or users query concurrently, a managed database service is the right choice.
          </p>
          <p>
            <strong>Operational maturity for production workloads.</strong> DuckDB is excellent in pipelines and development environments, but deploying it as the primary query layer for a production analytics product with many concurrent users requires careful architecture. It can work, but it is not what it was designed for.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Getting Started
          </h2>
          <p>
            Install:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`pip install duckdb

# For dbt integration
pip install dbt-duckdb`}
          </pre>
          <p>
            The quickest way to verify DuckDB belongs in your workflow: take a CSV or Parquet file you regularly work with in Pandas, run the same aggregation in DuckDB, and compare the time. For most data engineers doing that experiment for the first time, the result is conclusive enough to add DuckDB to the default local development setup immediately.
          </p>
          <p>
            The tool earns its place not by replacing your cloud warehouse but by filling the gap between notebook-level Pandas and full warehouse infrastructure. For everything in that gap, which is most local data engineering work, DuckDB is currently the best option available.
          </p>
        </div>

        {/* Share section */}
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

        {/* Back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
