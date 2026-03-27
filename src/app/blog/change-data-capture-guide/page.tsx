import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Change Data Capture: How CDC Works and When to Use It | Ryan Kirsch",
  description:
    "A practical guide to change data capture for data engineers: log-based CDC vs. query-based approaches, Debezium setup, handling schema changes, and when CDC is the right tool vs. batch ingestion.",
  openGraph: {
    title: "Change Data Capture: How CDC Works and When to Use It",
    description:
      "A practical guide to change data capture for data engineers: log-based CDC vs. query-based approaches, Debezium setup, handling schema changes, and when CDC is the right tool vs. batch ingestion.",
    type: "article",
    url: "https://ryankirsch.dev/blog/change-data-capture-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Change Data Capture: How CDC Works and When to Use It",
    description:
      "A practical guide to change data capture for data engineers: log-based CDC vs. query-based approaches, Debezium setup, handling schema changes, and when CDC is the right tool vs. batch ingestion.",
  },
  alternates: { canonical: "/blog/change-data-capture-guide" },
};

export default function CDCPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/change-data-capture-guide");
  const postTitle = encodeURIComponent("Change Data Capture: How CDC Works and When to Use It");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Change Data Capture: How CDC Works and When to Use It
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            CDC reads the database transaction log to capture every insert, update, and delete in near real-time. It solves problems that batch ingestion cannot, and introduces challenges that batch ingestion does not have.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Most data ingestion pipelines use one of two approaches: full table extracts (read everything, every time) or watermark-based incremental loads (read rows newer than the last run timestamp). Both work well for append-only data. Both fail in similar ways when rows can be updated or deleted after insertion.
          </p>
          <p>
            Change data capture solves this by reading from the database transaction log rather than querying the tables directly. Every insert, update, and delete produces a log entry. CDC captures those entries and delivers them as a stream of change events. This gives you a complete, ordered history of every state change in the source system, not just the current state.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How Log-Based CDC Works</h2>
          <p>
            Every major relational database maintains a write-ahead log (WAL) for crash recovery and replication. Postgres calls it the WAL. MySQL calls it the binary log (binlog). SQL Server calls it the transaction log. The log records every change made to the database in order, before the change is applied to the data files.
          </p>
          <p>
            Log-based CDC tools act as a replication consumer: they connect to the database as if they were a read replica, read the log stream, decode the change events, and publish them to a message broker (typically Kafka) or directly to a target system.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Example CDC event (Debezium format)
{
  "op": "u",           # u=update, c=create, d=delete, r=read(snapshot)
  "ts_ms": 1711574400000,
  "before": {
    "order_id": "abc123",
    "status": "pending",
    "amount": 9999
  },
  "after": {
    "order_id": "abc123",
    "status": "shipped",
    "amount": 9999
  },
  "source": {
    "db": "ecommerce",
    "table": "orders",
    "lsn": 12345678     # Log sequence number
  }
}`}
          </pre>
          <p>
            The <code>before</code> and <code>after</code> fields give you the complete row state before and after the change. The log sequence number (LSN) provides a stable ordering guarantee. The operation type tells you whether to insert, update, or delete in your target.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Query-Based CDC: The Simpler Alternative</h2>
          <p>
            Query-based CDC uses a watermark column (typically <code>updated_at</code>) to identify changed rows without reading the transaction log. It is simpler to set up and does not require special database permissions, but it has two significant limitations.
          </p>
          <p>
            First, it misses deletes. A deleted row is gone from the table; there is nothing to query. If your downstream systems need to handle deletions (removing records from a data warehouse, invalidating caches), query-based CDC is not sufficient.
          </p>
          <p>
            Second, it depends on every row having a reliable <code>updated_at</code> column that is maintained correctly. Many legacy systems do not have this, or have it only on some tables, or update it inconsistently.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Query-based incremental: simple but misses deletes
def extract_incremental(table: str, last_run: datetime) -> pd.DataFrame:
    return pd.read_sql(f"""
        SELECT * FROM {table}
        WHERE updated_at > %(last_run)s
        ORDER BY updated_at ASC
    """, params={"last_run": last_run}, con=db_connection())`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Debezium: The Standard Log-Based CDC Tool</h2>
          <p>
            Debezium is the most widely deployed open-source CDC platform. It runs as a set of Kafka Connect connectors, reads from source database logs, and publishes change events to Kafka topics. There are connectors for Postgres, MySQL, SQL Server, MongoDB, Oracle, and others.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Debezium Postgres connector configuration
{
  "name": "ecommerce-postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres-host",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${"$"}{DB_PASSWORD}",
    "database.dbname": "ecommerce",
    "database.server.name": "ecommerce",
    "table.include.list": "public.orders,public.customers,public.products",
    "plugin.name": "pgoutput",
    "publication.name": "debezium_publication",
    "slot.name": "debezium_slot",
    "heartbeat.interval.ms": "10000",
    "tombstones.on.delete": "false"
  }
}`}
          </pre>
          <p>
            For Postgres, Debezium uses logical replication, which requires creating a replication slot and publication on the source database. The replication slot retains WAL segments until Debezium has read them, so monitoring slot lag is critical: a stalled connector with an active slot will eventually cause the Postgres server to run out of disk space.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Handling the Initial Snapshot</h2>
          <p>
            When a CDC connector starts for the first time, it needs to backfill existing data. Debezium handles this with an initial snapshot: it reads the full table contents and emits <code>r</code> (read) events for each row before switching to streaming mode.
          </p>
          <p>
            For large tables, the snapshot can take hours and puts significant read load on the source database. Mitigations include: scheduling the initial connector start during off-peak hours, using snapshot chunking (available in newer Debezium versions) to read in batches, or pre-loading historical data via a separate batch process and having Debezium start streaming from the current WAL position.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Schema Changes</h2>
          <p>
            Schema changes in the source database are one of the harder operational challenges with CDC. When a column is added to a source table, Debezium captures the change but downstream consumers need to handle the new field without breaking.
          </p>
          <p>
            The standard mitigation is schema registry with schema evolution rules. Confluent Schema Registry with Avro or Protobuf serialization enforces compatibility rules: a new optional column (backward compatible) is allowed, dropping a required column (backward incompatible) is blocked until consumers are updated.
          </p>
          <p>
            For simpler setups, using JSON serialization and treating all fields as optional in consumers provides flexibility at the cost of schema enforcement. The downstream dbt models then handle the new column with a coalesce or a specific migration.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">CDC to Data Warehouse: The Pattern</h2>
          <p>
            A common production pattern routes CDC events through Kafka into a staging table in the warehouse, then uses dbt or a separate process to merge them into the final tables.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Staging table receives all CDC events
CREATE TABLE orders_cdc_staging (
  op CHAR(1),              -- c, u, d, r
  ts_ms BIGINT,
  order_id STRING,
  status STRING,
  amount INTEGER,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- dbt model merges staging into final table
-- models/marts/fct_orders.sql
{{
  config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge'
  )
}}

SELECT
  order_id,
  status,
  amount,
  TO_TIMESTAMP(ts_ms / 1000) AS changed_at
FROM {{ ref('orders_cdc_staging') }}
WHERE op != 'd'  -- filter deletes, or handle separately

{% if is_incremental() %}
  AND ts_ms > (SELECT MAX(ts_ms) FROM {{ this }})
{% endif %}`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When CDC Is the Right Choice</h2>
          <p>
            Use CDC when: you need to capture deletes, you need low-latency data delivery (minutes vs. hours), your source tables are large and full extracts are cost-prohibitive, or you need a complete audit trail of every state change rather than just current state.
          </p>
          <p>
            Stick with batch ingestion when: your data is append-only and rows are never updated or deleted, latency requirements are daily or hourly (batch is simpler to operate), your source database cannot support replication (permissions, version constraints), or the operational overhead of managing Kafka and Debezium outweighs the benefits.
          </p>
          <p>
            CDC adds complexity: replication slots to monitor, connector health to track, schema registry to maintain, and consumers that need to handle all three operation types correctly. That complexity is justified when the data characteristics demand it. It is overhead when batch ingestion would have been sufficient.
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
