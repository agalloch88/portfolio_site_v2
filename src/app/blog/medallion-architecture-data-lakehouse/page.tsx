import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Medallion Architecture in Practice: Bronze, Silver, Gold and Why It Works | Ryan Kirsch",
  description:
    "How to implement medallion architecture in a real lakehouse: what belongs in bronze, silver, and gold, how the layers isolate failures, and where dbt fits into the pattern.",
  openGraph: {
    title: "Medallion Architecture in Practice: Bronze, Silver, Gold and Why It Works",
    description:
      "How to implement medallion architecture in a real lakehouse: what belongs in bronze, silver, and gold, how the layers isolate failures, and where dbt fits into the pattern.",
    type: "article",
    url: "https://ryankirsch.dev/blog/medallion-architecture-data-lakehouse",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medallion Architecture in Practice: Bronze, Silver, Gold and Why It Works",
    description:
      "How to implement medallion architecture in a real lakehouse: what belongs in bronze, silver, and gold, how the layers isolate failures, and where dbt fits into the pattern.",
  },
  alternates: { canonical: "/blog/medallion-architecture-data-lakehouse" },
};

export default function MedallionArchitecturePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/medallion-architecture-data-lakehouse");
  const postTitle = encodeURIComponent("Medallion Architecture in Practice: Bronze, Silver, Gold and Why It Works");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">March 29, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Medallion Architecture in Practice: Bronze, Silver, Gold and Why It Works
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The medallion architecture is not just a naming convention. It is an operational pattern that makes lakehouses more reliable, more auditable, and much easier to evolve.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Medallion architecture became popular because it gives data teams a clear answer to a problem that used to create endless pipeline sprawl: where does raw data end, where does cleaned data begin, and where do analytics-ready models belong? The bronze, silver, and gold pattern gives each layer a distinct job and, more importantly, distinct failure boundaries.
          </p>
          <p>
            When teams skip those boundaries, the system becomes fragile. Raw source data gets mixed with business logic. A bad transformation corrupts the only copy of the truth. Dashboards depend directly on ingestion tables. Rebuilds become expensive and risky. The medallion pattern works because it restores separation of concerns at the storage layer, not just in code.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Problem Medallion Architecture Solves</h2>
          <p>
            In a poorly structured lakehouse, the same table often serves too many purposes at once. It is the raw landing zone, the cleaned table, and the source for analytics. That creates operational pain immediately. If ingestion changes the schema unexpectedly, the dashboard breaks. If the analytics team needs denormalized fields for reporting, those changes leak backward into the ingestion model. If a transformation introduces bad data, you have no clean rollback point because the raw state was overwritten along the way.
          </p>
          <p>
            Medallion architecture solves this by giving each layer a single responsibility:
          </p>
          <ul>
            <li><strong>Bronze</strong>: ingest and preserve raw source data exactly as it arrived.</li>
            <li><strong>Silver</strong>: clean, validate, deduplicate, and conform that raw data into trustworthy business entities.</li>
            <li><strong>Gold</strong>: model those entities into analytics-ready tables, metrics, marts, and aggregates.</li>
          </ul>
          <p>
            The real benefit is not the names. The real benefit is that every layer can now be rebuilt from the layer below it without destroying the source of truth. That is what turns the architecture from a diagram into an operational advantage.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Bronze: Preserve the Raw Truth</h2>
          <p>
            The bronze layer should store data as close to source fidelity as possible. If the source emitted malformed values, nulls in unexpected places, duplicate messages, or schema drift, bronze should capture all of that. The goal is preservation, not cleanup.
          </p>
          <p>
            This makes bronze useful for three critical tasks: replay, audit, and debugging. When a downstream transformation looks wrong, you can inspect the bronze records to determine whether the issue came from the source or from your own logic. When a silver model breaks because an API vendor added a new field or changed a nested structure, the raw event is still there and can be reprocessed correctly after the transformation code is updated.
          </p>
          <p>
            Bronze tables should almost always include ingestion metadata even if the source did not provide it. At minimum, I want fields like <code>_ingested_at</code>, <code>_batch_id</code>, <code>_source_system</code>, and often a raw payload column for semi-structured data. That metadata is what makes the layer traceable.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Example bronze table pattern
CREATE TABLE bronze.orders_raw (
  _ingested_at TIMESTAMP,
  _batch_id STRING,
  _source_system STRING,
  _file_name STRING,
  payload STRING
)
USING iceberg
PARTITIONED BY (days(_ingested_at));`}
          </pre>
          <p>
            The discipline that matters most in bronze is immutability. If bronze is supposed to be your recoverable source of truth, do not run business cleanup logic there. Do not drop duplicates there. Do not attempt to fix malformed values there. Store what arrived. If compliance or storage cost requires retention limits, apply them deliberately and with clear policy, not ad hoc table maintenance performed by whoever happens to be troubleshooting a broken report.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Silver: Turn Raw Events Into Trusted Data</h2>
          <p>
            The silver layer is where engineering judgment begins to shape the data. This is where you parse JSON, cast types, standardize field names, validate ranges, enforce unique keys, deduplicate repeated events, and join across related raw sources to produce coherent entities. Silver is the contract layer for the rest of the organization. If another team wants a trustworthy view of customers, orders, or subscriptions, they should usually start here.
          </p>
          <p>
            A good rule is this: silver contains data that is clean enough to use, but still close enough to the source that it can support many downstream use cases. Gold is where the data becomes purpose-built. Silver is where it becomes dependable.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Example silver model
CREATE OR REPLACE TABLE silver.orders AS
SELECT
  CAST(json_extract_scalar(payload, '$.order_id') AS BIGINT) AS order_id,
  CAST(json_extract_scalar(payload, '$.customer_id') AS BIGINT) AS customer_id,
  CAST(json_extract_scalar(payload, '$.order_total') AS DECIMAL(18,2)) AS order_total,
  CAST(json_extract_scalar(payload, '$.order_timestamp') AS TIMESTAMP) AS order_timestamp,
  _ingested_at,
  _batch_id
FROM bronze.orders_raw
WHERE json_extract_scalar(payload, '$.order_id') IS NOT NULL
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY CAST(json_extract_scalar(payload, '$.order_id') AS BIGINT)
  ORDER BY _ingested_at DESC
) = 1;`}
          </pre>
          <p>
            This layer is also where most data quality testing belongs. Null checks, uniqueness constraints, accepted values, freshness expectations, and relationship tests all fit naturally in silver because this is the point where raw variability gets transformed into a defined business contract. If bronze preserves what happened, silver defines what is valid.
          </p>
          <p>
            Teams often ask whether slowly changing dimensions belong in silver or gold. My default answer is silver if the table represents a conformed business entity used by multiple downstream domains, and gold if the table is specific to a reporting use case. The question is less about the technique and more about the reuse boundary.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Gold: Optimize for Consumption</h2>
          <p>
            Gold is where the lakehouse becomes useful to the business. These are the dimensional models, summary tables, feature tables, metric marts, and reporting aggregates that people actually query in dashboards or downstream products. Gold tables are intentionally opinionated. They are not trying to be a universal representation of the business. They are trying to answer specific questions quickly and consistently.
          </p>
          <p>
            That means gold models should be shaped around consumption patterns. If finance needs daily revenue by region and channel, build exactly that. If product analytics needs session funnels by experiment cohort, build exactly that. Gold is allowed to denormalize aggressively, materialize expensive logic, and encode business definitions that would be too specialized for silver.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Example gold mart
CREATE OR REPLACE TABLE gold.daily_revenue AS
SELECT
  DATE(order_timestamp) AS order_date,
  customer_region,
  marketing_channel,
  COUNT(*) AS order_count,
  SUM(order_total) AS gross_revenue,
  AVG(order_total) AS average_order_value
FROM silver.orders_enriched
GROUP BY 1, 2, 3;`}
          </pre>
          <p>
            Because gold is derived, it is also the safest layer to rebuild aggressively. If an executive dashboard needs a new business definition of active customers, that change should happen in gold without forcing any redesign of bronze or silver. That containment is one of the best arguments for the architecture: you can evolve consumption logic without destabilizing ingestion logic.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why the Layering Prevents Cascading Failures</h2>
          <p>
            The most important property of the medallion pattern is failure isolation. If bronze ingestion succeeds but a silver transformation fails, you still have the raw data and can re-run silver later. If silver succeeds but a gold aggregation fails, analysts may temporarily lose a dashboard, but you have not compromised the conformed business entities underneath it. Each layer narrows the blast radius of mistakes made in the next one.
          </p>
          <p>
            This matters in production because failures are inevitable. APIs change. Schemas drift. Vendors send malformed data. Someone deploys a transformation with the wrong join key. In a layered system, those failures are recoverable. In a flat system, they are often destructive.
          </p>
          <p>
            The ability to rebuild is the real operational win. If silver logic changes, rebuild silver from bronze. If gold logic changes, rebuild gold from silver. You do not need custom rollback scripts or manual warehouse surgery. The architecture itself gives you a recovery path.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Incremental Processing Works Better With Clear Layers</h2>
          <p>
            Incremental processing becomes much easier when each layer has a defined contract. Bronze ingest jobs append new source data with ingestion metadata. Silver models process only the new bronze records since the last successful run and merge them into conformed tables. Gold models compute only the impacted partitions or downstream entities rather than scanning the full history every time.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Incremental silver pattern in dbt
{{ config(materialized='incremental', unique_key='order_id') }}

SELECT
  order_id,
  customer_id,
  order_total,
  order_timestamp,
  _ingested_at
FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
WHERE _ingested_at > (SELECT MAX(_ingested_at) FROM {{ this }})
{% endif %}`}
          </pre>
          <p>
            With this pattern, the system stays efficient as volume grows because you are not constantly reprocessing immutable history unless the business logic actually changed. And when the logic does change, the layer boundaries still tell you exactly how far back you need to rebuild.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Where dbt Fits</h2>
          <p>
            dbt maps naturally onto the medallion pattern. Bronze is usually produced by ingestion tooling or custom pipelines: Fivetran, Airbyte, Kafka consumers, Spark jobs, or vendor exports landing in object storage. dbt usually begins at the silver layer, where staging models clean and standardize the raw data. Intermediate models can continue the conformance work. Marts then become the gold layer.
          </p>
          <p>
            The value of dbt here is not just SQL templating. It is lineage, testing, and documentation. A dbt DAG gives you a live map from bronze-adjacent staging tables through silver entities into gold marts. The tests make the contracts explicit. The documentation makes the purpose of each layer visible to everyone using it.
          </p>
          <p>
            This is one of the strongest practical reasons to keep the layers clean. When the architecture is disciplined, the dbt graph is readable. When the architecture is sloppy, the graph becomes a knot of mixed concerns that nobody wants to touch.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Common Mistakes</h2>
          <p>
            <strong>Treating bronze like a dumping ground.</strong> Bronze should be raw, but not careless. It still needs metadata, naming standards, retention policies, and a known ingestion contract.
          </p>
          <p>
            <strong>Skipping silver.</strong> Teams often jump from raw ingestion directly to reporting marts because it feels faster. It is faster for a month. Then every dashboard implements slightly different cleanup logic and nobody agrees on the meaning of a customer or an order anymore.
          </p>
          <p>
            <strong>Allowing business logic into bronze.</strong> The moment you start mutating raw data to make it easier for analysts, bronze stops being reliable as a recovery layer.
          </p>
          <p>
            <strong>Making gold too generic.</strong> Gold should be optimized for use cases. If you try to keep gold as abstract as silver, you lose the performance and clarity benefits that make gold worth building in the first place.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why It Works</h2>
          <p>
            Medallion architecture works because it encodes a simple but powerful idea: raw data should remain recoverable, cleaned data should be trustworthy, and analytics data should be purpose-built. That separation reduces ambiguity, lowers operational risk, and makes change cheaper over time.
          </p>
          <p>
            The specific tools can vary. You can implement the pattern on Databricks, Snowflake, BigQuery, Trino, Spark, or any serious lakehouse stack. The names bronze, silver, and gold are not the important part. The important part is the discipline to keep the layers distinct enough that failures do not cascade and rebuilds remain possible when the system inevitably changes.
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
