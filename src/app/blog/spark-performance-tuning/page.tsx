import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Apache Spark Performance Tuning: 10 Techniques That Actually Work | Ryan Kirsch - Data Engineer",
  description:
    "Practical Spark performance tuning techniques from production experience: partitioning, broadcast joins, caching strategy, shuffle optimization, and executor configuration that moves the needle.",
  openGraph: {
    title:
      "Apache Spark Performance Tuning: 10 Techniques That Actually Work | Ryan Kirsch - Data Engineer",
    description:
      "Practical Spark performance tuning techniques from production experience: partitioning, broadcast joins, caching strategy, shuffle optimization, and executor configuration that moves the needle.",
    type: "article",
    url: "https://ryankirsch.dev/blog/spark-performance-tuning",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Apache Spark Performance Tuning: 10 Techniques That Actually Work | Ryan Kirsch - Data Engineer",
    description:
      "Practical Spark performance tuning techniques from production experience: partitioning, broadcast joins, caching strategy, shuffle optimization, and executor configuration that moves the needle.",
  },
  alternates: { canonical: "/blog/spark-performance-tuning" },
};

export default function SparkPerformanceTuningPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/spark-performance-tuning"
  );
  const postTitle = encodeURIComponent(
    "Apache Spark Performance Tuning: 10 Techniques That Actually Work"
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
            {["Apache Spark", "Performance Tuning", "PySpark", "Data Engineering", "Big Data", "Optimization"].map(
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
            Apache Spark Performance Tuning: 10 Techniques That Actually Work
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 10 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Most Spark performance advice falls into two categories: too abstract to apply, or too
            obvious to matter. This post covers ten techniques I have used in production to cut job
            runtimes by 40 to 80 percent. Some are configuration changes. Some are code patterns.
            All of them are grounded in how Spark actually executes distributed work.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            1. Right-Size Your Partitions
          </h2>
          <p>
            Partition count is the single biggest lever on Spark performance and also the most
            commonly misconfigured. The default shuffle partition count is 200, which is wrong for
            almost every real workload. Too few partitions starve executors of parallelism. Too many
            create scheduling overhead and small task times that waste cluster resources.
          </p>
          <p>
            The practical rule: target 100 to 200 MB of uncompressed data per partition after a
            shuffle. For a 400 GB shuffle, that is 2,000 to 4,000 partitions. Set it explicitly.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Set shuffle partitions based on data size
spark.conf.set("spark.sql.shuffle.partitions", "2000")

# For Spark 3.0+, use Adaptive Query Execution instead
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728")  # 128MB`}
          </pre>
          <p>
            Adaptive Query Execution (AQE) in Spark 3.x handles this automatically by coalescing
            small post-shuffle partitions at runtime. Enable it unless you have a specific reason
            not to. It is one of the highest-value configuration changes available and costs nothing.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            2. Use Broadcast Joins for Small Tables
          </h2>
          <p>
            A shuffle join on a large table against a small lookup table is one of the most common
            sources of unnecessary shuffle overhead. When one side of a join fits in memory, broadcast
            it. Spark ships the smaller dataset to every executor, eliminating the shuffle entirely.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql import functions as F
from pyspark.sql.functions import broadcast

# Explicit broadcast hint
result = large_events_df.join(
    broadcast(small_lookup_df),
    on="event_type_id",
    how="left"
)

# Or configure the auto-broadcast threshold (default 10MB)
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "50m")  # 50MB`}
          </pre>
          <p>
            The default auto-broadcast threshold is 10 MB. Raise it to 50 to 100 MB if your
            executors have memory headroom. For tables in the 30 to 80 MB range, this alone can
            turn a 20-minute join into a 2-minute one.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            3. Cache Strategically, Not Reflexively
          </h2>
          <p>
            Caching a DataFrame only helps when you read that DataFrame more than once in the same
            job. Caching everything by default wastes memory and can actually degrade performance by
            evicting data needed by other stages. Cache at the right granularity.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark import StorageLevel

# Cache in memory only (default)
filtered_df = raw_df.filter(F.col("status") == "active")
filtered_df.cache()

# Force materialization before the multi-use fan-out
filtered_df.count()

# Use MEMORY_AND_DISK for datasets larger than available executor memory
large_df.persist(StorageLevel.MEMORY_AND_DISK)

# Always unpersist when done
filtered_df.unpersist()`}
          </pre>
          <p>
            Call <code>.count()</code> or another action after <code>.cache()</code> to force
            materialization. Spark is lazy: the cache does not actually happen until an action
            triggers execution. If you skip this, the first downstream action pays the full
            computation cost, and the cache only helps subsequent ones.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            4. Eliminate Data Skew with Salting
          </h2>
          <p>
            Skew happens when a small number of join keys or group-by values carry a disproportionate
            share of the data. One partition gets 10x the work of others, and the entire job waits
            for it. The standard fix is salting: artificially distribute skewed keys across multiple
            partitions.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import random
from pyspark.sql import functions as F

SALT_FACTOR = 20

# Salt the large (skewed) side
salted_large = large_df.withColumn(
    "salt", (F.rand() * SALT_FACTOR).cast("int")
).withColumn(
    "salted_key", F.concat(F.col("join_key"), F.lit("_"), F.col("salt"))
)

# Explode the small side to match all salt values
small_exploded = small_df.withColumn(
    "salt", F.explode(F.array([F.lit(i) for i in range(SALT_FACTOR)]))
).withColumn(
    "salted_key", F.concat(F.col("join_key"), F.lit("_"), F.col("salt"))
)

result = salted_large.join(small_exploded, on="salted_key", how="left")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            5. Tune Executor Memory and Cores
          </h2>
          <p>
            The executor configuration triad is memory, cores per executor, and number of executors.
            The common mistake is maximizing cores per executor without accounting for the GC pressure
            that comes with it. Five cores per executor with adequate memory per core is a reliable
            starting point for most workloads.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Recommended baseline for a 16-core, 64GB worker
spark-submit \\
  --executor-cores 5 \\
  --executor-memory 18g \\
  --conf spark.executor.memoryOverhead=2g \\
  --conf spark.memory.fraction=0.8 \\
  --conf spark.memory.storageFraction=0.3 \\
  your_job.py`}
          </pre>
          <p>
            Set <code>spark.executor.memoryOverhead</code> to at least 10 percent of executor memory.
            This covers off-heap allocations, Python worker processes in PySpark, and native memory
            used by libraries like Arrow. Skipping this is a common cause of mysterious OOM kills.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            6. Minimize Shuffles with Partition-Aware Transformations
          </h2>
          <p>
            Every <code>groupBy</code>, <code>join</code>, and <code>distinct</code> triggers a
            shuffle. Reducing shuffle count reduces network I/O, disk I/O, and serialization overhead.
            Think about operation ordering: filter before joining, project only needed columns early,
            and avoid re-partitioning when the data is already partitioned on the join key.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Bad: shuffle a large dataset before filtering
result = (
    large_df
    .groupBy("customer_id")
    .agg(F.sum("amount").alias("total"))
    .filter(F.col("total") > 1000)
)

# Better: filter first to reduce shuffle input size
result = (
    large_df
    .filter(F.col("amount") > 0)  # Push down predicates early
    .select("customer_id", "amount")  # Project only needed columns
    .groupBy("customer_id")
    .agg(F.sum("amount").alias("total"))
    .filter(F.col("total") > 1000)
)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            7. Use Columnar Formats and Predicate Pushdown
          </h2>
          <p>
            Reading less data is faster than reading all data efficiently. Store source data in
            Parquet or ORC. Partition tables by the columns most commonly used in filters.
            Spark will push predicates down to the storage layer and skip entire files and row groups.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Write with optimal Parquet settings
df.write \\
  .partitionBy("event_date", "region") \\
  .option("compression", "snappy") \\
  .option("maxRecordsPerFile", 1000000) \\
  .parquet("s3://bucket/events/")

# Spark will push this filter to file/row-group level
filtered = spark.read.parquet("s3://bucket/events/") \\
    .filter(
        (F.col("event_date") == "2026-01-15") &
        (F.col("region") == "us-east-1")
    )`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            8. Avoid UDFs When Built-in Functions Exist
          </h2>
          <p>
            Python UDFs break the Catalyst optimizer and force row-by-row serialization between
            the JVM and the Python process. This is a real cost: UDFs can be 10x slower than
            equivalent SQL functions. Use Pandas UDFs (vectorized) when you genuinely need custom
            Python logic. For everything else, use the built-in DataFrame API.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import pandas as pd
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import DoubleType

# Pandas UDF: vectorized, operates on Series instead of rows
@pandas_udf(DoubleType())
def apply_discount(price: pd.Series, discount: pd.Series) -> pd.Series:
    return price * (1 - discount.clip(0, 0.5))

df = df.withColumn("discounted_price", apply_discount("price", "discount_rate"))`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            9. Profile with the Spark UI Before Optimizing
          </h2>
          <p>
            Guessing at bottlenecks wastes time. The Spark UI shows you exactly where time is spent:
            which stages are slow, which tasks are skewed, how much shuffle read and write occurred,
            and whether GC is eating executor time. Look at the DAG visualization and the task metrics
            for the slowest stage before making any tuning change.
          </p>
          <p>
            Key metrics to check: median vs. max task duration (large gap indicates skew), shuffle
            read size (large values signal expensive joins), and GC time as a percentage of task time
            (above 20 percent means memory pressure). Fix the right problem.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            10. Repartition vs. Coalesce
          </h2>
          <p>
            Use <code>repartition(n)</code> to increase partition count or when you want to
            redistribute data evenly. It triggers a full shuffle. Use <code>coalesce(n)</code> to
            reduce partition count without a shuffle, by combining existing partitions on the same
            executor. For writing output files, coalesce to the target file count rather than
            repartitioning, unless you also need to sort or redistribute by key.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Increase partitions and redistribute evenly (full shuffle)
df_balanced = skewed_df.repartition(400, "customer_id")

# Reduce partition count before write (no shuffle)
df_balanced.coalesce(50).write.parquet("s3://bucket/output/")

# Repartition by column for downstream partition-aware reads
df.repartition("event_date").write \\
  .partitionBy("event_date") \\
  .parquet("s3://bucket/partitioned/")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Where to Start
          </h2>
          <p>
            If you are tuning a slow job for the first time, work in this order: enable AQE,
            check for skew in the Spark UI, confirm broadcast joins are firing for small tables,
            and review partition counts on your largest shuffles. These four steps resolve the
            majority of production Spark performance issues. The remaining techniques address
            specific patterns once the fundamentals are correct.
          </p>
          <p>
            Performance tuning is empirical. Measure before and after every change. A configuration
            that cuts one job&apos;s runtime by 60 percent can hurt another job with different
            characteristics. Know your workload, then apply the right lever.
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
