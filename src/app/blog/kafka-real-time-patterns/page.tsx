import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics",
  description:
    "Real-time pipelines need more than a Kafka cluster. Partitioning decisions, consumer group scaling, exactly-once semantics, and the production patterns that keep streaming data reliable.",
  openGraph: {
    title: "Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics",
    description:
      "Real-time pipelines need more than a Kafka cluster. Partitioning decisions, consumer group scaling, exactly-once semantics, and the production patterns that keep streaming data reliable.",
    type: "article",
    url: "https://ryankirsch.dev/blog/kafka-real-time-patterns",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics",
    description:
      "Real-time pipelines need more than a Kafka cluster. Partitioning decisions, consumer group scaling, exactly-once semantics, and the production patterns that keep streaming data reliable.",
  },
  alternates: { canonical: "/blog/kafka-real-time-patterns" },
};

export default function KafkaRealTimePatternsPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/kafka-real-time-patterns");
  const postTitle = encodeURIComponent(
    "Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics"
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
            Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Every data team eventually hits the wall where batch is not fast enough.
            Fraud detection needs sub-second decisions. AI training pipelines need
            continuous feature updates. Live dashboards need data that is actually
            live. Kafka is the tool most teams reach for, and most teams
            underestimate. I have been running Kafka in production for three years at
            a major media company, and the hard lessons were never about getting
            messages from A to B. They were about partitioning strategy, consumer
            group behavior, and the real cost of exactly-once semantics.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Kafka Fundamentals: Mental Models That Actually Help</h2>
            <p className="leading-relaxed">
              The Kafka docs will tell you about topics, partitions, brokers, and
              consumer groups. That is accurate and not very useful when you are
              staring at consumer lag at 2 AM. Here is how I actually think about
              Kafka after running it in production.
            </p>
            <p className="leading-relaxed">
              A <strong>topic</strong> is a named log. Think of it as an append-only
              table where every row has an offset instead of a primary key. You never
              update or delete. You just keep writing, and readers decide where they
              are in the log. That mental model matters because it explains why Kafka
              is fast. There is no locking, no random I/O. It is sequential writes
              and sequential reads, which is exactly what disks and networks are
              optimized for.
            </p>
            <p className="leading-relaxed">
              A <strong>partition</strong> is a shard of that log. Partitions are the
              unit of parallelism. One partition means one consumer thread. Twelve
              partitions means up to twelve consumer threads. This is the single most
              important capacity decision you make, and it is hard to change later.
            </p>
            <p className="leading-relaxed">
              A <strong>consumer group</strong> is a team of readers that split the
              work. Each partition is assigned to exactly one consumer in the group.
              If you have six partitions and three consumers, each consumer reads two
              partitions. Add a fourth consumer, and Kafka rebalances automatically.
              Add a seventh consumer, and one sits idle because there are only six
              partitions to go around.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Partitioning Strategy: Throughput vs. Ordering</h2>
            <p className="leading-relaxed">
              Partitioning is where most teams make their first production mistake.
              The default behavior is round-robin: messages spread evenly across
              partitions, which maximizes throughput. But the moment you need ordering
              guarantees, you need a partition key.
            </p>
            <p className="leading-relaxed">
              Kafka guarantees ordering <em>within</em> a partition, not across
              partitions. If you need all events for a user to arrive in order, you
              partition by user ID. If you need all events for a transaction to
              arrive in order, you partition by transaction ID. The tradeoff is that
              a hot key can create a hot partition. If one user generates 50 percent
              of your traffic, one partition handles 50 percent of your load.
            </p>
            <p className="leading-relaxed">
              At the media company, we built a real-time audit trail for content
              publishing workflows. Every article edit, status change, and
              publication event needed to arrive in order per article. We partitioned
              by article ID. That worked well until a breaking news event generated
              hundreds of edits on a single article in minutes. The partition backed
              up while others sat nearly idle.
            </p>
            <p className="leading-relaxed">
              The fix was a compound partition key: article ID plus event hour. That
              spread the load for high-activity articles across partitions while
              keeping events within the same hour ordered. Downstream consumers
              handled cross-hour ordering in application logic. It is a tradeoff, but
              it kept the pipeline from choking on breaking news days.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# Topic configuration for high-throughput audit trail
# 24 partitions: balances parallelism with broker overhead
# 7-day retention: enough for replay without blowing storage

kafka-topics --create \\
  --topic content-audit-trail \\
  --partitions 24 \\
  --replication-factor 3 \\
  --config retention.ms=604800000 \\
  --config compression.type=lz4 \\
  --config min.insync.replicas=2`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Twenty-four partitions was our sweet spot. Enough parallelism for peak
              traffic, not so many that rebalancing became slow. We used LZ4
              compression because it is fast on both sides and cut our network
              bandwidth by roughly 60 percent. Replication factor of three with
              min.insync.replicas of two meant we could lose a broker without data
              loss or downtime.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Consumer Groups: Scaling and the Rebalance Problem</h2>
            <p className="leading-relaxed">
              Consumer groups are Kafka&apos;s horizontal scaling mechanism, and they
              work well until a rebalance happens. A rebalance is triggered when a
              consumer joins, leaves, or is considered dead by the group coordinator.
              During a rebalance, all consumers in the group pause. In a large group,
              that pause can last seconds to minutes.
            </p>
            <p className="leading-relaxed">
              The practical impact is that rebalances cause latency spikes.
              Consumers stop processing, lag builds, and downstream systems see a
              burst of old data when processing resumes. For a real-time audit trail,
              that is unacceptable.
            </p>
            <p className="leading-relaxed">
              The first line of defense is static group membership. By assigning a
              <code className="text-cyberTeal bg-black/30 px-1 rounded">group.instance.id</code> to each consumer,
              Kafka skips the rebalance when a consumer restarts quickly. It
              reconnects and picks up its old partition assignments. This alone
              eliminated most of our rebalance-related lag spikes.
            </p>
            <p className="leading-relaxed">
              The second is cooperative rebalancing. The default
              <code className="text-cyberTeal bg-black/30 px-1 rounded">eager</code> rebalance protocol revokes all
              partitions before reassigning. The
              <code className="text-cyberTeal bg-black/30 px-1 rounded">cooperative-sticky</code> protocol only
              revokes the partitions that actually need to move. The difference in
              production is dramatic. We went from 30-second full-stop rebalances to
              sub-second incremental ones.
            </p>
            <p className="leading-relaxed">
              Lag monitoring is the other essential. Consumer lag is the difference
              between the latest offset in a partition and the consumer&apos;s
              committed offset. It is the single best health metric for a Kafka
              pipeline. We shipped lag metrics to Datadog and alerted when any
              consumer group exceeded 10,000 messages of lag for more than two
              minutes. That threshold caught real problems without being noisy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Exactly-Once Semantics: The Real Tradeoffs</h2>
            <p className="leading-relaxed">
              Exactly-once processing in Kafka is real, but it is not free. It
              requires three things: idempotent producers, transactional APIs, and
              careful consumer offset management. Most teams only implement one of
              the three and wonder why they see duplicates.
            </p>
            <p className="leading-relaxed">
              An <strong>idempotent producer</strong> guarantees that retries do not
              create duplicate messages. Kafka assigns a producer ID and sequence
              number to each message. If a retry arrives with the same sequence
              number, the broker deduplicates it. Enabling this is a single config
              change and has minimal performance impact. There is no reason not to
              turn it on.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`from confluent_kafka import Producer

producer_config = {
    "bootstrap.servers": "kafka-broker-1:9092,kafka-broker-2:9092",
    "enable.idempotence": True,
    "acks": "all",
    "retries": 5,
    "max.in.flight.requests.per.connection": 5,
    "compression.type": "lz4",
    "linger.ms": 10,
    "batch.size": 65536,
}

producer = Producer(producer_config)

def publish_audit_event(article_id: str, event: dict) -> None:
    """Publish an audit event with ordering guarantee per article."""
    producer.produce(
        topic="content-audit-trail",
        key=article_id.encode("utf-8"),
        value=json.dumps(event).encode("utf-8"),
        callback=delivery_report,
    )
    producer.flush()

def delivery_report(err, msg):
    if err:
        logger.error(f"Delivery failed: {err}")
    else:
        logger.debug(f"Delivered to {msg.topic()}[{msg.partition()}] @ {msg.offset()}")`}
              </pre>
            </div>
            <p className="leading-relaxed">
              The <strong>transactional API</strong> goes further. It wraps a produce
              and a consumer offset commit into a single atomic operation. Either
              both succeed or neither does. This is essential for stream processing
              where you consume from one topic, transform, and produce to another.
              Without transactions, a crash between produce and commit means either
              data loss or duplicates.
            </p>
            <p className="leading-relaxed">
              The tradeoff is latency. Transactional produces add a round-trip to the
              transaction coordinator on every commit. In our benchmarks, it added
              roughly 15-20ms per transaction batch. For the audit trail, that was
              acceptable. For a fraud detection pipeline that needed sub-5ms
              end-to-end latency, it was not. In that case, we used idempotent
              producers with at-least-once delivery and handled deduplication in the
              consumer using a Redis-backed idempotency key.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`from confluent_kafka import Consumer

consumer_config = {
    "bootstrap.servers": "kafka-broker-1:9092,kafka-broker-2:9092",
    "group.id": "audit-trail-processor",
    "group.instance.id": "processor-node-01",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,
    "partition.assignment.strategy": "cooperative-sticky",
    "isolation.level": "read_committed",
}

consumer = Consumer(consumer_config)
consumer.subscribe(["content-audit-trail"])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            logger.error(f"Consumer error: {msg.error()}")
            continue

        event = json.loads(msg.value().decode("utf-8"))
        process_audit_event(event)

        # Manual commit after successful processing
        consumer.commit(asynchronous=False)
except KeyboardInterrupt:
    pass
finally:
    consumer.close()`}
              </pre>
            </div>
            <p className="leading-relaxed">
              The key details in this consumer config: auto commit is off because we
              commit only after successful processing. The isolation level is
              <code className="text-cyberTeal bg-black/30 px-1 rounded">read_committed</code> so we never see
              messages from aborted transactions. And we use cooperative-sticky
              assignment to minimize rebalance disruption.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Schema Evolution: Avro, JSON, and the Registry</h2>
            <p className="leading-relaxed">
              Schemas are the contract between producers and consumers. Without
              enforcement, a producer can change a field name or type and silently
              break every downstream consumer. Confluent Schema Registry solves this
              by versioning schemas and enforcing compatibility rules.
            </p>
            <p className="leading-relaxed">
              The practical choice is between Avro and JSON Schema. Avro is compact,
              fast to serialize, and has excellent backward and forward compatibility
              support. JSON is human-readable and easier to debug. In production, I
              default to Avro for high-throughput topics and JSON Schema for
              lower-volume topics where debuggability matters more than wire size.
            </p>
            <p className="leading-relaxed">
              The compatibility mode matters more than the format. I use
              <code className="text-cyberTeal bg-black/30 px-1 rounded">BACKWARD_TRANSITIVE</code> for most topics.
              That means new schemas can add optional fields and remove fields that
              had defaults, but they cannot make breaking changes. Consumers running
              older schema versions can still read new messages. This is the safety
              net that lets you evolve schemas without coordinated deployments.
            </p>
            <p className="leading-relaxed">
              At the media company, we learned this the hard way. An engineer added a
              required field to a JSON topic without a default value. Every consumer
              started throwing deserialization errors. We lost about 45 minutes of
              audit data before we caught it. After that, every topic got a registered
              schema with backward transitive compatibility, and producers could not
              publish messages that violated the contract. That single change
              eliminated an entire class of incidents.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Building a Real-Time Audit Trail</h2>
            <p className="leading-relaxed">
              The audit trail project tied all of these patterns together. The
              requirements were straightforward: capture every content change in
              real-time, make it queryable within seconds, and never lose an event.
              The implementation required every concept in this post.
            </p>
            <p className="leading-relaxed">
              The architecture was a three-stage pipeline. Producers in the CMS
              published events to a Kafka topic on every save, status change, or
              publication action. A stream processing layer enriched events with
              author metadata and normalized the schema. A sink connector wrote the
              enriched events to Elasticsearch for real-time search and to S3 for
              long-term storage.
            </p>
            <p className="leading-relaxed">
              The hardest part was not the happy path. It was handling the edge cases.
              What happens when the CMS publishes faster than the enrichment layer
              can process? Consumer lag builds, and you need enough partitions and
              consumers to absorb bursts. What happens when the Elasticsearch cluster
              is slow? The sink connector backs up, but Kafka retains the data. When
              Elasticsearch recovers, the connector catches up. That durability is
              Kafka&apos;s superpower.
            </p>
            <p className="leading-relaxed">
              What happens when a producer crashes mid-transaction? The transactional
              API ensures the partial write is rolled back. Consumers with
              <code className="text-cyberTeal bg-black/30 px-1 rounded">read_committed</code> isolation never see the
              incomplete data. These are not theoretical scenarios. Every single one
              happened in our first six months.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">When Not to Use Kafka</h2>
            <p className="leading-relaxed">
              Not everything needs streaming, and Kafka is not the right tool for
              every data pipeline. If your data arrives in daily batches and your
              consumers run once a day, Kafka adds operational complexity without
              meaningful benefit. A scheduled Airflow job reading from S3 is simpler,
              cheaper, and easier to debug.
            </p>
            <p className="leading-relaxed">
              Kafka is also not a database. I have seen teams use compacted topics as
              a key-value store and then struggle with query patterns that Kafka was
              never designed for. If you need random reads by key, use a database. If
              you need full-text search, use Elasticsearch. Kafka is a log. Treat it
              like one.
            </p>
            <p className="leading-relaxed">
              The operational cost is real too. A production Kafka cluster needs
              monitoring, broker management, partition rebalancing, and someone who
              understands how ZooKeeper or KRaft works. If your team is three people
              and you are building your first data pipeline, managed services like
              Confluent Cloud or Amazon MSK can remove that overhead. But the
              conceptual complexity remains. You still need to understand partitioning,
              consumer groups, and offset management. Kafka does not abstract those
              away.
            </p>
            <p className="leading-relaxed">
              The right question is not whether Kafka can handle your use case. It
              probably can. The right question is whether the latency and throughput
              requirements justify the complexity. If batch is fast enough, batch is
              better. Real-time is a feature, not a default.
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
