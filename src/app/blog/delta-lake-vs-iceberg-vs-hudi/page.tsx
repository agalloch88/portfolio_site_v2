import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delta Lake vs Iceberg vs Hudi: The Open Table Format Battle | Ryan Kirsch",
  description:
    "A deep technical comparison of the three major open table formats: Delta Lake, Apache Iceberg, and Apache Hudi. ACID transactions, time travel, schema evolution, performance, and when to pick each.",
  openGraph: {
    title: "Delta Lake vs Iceberg vs Hudi: The Open Table Format Battle",
    description:
      "A deep technical comparison of the three major open table formats: Delta Lake, Apache Iceberg, and Apache Hudi. ACID transactions, time travel, schema evolution, performance, and when to pick each.",
    type: "article",
    url: "https://ryankirsch.dev/blog/delta-lake-vs-iceberg-vs-hudi",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delta Lake vs Iceberg vs Hudi: The Open Table Format Battle",
    description:
      "A deep technical comparison of the three major open table formats: Delta Lake, Apache Iceberg, and Apache Hudi. ACID transactions, time travel, schema evolution, performance, and when to pick each.",
  },
  alternates: { canonical: "/blog/delta-lake-vs-iceberg-vs-hudi" },
};

export default function DeltaLakeVsIcebergVsHudiPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/delta-lake-vs-iceberg-vs-hudi");
  const postTitle = encodeURIComponent("Delta Lake vs Iceberg vs Hudi: The Open Table Format Battle");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">March 29, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Delta Lake vs Iceberg vs Hudi: The Open Table Format Battle
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Three formats, one goal: bring database-grade reliability to data lakes. Here is how they differ on the properties that actually matter in production.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The open table format landscape has consolidated around three serious contenders: Delta Lake (created at Databricks), Apache Iceberg (originated at Netflix), and Apache Hudi (originated at Uber). All three bring ACID transactions, schema evolution, and time travel to the data lake. All three are open source. All three work with Parquet files on object storage.
          </p>
          <p>
            The differences that matter are in the architectural choices each project made: how they manage metadata, how they handle concurrent writes, how they perform at scale, and which ecosystems they integrate with most naturally. I have built production systems on all three, and the right choice depends heavily on your specific constraints.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Core Problem All Three Solve</h2>
          <p>
            Plain Parquet on S3 is immutable and unordered. You can append files, but you cannot update or delete individual records without rewriting entire partitions. There is no transaction coordination, so concurrent writers will silently overwrite each other. Schema changes require manual partition management. Time travel requires you to have never deleted old files. These limitations made traditional data lakes appropriate for append-only analytical workloads and inappropriate for anything requiring correctness guarantees.
          </p>
          <p>
            Open table formats solve this by adding a metadata layer on top of Parquet files. Instead of reasoning directly about which Parquet files represent your table, engines read a metadata catalog that tracks file membership, schema history, and transaction logs. The Parquet files themselves do not change, but the layer on top of them adds the database-grade properties that make the lake usable for serious engineering.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Delta Lake: The Databricks-Native Choice</h2>
          <p>
            Delta Lake stores its transaction log as a sequence of JSON files in a <code>_delta_log</code> directory alongside the data. Each commit appends a new JSON file describing what changed: which files were added, which were removed, and what the new schema is. This is a straightforward design that is easy to reason about and debug.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Delta Lake MERGE (upsert) in PySpark
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "s3://my-bucket/events")

delta_table.alias("target").merge(
    source=new_data.alias("source"),
    condition="target.event_id = source.event_id"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()

# Time travel: query yesterday's snapshot
df = spark.read.format("delta") \\
    .option("timestampAsOf", "2026-03-28") \\
    .load("s3://my-bucket/events")

# Or by version number
df = spark.read.format("delta") \\
    .option("versionAsOf", 42) \\
    .load("s3://my-bucket/events")`}
          </pre>
          <p>
            Delta Lake checkpoints the transaction log every 10 commits by default, generating a Parquet checkpoint file that summarizes the current table state. This prevents the log from growing unbounded and keeps read performance reasonable as tables accumulate history.
          </p>
          <p>
            The strengths of Delta Lake are its deep integration with Databricks (Unity Catalog, Delta Live Tables, and Photon are all Delta-native), its mature tooling (the delta-rs Rust library enables non-JVM access), and its straightforward transaction model. The weakness is that outside the Databricks ecosystem, Delta Lake has historically been slower to gain first-class support from query engines. Athena, Trino, and Flink all support Delta, but the integration has typically lagged behind Iceberg adoption in open-source contexts.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Apache Iceberg: The Open Ecosystem Choice</h2>
          <p>
            Iceberg takes a fundamentally different approach to metadata. Rather than a sequential transaction log, Iceberg maintains a tree of metadata files: a catalog pointer to a metadata JSON file, which references manifest lists, which reference manifests, which reference the actual data files. This hierarchical structure enables efficient partition pruning and file skipping at a scale where Delta&apos;s flat log becomes a performance bottleneck.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Iceberg in Trino (excellent native support)
-- Schema evolution without rewriting data
ALTER TABLE catalog.db.events 
ADD COLUMN user_agent VARCHAR;

-- Partition evolution: switch strategy without migrating data
ALTER TABLE catalog.db.events 
ADD PARTITION FIELD day(event_timestamp);

-- Time travel
SELECT * FROM catalog.db.events
FOR TIMESTAMP AS OF TIMESTAMP '2026-03-28 00:00:00';

-- Snapshot inspection
SELECT * FROM catalog.db.events.snapshots
ORDER BY committed_at DESC LIMIT 10;

-- Row-level deletes (copy-on-write or merge-on-read)
DELETE FROM catalog.db.events 
WHERE user_id = 12345;`}
          </pre>
          <p>
            Iceberg&apos;s partition evolution is genuinely powerful. With Delta and Hudi, changing your partitioning scheme means migrating your table. With Iceberg, you can add a new partition transform to an existing table and new data lands in the new partition scheme while old data stays in place. Queries transparently handle both layouts. This matters enormously for tables that have been running for years under a partitioning scheme that no longer fits the query patterns.
          </p>
          <p>
            Schema evolution in Iceberg tracks changes by column ID rather than by name. This means you can rename a column without it appearing as a drop-and-add to downstream consumers, and old Parquet files written before the rename are still correctly read because the engine maps by ID. Delta and Hudi handle schema evolution by column name, which creates subtle problems when columns are renamed.
          </p>
          <p>
            The case for Iceberg is its breadth of engine support. Trino, Spark, Flink, Snowflake, BigQuery, Redshift Spectrum, and Athena all have mature, actively maintained Iceberg integrations. If you are running a multi-engine architecture or want to avoid vendor lock-in, Iceberg is currently the strongest choice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Apache Hudi: The Streaming and Upsert Choice</h2>
          <p>
            Hudi was built at Uber to solve a specific problem: efficiently applying high-volume upserts and deletes to large tables in near-real-time. Its architecture reflects this origin. Hudi tables come in two storage types: Copy-On-Write (COW) and Merge-On-Read (MOR), and understanding the difference is essential to using Hudi correctly.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Hudi DeltaStreamer: ingest from Kafka with upserts
from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \\
    .config("spark.sql.catalog.spark_catalog", 
            "org.apache.spark.sql.hudi.catalog.HoodieCatalog") \\
    .getOrCreate()

hudi_options = {
    "hoodie.table.name": "events",
    "hoodie.datasource.write.recordkey.field": "event_id",
    "hoodie.datasource.write.precombine.field": "updated_at",
    "hoodie.datasource.write.operation": "upsert",
    "hoodie.datasource.write.table.type": "MERGE_ON_READ",
    # Inline clustering for read performance
    "hoodie.clustering.inline": "true",
    "hoodie.clustering.inline.max.commits": "4",
}

new_data.write.format("hudi") \\
    .options(**hudi_options) \\
    .mode("append") \\
    .save("s3://my-bucket/events")

# Incremental query: only records changed since a timestamp
spark.read.format("hudi") \\
    .option("hoodie.datasource.query.type", "incremental") \\
    .option("hoodie.datasource.read.begin.instanttime", "20260328000000") \\
    .load("s3://my-bucket/events")`}
          </pre>
          <p>
            With MOR tables, Hudi writes upserts as delta log files that are merged with base files at read time. This makes writes very fast (you are not rewriting base files on every upsert) but reads slightly more expensive (the merge happens at query time). Periodic compaction collapses the delta logs back into base files to restore read performance. For high-frequency upsert workloads where write latency matters, MOR is the right choice.
          </p>
          <p>
            Hudi&apos;s incremental query capability is unique: you can query a Hudi table for only the records that changed since a specific commit time. This makes Hudi a natural fit for building efficient change data capture (CDC) pipelines and incremental materialization, where you want to push only the delta to downstream systems rather than reprocessing the full table on each run.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">ACID Transactions: How Each Format Handles Concurrency</h2>
          <p>
            All three formats provide serializable isolation for single-writer workloads and optimistic concurrency for multi-writer scenarios. The difference is in how they handle conflicts when two writers attempt to commit simultaneously.
          </p>
          <p>
            Delta Lake uses optimistic concurrency with conflict detection at the file level. Two writers can commit successfully if they touched different files. If they touched the same files, the second commit is retried against the updated state and will succeed if the conflict can be resolved without violating isolation guarantees.
          </p>
          <p>
            Iceberg uses optimistic concurrency at the snapshot level. Each commit attempts to update the current snapshot pointer atomically. If the pointer was updated by another writer between when this writer read the current state and when it attempts to commit, the commit fails and must retry. Iceberg provides configurable retry logic and supports the optimistic locking patterns needed for high-concurrency writer scenarios.
          </p>
          <p>
            Hudi has the most sophisticated concurrency model of the three, with multi-writer support via a timeline server that coordinates commits and prevents conflicting operations from succeeding simultaneously. For workloads involving both batch and streaming writers on the same table, Hudi&apos;s timeline-based coordination is the most mature solution.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When to Pick Each Format</h2>
          <p>
            <strong>Pick Delta Lake</strong> when your primary compute platform is Databricks, when your team is already invested in the Databricks ecosystem, or when you need Delta Live Tables for declarative pipeline management. Delta is also the right choice when you want the simplest possible mental model for your transaction log and are willing to trade some cross-engine portability for tight platform integration.
          </p>
          <p>
            <strong>Pick Iceberg</strong> when you are running a multi-engine architecture (Trino for ad hoc, Spark for batch, Flink for streaming), when long-term schema and partition evolution flexibility matters, or when you are building on a cloud data platform that has native Iceberg support (Snowflake, BigQuery, and AWS Glue all treat Iceberg as a first-class format). Iceberg is also the safest choice if avoiding vendor lock-in is an explicit requirement.
          </p>
          <p>
            <strong>Pick Hudi</strong> when your primary workload is high-frequency upserts from CDC or streaming sources, when you need incremental query capability to build efficient downstream pipelines, or when write latency is a binding constraint and you are willing to pay for periodic compaction to maintain read performance. Hudi is the specialist choice for mutation-heavy workloads that would stress the COW model that Delta and Iceberg default to.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Honest Summary</h2>
          <p>
            In practice, the open table format decision is often made by your compute platform choice rather than the other way around. If you are on Databricks, you use Delta. If you are on Snowflake or Athena, Iceberg is the path of least resistance. If you are building a high-throughput CDC pipeline on Spark with Kafka as the source, Hudi deserves a serious look.
          </p>
          <p>
            All three are production-grade. All three will handle the workloads most data engineering teams actually run. The differences become meaningful at scale, under high concurrency, or when specific features like partition evolution or incremental query become requirements rather than nice-to-haves. Know your requirements, know your ecosystem, and pick the format that your team can operate confidently over the next several years.
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
