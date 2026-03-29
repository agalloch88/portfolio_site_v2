import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Building a Real-Time Data Pipeline with Kafka and Spark Structured Streaming | Ryan Kirsch - Data Engineer",
  description:
    "A practical guide to connecting Kafka and Spark Structured Streaming. Covers Kafka fundamentals, micro-batch vs continuous mode, checkpointing, PySpark code, and production patterns for exactly-once semantics.",
  openGraph: {
    title:
      "Building a Real-Time Data Pipeline with Kafka and Spark Structured Streaming | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to connecting Kafka and Spark Structured Streaming. Covers Kafka fundamentals, micro-batch vs continuous mode, checkpointing, PySpark code, and production patterns for exactly-once semantics.",
    type: "article",
    url: "https://ryankirsch.dev/blog/kafka-spark-structured-streaming",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Building a Real-Time Data Pipeline with Kafka and Spark Structured Streaming | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to connecting Kafka and Spark Structured Streaming. Covers Kafka fundamentals, micro-batch vs continuous mode, checkpointing, PySpark code, and production patterns for exactly-once semantics.",
  },
  alternates: { canonical: "/blog/kafka-spark-structured-streaming" },
};

export default function KafkaSparkStructuredStreamingPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/kafka-spark-structured-streaming"
  );
  const postTitle = encodeURIComponent(
    "Building a Real-Time Data Pipeline with Kafka and Spark Structured Streaming"
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
            {["Kafka", "Spark", "Structured Streaming", "Real-Time", "PySpark", "Data Pipelines"].map(
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
            Building a Real-Time Data Pipeline with Kafka and Spark Structured Streaming
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Kafka and Spark Structured Streaming are the backbone of most
            serious real-time data pipelines I have worked on. The combination
            handles high-throughput event streams, provides fault-tolerant
            processing, and integrates with the rest of the data platform through
            standard Spark APIs. If you are preparing for a senior DE interview
            or building your first production streaming pipeline, this is the
            pattern you need to understand end to end.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Kafka Fundamentals
          </h2>
          <p>
            Kafka is a distributed log. Events are written to topics, which are
            divided into partitions. Each partition is an ordered, immutable
            sequence of records. Consumers read from partitions and track their
            position using an offset, which is simply an integer indicating the
            last record read. This architecture has three important consequences
            for pipeline design.
          </p>
          <p>
            First, partitions are the unit of parallelism. More partitions means
            more consumers can read in parallel. A topic with 12 partitions can
            be consumed by up to 12 parallel readers without any coordination
            overhead. Second, offsets are consumer-managed. Kafka does not push
            records to consumers; consumers pull and commit their own offset.
            This means a consumer can reprocess any partition from any offset
            at any time, which is what makes replay and recovery straightforward.
            Third, retention is configurable and independent of consumption. A
            topic can retain 7 days of events regardless of whether anyone has
            read them, which gives late-arriving consumers a recovery window.
          </p>
          <p>
            For production Kafka, the parameters that matter most are
            <code className="text-electricBlue bg-steel/10 px-1 rounded">replication.factor</code> (3 for fault tolerance),
            <code className="text-electricBlue bg-steel/10 px-1 rounded">min.insync.replicas</code> (2 for durability guarantees),
            and <code className="text-electricBlue bg-steel/10 px-1 rounded">retention.ms</code> calibrated to your recovery window
            and storage budget.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Spark Structured Streaming Concepts
          </h2>
          <p>
            Structured Streaming treats a stream as an unbounded table. You write
            a query against it using the same DataFrame or SQL API you use for
            batch processing. Spark handles the incremental execution. This
            unified API is the primary reason to choose Structured Streaming
            over lower-level streaming frameworks for teams already invested
            in Spark.
          </p>
          <p>
            A streaming query runs in one of two modes. Micro-batch mode (the
            default) processes new data in discrete intervals. The trigger
            interval controls how frequently each batch runs, from 500ms to
            minutes depending on latency requirements. Continuous mode removes
            the batch boundary and achieves sub-millisecond latency, but with
            more restricted operator support. For most production pipelines,
            micro-batch at a 1 to 10 second trigger is the right starting point.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Connecting Kafka to Spark: The KafkaSourceProvider
          </h2>
          <p>
            The <code className="text-electricBlue bg-steel/10 px-1 rounded">kafka</code> source in Structured Streaming is
            provided by the <code className="text-electricBlue bg-steel/10 px-1 rounded">spark-sql-kafka</code> connector package.
            At read time, Spark assigns Kafka partitions to tasks and reads
            records up to the latest available offset in each micro-batch. The
            schema returned is fixed: key, value, topic, partition, offset,
            timestamp, and timestampType. Your event payload lives in the
            value column as raw bytes.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, window
from pyspark.sql.types import (
    StructType, StructField, StringType,
    LongType, TimestampType
)

spark = SparkSession.builder \\
    .appName("kafka-order-pipeline") \\
    .config(
        "spark.jars.packages",
        "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0"
    ) \\
    .getOrCreate()

# Read from Kafka topic
raw_stream = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka-broker:9092") \\
    .option("subscribe", "orders") \\
    .option("startingOffsets", "latest") \\
    .option("maxOffsetsPerTrigger", 100_000) \\
    .load()

# Define the expected event schema
order_schema = StructType([
    StructField("order_id", LongType(), True),
    StructField("customer_id", LongType(), True),
    StructField("amount", StringType(), True),
    StructField("status", StringType(), True),
    StructField("event_time", TimestampType(), True),
])

# Parse JSON payload from value bytes
orders = raw_stream.select(
    from_json(
        col("value").cast("string"),
        order_schema
    ).alias("data"),
    col("timestamp").alias("kafka_timestamp")
).select("data.*", "kafka_timestamp")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Micro-Batch vs Continuous Mode
          </h2>
          <p>
            Micro-batch processes records in bounded intervals. Each interval
            is a Spark job with a defined input range (offsets N to M for each
            partition). This means failures are recoverable at the job level:
            if a batch fails, Spark restarts from the last committed offset.
            The trigger interval is set with <code className="text-electricBlue bg-steel/10 px-1 rounded">processingTime</code>.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Micro-batch: process every 5 seconds
query = orders.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "s3://bucket/checkpoints/orders/") \\
    .trigger(processingTime="5 seconds") \\
    .outputMode("append") \\
    .start("s3://bucket/delta/orders/")`}
          </pre>
          <p>
            Continuous mode removes the batch boundary. Records are processed
            as they arrive with a configurable checkpoint interval. It supports
            a more limited set of operations (no aggregations without watermarks,
            no joins). Use it only when you need sub-second latency and your
            operators are compatible.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Continuous mode: checkpoint every 1 second
query = filtered_orders.writeStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka-broker:9092") \\
    .option("topic", "orders-enriched") \\
    .trigger(continuous="1 second") \\
    .start()`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Checkpointing
          </h2>
          <p>
            Checkpointing is non-negotiable in production. A checkpoint stores
            the current query progress, including the Kafka offsets processed
            in the last batch and any intermediate aggregation state. On
            restart, Spark reads the checkpoint and continues from exactly where
            it left off. Without a checkpoint, a restart defaults to
            <code className="text-electricBlue bg-steel/10 px-1 rounded">startingOffsets</code>, which means either reprocessing
            everything or losing data depending on configuration.
          </p>
          <p>
            Put checkpoints on durable storage: S3, GCS, or ADLS. Never use
            local disk for production checkpoints. Keep checkpoints separate
            per query; sharing a checkpoint directory between two queries
            corrupts both. When you make structural changes to a query (adding
            a column, changing output format), test checkpoint compatibility.
            In some cases you need to delete the checkpoint and replay from
            a known offset to avoid state corruption.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Watermarks and Late Data
          </h2>
          <p>
            Watermarks tell Spark how long to wait for late-arriving events
            before closing a time window. Without a watermark on a streaming
            aggregation, Spark holds state indefinitely, which produces an
            unbounded memory problem in production.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql.functions import sum as spark_sum

# Aggregate order amounts per customer per 10-minute window
# Allow up to 2 minutes of late data
windowed = orders \\
    .withWatermark("event_time", "2 minutes") \\
    .groupBy(
        window(col("event_time"), "10 minutes"),
        col("customer_id")
    ) \\
    .agg(spark_sum("amount").alias("total_amount"))

query = windowed.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "s3://bucket/checkpoints/windowed-orders/") \\
    .outputMode("append") \\
    .trigger(processingTime="30 seconds") \\
    .start("s3://bucket/delta/windowed-orders/")`}
          </pre>
          <p>
            The watermark delay trades completeness for state size. A 2-minute
            watermark means Spark will wait 2 minutes past the window close
            before finalizing it. Events arriving after the watermark threshold
            are dropped. Set your watermark based on your actual late-arrival
            distribution, not a guess. Instrument your pipeline to measure
            the 99th percentile latency between event time and processing time,
            then add 20 to 30 percent margin.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Exactly-Once Semantics in Production
          </h2>
          <p>
            Exactly-once delivery requires coordination between the source
            (Kafka), the processing engine (Spark), and the sink. Kafka provides
            at-least-once delivery by default. Spark Structured Streaming
            provides end-to-end exactly-once semantics when the sink supports
            idempotent writes or transactional commits.
          </p>
          <p>
            For Delta Lake sinks, Spark uses transactional commits to guarantee
            exactly-once writes. Each micro-batch commits atomically to the
            Delta log with the batch ID, and Spark skips any batch that is
            already committed on restart. This is the most reliable exactly-once
            pattern in the Spark ecosystem and the main reason Delta Lake is the
            preferred sink for production Spark streaming jobs.
          </p>
          <p>
            For Kafka sinks, exactly-once requires enabling Kafka transactions
            with the <code className="text-electricBlue bg-steel/10 px-1 rounded">kafka.transactional.id</code> option. Spark
            assigns a transactional producer per task and commits offsets and
            output records atomically. The overhead is real: transactional
            Kafka writes are 2 to 5x slower than non-transactional writes.
            Use this only when downstream consumers require strict
            exactly-once guarantees. For most analytics pipelines, at-least-once
            to Delta with idempotent downstream reads is the correct trade-off.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Production Considerations
          </h2>
          <p>
            <strong className="text-white">Backpressure:</strong> Use
            <code className="text-electricBlue bg-steel/10 px-1 rounded">maxOffsetsPerTrigger</code> to cap how many records
            Spark reads per batch. Without this, a spike in Kafka lag can cause
            a single batch to process millions of records, blowing memory and
            causing cascading failures. Set it based on your cluster capacity
            and your target batch duration, then monitor and tune.
          </p>
          <p>
            <strong className="text-white">Monitoring:</strong> Expose the
            streaming query metrics. <code className="text-electricBlue bg-steel/10 px-1 rounded">query.lastProgress</code>
            gives you input rows per second, processing time per batch, and
            trigger execution details. Feed these into your observability
            stack. Alert on batch duration exceeding your SLA and on
            input rate dropping to zero (Kafka connectivity issue) or
            spiking unexpectedly (upstream volume anomaly).
          </p>
          <p>
            <strong className="text-white">Schema registry:</strong> In
            production, Kafka payloads should be validated against a schema
            registry (Confluent Schema Registry is the standard). This prevents
            malformed events from silently corrupting downstream tables. Parse
            failures should route to a dead-letter topic for inspection, not
            crash the query.
          </p>
          <p>
            <strong className="text-white">Graceful shutdown:</strong> Use
            <code className="text-electricBlue bg-steel/10 px-1 rounded">query.stop()</code> rather than killing the JVM process.
            This allows the current batch to complete and the checkpoint to
            commit cleanly. An abrupt kill on a transactional Kafka write can
            leave the producer in a zombie state that requires manual broker
            intervention to clear.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Closing
          </h2>
          <p>
            Kafka and Spark Structured Streaming form a well-understood, widely
            deployed real-time pipeline stack. The concepts here, offsets,
            checkpointing, watermarks, exactly-once semantics, come up in
            virtually every senior DE interview that touches streaming. More
            importantly, they are the things that actually determine whether a
            production streaming pipeline is reliable or fragile. Get the
            checkpoint configuration right, understand your watermark
            requirements, and instrument the batch metrics before you need them.
            The rest follows from the fundamentals.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
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
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Spark,
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
