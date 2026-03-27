import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Event-Driven Architecture for Data Engineers: When and How to Build Event Pipelines | Ryan Kirsch",
  description:
    "A practical guide to event-driven architecture from a data engineering perspective. When event streaming is the right choice, how to design event schemas, the consumer patterns that matter, and what event-driven architecture looks like alongside a batch warehouse.",
  openGraph: {
    title:
      "Event-Driven Architecture for Data Engineers: When and How to Build Event Pipelines",
    description:
      "When event streaming is right, how to design event schemas, consumer patterns, and what event-driven architecture looks like alongside a batch warehouse.",
    type: "article",
    url: "https://ryankirsch.dev/blog/event-driven-architecture-data-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Event-Driven Architecture for Data Engineers: When and How to Build Event Pipelines",
    description:
      "When event streaming is right, how to design event schemas, consumer patterns, and what event-driven architecture looks like alongside a batch warehouse.",
  },
  alternates: {
    canonical: "/blog/event-driven-architecture-data-engineering",
  },
};

export default function EventDrivenArchitecturePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/event-driven-architecture-data-engineering"
  );
  const postTitle = encodeURIComponent(
    "Event-Driven Architecture for Data Engineers: When and How to Build Event Pipelines"
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
            Event-Driven Architecture for Data Engineers: When and How to
            Build Event Pipelines
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Event-driven architecture gets framed as a software engineering
            concern, but data engineers live in it whether they realize it
            or not. Every webhook, every CDC feed, every clickstream is an
            event stream. Understanding event-driven patterns -- how to design
            events, how to consume them reliably, and when they are worth the
            complexity -- is increasingly core to senior data engineering work.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What Makes Something an Event
            </h2>
            <p>
              An event represents something that happened at a specific point
              in time. It is immutable -- it cannot be changed after it occurs.
              A user clicked a button. An order was placed. A payment failed.
              These are facts about the world at a moment in time.
            </p>
            <p>
              This is distinct from a state update. &ldquo;The customer&apos;s email
              address is currently X&rdquo; is state. &ldquo;The customer changed their
              email address at 3:47 PM on March 27&rdquo; is an event. Both are
              useful for different purposes, and the right data platform often
              needs both.
            </p>
            <p>
              The data engineering value of events:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Complete history.</strong> A stream of events lets you
                reconstruct the state of any entity at any point in time.
                Current state (what a table row says today) cannot do this --
                it only reflects the most recent update.
              </li>
              <li>
                <strong>Decoupling.</strong> Event producers do not need to
                know about event consumers. A new analytics use case can
                subscribe to an existing event stream without changing the
                producer.
              </li>
              <li>
                <strong>Replay.</strong> When your pipeline logic changes,
                you can replay historical events through the new logic without
                asking source systems to re-export data.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Event Schema Design: Decisions That Matter
            </h2>
            <p>
              Event schema design is one of the highest-impact decisions in
              an event-driven system. Events are immutable once emitted, which
              means schema mistakes are permanent. The schema you define today
              will be in your event store for years.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Good event schema design - CloudEvents-inspired
{
  # Standard envelope fields (required on ALL events)
  "id": "01HZGT...",           # UUID, globally unique
  "specversion": "1.0",
  "type": "com.company.orders.created",  # Reverse-DNS namespaced
  "source": "/orders-service/v2",
  "time": "2026-03-27T14:30:00Z",        # RFC 3339, always UTC

  # Event-specific data
  "data": {
    "order_id": "ord_abc123",
    "customer_id": "cust_xyz789",
    "amount_cents": 4999,
    "currency": "USD",
    "line_items": [
      {"product_id": "prod_001", "quantity": 2, "unit_price_cents": 2499}
    ],
    "status": "created"
  },
  
  # Schema version for evolution
  "dataschema": "https://schemas.company.com/orders/created/v2"
}`}</code>
            </pre>
            <p>
              The design decisions that cause the most downstream pain:
            </p>
            <p>
              <strong>Embedding state instead of change.</strong> An event
              named <code>order.status_changed</code> should include both the
              old status and the new status, not just the new status. A consumer
              that needs to count transitions (pending to processing, processing
              to shipped) needs both values. If you only emit the new status,
              you cannot reconstruct the transition without joining to a
              separate state table.
            </p>
            <p>
              <strong>No schema registry.</strong> Without a schema registry
              (Confluent Schema Registry, AWS Glue Schema Registry), producers
              and consumers have no formal contract. Schema changes break
              consumers silently. Register every event schema before publishing.
            </p>
            <p>
              <strong>Using internal IDs only.</strong> If your events only
              reference internal database IDs, consumers that do not have
              access to that database cannot interpret them. Include enough
              context in the event that a consumer can act on it without
              requiring a separate lookup -- or at least include the key
              identifiers that allow a single-query enrichment.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Consumer Patterns: At-Least-Once vs. Exactly-Once
            </h2>
            <p>
              Kafka and most event streaming systems guarantee at-least-once
              delivery by default. This means a consumer may receive the same
              event more than once (typically after a failure and retry). Your
              pipeline must handle this.
            </p>
            <p>
              Idempotent consumers handle duplicate events safely. The pattern
              is to use a deduplication key (the event&apos;s unique ID) in your
              write logic:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Idempotent Snowflake load from Kafka events
MERGE INTO silver.orders AS target
USING (
    SELECT
        event_id,
        data:order_id::string AS order_id,
        data:customer_id::string AS customer_id,
        data:amount_cents::integer AS amount_cents,
        time::timestamp AS event_time
    FROM staging.order_events_raw
    WHERE event_type = 'com.company.orders.created'
) AS source ON target.order_id = source.order_id
WHEN MATCHED THEN
    UPDATE SET updated_at = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN
    INSERT (order_id, customer_id, amount_cents, event_time, created_at)
    VALUES (source.order_id, source.customer_id, source.amount_cents,
            source.event_time, CURRENT_TIMESTAMP());`}</code>
            </pre>
            <p>
              Exactly-once processing is available in Kafka (via transactions
              and idempotent producers) but adds significant complexity. For
              most data engineering use cases, at-least-once delivery with
              idempotent consumers is the right trade-off: simpler to operate,
              correct in result, negligible performance overhead.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Consumer Groups and Parallelism
            </h2>
            <p>
              Kafka partitions allow parallel consumption. Each partition is
              consumed by exactly one consumer in a consumer group. The
              parallelism ceiling of a consumer group equals the number of
              partitions -- adding more consumers than partitions leaves some
              consumers idle.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from confluent_kafka import Consumer, KafkaError
import json

consumer = Consumer({
    "bootstrap.servers": "kafka-broker:9092",
    "group.id": "analytics-pipeline-v2",  # Version in group ID for clean restarts
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,  # Manual commit for at-least-once guarantee
    "max.poll.interval.ms": 300000,  # 5 min max processing time per batch
})

consumer.subscribe(["order-events"])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            raise Exception(f"Consumer error: {msg.error()}")
        
        event = json.loads(msg.value().decode("utf-8"))
        process_event(event)
        
        # Commit only after successful processing
        consumer.commit(asynchronous=False)
        
finally:
    consumer.close()`}</code>
            </pre>
            <p>
              Use separate consumer groups for separate use cases. An analytics
              pipeline and a notification service consuming the same topic
              should have different group IDs. Each group maintains its own
              offset, so they can proceed independently without one blocking
              the other.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Change Data Capture: Events from Existing Databases
            </h2>
            <p>
              Most operational data does not originate as events -- it lives
              in relational databases as rows. Change Data Capture (CDC)
              converts database changes (INSERT, UPDATE, DELETE) into event
              streams, without requiring application code changes.
            </p>
            <p>
              Debezium is the standard open-source CDC tool. It reads from
              the database&apos;s transaction log (Postgres WAL, MySQL binlog,
              MongoDB oplog) and emits an event for each change:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Debezium connector config (Postgres)
{
  "name": "postgres-orders-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${"$"}{POSTGRES_PASSWORD}",
    "database.dbname": "orders",
    "table.include.list": "public.orders,public.order_items",
    "topic.prefix": "cdc.orders",
    "plugin.name": "pgoutput",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.add.fields": "op,ts_ms",
    "slot.name": "debezium_orders_slot"
  }
}

# Each change emits to topic: cdc.orders.public.orders
# Message structure:
# {
#   "before": {...old row...},
#   "after": {...new row...},
#   "__op": "u" (update), "c" (create), "d" (delete)
#   "__ts_ms": 1774617292049
# }`}</code>
            </pre>
            <p>
              CDC is the right approach for: populating a data warehouse from
              an operational database without polling, building event-driven
              pipelines from legacy systems that were not built to emit events,
              and maintaining low-latency synchronized copies for analytics.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Event-Driven Alongside Batch: The Hybrid Architecture
            </h2>
            <p>
              Event-driven architecture does not replace batch processing --
              it complements it. The right mental model is a two-speed platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Event stream layer</strong> (Kafka/Redpanda): low
                latency, operational use cases, fraud signals, live dashboards,
                real-time feature serving for ML. Seconds to minutes of latency.
              </li>
              <li>
                <strong>Batch warehouse layer</strong> (Snowflake/BigQuery):
                complex historical analysis, multi-table joins, period-over-period
                comparisons, long-term retention. Hours of latency, full history.
              </li>
            </ul>
            <p>
              Events flow into both layers. The warehouse ingests events in
              micro-batches (every 5-15 minutes) for analytical storage.
              The stream layer consumes events in real time for operational use.
              Consumers pick the layer that matches their latency requirement.
            </p>
            <p>
              The operational mistake is building two competing systems that
              disagree on numbers because they process the same events
              differently. Establish a single source of truth for event
              schemas (the schema registry) and use the same event definitions
              in both layers. Discrepancies between real-time and batch
              numbers should be explainable by processing lag, not schema drift.
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
