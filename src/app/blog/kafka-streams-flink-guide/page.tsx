import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Real-Time Data Processing with Kafka Streams and Flink: A Production Guide | Ryan Kirsch - Data Engineer",
  description:
    "Kafka Streams and Apache Flink both handle stateful stream processing, but they solve different problems. A production guide to windowing, exactly-once semantics, and choosing the right tool.",
  openGraph: {
    title:
      "Real-Time Data Processing with Kafka Streams and Flink: A Production Guide | Ryan Kirsch - Data Engineer",
    description:
      "Kafka Streams and Apache Flink both handle stateful stream processing, but they solve different problems. A production guide to windowing, exactly-once semantics, and choosing the right tool.",
    type: "article",
    url: "https://ryankirsch.dev/blog/kafka-streams-flink-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Real-Time Data Processing with Kafka Streams and Flink: A Production Guide | Ryan Kirsch - Data Engineer",
    description:
      "Kafka Streams and Apache Flink both handle stateful stream processing, but they solve different problems. A production guide to windowing, exactly-once semantics, and choosing the right tool.",
  },
  alternates: { canonical: "/blog/kafka-streams-flink-guide" },
};

export default function KafkaStreamsFlinkGuidePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/kafka-streams-flink-guide"
  );
  const postTitle = encodeURIComponent(
    "Real-Time Data Processing with Kafka Streams and Flink: A Production Guide"
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
            {[
              "Kafka Streams",
              "Apache Flink",
              "Streaming",
              "Stateful Processing",
              "Data Engineering",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Real-Time Data Processing with Kafka Streams and Flink: A Production Guide
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            October 31, 2025 · 11 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            I have built stream processors with both Kafka Streams and Apache Flink,
            and the decision is rarely about which one is better. It is about where
            the state should live, how much operational overhead the team can handle,
            and whether the pipeline needs to join multiple sources or just keep up
            with a single Kafka cluster. I have seen teams pick Flink when they only
            needed a Kafka-native consumer, and teams stretch Kafka Streams too far.
          </p>
          <p>
            This guide is my production view of the tradeoffs. I compare the two
            systems, show windowing and stateful aggregation patterns, and end with
            a decision matrix I use in architecture reviews. The examples are real
            patterns from production, in Java for Kafka Streams and PyFlink for
            Flink.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            When to Use Kafka Streams
          </h2>
          <p>
            Kafka Streams is a library, not a separate system. You deploy it like any
            other JVM service, ship it with your application, and it scales by adding
            instances and partitions. I use it when the source of truth is Kafka and
            I want an embedded processor co-located with Kafka, like sessionization
            on clickstream events or enrichment with compacted topics.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            When to Use Apache Flink
          </h2>
          <p>
            Flink is a distributed stream processing engine. It is the right choice
            when the job is complex, state is large, or the pipeline needs to ingest
            from multiple sources beyond Kafka. I reach for Flink when I need rich
            event time semantics, complex windowing, large joins, or integrations
            with databases and data lakes that require two phase commit.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Windowing Patterns with Kafka Streams
          </h2>
          <p>
            Windowing is where stateful stream processing becomes real. The patterns
            I use most are tumbling windows for fixed buckets, sliding windows for
            continuous aggregation, and session windows for user activity. Kafka
            Streams uses event time windows with optional grace periods.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`StreamsBuilder builder = new StreamsBuilder();
KStream<String, Purchase> purchases = builder.stream("purchases");

// Tumbling window, 5 minutes
KTable<Windowed<String>, Long> countPerUser = purchases
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5)))
    .count();

// Sliding window, size 10 minutes, advance every 1 minute
KTable<Windowed<String>, Double> spendPerUser = purchases
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(10))
        .advanceBy(Duration.ofMinutes(1)))
    .aggregate(
        () -> 0.0,
        (key, purchase, total) -> total + purchase.amount(),
        Materialized.with(Serdes.String(), Serdes.Double())
    );

// Session window, 30 minute inactivity gap
KTable<Windowed<String>, Long> sessions = purchases
    .groupByKey()
    .windowedBy(SessionWindows.with(Duration.ofMinutes(30)))
    .count();`}
          </pre>
          <p>
            Windowed aggregations create state in RocksDB. I size state stores for
            the worst case and set retention on window stores to avoid infinite
            growth.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Windowing Patterns with PyFlink
          </h2>
          <p>
            Flink gives you explicit control over event time and watermarks. The
            APIs are more verbose, but you can build precise behavior around late
            events. I use Flink for sessionization or business rules where lateness
            is expected and I need deterministic handling.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.window import (
    TumblingEventTimeWindows,
    SlidingEventTimeWindows,
    EventTimeSessionWindows,
)
from pyflink.common.time import Time

env = StreamExecutionEnvironment.get_execution_environment()
stream = env.from_source(source, watermark_strategy, "purchases")

# Tumbling window, 5 minutes
stream.key_by(lambda x: x.user_id) \
    .window(TumblingEventTimeWindows.of(Time.minutes(5))) \
    .reduce(lambda a, b: a.add(b))

# Sliding window, 10 minutes size, 1 minute slide
stream.key_by(lambda x: x.user_id) \
    .window(SlidingEventTimeWindows.of(Time.minutes(10), Time.minutes(1))) \
    .reduce(lambda a, b: a.add(b))

# Session window, 30 minute gap
stream.key_by(lambda x: x.user_id) \
    .window(EventTimeSessionWindows.with_gap(Time.minutes(30))) \
    .reduce(lambda a, b: a.add(b))`}
          </pre>
          <p>
            Flink windowing is more expressive, and the tradeoff is that you have to
            think about watermarks, late data, and state backend configuration.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Stateful Aggregations and Joins
          </h2>
          <p>
            The basic stateful building blocks are count, sum, and join. In Kafka
            Streams, you define a topology, Kafka handles partitioning, and RocksDB
            stores state locally with changelogs in Kafka. In Flink, you get richer
            join semantics and can manage state across more inputs.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`KStream<String, Order> orders = builder.stream("orders");
KTable<String, Customer> customers = builder.table("customers");

// Sum order total per customer
KTable<String, Double> revenue = orders
    .groupByKey()
    .aggregate(
        () -> 0.0,
        (key, order, total) -> total + order.total(),
        Materialized.with(Serdes.String(), Serdes.Double())
    );

// Stream-table join for enrichment
KStream<String, EnrichedOrder> enriched = orders.join(
    customers,
    (order, customer) -> new EnrichedOrder(order, customer)
);`}
          </pre>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# PyFlink interval join for streams
orders = env.from_source(order_source, watermark_strategy, "orders")
customers = env.from_source(customer_source, watermark_strategy, "customers")

joined = orders.key_by(lambda o: o.customer_id) \
    .interval_join(customers.key_by(lambda c: c.id)) \
    .between(Time.seconds(-5), Time.seconds(5)) \
    .process(lambda left, right, ctx, out: out.collect(EnrichedOrder(left, right)))`}
          </pre>
          <p>
            My rule of thumb is that Kafka Streams joins are great when both sides
            are in Kafka and the state fits comfortably on each instance. If the
            join is large, the window is long, or the sources are heterogeneous,
            Flink is safer because it scales state across TaskManagers.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Exactly-Once Semantics in Practice
          </h2>
          <p>
            Kafka Streams exactly-once is built on Kafka transactions. Each task
            writes to changelog topics and output topics within a single transaction.
            When you enable exactly-once v2, the producer is idempotent, commits are
            transactional, and offsets are committed with the output. This gives you
            end to end exactly-once as long as all sources and sinks are Kafka.
          </p>
          <p>
            Flink uses checkpointing to coordinate state and sinks. It snapshots
            state across operators, and sinks that support two phase commit can
            participate in the checkpoint so that state and output stay consistent.
            Flink can provide exactly-once even with sinks outside Kafka, which is
            why I use it for pipelines that write to databases or data lakes. The
            tradeoff is checkpoint overhead and tuning.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Deployment Patterns
          </h2>
          <p>
            Kafka Streams is deployed as a library. You package the topology inside
            your application, deploy it on Kubernetes, ECS, or bare metal, and scale
            by adding instances. There is no separate control plane, so rollouts look
            like normal service deployments.
          </p>
          <p>
            Flink is deployed as a cluster with JobManagers and TaskManagers. You
            submit jobs, manage versions, and coordinate upgrades. In exchange you
            get centralized resource management, rescaling, and checkpointing for
            long running jobs.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Production Lessons I Learned the Hard Way
          </h2>
          <p>
            Backpressure handling is the first real operational challenge. Kafka
            Streams will slow consumers when downstream processing slows, but you
            still need to watch consumer lag, RocksDB compaction, and large windowed
            state. Flink has explicit backpressure metrics, but you still need to
            tune buffers and parallelism or the job will stall.
          </p>
          <p>
            State store sizing is the second lesson. I have seen Kafka Streams
            instances die because the local disk filled up, and I have seen Flink
            jobs crawl because RocksDB was starved for memory. Size for peak, keep
            retention tight, and separate state from log directories. Checkpointing
            is the third lesson, Kafka Streams hides it inside the commit interval,
            Flink exposes every knob. Use a checkpoint interval that matches your
            recovery objectives, and watch duration so it does not approach the
            interval.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Decision Matrix
          </h2>
          <p>
            <strong className="text-white">Choose Kafka Streams when:</strong> you
            process only Kafka sources and sinks, state fits on each instance, and
            the team wants a library they can deploy like any other service.
          </p>
          <p>
            <strong className="text-white">Choose Flink when:</strong> you need
            multi source joins, large state, or long windows, or you must write to
            non Kafka sinks with exactly-once guarantees. It is also the right call
            when you want a shared streaming platform with centralized operations.
          </p>
          <p>
            <strong className="text-white">Borderline case:</strong> if your job is
            Kafka only today but likely to grow into complex joins, I still start in
            Kafka Streams for speed, then migrate once requirements stabilize.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">Closing</h2>
          <p>
            I have shipped production systems on both stacks, and neither one is a
            silver bullet. Kafka Streams is the pragmatic choice for Kafka native
            processing with moderate state and low operational overhead. Flink is
            the right choice for complex, large scale, multi source pipelines that
            need strong event time semantics and rich state management.
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
