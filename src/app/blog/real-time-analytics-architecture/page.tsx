import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Real-Time Analytics Architecture: From Kafka to ClickHouse",
  description:
    "A practical breakdown of the real-time analytics stack: event ingestion via Kafka, stream processing with Flink or Spark Structured Streaming, OLAP storage in ClickHouse or Apache Druid, and when real-time is actually worth the complexity.",
  openGraph: {
    title: "Real-Time Analytics Architecture: From Kafka to ClickHouse",
    description:
      "A practical breakdown of the real-time analytics stack: event ingestion via Kafka, stream processing with Flink or Spark Structured Streaming, OLAP storage in ClickHouse or Apache Druid, and when real-time is actually worth the complexity.",
    type: "article",
    url: "https://ryankirsch.dev/blog/real-time-analytics-architecture",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time Analytics Architecture: From Kafka to ClickHouse",
    description:
      "A practical breakdown of the real-time analytics stack: event ingestion via Kafka, stream processing with Flink or Spark Structured Streaming, OLAP storage in ClickHouse or Apache Druid, and when real-time is actually worth the complexity.",
  },
  alternates: { canonical: "/blog/real-time-analytics-architecture" },
};

export default function RealTimeAnalyticsArchitecturePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/real-time-analytics-architecture"
  );
  const postTitle = encodeURIComponent(
    "Real-Time Analytics Architecture: From Kafka to ClickHouse"
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
            Real-Time Analytics Architecture: From Kafka to ClickHouse
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">10-12 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Real-time analytics sounds like a simple upgrade from batch until you
            actually build it. The stack is deeper, the failure modes are stranger,
            and the business case is narrower than most stakeholders assume. Here is
            the full architecture, when it is worth it, and how to build it without
            fighting every layer.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <p className="leading-relaxed">
              Most analytics workloads do not need real-time. The dashboard that
              refreshes every morning is fine for the vast majority of business
              questions. But there are genuine use cases where sub-minute latency
              changes outcomes: fraud detection, live operational metrics, product
              funnel monitoring, and user-facing features that surface personalized
              data. For those cases, a real-time analytics stack built around Kafka,
              a stream processor, and an OLAP engine is the right tool. This post
              covers how to build it and how to avoid the traps that make it brittle.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">When Real-Time Is Actually Worth It</h2>
            <p className="leading-relaxed">
              Before discussing the stack, it is worth being honest about the
              tradeoffs. Real-time analytics adds operational complexity at every
              layer. Kafka clusters need tuning and monitoring. Stream processors
              require state management and exactly-once semantics if you care about
              correctness. OLAP databases like ClickHouse have their own performance
              characteristics that differ sharply from warehouse engines.
            </p>
            <p className="leading-relaxed">
              Real-time is justified when the latency reduction changes a decision
              or outcome. Fraud scoring that runs on 15-minute-old data is
              meaningfully worse than scoring on second-old data. A live conversion
              funnel that engineering monitors during a deploy gives them actionable
              signal in the moment, not a post-mortem. A user-facing feature that
              shows real-time engagement is a product capability, not just a dashboard
              improvement.
            </p>
            <p className="leading-relaxed">
              If the business question is &quot;how did we do last week,&quot; batch wins.
              Build the real-time stack for the questions where the answer needs to
              be now.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Architecture: Four Layers</h2>
            <p className="leading-relaxed">
              A production real-time analytics stack has four layers: event ingestion,
              stream processing, OLAP storage, and a serving or dashboarding layer.
              Each layer has well-established tooling choices and a set of decisions
              that have outsized impact on reliability and performance.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`Event Sources (apps, services, databases)
        |
        v
[Layer 1] Kafka (event ingestion + durable log)
        |
        v
[Layer 2] Flink or Spark Structured Streaming (transformations, joins, aggregations)
        |
        v
[Layer 3] ClickHouse or Apache Druid (OLAP storage + fast queries)
        |
        v
[Layer 4] Grafana / Superset / custom API (dashboarding + serving)`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Each layer is independently scalable and replaceable. The interfaces
              between them are standard: Kafka topics as the handoff between ingestion
              and processing, and the stream processor writing directly to the OLAP
              engine via its native connector or an HTTP insert API.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Layer 1: Event Ingestion via Kafka</h2>
            <p className="leading-relaxed">
              Kafka is the standard ingestion layer for real-time analytics. Its
              value here is not just transport but durability and replayability. If
              the downstream processor falls behind or fails, events remain in the
              log and can be replayed. That replay capability is the safety net that
              makes the rest of the stack recoverable.
            </p>
            <p className="leading-relaxed">
              For analytics ingestion, key decisions include partition count,
              retention, and schema enforcement. Partition count determines
              parallelism: too few partitions bottleneck your consumers, too many
              create coordination overhead. A starting point for most analytics
              topics is 12 to 24 partitions, scaled up if consumer lag grows.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`from confluent_kafka import Producer
import json

conf = {
    "bootstrap.servers": "kafka-broker-1:9092,kafka-broker-2:9092",
    "acks": "all",
    "enable.idempotence": True,
    "linger.ms": 10,
    "compression.type": "snappy",
}

producer = Producer(conf)

def emit_event(topic: str, key: str, payload: dict) -> None:
    producer.produce(
        topic=topic,
        key=key.encode("utf-8"),
        value=json.dumps(payload).encode("utf-8"),
    )
    producer.poll(0)

emit_event(
    "pageview_events",
    key="user_8821",
    payload={"user_id": 8821, "page": "/checkout", "ts": "2026-03-21T14:01:00Z"},
)
producer.flush()`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Schema registry is non-negotiable for production. Without it, schema
              drift between producers and consumers becomes a silent corruption
              problem. Use Confluent Schema Registry with Avro or Protobuf so
              consumers can validate messages at read time and producers get
              compatibility checks before shipping a breaking change.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Layer 2: Stream Processing with Flink or Spark</h2>
            <p className="leading-relaxed">
              The stream processing layer handles transformations, stateful
              aggregations, joins, and enrichment before data hits the OLAP store.
              The two dominant choices are Apache Flink and Spark Structured Streaming.
              Both are production-proven at scale. The choice usually comes down to
              your team&apos;s existing expertise and your latency requirements.
            </p>
            <p className="leading-relaxed">
              Flink is the better choice for low-latency stateful processing. Its
              event-time semantics and watermark handling are more mature, and its
              state backend options give you fine-grained control over exactly-once
              guarantees. If you need sub-second aggregations or complex windowed
              joins, Flink is where I would start.
            </p>
            <p className="leading-relaxed">
              Spark Structured Streaming is the right choice if your team is already
              running Spark and the incremental operational complexity of adding Flink
              is not justified. Micro-batch latency of a few seconds is acceptable for
              many analytics use cases, and the Spark ecosystem integration with Delta
              Lake and dbt is mature.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# Spark Structured Streaming: sessionized pageview counts
from pyspark.sql import SparkSession
from pyspark.sql.functions import window, count, col

spark = SparkSession.builder.appName("pageview_agg").getOrCreate()

raw = (
    spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "kafka-broker-1:9092")
    .option("subscribe", "pageview_events")
    .load()
)

from pyspark.sql.functions import from_json, to_timestamp
from pyspark.sql.types import StructType, StringType, LongType

schema = (
    StructType()
    .add("user_id", LongType())
    .add("page", StringType())
    .add("ts", StringType())
)

parsed = raw.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*").withColumn("event_time", to_timestamp("ts"))

agg = (
    parsed.withWatermark("event_time", "30 seconds")
    .groupBy(window("event_time", "1 minute"), "page")
    .agg(count("*").alias("views"))
)

query = (
    agg.writeStream.format("console")
    .outputMode("update")
    .start()
)
query.awaitTermination()`}
              </pre>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Layer 3: OLAP Storage in ClickHouse or Druid</h2>
            <p className="leading-relaxed">
              The OLAP layer is what makes real-time analytics queryable at scale.
              Both ClickHouse and Apache Druid are purpose-built for fast aggregation
              queries over large volumes of time-series and event data. They use
              columnar storage, skip indexes, and vectorized execution to answer
              queries in milliseconds that would take seconds or minutes in a
              traditional row-store database.
            </p>
            <p className="leading-relaxed">
              ClickHouse is my default recommendation for greenfield projects. Its
              SQL dialect is familiar, the documentation is excellent, and its
              MergeTree engine family handles a wide range of use cases out of the
              box. Druid has stronger native streaming ingestion support and better
              pre-aggregation capabilities for extremely high cardinality workloads,
              but comes with significantly more operational overhead.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`-- ClickHouse table for pageview events
CREATE TABLE pageview_events (
    event_time   DateTime,
    user_id      UInt64,
    page         String,
    session_id   String
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_time)
ORDER BY (event_time, user_id)
TTL event_time + INTERVAL 90 DAY;

-- Real-time query: top pages in last 5 minutes
SELECT
    page,
    count() AS views
FROM pageview_events
WHERE event_time >= now() - INTERVAL 5 MINUTE
GROUP BY page
ORDER BY views DESC
LIMIT 20;`}
              </pre>
            </div>
            <p className="leading-relaxed">
              ClickHouse ingestion from Kafka is handled by its Kafka engine, which
              reads directly from topics. Alternatively, the stream processor writes
              to ClickHouse via its HTTP insert API or the native client. For most
              teams, having the stream processor own the write simplifies the
              architecture and keeps transformation logic in one place.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Layer 4: Dashboarding and Serving</h2>
            <p className="leading-relaxed">
              ClickHouse and Druid both integrate directly with Grafana and Apache
              Superset for dashboarding. For operational metrics and live monitoring,
              Grafana is the standard choice. For ad-hoc analytical queries and
              business dashboards, Superset or Metabase work well with ClickHouse
              as the backend.
            </p>
            <p className="leading-relaxed">
              For user-facing real-time features, a thin API layer queries ClickHouse
              directly. Response times in the single-digit milliseconds for
              pre-aggregated queries make this viable for production API traffic.
              Materialize pre-computed aggregations into summary tables if query
              patterns are consistent: that is where ClickHouse&apos;s materialized
              view feature earns its place in the architecture.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Real-Time vs. Batch: The Honest Comparison</h2>
            <p className="leading-relaxed">
              Real-time adds latency sensitivity at every step. A batch pipeline that
              runs once an hour is forgiving: a 10-minute delay in one component is
              invisible. A real-time pipeline that targets 30-second end-to-end
              latency has no slack. Every component needs monitoring, alerting, and
              a defined degradation path.
            </p>
            <p className="leading-relaxed">
              The operational costs are real. Kafka cluster management, stream
              processor state backend maintenance, and OLAP engine tuning are each
              non-trivial ongoing investments. If you can answer the business question
              with a 15-minute batch refresh, that is usually the right architecture.
              The real-time stack earns its place when latency reduction produces
              measurable business value.
            </p>
            <p className="leading-relaxed">
              A hybrid approach often works well: run the real-time stack for the
              handful of metrics that genuinely need sub-minute freshness, and run
              batch for everything else. Trying to put all analytics through the
              real-time stack is over-engineering that increases cost and complexity
              without proportional return.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Stack in One Sentence</h2>
            <p className="leading-relaxed">
              For most teams building real-time analytics in 2026: Kafka for ingestion
              and durability, Flink or Spark Structured Streaming for transformations,
              ClickHouse for fast OLAP queries, and Grafana or Superset for serving.
              Each component is production-proven, horizontally scalable, and well
              documented. The complexity is real, but the stack is not mysterious:
              it is four well-understood layers with clear interfaces between them.
              Build it incrementally, instrument every layer from day one, and treat
              consumer lag as your primary health signal.
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
              <strong className="text-white">Ryan Kirsch</strong> is a senior data
              engineer with 8+ years building data infrastructure at media, SaaS, and
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Airflow,
              and writes about data engineering patterns from production experience.{" "}
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
    </main>
  );
}
