import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Databricks for Data Engineers: What You Need to Know',
  description:
    'A practical guide to Databricks for data engineers: Delta Lake, Unity Catalog, Structured Streaming, and when Databricks is the right choice for your platform.',
};

export default function DatabricksForDataEngineers() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10">
        <div className="text-sm text-gray-500 mb-3">March 27, 2026 · 12 min read</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Databricks for Data Engineers: What You Need to Know
        </h1>
        <p className="text-xl text-gray-600">
          Delta Lake, Unity Catalog, Structured Streaming, and how to actually use Databricks in
          production without paying for things you do not need.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <p>
          Databricks shows up in a lot of senior data engineering job descriptions. It also shows up
          in a lot of data platform disasters where teams paid for a Spark cluster to run queries
          that would have been faster in dbt and DuckDB. Understanding what Databricks actually does
          well, and where it is genuinely the right tool, is the difference between looking
          competent and looking like you bought the hype.
        </p>

        <h2>What Databricks Is (and Is Not)</h2>
        <p>
          Databricks is a managed data and AI platform built on top of Apache Spark, running in
          your cloud account (AWS, Azure, or GCP). At its core, it provides collaborative
          notebooks, managed Spark clusters, a Delta Lake storage layer, and increasingly a full
          data governance and ML platform.
        </p>
        <p>
          It is not a data warehouse. It does not replace Snowflake or BigQuery for typical
          analytical workloads. It is best understood as a platform for large-scale data processing
          and machine learning, with strong storage primitives through Delta Lake.
        </p>
        <p>
          The distinction matters. If your team needs to run complex ETL on petabyte-scale data,
          train ML models on feature-rich datasets, or build streaming pipelines that process
          millions of events per second, Databricks is well-suited. If your team needs to answer
          business questions quickly with a reliable semantic layer, you probably want a warehouse.
        </p>

        <h2>Delta Lake: The Foundation</h2>
        <p>
          The most important thing Databricks ships is Delta Lake, an open-source storage layer
          that adds ACID transactions, schema enforcement, and time travel to Parquet files on
          cloud storage (S3, ADLS, GCS).
        </p>
        <p>
          Before Delta Lake (and its cousins Apache Iceberg and Apache Hudi), working with data
          lakes meant dealing with eventual consistency, silent schema changes, and painful recovery
          when a job failed halfway through writing. Delta Lake fixes all of this.
        </p>

        <h3>Key Delta Lake Features</h3>
        <p>
          <strong>ACID transactions:</strong> Multi-step writes either complete or roll back. You
          can read a table while another job is writing to it without getting partial results.
        </p>
        <p>
          <strong>Schema enforcement and evolution:</strong> Delta rejects writes that do not
          match the table schema by default. You opt in to schema evolution when you need it,
          preventing the silent corruption that plagues Parquet-on-S3 setups.
        </p>
        <p>
          <strong>Time travel:</strong> Every table maintains a transaction log. You can query any
          previous version with <code>VERSION AS OF</code> or <code>TIMESTAMP AS OF</code>. This
          is genuinely useful for debugging, auditing, and recovering from bad writes.
        </p>
        <p>
          <strong>Optimized writes:</strong> Databricks auto-optimizes file sizes (compaction) and
          collects statistics for partition pruning and data skipping. On large tables, this
          matters a lot for read performance.
        </p>

        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {`-- Time travel: query yesterday's version of a table
SELECT * FROM orders VERSION AS OF 42;

-- Or by timestamp
SELECT * FROM orders TIMESTAMP AS OF '2026-03-26 00:00:00';

-- Restore a table to a previous version
RESTORE TABLE orders TO VERSION AS OF 42;

-- See table history
DESCRIBE HISTORY orders;`}
        </pre>

        <h2>Unity Catalog: Governance at Scale</h2>
        <p>
          Unity Catalog is Databricks&apos; data governance layer. It provides a three-level namespace
          (catalog.schema.table), column-level access control, data lineage, and auditing across
          all workspaces in an account.
        </p>
        <p>
          The three-level namespace matters because it lets you organize data by environment
          (catalog), domain (schema), and entity (table). A common pattern:
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {`-- Production catalog structure
prod.bronze.raw_events
prod.silver.cleaned_events
prod.gold.daily_user_aggregates

-- Development catalog (separate catalog, same schema names)
dev.bronze.raw_events
dev.silver.cleaned_events`}
        </pre>
        <p>
          Column masking is one of Unity Catalog&apos;s most useful features. You can define a masking
          policy on a sensitive column so that users who lack the right privilege see a redacted
          value, while authorized users see the real data, without any application-layer changes.
        </p>
        <p>
          Lineage in Unity Catalog is captured automatically. When a job reads from Table A and
          writes to Table B, that dependency is recorded. The lineage graph is queryable via the
          UI or API, which makes impact analysis much faster than grepping through notebooks.
        </p>

        <h2>Structured Streaming</h2>
        <p>
          Databricks&apos; Structured Streaming implementation is one of its strongest features.
          Built on Spark Structured Streaming, it treats a stream as an unbounded table and
          applies the same DataFrame API you use for batch processing.
        </p>
        <p>
          Auto Loader is the recommended pattern for incrementally ingesting files from cloud
          storage. It uses checkpoint files to track which objects have been processed, handles
          schema inference and evolution, and is resilient to failures without reprocessing
          already-ingested data.
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {`from pyspark.sql.functions import col, from_json
from pyspark.sql.types import StructType, StringType, TimestampType

schema = StructType().add("user_id", StringType()).add("event_type", StringType()).add("ts", TimestampType())

# Auto Loader: incrementally ingest from S3
df = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/checkpoints/events/schema")
    .load("s3://my-bucket/raw/events/")
)

# Write to Delta Lake with exactly-once semantics
(
    df
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/events/bronze")
    .outputMode("append")
    .table("prod.bronze.raw_events")
)`}
        </pre>
        <p>
          Delta Live Tables (DLT) extends this further by letting you declare transformation
          pipelines as Python or SQL with automatic dependency resolution, quality constraints,
          and managed checkpointing. It is the recommended way to build production streaming
          pipelines on Databricks today.
        </p>

        <h2>Compute: Clusters and SQL Warehouses</h2>
        <p>
          Databricks has two main compute types: clusters (for notebooks, jobs, and Spark
          workloads) and SQL Warehouses (optimized for BI queries and dbt).
        </p>
        <p>
          <strong>Clusters</strong> are for PySpark, ML training, and complex ETL. Use job
          clusters (ephemeral, created per job run) rather than interactive clusters whenever
          possible. Interactive clusters left running are a common source of runaway cost.
        </p>
        <p>
          <strong>SQL Warehouses</strong> run on Photon, Databricks&apos; vectorized query engine,
          and are optimized for SQL queries. They support concurrency better than clusters and are
          the right compute type for dbt, BI tool connections, and ad hoc analysis.
        </p>
        <p>
          Cost control tip: set aggressive auto-termination on all clusters (15-30 minutes of
          inactivity). Use spot instances for job clusters. Size clusters based on actual data
          volume, not aspirational future scale.
        </p>

        <h2>dbt + Databricks</h2>
        <p>
          dbt works well with Databricks via the <code>dbt-databricks</code> adapter. Models run
          as SQL on a SQL Warehouse, with incremental models using Delta Lake&apos;s merge capability.
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {`# profiles.yml
my_project:
  target: prod
  outputs:
    prod:
      type: databricks
      host: your-workspace.azuredatabricks.net
      http_path: /sql/1.0/warehouses/abc123
      catalog: prod          # Unity Catalog
      schema: gold
      token: "{{ env_var('DBT_ACCESS_TOKEN') }}"

# models/gold/daily_revenue.sql
{{ config(
    materialized='incremental',
    unique_key='date_day',
    incremental_strategy='merge'
) }}

SELECT
    date_trunc('day', event_ts) AS date_day,
    sum(revenue_usd) AS total_revenue
FROM {{ ref('silver_transactions') }}
{% if is_incremental() %}
WHERE event_ts >= (SELECT max(date_day) FROM {{ this }})
{% endif %}
GROUP BY 1`}
        </pre>

        <h2>When Databricks Is the Right Choice</h2>
        <p>
          Databricks is well-suited when you have one or more of:
        </p>
        <ul>
          <li>
            <strong>Large-scale ML workloads:</strong> Training models on hundreds of gigabytes
            to terabytes of feature data, distributed training with GPUs.
          </li>
          <li>
            <strong>Complex ETL on raw data:</strong> Unstructured data, JSON with variable
            schemas, multi-step transformations that benefit from Spark&apos;s parallelism.
          </li>
          <li>
            <strong>Streaming pipelines:</strong> High-volume event processing where micro-batch
            or real-time processing is required.
          </li>
          <li>
            <strong>Existing Spark investment:</strong> Teams already running Spark who want
            managed infrastructure and better collaboration tooling.
          </li>
          <li>
            <strong>Unified platform goal:</strong> Organizations that want a single platform for
            data engineering, analytics engineering, and ML.
          </li>
        </ul>

        <h2>When Databricks Is Not the Right Choice</h2>
        <p>
          Do not reach for Databricks when:
        </p>
        <ul>
          <li>
            Your data fits in memory or on a single node. DuckDB or Pandas will be faster and
            dramatically cheaper.
          </li>
          <li>
            Your team primarily needs SQL analytics and BI. Snowflake and BigQuery have better
            concurrency, more mature semantic layers, and simpler cost models for query-heavy
            workloads.
          </li>
          <li>
            You want fast iteration on transformations. Notebook-based development has its place,
            but dbt with a warehouse is faster to test, version, and debug.
          </li>
          <li>
            Your team is small and does not have Spark expertise. Managed Spark has operational
            overhead. The abstractions leak. Plan for that learning curve.
          </li>
        </ul>

        <h2>Practical Interview Angle</h2>
        <p>
          When Databricks comes up in a senior DE interview, the signal the interviewer is looking
          for is whether you know the tradeoffs, not just the feature list. The strong answer
          combines specific capabilities (Delta Lake ACID, Unity Catalog lineage, Auto Loader for
          streaming ingest) with honest assessment of when a warehouse would be better.
        </p>
        <p>
          A common system design question is: &ldquo;How would you build a real-time analytics platform
          for event data at 10M events per day?&rdquo; A Databricks-based answer that scores well: ingest
          via Kafka into Auto Loader, transform with DLT or Structured Streaming into Delta Lake
          bronze/silver/gold, serve gold layer via SQL Warehouse to BI tools, use Unity Catalog for
          access control and lineage. Then explain what would make you choose Databricks over
          Snowflake Dynamic Tables or BigQuery for this use case.
        </p>

        <h2>Key Takeaways</h2>
        <ul>
          <li>Databricks is a managed Spark platform, not a data warehouse replacement</li>
          <li>Delta Lake adds ACID transactions, schema enforcement, and time travel to cloud storage</li>
          <li>Unity Catalog provides three-level namespacing, column-level security, and lineage</li>
          <li>Use SQL Warehouses for dbt and BI, job clusters for ETL and ML</li>
          <li>Auto Loader is the recommended pattern for incremental cloud storage ingest</li>
          <li>Cost control requires aggressive auto-termination and right-sized clusters</li>
          <li>Databricks wins for ML, large-scale ETL, and streaming; warehouses win for analytics</li>
        </ul>
      </div>
    </article>
  );
}
