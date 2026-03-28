import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Real-Time Data Engineering: Kafka, Flink, and the Stream Processing Stack",
  description:
    "Why batch is no longer enough, what the real-time stack actually looks like, and how to build streaming pipelines that survive production.",
  openGraph: {
    title: "Real-Time Data Engineering: Kafka, Flink, and the Stream Processing Stack",
    description:
      "Why batch is no longer enough, what the real-time stack actually looks like, and how to build streaming pipelines that survive production.",
    type: "article",
    url: "https://ryankirsch.dev/blog/real-time-data-engineering-kafka-flink",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time Data Engineering: Kafka, Flink, and the Stream Processing Stack",
    description:
      "Why batch is no longer enough, what the real-time stack actually looks like, and how to build streaming pipelines that survive production.",
  },
  alternates: { canonical: "/blog/real-time-data-engineering-kafka-flink" },
};

export default function RealTimeDataEngineeringKafkaFlinkPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/real-time-data-engineering-kafka-flink"
  );
  const postTitle = encodeURIComponent(
    "Real-Time Data Engineering: Kafka, Flink, and the Stream Processing Stack"
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
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">Blog</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Real-Time Data Engineering: Kafka, Flink, and the Stream Processing Stack
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 28, 2026 · <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Why batch is no longer enough, what the real-time stack actually looks like, and
            how to build streaming pipelines that survive production. This is not a beginner
            primer. If you already run batch pipelines, you are ready for the real question:
            where do you introduce streaming without inheriting a permanent on-call burden?
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Real-Time Is No Longer a Big Tech Luxury
            </h2>
            <p className="leading-relaxed">
              The practical shift in 2026 is not that every company wants streaming. It is
              that the margin between a useful batch pipeline and a useless one is shrinking.
              Fraud detection is the obvious example. A nightly job that flags fraud after the
              funds already settled is a compliance artifact, not a control. Retail inventory
              is the same story. A batch refresh that misses a flash sale drives stockouts or
              oversells in minutes. Recommendation systems are now expected to respond to a
              user&apos;s last click, not their behavior from yesterday.
            </p>
            <p className="leading-relaxed">
              The real driver is operational feedback loops. Customer support teams want
              anomaly alerts while the incident is still small. Growth teams want triggered
              campaigns while the user is still on the site. Finance teams want spend alerts
              before the budget is blown. These are not big tech fantasies. They are
              mainstream expectations now, and they are hard to meet with a batch-only stack.
            </p>
            <p className="leading-relaxed">
              This does not mean you replace your warehouse with a stream processor. It means
              you add a real-time layer where time actually matters, and keep batch for the
              heavy lifting where accuracy and cost efficiency dominate. The rest of this post
              is about building that layer without turning your data platform into a 24/7
              fire drill.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Kafka Fundamentals for Data Engineers
            </h2>
            <p className="leading-relaxed">
              Kafka is not a queue; it is a distributed log. That distinction matters because
              logs scale by partitioning and are consumed by multiple independent readers.
              From a data engineering perspective, that makes Kafka a time-ordered write-ahead
              log for events, not a transient message bus. You choose retention, partition
              count, and compaction policy. Those decisions define how much history you can
              replay and how much parallelism you can buy.
            </p>
            <p className="leading-relaxed">
              A <strong>topic</strong> is the logical stream. You should name it like a table
              because it becomes the upstream contract. If you treat topics as throwaway
              channels, you end up with orphaned consumers and shadow pipelines. A topic should
              exist because it is a product. Make the schema explicit, version it, and treat
              its retention as a replay policy, not a storage default.
            </p>
            <p className="leading-relaxed">
              A <strong>partition</strong> is your throughput and ordering boundary. Kafka
              guarantees ordering within a partition and zero ordering across partitions. That
              means you must decide which entity requires ordering. If it is a user, partition
              by user ID. If it is an order, partition by order ID. If you do not know yet,
              choose a key that lets you scale later. Repartitioning after consumers are built
              is expensive and can break stateful processors.
            </p>
            <p className="leading-relaxed">
              A <strong>consumer group</strong> is the scaling unit. Within a group, each
              partition is owned by exactly one consumer. That gives you a simple throughput
              rule: maximum parallelism equals partitions. If your consumers are CPU bound, add
              partitions. If they are I/O bound, add more consumers. If you hit the partition
              ceiling, you are out of scale headroom.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# Topic design for real-time inventory events
# 48 partitions: enough consumer parallelism for hourly spikes
# 3-day retention: replay for incident recovery, not data warehousing

kafka-topics --create \\
  --topic inventory-events \\
  --partitions 48 \\
  --replication-factor 3 \\
  --config retention.ms=259200000 \\
  --config cleanup.policy=delete \\
  --config compression.type=lz4`}
              </pre>
            </div>
            <p className="leading-relaxed">
              These settings are not one-size-fits-all, but they reflect the core DE mindset:
              use Kafka for durable event streams with enough history to recover and replay, not
              for long-term storage. Your warehouse or lakehouse still owns analytics-grade
              history.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Kafka Streams vs Flink vs Spark Structured Streaming
            </h2>
            <p className="leading-relaxed">
              The choice of stream processor is mostly about state management and operational
              model, not syntax. All three can read from Kafka and produce outputs. The hard
              part is how they handle state, time, and failure recovery.
            </p>
            <p className="leading-relaxed">
              <strong>Kafka Streams</strong> is a library, not a platform. That is the point.
              You embed it in a JVM service, deploy it like any other service, and keep its
              state in local RocksDB with Kafka changelog topics for recovery. Use it when you
              want low operational overhead, tight integration with Kafka, and relatively
              simple stateful transforms. It shines for per-key aggregations, stream-table
              joins, and compacted state stores. It struggles when you need multi-cluster
              processing, complex event-time semantics, or large state that exceeds local
              disks.
            </p>
            <p className="leading-relaxed">
              <strong>Flink</strong> is a dedicated stream processing engine. It assumes you
              are serious about stateful processing and want fine-grained control over
              checkpoints, watermarks, backpressure, and exactly-once guarantees across sinks.
              Flink is the right choice when event time is real, when you need long-running
              state, or when the cost of reprocessing is unacceptable. The tradeoff is
              operational: you run a Flink cluster, manage savepoints, and treat it as part of
              your data platform rather than a library.
            </p>
            <p className="leading-relaxed">
              <strong>Spark Structured Streaming</strong> is the streaming extension of a
              batch engine. That is both its strength and its limitation. You get a familiar
              DataFrame API, a shared codebase with batch jobs, and a strong ecosystem. You
              also inherit micro-batch semantics for most workloads, which is often fine but
              rarely sub-second. Spark is great when you already run Spark at scale and want
              streaming for near-real-time analytics, especially when you can tolerate seconds
              of latency.
            </p>
            <p className="leading-relaxed">
              A pragmatic rule: use Kafka Streams when you want to keep it inside application
              services, use Flink when you need true event-time processing and stateful
              correctness, and use Spark when streaming is adjacent to your existing batch
              stack and latency tolerance is in the seconds range.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Event Time, State, and the Quiet Failure Modes
            </h2>
            <p className="leading-relaxed">
              Most streaming bugs are not crashes. They are subtle correctness issues caused by
              time semantics. Event time is when the event happened. Processing time is when
              your job saw it. If you aggregate by processing time, late events land in the
              wrong window and your metrics drift. If you aggregate by event time, you need
              watermarks and a late data strategy, or your state grows without bound.
            </p>
            <p className="leading-relaxed">
              In Flink, watermarks are how you trade off correctness and latency. A watermark
              of five seconds means you accept events that arrive up to five seconds late. That
              might be fine for clickstream analytics, and completely wrong for fraud scoring
              that must include every event. In Spark, the equivalent is watermarking and
              late-data handling in Structured Streaming. Kafka Streams handles this through
              grace periods on windowed aggregations. Different APIs, same core decision.
            </p>
            <p className="leading-relaxed">
              State is the other hidden cost. Every keyed aggregation or join stores state per
              key. That state must be checkpointed, restored, and cleaned up. If you do not set
              TTLs and compaction policies, state sizes explode and checkpoints become
              unmanageable. The most reliable streaming jobs keep state minimal: use pre-joined
              reference data, avoid unbounded joins, and push expensive enrichment to batch
              unless it is strictly required for real-time outputs.
            </p>
            <p className="leading-relaxed">
              This is why the real-time stack is a system, not a single tool. You need to
              design for late data, backfills, and state cleanup from day one. If you cannot
              reprocess a topic without manual surgery, your pipeline is fragile. The correct
              approach is to treat Kafka retention as your replay window and to keep a clear
              mapping from offsets to lakehouse tables so you can recompute deterministically.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Real-Time Lakehouse Pattern: Kafka → Flink → Delta/Iceberg
            </h2>
            <p className="leading-relaxed">
              The most stable real-time architecture today is a streaming ingestion layer that
              lands into open table formats. Kafka captures the event stream, Flink handles
              stateful transforms and schema enforcement, and the sink writes to Delta Lake or
              Iceberg. That gives you exactly-once writes, schema evolution controls, and
              unified batch + streaming queries in the lakehouse.
            </p>
            <p className="leading-relaxed">
              The key design decision is where you apply transformations. In practice, you
              want the streaming layer to do only what is required for correctness and
              usability: schema validation, enrichment from reference data, and essential
              aggregations. Everything else should wait for batch models downstream. That
              keeps your streaming jobs stable and limits state growth.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`// Flink SQL: ingest Kafka events and write to Iceberg
CREATE TABLE inventory_events (
  sku STRING,
  warehouse_id STRING,
  event_type STRING,
  quantity INT,
  event_time TIMESTAMP(3),
  WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'inventory-events',
  'properties.bootstrap.servers' = 'kafka-1:9092,kafka-2:9092',
  'format' = 'avro'
);

CREATE TABLE lakehouse.inventory_events (
  sku STRING,
  warehouse_id STRING,
  event_type STRING,
  quantity INT,
  event_time TIMESTAMP(3)
) WITH (
  'connector' = 'iceberg',
  'catalog-name' = 'hive',
  'warehouse' = 's3://lakehouse/',
  'format-version' = '2'
);

INSERT INTO lakehouse.inventory_events
SELECT sku, warehouse_id, event_type, quantity, event_time
FROM inventory_events;`}
              </pre>
            </div>
            <p className="leading-relaxed">
              This pattern turns your stream into a first-class table. Analysts can query it
              with Trino, Spark, or DuckDB. dbt can build incremental models on top of it.
              And if the streaming job fails, you replay from Kafka offsets without losing
              data. The lakehouse becomes the integration point between streaming and batch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Operational Realities: Lag, Schemas, Exactly-Once
            </h2>
            <p className="leading-relaxed">
              The true cost of streaming shows up in operations. The pipeline is only as good
              as the metrics and runbooks around it. The first metric is consumer lag. Lag is
              your early warning system that processing has fallen behind. It is also your
              capacity planning signal. If lag grows during normal traffic, you need more
              partitions, more consumers, or lower-cost transforms.
            </p>
            <p className="leading-relaxed">
              Backpressure is the second operational reality. When a downstream sink slows
              down, the stream processor must either buffer or shed load. In Flink, that means
              checkpoint duration spikes and source reads slow automatically. In Kafka Streams,
              it means your application threads spend more time committing state and less time
              consuming. You need alerts on checkpoint duration and end-to-end latency, not
              just raw throughput, or you will miss the slow bleed that eventually turns into
              hours of lag.
            </p>
            <p className="leading-relaxed">
              Schema evolution is the next operational cliff. Streaming systems do not tolerate
              breaking changes. If a producer renames a field or changes a type, every
              downstream consumer can fail simultaneously. The fix is strict schema governance:
              use a registry, enforce compatibility rules, and block incompatible publishes.
              If you treat schema as a human document instead of an enforced contract, you are
              gambling with production stability.
            </p>
            <p className="leading-relaxed">
              Exactly-once semantics are real but conditional. In Kafka, idempotent producers
              eliminate duplicates on retries. In Flink, checkpoints plus transactional sinks
              can give you end-to-end exactly-once into Iceberg or Delta. In Spark, the
              guarantees depend on your sink and checkpoint configuration. The mistake is
              assuming exactly-once without verifying every hop. You either have it end to
              end, or you do not.
            </p>
            <p className="leading-relaxed">
              The practical guidance: start with at-least-once and dedup downstream, then
              upgrade to exactly-once only where the cost of duplicates is higher than the
              operational complexity. Many teams burn months chasing theoretical correctness
              while ignoring lag alerts and schema enforcement, which are the actual sources of
              production incidents.
            </p>
            <p className="leading-relaxed">
              Finally, plan for replays. You will need to backfill after a schema bug, a bad
              transformation, or a downstream outage. The cleanest approach is to write idempotent
              sink logic, track offsets alongside data in the lakehouse, and keep Kafka retention
              long enough to recover without a special restore process. If your only backfill
              plan is to rerun a batch job, you have not built a real-time system. You have built
              a fragile batch system with extra failure modes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How dbt Fits in a Streaming World
            </h2>
            <p className="leading-relaxed">
              dbt is still the right tool for most transforms, even when the data arrives in
              real time. The shift is not in the tool, but in the tables it models. Instead of
              building models on daily batch tables, you build them on streaming landing tables
              inside your lakehouse or warehouse.
            </p>
            <p className="leading-relaxed">
              The common pattern is to stream raw events into a bronze table, apply light
              cleaning and dedup in a silver table with dbt incremental models, and then build
              business-ready gold models on top. The streaming layer focuses on data
              correctness and freshness. dbt focuses on business logic, semantic consistency,
              and historical backfills. That division keeps streaming jobs thin and lets dbt
              handle the complexity it is designed for.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`-- dbt incremental model on top of streaming events
{{ config(materialized='incremental', unique_key='event_id') }}

select
  event_id,
  sku,
  warehouse_id,
  event_type,
  quantity,
  event_time
from {{ source('lakehouse', 'inventory_events') }}

{% if is_incremental() %}
  where event_time > (select max(event_time) from {{ this }})
{% endif %}`}
              </pre>
            </div>
            <p className="leading-relaxed">
              dbt does not make your pipeline real-time by itself. It makes your real-time
              data trustworthy and consumable. If you do not model streaming tables, you end
              up with a firehose of raw events that nobody can use. If you do, you get the same
              downstream consistency you already have in batch, with much fresher data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Putting It Together: A Pragmatic Streaming Stack
            </h2>
            <p className="leading-relaxed">
              A production-ready stack does not try to make everything real-time. It introduces
              streaming where latency is a business requirement, and keeps batch everywhere
              else. A typical architecture looks like this: producers publish events to Kafka,
              Flink or Kafka Streams performs stateful enrichment and windowed aggregation,
              results land in Delta Lake or Iceberg, and dbt builds the analytical models on
              top. Monitoring covers lag, schema registry compatibility, and checkpoint health.
              Alerts focus on freshness SLAs, not raw task failures.
            </p>
            <p className="leading-relaxed">
              The goal is boring reliability, not maximal novelty. Streaming should reduce risk
              by providing earlier signals, not increase risk by becoming a fragile, opaque
              subsystem. If the team can explain how to replay, how to handle schema evolution,
              and how to backfill without downtime, then the stack is ready for production. If
              not, it is a demo.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-steel/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-mutedGray">
              Questions or pushback on any of this?{" "}
              <a
                href="https://www.linkedin.com/in/ryanmkirsch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electricBlue hover:text-white transition-colors"
              >
                Find me on LinkedIn.
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-8 p-5 bg-steel/5 rounded-xl border border-steel/20">
            <p className="text-sm text-mutedGray leading-relaxed">
              <strong className="text-white">Ryan Kirsch</strong> is a senior data engineer
              with 8+ years building data infrastructure at media, SaaS, and fintech companies.
              He specializes in Kafka, dbt, Snowflake, and Airflow, and writes about data
              engineering patterns from production experience.{" "}
              <Link href="/" className="text-electricBlue hover:text-white transition-colors">
                See his full portfolio.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
