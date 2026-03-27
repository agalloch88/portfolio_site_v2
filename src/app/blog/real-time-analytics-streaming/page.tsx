import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Real-Time Analytics: Building a Streaming Data Warehouse with Redpanda and Materialize | Ryan Kirsch",
  description:
    "A practical guide to real-time analytics pipelines. How to combine Redpanda (Kafka-compatible), Materialize (streaming SQL), and dbt to build a data warehouse that answers questions in milliseconds, not hours.",
  openGraph: {
    title:
      "Real-Time Analytics: Building a Streaming Data Warehouse with Redpanda and Materialize",
    description:
      "A practical guide to real-time analytics pipelines. How to combine Redpanda, Materialize, and dbt to build a data warehouse that answers questions in milliseconds, not hours.",
    type: "article",
    url: "https://ryankirsch.dev/blog/real-time-analytics-streaming",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Real-Time Analytics: Building a Streaming Data Warehouse with Redpanda and Materialize",
    description:
      "A practical guide to real-time analytics pipelines. How to combine Redpanda, Materialize, and dbt to build a data warehouse that answers questions in milliseconds, not hours.",
  },
  alternates: { canonical: "/blog/real-time-analytics-streaming" },
};

export default function RealTimeAnalyticsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/real-time-analytics-streaming"
  );
  const postTitle = encodeURIComponent(
    "Real-Time Analytics: Building a Streaming Data Warehouse with Redpanda and Materialize"
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
            Real-Time Analytics: Building a Streaming Data Warehouse with
            Redpanda and Materialize
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most analytics questions do not need real-time answers. But the ones
            that do -- fraud signals, live inventory, active user counts,
            operational dashboards -- are often the most valuable to a business.
            The challenge is building real-time without rebuilding your entire
            data stack. This guide shows how Redpanda and Materialize let you
            add streaming to an existing platform without a rewrite.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Real-Time Analytics Problem
            </h2>
            <p>
              Traditional data warehouses are optimized for batch. You run a
              pipeline every hour or every day, load the results, and analysts
              query the warehouse. This works well for historical analysis --
              what happened last quarter, what cohorts churned in the past
              year -- but falls apart when the question is &ldquo;what is happening
              right now.&rdquo;
            </p>
            <p>
              The naive fix is to run batches more frequently. Five-minute
              microbatches. One-minute microbatches. Eventually you are
              running Spark jobs every 30 seconds and discovering that your
              warehouse was never designed for that write frequency. You have
              table lock contention, duplicates in incremental models, and
              latency that keeps creeping up as the data volume grows.
            </p>
            <p>
              The real fix is to treat streaming as a first-class primitive.
              That means a messaging layer that handles high-throughput writes
              with durable replay (Kafka or a Kafka-compatible system), and a
              compute layer that can execute SQL continuously over changing data
              (a streaming database or materialized view engine).
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Redpanda: Kafka Without the Operational Overhead
            </h2>
            <p>
              Apache Kafka is the standard for high-throughput event streaming,
              but running Kafka in production is operationally intensive.
              Zookeeper (or KRaft), broker tuning, JVM heap management,
              partition rebalancing -- there is a reason Kafka expertise is its
              own career path.
            </p>
            <p>
              Redpanda is a Kafka-compatible message broker written in C++
              instead of Java/Scala. It is fully API-compatible with Kafka,
              which means any Kafka client, connector, or tool works with
              Redpanda without code changes. The operational difference is
              significant: no Zookeeper, no JVM, a single binary deployment,
              and meaningfully lower tail latency.
            </p>
            <p>
              For data engineers who know Kafka but are tired of JVM tuning,
              Redpanda is a drop-in that trades some ecosystem maturity for
              much easier operations. You produce and consume exactly as you
              would with Kafka:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from confluent_kafka import Producer, Consumer
import json

# Producer -- identical to Kafka
producer = Producer({
    "bootstrap.servers": "redpanda-broker:9092",
    "acks": "all",
    "retries": 3,
})

def on_delivery(err, msg):
    if err:
        print(f"Delivery failed: {err}")

producer.produce(
    topic="order-events",
    key="order-12345",
    value=json.dumps({
        "order_id": "order-12345",
        "customer_id": "cust-789",
        "amount_cents": 4999,
        "status": "created",
        "timestamp": "2026-03-27T14:30:00Z",
    }),
    callback=on_delivery,
)
producer.flush()

# Consumer -- also identical to Kafka
consumer = Consumer({
    "bootstrap.servers": "redpanda-broker:9092",
    "group.id": "analytics-consumer",
    "auto.offset.reset": "earliest",
})
consumer.subscribe(["order-events"])`}</code>
            </pre>
            <p>
              The Kafka-compatible API is why Redpanda is worth knowing even
              if you work primarily with managed Kafka (Confluent, MSK). The
              architecture knowledge transfers directly, and for local
              development or test environments, Redpanda spins up in a single
              Docker container in under 10 seconds.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Materialize: Streaming SQL That Feels Like a Database
            </h2>
            <p>
              Materialize is a streaming database built on Timely Dataflow and
              Differential Dataflow. From the user perspective, it looks like
              Postgres -- you connect with a Postgres client, write SQL, and
              query views. The difference is that those views are maintained
              incrementally in real time as new data arrives.
            </p>
            <p>
              Instead of writing a Flink job or a Spark Streaming application,
              you write a SQL CREATE MATERIALIZED VIEW. Materialize subscribes
              to the upstream source (a Kafka topic, a Postgres CDC feed) and
              keeps the view result fresh as events arrive. Query latency is
              in the milliseconds because the computation runs continuously --
              you are reading a precomputed result, not re-scanning data.
            </p>
            <p>
              Setting up a source from Redpanda:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Connect Materialize to Redpanda
CREATE CONNECTION redpanda_conn
TO KAFKA (
    BROKER 'redpanda-broker:9092'
);

-- Declare the schema
CREATE SOURCE order_events
FROM KAFKA CONNECTION redpanda_conn (TOPIC 'order-events')
FORMAT JSON
(
    order_id     TEXT,
    customer_id  TEXT,
    amount_cents BIGINT,
    status       TEXT,
    "timestamp"  TEXT
)
ENVELOPE NONE;

-- Create a continuously updated materialized view
CREATE MATERIALIZED VIEW active_orders_by_customer AS
SELECT
    customer_id,
    COUNT(*)              AS total_orders,
    SUM(amount_cents)     AS total_spent_cents,
    MAX("timestamp")      AS last_order_at
FROM order_events
WHERE status != 'cancelled'
GROUP BY customer_id;

-- This query returns fresh results in milliseconds
SELECT * FROM active_orders_by_customer
WHERE customer_id = 'cust-789';`}</code>
            </pre>
            <p>
              The view is incrementally maintained. When a new order event
              arrives for cust-789, Materialize updates only that row -- it
              does not re-scan the entire table. This is the core property
              that makes streaming SQL practical: sub-second latency without
              full recomputation on every query.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Connecting the Streaming Layer to dbt
            </h2>
            <p>
              One of the underappreciated properties of Materialize is its
              Postgres-compatible interface, which means dbt works with it
              almost out of the box. The dbt-materialize adapter lets you
              define streaming transformations as dbt models and run them
              through standard dbt commands.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# profiles.yml
materialize:
  target: dev
  outputs:
    dev:
      type: materialize
      host: localhost
      port: 6875
      user: materialize
      database: materialize
      schema: analytics

# models/streaming/customer_revenue_realtime.sql
# config block at top
# {{ config(materialized='materializedview') }}

SELECT
    customer_id,
    DATE_TRUNC('hour', "timestamp"::timestamptz) AS hour_bucket,
    COUNT(*)                                       AS orders,
    SUM(amount_cents) / 100.0                      AS revenue_usd
FROM {{ source('redpanda', 'order_events') }}
WHERE status = 'delivered'
GROUP BY 1, 2`}</code>
            </pre>
            <p>
              The materialized view model type tells dbt to create a
              Materialize-maintained view rather than a standard table or view.
              dbt handles the lineage, documentation, and testing -- the same
              workflow you use for batch dbt models -- but the underlying
              computation is streaming.
            </p>
            <p>
              This is the architectural win: your team does not need to learn
              Flink or Spark Streaming. Data engineers who know dbt can write
              streaming transformations. The streaming complexity is abstracted
              into the adapter layer.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              A Full Real-Time Analytics Stack
            </h2>
            <p>
              Combining the pieces into a production-grade real-time analytics
              architecture:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Event producers</strong> -- application services,
                microservices, webhooks -- publish to Redpanda topics.
                Kafka-compatible clients, zero code changes from Kafka.
              </li>
              <li>
                <strong>Materialize</strong> subscribes to Redpanda topics and
                maintains materialized views. SQL-defined transformations,
                millisecond query latency.
              </li>
              <li>
                <strong>dbt-materialize</strong> manages the transformation
                layer. Streaming models live in the same dbt project as batch
                models, unified lineage and documentation.
              </li>
              <li>
                <strong>Downstream BI tools</strong> connect to Materialize
                via Postgres driver. Metabase, Superset, Grafana -- any tool
                that speaks Postgres works without modification.
              </li>
              <li>
                <strong>Batch warehouse</strong> (Snowflake, BigQuery) runs in
                parallel for historical analysis and complex aggregations that
                do not need real-time latency.
              </li>
            </ul>
            <p>
              The parallel operation is intentional. Real-time does not replace
              batch for all use cases. Operational dashboards and fraud signals
              belong in the streaming layer. Historical cohort analysis and
              month-end revenue attribution belong in the batch warehouse. The
              right architecture uses both.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When Real-Time Is Worth It
            </h2>
            <p>
              Real-time infrastructure adds operational complexity. Before
              reaching for Redpanda and Materialize, verify the business
              case clearly.
            </p>
            <p>
              Real-time is worth the investment when:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Decisions depend on freshness.</strong> Fraud detection,
                inventory management, live bidding systems, and operational
                SLA tracking all degrade meaningfully with batch latency.
              </li>
              <li>
                <strong>User-facing features need it.</strong> If a product
                feature shows a live metric to users (active users online,
                real-time leaderboards, live transaction counts), the data
                needs to be seconds-fresh, not hours-fresh.
              </li>
              <li>
                <strong>The volume justifies streaming.</strong> High-frequency
                event streams -- clickstreams, IoT sensors, payment
                transactions -- generate data continuously. Batch pipelines
                on these sources often create backpressure problems that
                streaming solves naturally.
              </li>
            </ul>
            <p>
              Real-time is likely overkill when stakeholders only look at
              dashboards once a day, when the business cadence is weekly or
              monthly, or when your current batch pipeline already runs fast
              enough. Adding streaming for its own sake creates maintenance
              burden without business value.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Getting Started Without Rebuilding Everything
            </h2>
            <p>
              The practical starting point is to identify one high-value
              real-time use case -- typically an operational dashboard or a
              fraud/anomaly detection signal -- and build the streaming path
              only for that use case. Leave everything else in the batch
              warehouse.
            </p>
            <p>
              Redpanda runs locally in Docker and Materialize has a developer
              tier. You can prototype a working end-to-end streaming pipeline
              in an afternoon without any cloud infrastructure. Once the pattern
              is proven, moving to managed Redpanda Cloud and Materialize Cloud
              is straightforward.
            </p>
            <p>
              The combination of Kafka-compatible streaming (Redpanda),
              streaming SQL (Materialize), and familiar dbt workflows lowers
              the barrier to real-time analytics further than it has ever been.
              You do not need a dedicated streaming team or deep Flink expertise
              to deliver millisecond query latency. You need a clear use case,
              the right tooling, and a dbt model.
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
