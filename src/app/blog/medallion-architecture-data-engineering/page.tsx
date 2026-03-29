import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Medallion Architecture in Practice: Bronze, Silver, and Gold Data Layers | Ryan Kirsch",
  description:
    "A practical guide to implementing the medallion architecture in production data platforms. How to design bronze, silver, and gold layers with dbt, Delta Lake, and Dagster -- and the common mistakes that undermine it.",
  openGraph: {
    title:
      "Medallion Architecture in Practice: Bronze, Silver, and Gold Data Layers",
    description:
      "A practical guide to implementing the medallion architecture in production data platforms. How to design bronze, silver, and gold layers with dbt, Delta Lake, and Dagster -- and the common mistakes that undermine it.",
    type: "article",
    url: "https://ryankirsch.dev/blog/medallion-architecture-data-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Medallion Architecture in Practice: Bronze, Silver, and Gold Data Layers",
    description:
      "A practical guide to implementing the medallion architecture in production data platforms. How to design bronze, silver, and gold layers with dbt, Delta Lake, and Dagster -- and the common mistakes that undermine it.",
  },
  alternates: { canonical: "/blog/medallion-architecture-data-engineering" },
};

export default function MedallionArchitecturePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/medallion-architecture-data-engineering"
  );
  const postTitle = encodeURIComponent(
    "Medallion Architecture in Practice: Bronze, Silver, and Gold Data Layers"
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
            Medallion Architecture in Practice: Bronze, Silver, and Gold Data
            Layers
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · November 24, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            The medallion architecture sounds deceptively simple: raw data in,
            clean data out, business-ready data beyond that. Three layers,
            three names, done. In practice, most teams get at least one layer
            wrong in a way that compounds across the entire platform. Here is
            what actually works in production.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What the Medallion Architecture Actually Is
            </h2>
            <p>
              The medallion architecture, popularized by Databricks, organizes a
              data platform into three progressive refinement layers. Each layer
              has a specific purpose, a specific trust level, and a specific
              audience. The key insight is that data should only move forward
              through the layers -- you refine, you do not revert.
            </p>
            <p>
              <strong>Bronze</strong> is your landing zone. Raw, unmodified
              source data exactly as it arrived. No transformations, no
              filtering, no business logic. If the source sent you 14 columns
              with inconsistent date formats and a field called{" "}
              <code>acct_id_v2_final_FINAL</code>, that is what bronze stores.
              This layer is append-only, immutable, and serves as the
              authoritative historical record.
            </p>
            <p>
              <strong>Silver</strong> is where trust begins. Cleansed,
              conformed, and deduplicated data that any analyst or downstream
              system can rely on. Schema is enforced, types are consistent,
              duplicates are resolved, and business keys are standardized. Silver
              is not business-ready -- it is source-ready. You still have one
              row per transaction, not one row per customer.
            </p>
            <p>
              <strong>Gold</strong> is the business layer. Dimensional models,
              aggregates, and denormalized tables built for specific analytical
              use cases. A gold table might be{" "}
              <code>monthly_revenue_by_product</code> or{" "}
              <code>customer_lifetime_value</code>. It represents a business
              concept, not a source system concept.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Why Medallion Beats Lambda and Kappa for Most Teams
            </h2>
            <p>
              Lambda architecture separates batch and streaming paths into two
              distinct systems that must agree on the same result. In theory,
              this gives you both low latency (streaming) and correctness
              (batch). In practice, you maintain two codebases, debug subtle
              discrepancies between them, and eventually ask why you have two
              pipelines doing the same job.
            </p>
            <p>
              Kappa architecture solves the dual-system problem by treating
              everything as a stream. Great for teams that live in Kafka or
              Flink and have the engineering depth to make it work. Most data
              engineering teams do not. Kappa requires event sourcing discipline
              that most source systems -- SaaS APIs, operational databases,
              third-party feeds -- simply do not provide.
            </p>
            <p>
              Medallion architecture works because it matches how most data
              teams actually operate: batch ingestion from operational systems,
              progressive refinement, serving business queries from curated
              tables. The layers are conceptual as much as physical, which means
              you can implement them in Snowflake, BigQuery, Databricks, or
              DuckDB using the same mental model.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Bronze Layer: Raw Ingestion Done Right
            </h2>
            <p>
              The goal of bronze is fidelity. You want to store exactly what
              the source sent you, with enough metadata to replay or audit the
              ingestion later.
            </p>
            <p>A minimal bronze table looks like this in PySpark:</p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from pyspark.sql import SparkSession
from pyspark.sql.functions import current_timestamp, lit

spark = SparkSession.builder.getOrCreate()

# Read raw source data
raw_df = spark.read.format("json").load("s3://raw-events/orders/2026-03-27/")

# Add ingestion metadata
bronze_df = raw_df.withColumn(
    "_ingested_at", current_timestamp()
).withColumn(
    "_source", lit("orders_api_v2")
).withColumn(
    "_batch_id", lit("2026-03-27-01")
)

# Write to Delta Lake for ACID guarantees
bronze_df.write \\
    .format("delta") \\
    .mode("append") \\
    .partitionBy("_source") \\
    .save("s3://data-lake/bronze/orders")`}</code>
            </pre>
            <p>
              A few things worth noting. Schema on read means you do not enforce
              types here -- bronze accepts whatever arrives. Delta Lake (or
              Apache Iceberg) gives you ACID transactions so concurrent writes
              do not corrupt the table. The{" "}
              <code>_ingested_at</code> and <code>_batch_id</code> columns are
              your debugging lifeline when something goes wrong in silver three
              weeks later.
            </p>
            <p>
              What bronze should never do: transform data, filter rows, or
              apply business logic. Any time you add a WHERE clause to a bronze
              ingestion job, you are creating a gap in your historical record
              that you will eventually need and not have.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Silver Layer: Cleansing and Conformation with dbt
            </h2>
            <p>
              Silver is where dbt shines. The silver layer transformation is
              almost always a set of deterministic SQL transformations that you
              can test, version, and document -- exactly what dbt is built for.
            </p>
            <p>
              A typical silver model for orders looks like this:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- models/silver/silver_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    on_schema_change='sync_all_columns'
) }}

with source as (
    select * from {{ source('bronze', 'orders') }}
    {% if is_incremental() %}
    where _ingested_at > (select max(_ingested_at) from {{ this }})
    {% endif %}
),

cleansed as (
    select
        -- Standardize the key
        cast(order_id as varchar) as order_id,
        
        -- Normalize customer_id across two source formats
        coalesce(customer_id, cust_id) as customer_id,
        
        -- Enforce date type
        cast(order_date as date) as order_date,
        
        -- Trim whitespace from status
        trim(upper(status)) as order_status,
        
        -- Amount in cents -> dollars
        round(order_amount_cents / 100.0, 2) as order_amount_usd,
        
        _ingested_at,
        _source
    from source
    where order_id is not null  -- Only filter genuine nulls, not business logic
),

deduped as (
    select *,
        row_number() over (
            partition by order_id 
            order by _ingested_at desc
        ) as rn
    from cleansed
)

select * exclude (rn) from deduped where rn = 1`}</code>
            </pre>
            <p>
              The deduplication step is critical and often skipped. Sources
              emit duplicate events -- webhook retries, CDC duplicates,
              backfills. Silver should produce exactly one canonical record per
              business key. The{" "}
              <code>row_number()</code> pattern keeps the most recently ingested
              version, which works for most cases where the source is
              eventually consistent.
            </p>
            <p>
              Test your silver models aggressively. At minimum:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/silver/silver_orders.yml
models:
  - name: silver_orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - not_null
      - name: order_status
        tests:
          - accepted_values:
              values: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
      - name: order_amount_usd
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0"`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Gold Layer: Business-Ready Aggregates
            </h2>
            <p>
              Gold tables represent business concepts, not source system
              concepts. A gold table should be named after the business question
              it answers, not the system it came from.
            </p>
            <p>
              A revenue reporting gold model built on top of silver:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- models/gold/monthly_revenue_by_product.sql
{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('silver_orders') }}
    where order_status = 'DELIVERED'
),

order_items as (
    select * from {{ ref('silver_order_items') }}
),

products as (
    select * from {{ ref('silver_products') }}
),

joined as (
    select
        date_trunc('month', o.order_date) as revenue_month,
        p.product_category,
        p.product_name,
        count(distinct o.order_id) as order_count,
        sum(oi.quantity) as units_sold,
        sum(oi.quantity * oi.unit_price_usd) as gross_revenue_usd,
        sum(oi.quantity * oi.unit_price_usd * (1 - coalesce(oi.discount_pct, 0))) as net_revenue_usd
    from orders o
    inner join order_items oi on o.order_id = oi.order_id
    inner join products p on oi.product_id = p.product_id
    group by 1, 2, 3
)

select * from joined`}</code>
            </pre>
            <p>
              Notice that gold models reference silver models with{" "}
              <code>ref()</code>, never bronze. The bronze-to-gold shortcut is a
              common mistake that bypasses your cleansing logic entirely. Someone
              adds a direct bronze reference for speed, the silver model gets
              updated to handle a new edge case, and now your gold table quietly
              disagrees with the rest of your platform.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Orchestrating the Layers with Dagster
            </h2>
            <p>
              The medallion architecture has a natural dependency direction:
              bronze must run before silver, silver before gold. Dagster&apos;s
              asset-based model makes this explicit and observable.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dagster import asset, AssetIn, MaterializeResult
from dagster_dbt import DbtCliResource, dbt_assets

# Bronze: ingestion asset
@asset(group_name="bronze")
def bronze_orders(context) -> MaterializeResult:
    # ... ingestion logic
    return MaterializeResult(metadata={"row_count": row_count})

# Silver: depends on bronze
@asset(
    group_name="silver",
    ins={"bronze_orders": AssetIn()},
    deps=["bronze_orders"]
)
def silver_orders(context, bronze_orders) -> MaterializeResult:
    # Run dbt silver model
    result = dbt.cli(["run", "--select", "silver_orders"]).wait()
    return MaterializeResult(metadata={"status": "ok"})

# Gold: depends on silver
@asset(
    group_name="gold",
    ins={"silver_orders": AssetIn()},
)
def monthly_revenue_by_product(context, silver_orders):
    result = dbt.cli(["run", "--select", "monthly_revenue_by_product"]).wait()
    return MaterializeResult(metadata={"status": "ok"})`}</code>
            </pre>
            <p>
              The asset graph makes the dependency chain visible in the Dagster
              UI. When silver_orders fails, Dagster automatically knows not to
              run any downstream gold assets that depend on it. This is far more
              reliable than cron-based scheduling where a failed silver run
              silently lets gold run on stale data.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Common Mistakes That Undermine the Architecture
            </h2>
            <p>
              <strong>1. Over-engineering the gold layer.</strong> Gold tables
              should answer business questions efficiently. They are not a place
              to showcase SQL complexity. If a gold model has more than 3 CTEs
              and 5 joins, it is probably doing silver work that should have
              been done upstream.
            </p>
            <p>
              <strong>2. Mixing layers.</strong> A bronze table that filters
              out soft-deleted records is not bronze -- it is silver without the
              honesty. A silver table that pre-aggregates by month is not silver
              -- it is gold that lost its granularity. Keep layers pure.
            </p>
            <p>
              <strong>3. No data contracts between layers.</strong> When silver
              depends on bronze schemas with no formal contract, every source
              system change becomes a production incident. Use dbt sources with
              schema definitions, or explicit schema enforcement at the bronze
              write path, to fail fast when upstream schemas change.
            </p>
            <p>
              <strong>4. Treating gold as the only output.</strong> Gold tables
              are optimized for business queries. They are not optimized for ML
              feature engineering, operational reverse ETL, or real-time serving.
              Build purpose-specific exports from silver when the consumer has
              different latency or granularity requirements.
            </p>
            <p>
              <strong>5. Not versioning gold tables.</strong> When a gold table
              changes its grain or logic, downstream BI reports and embedded
              analytics break silently. Version significant gold table changes
              the same way you version APIs -- maintain{" "}
              <code>monthly_revenue_by_product_v2</code> while{" "}
              <code>v1</code> consumers migrate.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Storage Considerations: Delta Lake vs. Iceberg
            </h2>
            <p>
              Both Delta Lake and Apache Iceberg provide ACID transactions on
              object storage, which is what makes medallion architecture
              practical in cloud data lakes. The choice between them matters less
              than picking one and being consistent.
            </p>
            <p>
              <strong>Delta Lake</strong> has tighter Databricks integration and
              a larger ecosystem of connectors. If you are on Databricks or
              already using Delta elsewhere, stay with Delta.
            </p>
            <p>
              <strong>Apache Iceberg</strong> has stronger multi-engine support
              -- Spark, Flink, Trino, Snowflake, and BigQuery all read Iceberg
              natively. If you have a multi-engine environment or want to avoid
              vendor lock-in, Iceberg is the better long-term choice.
            </p>
            <p>
              For teams on Snowflake or BigQuery as their primary warehouse, the
              table format question largely goes away -- the warehouse handles
              it. Focus on the layer logic instead.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What a Production Medallion Setup Looks Like
            </h2>
            <p>
              Here is the stack I would recommend for a new data platform build
              in 2026:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Ingestion to bronze:</strong> Fivetran or Airbyte for
                SaaS sources, custom Python (AWS Lambda or Cloud Run) for
                custom APIs, Kafka Connect for CDC
              </li>
              <li>
                <strong>Storage:</strong> Snowflake (if warehouse-centric) or
                S3/GCS with Delta Lake/Iceberg (if lakehouse-centric)
              </li>
              <li>
                <strong>Transformations (silver and gold):</strong> dbt Core or
                dbt Cloud, with incremental models on silver and table
                materializations on gold
              </li>
              <li>
                <strong>Orchestration:</strong> Dagster for asset-based
                dependency management and observability
              </li>
              <li>
                <strong>Quality:</strong> dbt tests on silver and gold, Great
                Expectations for bronze schema validation, Monte Carlo or
                Anomalo for anomaly detection
              </li>
              <li>
                <strong>Serving:</strong> BI tools (Looker, Metabase, Hex)
                read from gold; ML features read from silver; operational
                reverse ETL reads from gold via Census or Hightouch
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Architecture Is the Contract
            </h2>
            <p>
              The medallion architecture is ultimately about trust. Bronze is
              where you trust the source. Silver is where you trust the data.
              Gold is where you trust the business definition. Each layer adds a
              new level of confidence.
            </p>
            <p>
              When a stakeholder asks why a number is wrong, the layer structure
              tells you exactly where to look. Is it wrong in bronze? Then the
              source sent bad data. Is it correct in silver but wrong in gold?
              Then there is a business logic bug. Is gold correct but the report
              disagrees? Then the consumer is not reading gold correctly.
            </p>
            <p>
              That debuggability -- knowing exactly where confidence breaks down
              -- is what makes the medallion architecture worth the upfront
              structure. It is not just a pattern for organizing tables. It is a
              pattern for organizing trust.
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
