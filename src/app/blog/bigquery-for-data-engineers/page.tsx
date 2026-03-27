import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "BigQuery for Data Engineers: Architecture, Optimization, and When to Use It | Ryan Kirsch",
  description:
    "A data engineer's guide to BigQuery. How it stores and prices data differently from Snowflake, the partition and clustering strategies that matter, query optimization patterns, and the dbt integration that makes it production-ready.",
  openGraph: {
    title:
      "BigQuery for Data Engineers: Architecture, Optimization, and When to Use It",
    description:
      "How BigQuery stores and prices data, partition and clustering strategies, query optimization, and dbt integration for production workloads.",
    type: "article",
    url: "https://ryankirsch.dev/blog/bigquery-for-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "BigQuery for Data Engineers: Architecture, Optimization, and When to Use It",
    description:
      "How BigQuery stores and prices data, partition and clustering strategies, query optimization, and dbt integration for production workloads.",
  },
  alternates: { canonical: "/blog/bigquery-for-data-engineers" },
};

export default function BigQueryForDataEngineersPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/bigquery-for-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "BigQuery for Data Engineers: Architecture, Optimization, and When to Use It"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">←</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2 text-steel">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">
            Blog
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            BigQuery for Data Engineers: Architecture, Optimization, and When
            to Use It
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            BigQuery and Snowflake are the two dominant cloud data warehouses,
            and they make fundamentally different architectural choices. If you
            are coming from Snowflake and starting work on a BigQuery platform,
            or evaluating which to adopt, the differences matter more than the
            surface-level SQL compatibility. This guide covers what a data
            engineer needs to know to use BigQuery well.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How BigQuery Is Different from Snowflake
            </h2>
            <p>
              The two most significant architectural differences:
            </p>
            <p>
              <strong>Serverless compute.</strong> BigQuery has no warehouses
              to manage. You run a query, BigQuery allocates compute
              automatically, and you pay per byte scanned (on-demand pricing)
              or per slot-hour (capacity pricing). There is no &ldquo;warehouse
              size&rdquo; decision, no auto-suspend configuration, and no cold-start
              penalty. Queries start immediately.
            </p>
            <p>
              <strong>Bytes-scanned pricing.</strong> On-demand BigQuery
              charges per terabyte of data scanned, not per second of compute.
              This fundamentally changes what optimization means. In Snowflake,
              you optimize for query execution time (credits per second). In
              BigQuery on-demand, you optimize for bytes scanned. A query
              that reads 1TB in 10 seconds costs the same as a query that
              reads 1TB in 2 minutes -- what matters is the data volume, not
              the duration.
            </p>
            <p>
              The practical implication: partition pruning and column projection
              (SELECT only what you need) are the highest-impact optimizations
              in BigQuery, even more so than in Snowflake.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Partitioning: The Most Important Optimization Decision
            </h2>
            <p>
              Partitioning in BigQuery divides a table into segments that
              can be pruned based on query filters. BigQuery supports three
              partition types:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Date/timestamp partition (most common for time-series data)
CREATE TABLE analytics.orders
PARTITION BY DATE(created_at)  -- Daily partitions
OPTIONS (
    require_partition_filter = true  -- Force callers to filter by date
)
AS SELECT * FROM staging.raw_orders;

-- Integer range partition (for user IDs, batch numbers)
CREATE TABLE analytics.user_events
PARTITION BY RANGE_BUCKET(user_id, GENERATE_ARRAY(0, 10000000, 100000))
AS SELECT * FROM staging.raw_events;

-- Ingestion-time partition (automatic, based on load time)
CREATE TABLE analytics.log_events
PARTITION BY _PARTITIONDATE
AS SELECT * FROM staging.raw_logs;`}</code>
            </pre>
            <p>
              The <code>require_partition_filter = true</code> option is
              the BigQuery equivalent of a Snowflake row access policy for
              large tables. It forces every query to include a partition
              filter, preventing accidental full-table scans that scan and
              bill for terabytes of data.
            </p>
            <p>
              Check partition pruning after query runs:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- In the BigQuery console Query Details, check:
-- "Partitions processed" vs "Partitions total"
-- A well-pruned query should process <10% of partitions

-- Or query INFORMATION_SCHEMA for recent job stats
SELECT
    job_id,
    query,
    total_bytes_processed / 1e9 AS gb_processed,
    total_bytes_billed / 1e9 AS gb_billed,
    total_slot_ms / 1000 AS slot_seconds
FROM region-us.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY total_bytes_billed DESC
LIMIT 20;`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Clustering: Fine-Grained Data Organization
            </h2>
            <p>
              Clustering in BigQuery sorts data within each partition by
              specified columns. It does not reduce the number of partitions
              scanned, but it reduces the bytes scanned within each partition
              by allowing BigQuery to skip blocks of data that do not match
              filter conditions.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Combined partition + clustering (recommended pattern)
CREATE TABLE analytics.orders
PARTITION BY DATE(created_at)
CLUSTER BY customer_id, status  -- Up to 4 cluster columns
AS SELECT * FROM staging.raw_orders;

-- Query that benefits from clustering:
SELECT
    order_id,
    customer_id,
    amount_usd
FROM analytics.orders
WHERE DATE(created_at) = '2026-03-27'  -- Partition pruning
  AND customer_id = 'cust_12345'       -- Cluster pruning within partition
  AND status = 'delivered';            -- Cluster pruning`}</code>
            </pre>
            <p>
              The clustering column order matters. BigQuery prunes most
              efficiently when you filter on the first cluster column, less
              efficiently on the second, and so on. Put the highest-cardinality,
              most-commonly-filtered column first in the cluster definition.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              dbt with BigQuery: The Setup That Works
            </h2>
            <p>
              dbt works with BigQuery through the dbt-bigquery adapter. The
              configuration:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# profiles.yml
myproject:
  target: prod
  outputs:
    prod:
      type: bigquery
      method: service-account
      project: my-gcp-project
      dataset: analytics
      keyfile: /path/to/service-account.json
      location: US
      threads: 4
      timeout_seconds: 300
      
    dev:
      type: bigquery
      method: oauth  # Use personal credentials in dev
      project: my-gcp-project
      dataset: analytics_dev_{{ env_var('USER', 'unknown') }}
      location: US
      threads: 4`}</code>
            </pre>
            <p>
              The partition and cluster configuration in dbt models:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- models/marts/fct_orders.sql
{{ config(
    materialized='table',
    partition_by={
        "field": "created_at",
        "data_type": "timestamp",
        "granularity": "day"
    },
    cluster_by=["customer_id", "status"],
    require_partition_filter=True,
    labels={"team": "data-platform", "env": "prod"}
) }}

SELECT
    order_id,
    customer_id,
    amount_usd,
    status,
    created_at
FROM {{ ref('silver_orders') }}

-- Incremental config with BigQuery-specific merge
-- {{ config(
--     materialized='incremental',
--     unique_key='order_id',
--     incremental_strategy='merge',
--     partition_by={...},
--     cluster_by=['customer_id']
-- ) }}
-- {% if is_incremental() %}
-- WHERE created_at >= (SELECT MAX(created_at) FROM {{ this }})
-- {% endif %}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              BigQuery-Specific SQL Patterns
            </h2>
            <p>
              BigQuery has several SQL features worth knowing:
            </p>
            <p>
              <strong>Nested and repeated fields (STRUCTs and ARRAYs)</strong>:
              BigQuery is columnar but supports nested structures natively.
              JSON-like data can be stored without flattening, and queried
              with dot notation:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Query nested fields
SELECT
    order_id,
    customer.customer_id,
    customer.email,
    -- Flatten an array
    item.product_id,
    item.quantity,
    item.unit_price
FROM orders,
UNNEST(line_items) AS item  -- Flatten the nested array
WHERE DATE(created_at) = CURRENT_DATE()
  AND customer.tier = 'premium';`}</code>
            </pre>
            <p>
              <strong>MERGE with BigQuery</strong>: BigQuery&apos;s MERGE supports
              upsert patterns for incremental loads:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`MERGE analytics.orders AS target
USING (
    SELECT * FROM staging.new_orders
    WHERE _PARTITIONDATE = CURRENT_DATE()
) AS source
ON target.order_id = source.order_id
    AND target.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
WHEN MATCHED THEN
    UPDATE SET
        status = source.status,
        updated_at = source.updated_at
WHEN NOT MATCHED THEN
    INSERT (order_id, customer_id, amount_usd, status, created_at)
    VALUES (source.order_id, source.customer_id, source.amount_usd,
            source.status, source.created_at);`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Cost Control in BigQuery
            </h2>
            <p>
              BigQuery on-demand pricing can surprise teams that do not set
              guardrails. A single unconstrained query against a large
              unpartitioned table can scan and bill for hundreds of gigabytes.
            </p>
            <p>
              The three controls that prevent surprise bills:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>require_partition_filter on large tables.</strong>
                Forces every query to include a partition filter. No query
                can full-scan a multi-terabyte table accidentally.
              </li>
              <li>
                <strong>Maximum bytes billed per query.</strong> Set at the
                connection or session level to cap scan cost per query:
                <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono mt-2">
                  <code>{`# In your BigQuery client
from google.cloud import bigquery

client = bigquery.Client()
job_config = bigquery.QueryJobConfig(
    maximum_bytes_billed=10 * 1024**3  # 10GB limit per query
)
query_job = client.query(sql, job_config=job_config)`}</code>
                </pre>
              </li>
              <li>
                <strong>Custom quotas in IAM.</strong> Set project-level or
                user-level daily byte quotas in the BigQuery IAM settings
                to cap total daily spend.
              </li>
            </ul>
            <p>
              For high-query-volume environments, consider BigQuery capacity
              pricing (flat-rate slots) instead of on-demand. At sufficient
              query volume, flat-rate is significantly cheaper -- but requires
              estimating and committing to slot capacity in advance.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When to Choose BigQuery vs. Snowflake
            </h2>
            <p>
              The decision is rarely technical -- it is usually organizational:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GCP shop:</strong> BigQuery integrates deeply with
                Pub/Sub, Dataflow, Vertex AI, and Cloud Composer. If your
                engineering infrastructure is GCP-native, BigQuery is the
                obvious choice.
              </li>
              <li>
                <strong>AWS or Azure shop:</strong> Snowflake runs on all
                three clouds and integrates well with native cloud services.
                For multi-cloud or AWS/Azure-primary organizations, Snowflake
                has better native integration.
              </li>
              <li>
                <strong>Serverless preference:</strong> If the team wants
                to eliminate warehouse management (sizing, auto-suspend),
                BigQuery&apos;s serverless model is appealing. There is genuinely
                less operational overhead.
              </li>
              <li>
                <strong>Extremely high query concurrency:</strong> BigQuery
                handles massive concurrency with no configuration. Snowflake
                requires tuning warehouse concurrency settings and potentially
                adding multi-cluster warehouses.
              </li>
            </ul>
            <p>
              Both are excellent platforms. The best choice is usually the
              one your team already knows, unless there is a specific
              organizational or technical reason to switch.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-steel">
          <p className="text-sm text-mutedGray">Share this post:</p>
          <div className="mt-3 flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              Twitter/X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-steel">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-cyberTeal/20 border border-cyberTeal/40 flex items-center justify-center flex-shrink-0">
              <span className="text-cyberTeal font-bold text-sm">RK</span>
            </div>
            <div>
              <p className="font-semibold text-white">Ryan Kirsch</p>
              <p className="text-sm text-mutedGray mt-1">
                Senior Data Engineer with experience building production
                pipelines at scale. Works with dbt, Snowflake, and Dagster, and
                writes about data engineering patterns from production
                experience.{" "}
                <Link
                  href="/"
                  className="text-electricBlue hover:text-white transition-colors"
                >
                  See his full portfolio.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
