import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Building Real-Time Data Pipelines with Kafka and Flink | Ryan Kirsch - Data Engineer",
  description:
    "A practical guide to building production-grade streaming data pipelines using Apache Kafka and Apache Flink. Architecture patterns, gotchas, and when to use each.",
  openGraph: {
    title:
      "Building Real-Time Data Pipelines with Kafka and Flink | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to building production-grade streaming data pipelines using Apache Kafka and Apache Flink. Architecture patterns, gotchas, and when to use each.",
    type: "article",
    url: "https://ryankirsch.dev/blog/streaming-data-pipelines-kafka-flink",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Building Real-Time Data Pipelines with Kafka and Flink | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to building production-grade streaming data pipelines using Apache Kafka and Apache Flink. Architecture patterns, gotchas, and when to use each.",
  },
  alternates: { canonical: "/blog/streaming-data-pipelines-kafka-flink" },
};

export default function StreamingDataPipelinesPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/streaming-data-pipelines-kafka-flink"
  );
  const postTitle = encodeURIComponent(
    "Building Real-Time Data Pipelines with Kafka and Flink"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">&larr;</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="mt-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {["Kafka", "Flink", "Streaming", "Real-Time", "Data Engineering", "Architecture"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Building Real-Time Data Pipelines with Kafka and Flink
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 8 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            I build streaming pipelines at a major media company. We ingest
            tens of millions of events per hour: video play events, ad
            impressions, user interactions, recommendation signals. The system
            needs to be fast, fault-tolerant, and correct. Kafka and Flink are
            the two tools that make that possible in production, and they work
            at different layers of the stack in ways that are worth understanding
            clearly before you commit to either.
          </p>
          <p>
            This post is not a getting-started tutorial. There are plenty of
            those. This is what I wish someone had told me before I built
            my first production streaming pipeline: when streaming is the right
            choice, what Kafka and Flink each actually do, where they interact,
            and the patterns that hold up under real load.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Stream Processing vs. Batch: When It Actually Matters
          </h2>
          <p>
            The honest answer is that most pipelines do not need to be
            streaming. Batch processing is simpler, cheaper to operate, and
            easier to debug. A pipeline that runs every 15 minutes handles the
            vast majority of analytical use cases without any of the complexity
            that comes with real-time infrastructure.
          </p>
          <p>
            Streaming becomes the right choice in a specific set of scenarios.
            Low-latency alerting: you need to know within seconds that a payment
            fraud signal crossed a threshold, not within the next batch window.
            Continuous feature computation: your ML model needs user activity
            aggregated over a rolling 5-minute window, not a daily summary.
            CDC-driven replication: a downstream system needs to reflect
            database changes within seconds, not hours. Real-time dashboards:
            a business stakeholder needs to see ingestion numbers updating as
            events flow, not after the next Spark job completes.
          </p>
          <p>
            If your use case does not fall into one of these categories, look
            hard at whether you actually need streaming before you introduce
            the operational overhead. I have seen teams build Flink pipelines
            for use cases that a 5-minute Airflow DAG would have handled fine.
            The streaming system required two engineers to maintain, the batch
            system would have required zero.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Kafka as the Message Broker
          </h2>
          <p>
            Kafka is not a stream processor. It is a distributed, durable,
            partitioned log. Events go in, they stay for a configurable
            retention window, and consumers read them at their own pace. The
            key properties that make Kafka the right foundation for streaming
            pipelines are durability (events survive broker restarts),
            replayability (consumers can seek back to any offset), and
            decoupling (producers and consumers are completely independent).
          </p>
          <p>
            In a Kafka-based streaming architecture, topics are the primary
            abstraction. A topic named{" "}
            <code>user-events-raw</code> receives all inbound events from your
            producers. A processed topic named{" "}
            <code>user-events-enriched</code> receives the output of your
            stream processor. A topic named{" "}
            <code>user-events-dead-letter</code> captures events that failed
            processing for later inspection. The partitioning strategy, how
            you assign events to partitions, determines your parallelism ceiling
            and your ordering guarantees. Events with the same partition key
            are always processed in order within a partition. Events across
            partitions have no ordering guarantee.
          </p>
          <p>
            In production, I keep retention at 7 days minimum. This gives you
            a full week of replay capacity if a consumer goes down, if you need
            to reprocess after a bug fix, or if a downstream system needs to
            catch up. The disk cost is worth it. Losing the ability to replay
            is a painful constraint when something goes wrong at 2 AM.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Topic configuration for a production pipeline
kafka-topics.sh --create \\
  --topic user-events-raw \\
  --partitions 24 \\
  --replication-factor 3 \\
  --config retention.ms=604800000 \\
  --config compression.type=snappy \\
  --config min.insync.replicas=2`}
          </pre>
          <p>
            24 partitions gives you a parallelism ceiling of 24 Flink task
            managers (or Kafka consumer threads) processing the same topic
            simultaneously. Choose partition count based on your expected
            peak throughput, not your current throughput. Increasing partition
            count after the fact requires rebalancing and can briefly disrupt
            consumers.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Flink for Stateful Stream Processing
          </h2>
          <p>
            Flink is where the computation happens. It consumes from Kafka,
            applies transformations, maintains state, and produces to output
            sinks: another Kafka topic, a database, an object store, a metrics
            system. The core Flink concepts you need to understand for
            production work are operators, state backends, and checkpointing.
          </p>
          <p>
            <strong className="text-white">Operators</strong> are the
            transformation units in a Flink job. A{" "}
            <code>map</code> operator transforms one event to one output. A{" "}
            <code>flatMap</code> can produce zero or more outputs per event. A{" "}
            <code>filter</code> drops events that do not match a predicate. A{" "}
            <code>keyBy</code> partitions the stream by a key field so that all
            events with the same key go to the same operator instance. This is
            the gateway to stateful operations: once you have keyed the stream,
            each operator instance has its own isolated state scoped to its key
            space.
          </p>
          <p>
            <strong className="text-white">State backends</strong> determine
            where Flink stores operator state between checkpoints. The default{" "}
            <code>HashMapStateBackend</code> keeps state in JVM heap memory,
            which is fast but limited by available RAM. The{" "}
            <code>EmbeddedRocksDBStateBackend</code> spills state to local SSD
            and supports state sizes far larger than heap memory allows. For
            any pipeline where per-key state can grow large (user session
            aggregations, long-running event correlations), RocksDB is the
            right choice.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.state_backend import EmbeddedRocksDBStateBackend
from pyflink.datastream.connectors.kafka import KafkaSource
from pyflink.common import WatermarkStrategy, Duration

env = StreamExecutionEnvironment.get_execution_environment()
env.set_state_backend(EmbeddedRocksDBStateBackend(incremental=True))
env.enable_checkpointing(interval_ms=60000)

source = KafkaSource.builder() \\
    .set_bootstrap_servers("broker1:9092,broker2:9092") \\
    .set_topics("user-events-raw") \\
    .set_group_id("flink-enrichment-job") \\
    .set_starting_offsets(KafkaOffsetsInitializer.committed_offsets()) \\
    .set_value_only_deserializer(JsonRowDeserializationSchema(...)) \\
    .build()

stream = env.from_source(
    source,
    WatermarkStrategy.for_bounded_out_of_orderness(Duration.of_seconds(5)),
    "user-events-source"
)`}
          </pre>
          <p>
            The watermark strategy here deserves attention. Flink processes
            events by event time, not by the wall clock when they arrive. A
            watermark is Flink&apos;s signal that all events up to a certain
            timestamp have arrived (with some tolerance for late arrivals).{" "}
            <code>for_bounded_out_of_orderness(Duration.of_seconds(5))</code>{" "}
            tells Flink to wait up to 5 seconds for late-arriving events before
            closing a time window. Set this based on your actual event latency
            distribution, not a guess.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Windowing Strategies
          </h2>
          <p>
            Windows are how you aggregate a continuous stream into discrete
            time buckets. The three window types you will use in practice are
            tumbling windows, sliding windows, and session windows.
          </p>
          <p>
            <strong className="text-white">Tumbling windows</strong> divide
            time into fixed, non-overlapping buckets. A 5-minute tumbling
            window over a stream of play events gives you a count of plays per
            user per 5-minute interval, with no overlap between windows. Use
            these for metrics dashboards and simple aggregations.
          </p>
          <p>
            <strong className="text-white">Sliding windows</strong> overlap.
            A 10-minute window sliding every 2 minutes produces a new
            aggregation every 2 minutes, each covering the last 10 minutes of
            data. The overlap makes sliding windows more expensive (each event
            is counted in multiple windows) but more useful for trend detection
            where you care about recent history without discrete bucket
            boundaries.
          </p>
          <p>
            <strong className="text-white">Session windows</strong> group
            events that arrive within a configurable gap of each other. Events
            more than 30 minutes apart (for example) are assigned to different
            sessions. This is the right model for user session analysis where
            you want to group activity naturally rather than by fixed time
            buckets. Session windows are keyed by definition because the
            session gap is evaluated per key.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyflink.datastream.window import TumblingEventTimeWindows, Time

# Count plays per user per 5-minute tumbling window
play_counts = stream \\
    .key_by(lambda e: e["user_id"]) \\
    .window(TumblingEventTimeWindows.of(Time.minutes(5))) \\
    .aggregate(PlayCountAggregateFunction())

# Sink to Kafka topic for downstream consumption
play_counts.sink_to(kafka_sink)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Exactly-Once Semantics
          </h2>
          <p>
            Exactly-once is one of the most misunderstood concepts in streaming.
            It does not mean events are processed exactly once in the physical
            sense. It means the effect of processing is applied exactly once,
            even if the operator executes the same event multiple times after
            a failure and recovery.
          </p>
          <p>
            Flink achieves exactly-once end-to-end via distributed snapshots
            (the Chandy-Lamport algorithm) combined with transactional sinks.
            When Flink writes to Kafka with exactly-once semantics enabled, it
            uses the Kafka transaction protocol. Events are written to a
            transaction that is only committed when Flink successfully
            checkpoints. If the job fails before checkpoint completion, the
            transaction is aborted and the events are not visible to downstream
            consumers.
          </p>
          <p>
            The configuration that enables this:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyflink.datastream.connectors.kafka import KafkaSink, DeliveryGuarantee

sink = KafkaSink.builder() \\
    .set_bootstrap_servers("broker1:9092,broker2:9092") \\
    .set_record_serializer(...) \\
    .set_delivery_guarantee(DeliveryGuarantee.EXACTLY_ONCE) \\
    .set_transactional_id_prefix("flink-enrichment-") \\
    .build()`}
          </pre>
          <p>
            The practical cost of exactly-once is latency. Flink cannot expose
            output to downstream consumers until the checkpoint commits. If your
            checkpoint interval is 60 seconds, your downstream consumers see
            output at most every 60 seconds, not in true sub-second latency.
            For dashboards or alerting where true latency matters more than
            perfect deduplication, at-least-once delivery with idempotent
            consumers is often the right tradeoff.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            When Streaming Is Overkill
          </h2>
          <p>
            I want to be direct here because it is easy to over-engineer in
            this space.
          </p>
          <p>
            Streaming is overkill when your stakeholders actually need results
            every 15 minutes or hourly and have been using the word
            &quot;real-time&quot; to mean &quot;faster than daily.&quot; A
            Spark job on a schedule handles this. No Kafka, no Flink, no
            checkpointing configuration.
          </p>
          <p>
            Streaming is overkill when the event volume is low enough that a
            simple database-backed queue handles it comfortably. A few thousand
            events per hour does not need a distributed log and a stateful
            processor.
          </p>
          <p>
            Streaming is the right call when you genuinely need sub-minute
            latency, when state accumulates continuously and must be queryable
            at any moment, or when your downstream systems (recommendation
            models, fraud detection, live dashboards) cannot tolerate batch
            boundaries. At those requirements, Kafka and Flink earn their
            operational complexity.
          </p>
          <p>
            In my stack, I run exactly three Flink jobs. Each of them has a
            clear latency or state requirement that batch cannot satisfy. Every
            other analytical pipeline is orchestrated by Airflow and runs on
            a schedule. That ratio is probably healthier than most teams get to.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
              Exploring DE roles where you can build systems like this? See my
              work at{" "}
              <Link
                href="/"
                className="text-electricBlue hover:text-white transition-colors"
              >
                ryankirsch.dev
              </Link>
              . Questions on any of this?{" "}
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
              <strong className="text-white">Ryan Kirsch</strong> is a senior
              data engineer with 8+ years building data infrastructure at media,
              SaaS, and fintech companies. He specializes in Kafka, dbt,
              Snowflake, and Spark, and writes about data engineering patterns
              from production experience.{" "}
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
