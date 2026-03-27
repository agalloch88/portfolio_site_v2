import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PySpark for Data Engineers: Production Patterns Beyond the Tutorial | Ryan Kirsch",
  description:
    "PySpark patterns that matter for production data engineering: the DataFrame API vs. RDDs, partitioning strategy, avoiding common performance pitfalls, broadcast joins, UDFs, and when Spark is and isn't the right tool.",
  openGraph: {
    title: "PySpark for Data Engineers: Production Patterns Beyond the Tutorial",
    description:
      "PySpark patterns that matter for production data engineering: the DataFrame API vs. RDDs, partitioning strategy, avoiding common performance pitfalls, broadcast joins, UDFs, and when Spark is and isn't the right tool.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-with-spark",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySpark for Data Engineers: Production Patterns Beyond the Tutorial",
    description:
      "PySpark patterns that matter for production data engineering: the DataFrame API vs. RDDs, partitioning strategy, avoiding common performance pitfalls, broadcast joins, UDFs, and when Spark is and isn't the right tool.",
  },
  alternates: { canonical: "/blog/data-engineering-with-spark" },
};

export default function PySparkPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-engineering-with-spark");
  const postTitle = encodeURIComponent("PySpark for Data Engineers: Production Patterns Beyond the Tutorial");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Spark</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            PySpark for Data Engineers: Production Patterns Beyond the Tutorial
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Spark tutorials show you how to run a word count. Production Spark work involves partitioning strategies, skew handling, and knowing when to stop using Spark entirely.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            PySpark is one of the most powerful tools in the data engineering toolkit and one of the easiest to misuse. The API is expressive and the tutorials make it look simple. Production Spark work reveals the gap: skewed partitions that bring jobs to a crawl, UDFs that serialize everything to Python and eliminate all the performance gains, joins that cause out-of-memory errors on executors, and cluster configurations that nobody understands well enough to tune.
          </p>
          <p>
            This guide covers the patterns and mental models that separate Spark code that works in dev from Spark code that works reliably in production at scale.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">DataFrame API vs. RDDs</h2>
          <p>
            Use the DataFrame API. Full stop. RDDs (Resilient Distributed Datasets) are the lower-level abstraction that the DataFrame API is built on. They exist and are sometimes necessary for very specific custom operations, but for data engineering work the DataFrame API is almost always the right choice.
          </p>
          <p>
            The DataFrame API benefits from the Catalyst query optimizer, which rewrites your query into an efficient execution plan. RDDs bypass this entirely. A DataFrame join can be optimized by Catalyst to use a broadcast join when one side is small; the equivalent RDD join cannot be.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

spark = SparkSession.builder \
    .appName("orders-pipeline") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

# Prefer explicit schema over inferSchema — faster and safer
schema = StructType([
    StructField("order_id", StringType(), False),
    StructField("customer_id", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("order_date", TimestampType(), True)
])

df = spark.read.schema(schema).parquet("s3://bucket/orders/")`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Partitioning: The Most Important Performance Lever</h2>
          <p>
            Spark parallelism is determined by the number of partitions. Too few partitions and you underutilize the cluster. Too many and you spend more time on scheduling overhead than computation. The default target is 128MB per partition.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Check partition count and size
df.rdd.getNumPartitions()  # current partition count

# Repartition for joins and shuffles (increases partitions)
df_repartitioned = df.repartition(200, "customer_id")

# Coalesce to reduce partitions (no shuffle, only decreases)
df_coalesced = df.coalesce(10)

# Write partitioned by date for efficient reads
df.write \
    .partitionBy("year", "month") \
    .mode("overwrite") \
    .parquet("s3://bucket/processed-orders/")

# Read with partition pruning (Spark only reads matching partitions)
df_march = spark.read.parquet("s3://bucket/processed-orders/") \
    .filter((F.col("year") == 2026) & (F.col("month") == 3))`}
          </pre>
          <p>
            Adaptive Query Execution (AQE), enabled with <code>spark.sql.adaptive.enabled=true</code>, automatically coalesces small partitions after shuffles and handles some skew cases. Enable it in all production jobs.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Join Strategies: Avoiding the OOM Shuffle</h2>
          <p>
            Joins in Spark require shuffling data across the network to co-locate matching keys. Shuffle joins on large tables are expensive. Broadcast joins, where a small table is copied to every executor, eliminate the shuffle entirely.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyspark.sql.functions import broadcast

# Automatic broadcast: Spark broadcasts tables under spark.sql.autoBroadcastJoinThreshold (default 10MB)
# Manual broadcast hint for tables slightly above threshold
result = large_orders.join(
    broadcast(small_dim_table),
    on="customer_id",
    how="left"
)

# Sort-merge join for large-large joins (default when neither side is broadcastable)
# Ensure both sides are sorted on the join key before the join
orders_sorted = orders.repartition("customer_id").sortWithinPartitions("customer_id")
customers_sorted = customers.repartition("customer_id").sortWithinPartitions("customer_id")

result = orders_sorted.join(customers_sorted, on="customer_id", how="left")

# Skew join: one key has disproportionately many rows
# Salting technique: add a random suffix to the skewed key
import random
from pyspark.sql.functions import concat, lit, floor, rand

# Salt the large table
orders_salted = orders.withColumn(
    "salted_key",
    concat(F.col("skewed_customer_id"), lit("_"), (floor(rand() * 10)).cast("string"))
)

# Explode the small table to match all salt values
customers_exploded = customers.crossJoin(
    spark.range(10).toDF("salt")
).withColumn(
    "salted_key",
    concat(F.col("customer_id"), lit("_"), F.col("salt").cast("string"))
)`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Avoiding UDF Performance Traps</h2>
          <p>
            Python UDFs (User Defined Functions) serialize data between the JVM and the Python interpreter for each row. For large datasets, this serialization overhead can make a UDF 10-100x slower than an equivalent native Spark function.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

# SLOW: Python UDF — serializes row by row to Python
@udf(StringType())
def get_revenue_tier_python(amount):
    if amount is None:
        return "unknown"
    if amount >= 10000:
        return "enterprise"
    if amount >= 1000:
        return "growth"
    return "starter"

df_slow = df.withColumn("tier", get_revenue_tier_python(F.col("amount")))

# FAST: Native Spark functions — stays in JVM
df_fast = df.withColumn(
    "tier",
    F.when(F.col("amount").isNull(), "unknown")
     .when(F.col("amount") >= 10000, "enterprise")
     .when(F.col("amount") >= 1000, "growth")
     .otherwise("starter")
)

# If you must use a Python UDF, use pandas UDF (vectorized)
# Operates on pandas Series instead of row by row — much faster
from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf(StringType())
def get_revenue_tier_vectorized(amounts: pd.Series) -> pd.Series:
    conditions = [amounts >= 10000, amounts >= 1000, amounts.isna()]
    choices = ["enterprise", "growth", "unknown"]
    return pd.Series(
        pd.np.select(conditions, choices, default="starter")
    )`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Reading and Writing Efficiently</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Always use Parquet or Delta for intermediate data (not CSV)
# Parquet: columnar, compressed, schema enforcement
# Delta: Parquet + ACID transactions + schema evolution

# Read with predicate pushdown — Spark pushes filters to storage layer
df = spark.read.parquet("s3://bucket/orders/") \
    .filter(F.col("order_date") >= "2026-01-01")

# Column pruning — only read needed columns
df = spark.read.parquet("s3://bucket/orders/") \
    .select("order_id", "customer_id", "amount")

# Write with compression (default is snappy for Parquet)
df.write \
    .option("compression", "snappy") \
    .mode("overwrite") \
    .partitionBy("year", "month", "day") \
    .parquet("s3://bucket/output/")

# For small output, coalesce before writing to avoid many tiny files
df.coalesce(1).write.mode("overwrite").parquet("s3://bucket/small-output/")`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Debugging Spark Jobs</h2>
          <p>
            The Spark UI (port 4040 when running locally, accessible via the history server in a cluster) is the primary debugging tool. Key things to look for:
          </p>
          <p>
            <strong>Stage duration and task distribution.</strong> If one task in a stage takes 10x longer than others, you have partition skew. The tasks bar in the Spark UI will show a long tail on a few tasks.
          </p>
          <p>
            <strong>Shuffle read/write.</strong> High shuffle volume indicates expensive joins or groupBy operations that could be optimized by repartitioning before the operation.
          </p>
          <p>
            <strong>Spill to disk.</strong> If executors are spilling to disk during a shuffle, they are running out of memory for the shuffle buffer. Increase executor memory or reduce the number of partitions in the shuffle.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Explain query plan — check for broadcast joins, sort-merge joins, partitioning
df.join(dim_table, on="customer_id").explain(extended=True)

# Cache expensive intermediate results that are reused
df_enriched = df.join(broadcast(dim_customers), on="customer_id").cache()
df_enriched.count()  # Trigger caching

# Check partitioning after operations
print(df_enriched.rdd.getNumPartitions())

# Unpersist when done to free memory
df_enriched.unpersist()`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When Not to Use Spark</h2>
          <p>
            Spark is optimized for large-scale distributed processing. It has significant overhead for small datasets: cluster startup time, JVM initialization, and shuffle operations that are trivial for a single-node system. For datasets under a few gigabytes, DuckDB, Pandas, or Polars will be faster and simpler.
          </p>
          <p>
            Spark also requires a cluster, which means operational overhead: sizing executors, managing driver memory, handling cluster failures. For teams without dedicated infrastructure support, this overhead can outweigh the benefits.
          </p>
          <p>
            Use Spark when: your dataset exceeds what a single machine can process comfortably (typically hundreds of gigabytes to terabytes), you need distributed streaming with Spark Structured Streaming, or you are on a platform (Databricks, EMR, Dataproc) where the cluster is managed for you. For everything else, simpler tools are often the right call.
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
