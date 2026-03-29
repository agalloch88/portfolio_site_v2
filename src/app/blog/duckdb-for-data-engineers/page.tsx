import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DuckDB for Data Engineers: The In-Process Analytics Engine | Ryan Kirsch",
  description:
    "DuckDB is the SQLite of analytical databases. A practical guide to using DuckDB for local data exploration, pipeline development, replacing Pandas for medium-sized datasets, and querying Parquet and S3 without a cluster.",
  openGraph: {
    title: "DuckDB for Data Engineers: The In-Process Analytics Engine",
    description:
      "DuckDB is the SQLite of analytical databases. A practical guide to using DuckDB for local data exploration, pipeline development, replacing Pandas for medium-sized datasets, and querying Parquet and S3 without a cluster.",
    type: "article",
    url: "https://ryankirsch.dev/blog/duckdb-for-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "DuckDB for Data Engineers: The In-Process Analytics Engine",
    description:
      "DuckDB is the SQLite of analytical databases. A practical guide to using DuckDB for local data exploration, pipeline development, replacing Pandas for medium-sized datasets, and querying Parquet and S3 without a cluster.",
  },
  alternates: { canonical: "/blog/duckdb-for-data-engineers" },
};

export default function DuckDBPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/duckdb-for-data-engineers");
  const postTitle = encodeURIComponent("DuckDB for Data Engineers: The In-Process Analytics Engine");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">January 23, 2026</span>
            <span className="text-sm text-gray-500">8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            DuckDB for Data Engineers: The In-Process Analytics Engine
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            DuckDB runs inside your Python process, queries Parquet files directly, and handles hundreds of gigabytes on a laptop. It has replaced Spark for a surprising number of data engineering workflows.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            DuckDB occupies a position that did not really exist before: a fully featured analytical SQL engine that runs in-process, requires no server, and handles analytical workloads that would have required a Spark cluster five years ago. The tagline &quot;SQLite for analytics&quot; undersells it. DuckDB is fast enough and capable enough to be a primary tool, not just a development convenience.
          </p>
          <p>
            This guide covers what DuckDB is good at, how to use it in Python data pipelines, how to query Parquet and S3 files, how it integrates with dbt, and the honest limitations that tell you when to reach for something else.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What DuckDB Actually Is</h2>
          <p>
            DuckDB is a columnar, vectorized SQL database that runs embedded inside a host process (Python, R, Node, or as a standalone CLI). It stores data in its own binary format or queries external files directly without importing them first. There is no server to start, no port to connect to, and no configuration file to manage.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`pip install duckdb

import duckdb

# Query a CSV directly — no import needed
result = duckdb.sql("SELECT COUNT(*) FROM 'events.csv'").fetchone()

# Query a Parquet file
df = duckdb.sql("""
    SELECT
        user_id,
        DATE_TRUNC('day', event_timestamp) AS event_date,
        COUNT(*) AS event_count
    FROM 'events.parquet'
    WHERE event_type = 'purchase'
    GROUP BY 1, 2
    ORDER BY 1, 2
""").df()  # Returns a pandas DataFrame`}
          </pre>
          <p>
            The performance on analytical queries is genuinely impressive. DuckDB uses vectorized execution (processing data in batches rather than row by row) and parallel execution across CPU cores by default. On a modern laptop, it can aggregate hundreds of millions of rows in seconds.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Querying Parquet and S3</h2>
          <p>
            DuckDB&apos;s ability to query Parquet files directly without loading them into memory first is one of its most powerful features. It uses predicate pushdown and column pruning to read only the data it needs.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Query multiple Parquet files with glob pattern
result = duckdb.sql("""
    SELECT
        year,
        month,
        SUM(revenue) AS total_revenue
    FROM 'data/orders/year=*/month=*/*.parquet'
    GROUP BY year, month
    ORDER BY year, month
""").df()

# Query S3 directly (requires httpfs extension)
duckdb.sql("INSTALL httpfs; LOAD httpfs;")
duckdb.sql("""
    SET s3_region='us-east-1';
    SET s3_access_key_id='your_key';
    SET s3_secret_access_key='your_secret';
""")

result = duckdb.sql("""
    SELECT COUNT(*) 
    FROM 's3://my-data-bucket/events/2026/03/*.parquet'
""").fetchone()

# Use IAM role instead of credentials (preferred in production)
duckdb.sql("SET s3_use_credential_chain=true;")`}
          </pre>
          <p>
            For Hive-partitioned Parquet on S3, DuckDB reads the partition keys from the directory structure and uses them in predicate pushdown. A query filtering on year=2026 will skip all other year partitions without reading them.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">DuckDB as a Pandas Replacement</h2>
          <p>
            For datasets that fit in memory or slightly exceed it, DuckDB often outperforms Pandas and produces cleaner, more readable code. The SQL interface is more expressive than method chaining for complex transformations.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import pandas as pd
import duckdb

# Load a pandas DataFrame
orders = pd.read_parquet('orders.parquet')
customers = pd.read_parquet('customers.parquet')

# DuckDB can query pandas DataFrames directly by name
result = duckdb.sql("""
    WITH customer_ltv AS (
        SELECT
            customer_id,
            SUM(amount) AS lifetime_value,
            COUNT(*) AS order_count,
            MIN(order_date) AS first_order,
            MAX(order_date) AS last_order
        FROM orders
        GROUP BY customer_id
    )
    SELECT
        c.segment,
        COUNT(*) AS customer_count,
        AVG(ltv.lifetime_value) AS avg_ltv,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ltv.lifetime_value) AS median_ltv
    FROM customers c
    JOIN customer_ltv ltv ON c.customer_id = ltv.customer_id
    GROUP BY c.segment
    ORDER BY avg_ltv DESC
""").df()

# Benchmark: for this type of multi-table aggregation,
# DuckDB is typically 3-10x faster than pandas on datasets > 10M rows`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">DuckDB in Data Pipelines</h2>
          <p>
            DuckDB fits naturally into lightweight pipeline patterns where you want SQL-based transformations without a warehouse connection.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset
import duckdb
import boto3
from pathlib import Path

@asset
def daily_revenue_parquet(context) -> None:
    """
    Read raw events from S3 Parquet, compute daily revenue,
    write result back to S3 as Parquet.
    """
    partition_date = context.asset_partition_key_for_output()
    
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_use_credential_chain=true;")
    
    con.execute(f"""
        COPY (
            SELECT
                DATE_TRUNC('day', event_timestamp)::DATE AS event_date,
                user_id,
                SUM(amount / 100.0) AS daily_revenue,
                COUNT(*) AS transaction_count
            FROM 's3://raw-data/events/date={partition_date}/*.parquet'
            WHERE event_type = 'purchase'
            GROUP BY 1, 2
        )
        TO 's3://processed-data/daily-revenue/date={partition_date}/data.parquet'
        (FORMAT PARQUET, COMPRESSION SNAPPY)
    """)
    
    row_count = con.execute(f"""
        SELECT COUNT(*) FROM 
        's3://processed-data/daily-revenue/date={partition_date}/data.parquet'
    """).fetchone()[0]
    
    context.log.info(f"Wrote {row_count} rows for {partition_date}")`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">dbt-DuckDB Integration</h2>
          <p>
            DuckDB has a first-class dbt adapter (dbt-duckdb), making it a fully supported warehouse target. This means you can run an entire dbt project locally against DuckDB without a cloud warehouse account, which is useful for development, testing, and CI.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# profiles.yml
my_project:
  target: dev
  outputs:
    dev:
      type: duckdb
      path: /tmp/dev.duckdb   # local file
    prod:
      type: duckdb
      path: s3://my-bucket/warehouse.duckdb  # S3-backed
      extensions:
        - httpfs`}
          </pre>
          <p>
            The dbt-duckdb adapter supports external sources, allowing dbt to read directly from Parquet files on S3 without materializing them into the database first. This makes it possible to build a full transformation layer on top of a data lake without a managed warehouse service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Honest Limitations</h2>
          <p>
            DuckDB is single-node. It scales to the resources of a single machine, which is substantial on modern hardware (a high-memory EC2 instance can handle terabytes) but has a ceiling that distributed systems do not. For petabyte-scale workloads, you need Spark, BigQuery, or Snowflake.
          </p>
          <p>
            DuckDB is not a transactional database. It handles concurrent reads well but concurrent writes poorly. Do not use it as an operational database. It is an analytical tool.
          </p>
          <p>
            The ecosystem is younger than Postgres or Spark. Some integrations that are mature for other systems are still rough around the edges for DuckDB. Check the specific connector or integration you need before committing to it in production.
          </p>
          <p>
            Within those constraints, DuckDB is one of the most valuable additions to the data engineering toolkit in recent years. The ability to run analytical SQL locally, against files, without infrastructure, changes how you prototype and test pipelines. Once you start using it, reaching for a warehouse connection to run a quick exploratory query starts to feel unnecessarily heavy.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on X</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on LinkedIn</a>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">← Back to all posts</Link>
        </div>
      </article>
    </main>
  );
}
