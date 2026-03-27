import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams | Ryan Kirsch",
  description:
    "A practical comparison of streaming frameworks for data engineers: when to use Flink vs. Spark Structured Streaming vs. Kafka Streams, stateful processing patterns, watermarks and late data, and deployment considerations.",
  openGraph: {
    title: "Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams",
    description:
      "A practical comparison of streaming frameworks for data engineers: when to use Flink vs. Spark Structured Streaming vs. Kafka Streams, stateful processing patterns, watermarks and late data, and deployment considerations.",
    type: "article",
    url: "https://ryankirsch.dev/blog/streaming-data-pipelines",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams",
    description:
      "A practical comparison of streaming frameworks for data engineers: when to use Flink vs. Spark Structured Streaming vs. Kafka Streams, stateful processing patterns, watermarks and late data, and deployment considerations.",
  },
  alternates: { canonical: "/blog/streaming-data-pipelines" },
};

export default function StreamingPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/streaming-data-pipelines");
  const postTitle = encodeURIComponent("Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Streaming</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Streaming is not just fast batch. The frameworks, the failure modes, and the operational patterns are all different. Here is how to choose and what to build.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The decision to build a streaming pipeline is often made before the requirements are fully understood. Streaming adds operational complexity that is not justified unless the use case genuinely requires sub-minute data freshness. The first question is not which streaming framework to use. It is whether streaming is actually necessary.
          </p>
          <p>
            Streaming is appropriate when: you need to act on data within seconds or minutes of it being produced (fraud detection, real-time recommendations, live dashboards), when you are processing event streams that are naturally continuous (clickstreams, IoT sensors, log pipelines), or when you need to maintain continuously updated aggregations (running totals, session windows, real-time metrics).
          </p>
          <p>
            Streaming is not appropriate when: a 15-minute or hourly batch job produces the same business outcome. Many use cases that get built as streaming pipelines could have been hourly micro-batches, which are dramatically simpler to build and operate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Three Main Options</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Apache Flink</h3>
          <p>
            Flink is the most capable streaming framework, with true native streaming execution (not micro-batch), sophisticated stateful processing, exactly-once semantics, and the most powerful windowing API available. It is the right choice for complex streaming use cases: multi-stream joins, long-running sessions, complex event processing, and low-latency applications where even micro-batch latency is unacceptable.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import KafkaSource, KafkaOffsetsInitializer
from pyflink.common.serialization import SimpleStringSchema
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.common.time import Time
import json

env = StreamExecutionEnvironment.get_execution_environment()
env.set_parallelism(4)

# Read from Kafka
source = KafkaSource.builder() \
    .set_bootstrap_servers("kafka:9092") \
    .set_topics("user-events") \
    .set_group_id("flink-processor") \
    .set_starting_offsets(KafkaOffsetsInitializer.latest()) \
    .set_value_only_deserializer(SimpleStringSchema()) \
    .build()

stream = env.from_source(source, WatermarkStrategy.no_watermarks(), "Kafka Source")

# Parse and aggregate events in 5-minute tumbling windows
result = (
    stream
    .map(lambda x: json.loads(x))
    .filter(lambda event: event.get('type') == 'purchase')
    .key_by(lambda event: event['user_id'])
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(SumAggregator())
)

env.execute("User Purchase Aggregation")`}
          </pre>
          <p>
            The operational cost of Flink is real: it requires dedicated cluster infrastructure (or a managed service like Confluent Flink, Kinesis Data Analytics, or Ververica Platform), careful state backend configuration, and engineering expertise to tune. It is overkill for simple streaming use cases.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Spark Structured Streaming</h3>
          <p>
            Spark Structured Streaming extends the Spark DataFrame API to streaming workloads. It uses a micro-batch execution model by default (processing data in small batches at configurable intervals) with an optional continuous processing mode for lower latency.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

spark = SparkSession.builder \
    .appName("streaming-orders") \
    .config("spark.sql.streaming.checkpointLocation", "s3://checkpoints/orders/") \
    .getOrCreate()

schema = StructType() \
    .add("order_id", StringType()) \
    .add("user_id", StringType()) \
    .add("amount", DoubleType()) \
    .add("event_time", TimestampType())

# Read streaming data from Kafka
orders_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "orders") \
    .load() \
    .select(F.from_json(F.col("value").cast("string"), schema).alias("data")) \
    .select("data.*")

# Windowed aggregation with watermark for late data
result = orders_stream \
    .withWatermark("event_time", "10 minutes") \
    .groupBy(
        F.window("event_time", "5 minutes"),
        "user_id"
    ) \
    .agg(
        F.sum("amount").alias("total_spend"),
        F.count("order_id").alias("order_count")
    )

# Write to Delta Lake (or Iceberg)
query = result.writeStream \
    .outputMode("append") \
    .format("delta") \
    .option("checkpointLocation", "s3://checkpoints/orders-agg/") \
    .start("s3://data-lake/streaming/user-spend/")

query.awaitTermination()`}
          </pre>
          <p>
            Spark Structured Streaming is the right choice when: you are already using Spark for batch processing and want to add streaming with minimal new infrastructure, your latency requirement is seconds to minutes (acceptable for micro-batch), or you are on Databricks where Delta Live Tables provides a managed streaming layer.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Kafka Streams</h3>
          <p>
            Kafka Streams is a Java library (not a separate cluster) that processes Kafka topics directly within your application. It is the right choice for relatively simple stream processing that runs as part of a service rather than a standalone data pipeline.
          </p>
          <p>
            Kafka Streams is ideal for: enrichment pipelines (join an event stream with a lookup table), filtering and routing (route events to different Kafka topics based on content), simple aggregations over short windows. It is not well-suited for complex stateful operations across multiple streams, very long windowing requirements, or ML inference pipelines.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Watermarks and Late Data</h2>
          <p>
            Event time vs. processing time is the central distinction in streaming systems. Processing time is when the event arrives at the processing engine. Event time is when the event actually occurred. These diverge because events can arrive late: a mobile user whose phone was offline for 30 minutes might generate events that arrive 30 minutes after they occurred.
          </p>
          <p>
            Watermarks tell the streaming engine how long to wait for late events before considering a time window complete. A 10-minute watermark means the engine will wait for events up to 10 minutes late before closing and emitting a window.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Flink watermark strategy
from pyflink.common.watermark_strategy import WatermarkStrategy
from pyflink.common.time import Duration

# Wait up to 10 minutes for late events
watermark_strategy = WatermarkStrategy \
    .for_bounded_out_of_orderness(Duration.of_minutes(10)) \
    .with_timestamp_assigner(EventTimestampAssigner())

# Events arriving more than 10 minutes late are dropped (or sent to side output)
# The watermark is: max_observed_timestamp - 10_minutes`}
          </pre>
          <p>
            Choosing the right watermark is a tradeoff: a larger watermark handles more late data correctly but increases output latency. A smaller watermark produces results faster but drops more late events. Profile your actual late arrival distribution and set the watermark to cover the 95th or 99th percentile of lateness.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Stateful Processing and Checkpointing</h2>
          <p>
            Stateful streaming operations (aggregations, joins, sessionization) require the engine to maintain state between events. This state must be persisted to survive failures. Flink uses RocksDB as its default state backend for large state, with checkpoints written to durable storage (S3, HDFS). Spark uses checkpoint locations in HDFS or S3.
          </p>
          <p>
            Checkpoint interval determines the tradeoff between recovery time (smaller checkpoint interval = less work to redo on failure) and overhead (more frequent checkpoints = more I/O and CPU). A 60-second checkpoint interval is a reasonable starting point for most applications.
          </p>
          <p>
            State size is the primary operational concern for long-running stateful jobs. A session window that can remain open for 24 hours will accumulate a day&apos;s worth of state per session key. Monitor state backend metrics and plan for state cleanup (TTL on state, explicit expiration) to prevent unbounded state growth.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Decision Framework</h2>
          <p>
            Use Kafka Streams when: the processing logic is straightforward, it runs as part of an existing service, and you want to avoid a separate processing cluster.
          </p>
          <p>
            Use Spark Structured Streaming when: you are already on Spark/Databricks, latency of seconds to a minute is acceptable, and you want one framework for both batch and streaming.
          </p>
          <p>
            Use Flink when: you need sub-second latency, complex stateful operations across multiple streams, or the most sophisticated windowing and event time semantics available.
          </p>
          <p>
            Consider micro-batch batch pipelines first when: the business requirement is actually satisfied by 5-minute or 15-minute data freshness. Managed Airflow or Dagster running on a tight schedule is dramatically simpler to build and operate than any streaming framework.
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
