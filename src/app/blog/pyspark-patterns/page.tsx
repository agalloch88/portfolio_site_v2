import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PySpark for Data Engineers: Transformations, Partitioning, and Production Patterns",
  description:
    "PySpark is table stakes for senior DE roles. Here are the patterns that matter in production: DataFrame operations, partition strategies, broadcast joins, Delta Lake integration, and how to write Spark code that actually survives code review.",
  openGraph: {
    title: "PySpark for Data Engineers: Transformations, Partitioning, and Production Patterns",
    description:
      "PySpark is table stakes for senior DE roles. Here are the patterns that matter in production: DataFrame operations, partition strategies, broadcast joins, Delta Lake integration, and how to write Spark code that actually survives code review.",
    type: "article",
    url: "https://ryankirsch.dev/blog/pyspark-patterns",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "PySpark for Data Engineers: Transformations, Partitioning, and Production Patterns",
    description:
      "PySpark is table stakes for senior DE roles. Here are the patterns that matter in production: DataFrame operations, partition strategies, broadcast joins, Delta Lake integration, and how to write Spark code that actually survives code review.",
  },
  alternates: { canonical: "/blog/pyspark-patterns" },
};

export default function PySparkPatternsPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/pyspark-patterns");
  const postTitle = encodeURIComponent(
    "PySpark for Data Engineers: Transformations, Partitioning, and Production Patterns"
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
            {["PySpark", "Spark", "Data Engineering", "Python", "Big Data"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            PySpark for Data Engineers: Transformations, Partitioning, and
            Production Patterns
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 2026 · 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Every senior DE job description mentions Spark. It shows up in the
            required skills, the technical screen, and the system design round.
            The{" "}
            <span className="text-white font-medium">
              &ldquo;just use DuckDB&rdquo; crowd has a point
            </span>{" "}
            — for datasets under a few hundred gigabytes, a modern columnar
            engine on a single machine often beats a distributed cluster on
            cost and complexity. But Spark is not going anywhere. When you are
            processing petabytes of clickstream data, joining terabyte-scale
            tables, or running ML pipelines across distributed feature stores,
            Spark is still the tool you reach for.
          </p>

          <p>
            At The Philadelphia Inquirer, I ran Spark workloads that processed
            reader behavior data — page views, session events, engagement
            signals — at a scale where DuckDB would have needed a machine that
            cost more than the Spark cluster. This post is what I learned about
            writing PySpark that is fast, readable, and maintainable. The
            patterns that survive code review. The mistakes that get caught in
            production.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The DataFrame operations that show up in interviews
          </h2>
          <p>
            Interviewers testing PySpark knowledge almost always probe the same
            five patterns. Make sure these feel natural:
          </p>

          <p className="font-medium text-white mt-4">groupBy and aggregation</p>
          <p>
            The workhorse. Know how to compose multiple aggregations in a single
            pass, which is far more efficient than chaining separate{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              groupBy
            </code>{" "}
            calls:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql import functions as F

df.groupBy("article_id").agg(
    F.count("*").alias("total_views"),
    F.countDistinct("user_id").alias("unique_readers"),
    F.avg("time_on_page").alias("avg_engagement_seconds"),
    F.max("event_ts").alias("last_viewed_at"),
)`}
          </pre>

          <p className="font-medium text-white mt-4">Window functions</p>
          <p>
            Window functions are the PySpark equivalent of SQL analytics. They
            come up constantly for ranking, running totals, and sessionization:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql.window import Window

# Rank articles by views within each section
w = Window.partitionBy("section").orderBy(F.desc("total_views"))

df.withColumn("rank", F.rank().over(w)) \\
  .filter(F.col("rank") <= 5)  # top 5 per section

# Session gap detection (user inactivity > 30 min = new session)
w_user = Window.partitionBy("user_id").orderBy("event_ts")
df.withColumn("prev_ts", F.lag("event_ts").over(w_user)) \\
  .withColumn("gap_mins",
      (F.col("event_ts").cast("long") - F.col("prev_ts").cast("long")) / 60
  ) \\
  .withColumn("new_session", (F.col("gap_mins") > 30).cast("int"))`}
          </pre>

          <p className="font-medium text-white mt-4">
            explode and posexplode
          </p>
          <p>
            When you have arrays or maps in your schema — JSON arrays from an
            event stream, tag lists on articles, product category arrays —{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              explode
            </code>{" "}
            flattens them into rows.{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              posexplode
            </code>{" "}
            does the same but also returns the array index, which is useful for
            ordered lists:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Flatten article tags array
df.withColumn("tag", F.explode("tags")) \\
  .groupBy("tag").count()

# Retain position in ordered reading list
df.select(
    "user_id",
    F.posexplode("reading_history").alias("position", "article_id")
)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Partitioning done right
          </h2>
          <p>
            Partitioning is where most PySpark performance problems live. The
            goal is to keep partitions roughly equal in size and choose
            partition keys that align with how you query the data.
          </p>

          <p className="font-medium text-white mt-4">
            repartition vs coalesce
          </p>
          <p>
            These do opposite things in terms of data movement.{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              repartition(n)
            </code>{" "}
            triggers a full shuffle and produces evenly sized partitions.{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              coalesce(n)
            </code>{" "}
            reduces partition count with minimal data movement but can produce
            uneven sizes. Use{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              repartition
            </code>{" "}
            before wide transformations, use{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              coalesce
            </code>{" "}
            before writing to reduce output files:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Before a heavy join or groupBy — distribute evenly
df = df.repartition(200, "article_id")

# Before writing to storage — reduce small file problem
df.coalesce(20).write.parquet("s3://bucket/output/")`}
          </pre>

          <p className="font-medium text-white mt-4">Partition skew</p>
          <p>
            Skew happens when one partition key has dramatically more rows than
            others. A single slow task can hold up an entire stage. Common
            causes: null values, bot traffic with a single user agent, a
            hot-shard entity. Fixes include salting (adding random noise to the
            key before joining then stripping it after), filtering nulls
            separately, or using Spark 3&apos;s Adaptive Query Execution (AQE)
            skew join optimization, which handles this automatically when
            enabled.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Enable AQE (Spark 3+) — handles skew joins automatically
spark = SparkSession.builder \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \\
    .getOrCreate()`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Broadcast joins
          </h2>
          <p>
            A broadcast join sends a small table to every executor, eliminating
            the shuffle entirely for the large table side. When one side of a
            join is small enough to fit in memory per-executor, this is a major
            win. Spark will broadcast automatically if the table is under the{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              spark.sql.autoBroadcastJoinThreshold
            </code>{" "}
            (default 10MB, usually too low for real workloads). You can hint it
            explicitly:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql.functions import broadcast

# article_metadata is small (< 500MB) — broadcast to avoid shuffle
result = page_views.join(
    broadcast(article_metadata),
    on="article_id",
    how="left"
)

# Or raise the threshold globally (use with caution on large executors)
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 104857600)  # 100MB`}
          </pre>

          <p>
            With AQE enabled, Spark 3 can also convert a regular shuffle join to
            a broadcast join at runtime if it discovers one side is small after
            scanning. This catches cases where statistics are stale or unknown.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Delta Lake: ACID transactions on your data lake
          </h2>
          <p>
            Writing raw Parquet to S3 is fine until you need to update, delete,
            or merge records. Delta Lake adds a transaction log on top of
            Parquet that gives you ACID guarantees, time travel, and schema
            enforcement — without leaving the data lake.
          </p>

          <p className="font-medium text-white mt-4">
            MERGE for upsert patterns
          </p>
          <p>
            This is the pattern I use most often for CDC (change data capture)
            pipelines, where each batch contains inserts, updates, and
            occasional deletes:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "s3://bucket/articles/")

# Upsert: insert new, update changed, skip unchanged
delta_table.alias("target").merge(
    source=updates.alias("src"),
    condition="target.article_id = src.article_id"
).whenMatchedUpdate(set={
    "title": "src.title",
    "updated_at": "src.updated_at",
    "word_count": "src.word_count",
}).whenNotMatchedInsertAll().execute()`}
          </pre>

          <p className="font-medium text-white mt-4">Z-ordering for query performance</p>
          <p>
            Z-ordering co-locates related values in the same set of files,
            enabling data skipping when you filter on those columns. For our
            article metadata table, filtering by{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              section
            </code>{" "}
            and{" "}
            <code className="text-xs bg-steel/20 px-1 py-0.5 rounded font-mono text-electricBlue">
              published_date
            </code>{" "}
            was our most common query pattern, so we optimized for that:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Run after a batch of merges — improves read performance significantly
delta_table.optimize().executeZOrderBy("section", "published_date")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Testing PySpark transformations
          </h2>
          <p>
            Most PySpark code is untested because spinning up a SparkSession
            feels heavy. It is not that bad. A local session with a small fixture
            DataFrame is fast enough to run in CI:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# conftest.py
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    return SparkSession.builder \\
        .master("local[2]") \\
        .appName("test") \\
        .config("spark.sql.shuffle.partitions", "2") \\
        .getOrCreate()

# test_transformations.py
def test_session_detection(spark):
    data = [
        ("u1", 1000),
        ("u1", 1500),   # 8.3 min gap — same session
        ("u1", 3400),   # 31.7 min gap — NEW session
    ]
    df = spark.createDataFrame(data, ["user_id", "event_ts_min"])
    result = add_session_boundaries(df)
    assert result.filter("new_session = 1").count() == 1`}
          </pre>

          <p>
            Keep transformations as pure functions that take a DataFrame and
            return a DataFrame. This makes them trivially testable and
            composable. Avoid mixing transformation logic with I/O (reading/writing
            files) in the same function.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Production config patterns
          </h2>
          <p>
            The default Spark configuration is not tuned for production. The
            two settings that matter most for most jobs:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`spark = SparkSession.builder \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \\
    .config("spark.sql.shuffle.partitions", "200") \\
    .config("spark.executor.memory", "8g") \\
    .config("spark.driver.memory", "4g") \\
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \\
    .getOrCreate()`}
          </pre>

          <p>
            AQE is the highest-ROI config change in Spark 3. It adjusts query
            plans at runtime based on actual data statistics — converting
            shuffle joins to broadcasts, coalescing small partitions,
            optimizing skew joins. Enable it everywhere.
          </p>

          <p className="font-medium text-white mt-4">Idempotent writes</p>
          <p>
            Every Spark job should be safe to re-run. The easiest way is to
            write to a date-partitioned path and overwrite that partition only.
            If the job fails and reruns, the output is identical:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Overwrite only today's partition — idempotent by design
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")

df.write.partitionBy("date") \\
  .mode("overwrite") \\
  .parquet("s3://bucket/events/")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Inquirer pipeline in practice
          </h2>
          <p>
            Our reader behavior pipeline at The Philadelphia Inquirer processed
            roughly 50-80 million events per day — page views, scroll depth,
            video plays, newsletter click-throughs. The Spark job ran on EMR,
            read from an S3 event lake partitioned by hour, and produced daily
            aggregates for the analytics team and feature tables for our
            recommendation engine.
          </p>
          <p>
            The patterns that made it reliable: broadcast joins for the article
            metadata lookup (small table, joined on every row), window functions
            for session detection, Delta Lake for the output tables so analysts
            could always query the most recent consistent state, and strict
            partition key selection (user_id and date) that matched the access
            patterns of downstream consumers.
          </p>
          <p>
            The lesson from running it in production for two years: most Spark
            performance problems trace back to two things — bad partition
            strategies and missing broadcast hints. Get those right, enable AQE,
            and the rest is usually fine.
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
