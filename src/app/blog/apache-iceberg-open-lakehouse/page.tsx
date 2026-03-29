import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs to Know It in 2026 | Ryan Kirsch - Data Engineer",
  description:
    "Apache Iceberg is the open table format powering the open lakehouse. Learn its features, how it compares to Delta Lake and Hudi, and how to use it in production.",
  openGraph: {
    title:
      "Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs to Know It in 2026 | Ryan Kirsch - Data Engineer",
    description:
      "Apache Iceberg is the open table format powering the open lakehouse. Learn its features, how it compares to Delta Lake and Hudi, and how to use it in production.",
    type: "article",
    url: "https://ryankirsch.dev/blog/apache-iceberg-open-lakehouse",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs to Know It in 2026 | Ryan Kirsch - Data Engineer",
    description:
      "Apache Iceberg is the open table format powering the open lakehouse. Learn its features, how it compares to Delta Lake and Hudi, and how to use it in production.",
  },
  alternates: { canonical: "/blog/apache-iceberg-open-lakehouse" },
};

export default function ApacheIcebergOpenLakehousePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/apache-iceberg-open-lakehouse"
  );
  const postTitle = encodeURIComponent(
    "Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs to Know It in 2026"
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
            {["Iceberg", "Lakehouse", "Open Table Format", "PySpark", "Data Engineering"].map(
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
            Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs
            to Know It in 2026
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            November 2, 2025 · 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            The modern data stack is converging on a simple idea: store data in
            open formats on object storage, and use a transaction layer that
            makes it behave like a real database. Apache Iceberg is that layer.
            It is an open table format built for huge analytic datasets, with
            a metadata model that makes updates, deletes, and time travel
            reliable at scale.
          </p>
          <p>
            If you are building a lakehouse in 2026, Iceberg is not just a nice
            to have. It is one of the most important pieces of the architecture.
            It gives you consistency without locking you into a single vendor,
            and it works across Spark, Flink, Trino, and the fast growing list
            of modern engines.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            What Apache Iceberg Is and Why It Matters
          </h2>
          <p>
            Iceberg is a table format for data lakes. It stores data in Parquet,
            ORC, or Avro files, and uses metadata files to track snapshots,
            partitioning, and schema history. The core idea is simple: data
            files are immutable, and table state is defined by a snapshot that
            points to a list of files. Every write creates a new snapshot, so
            reads are consistent, and you can go back in time without copying
            data.
          </p>
          <p>
            This matters because data lakes without a table format are fragile.
            They break when schemas drift, when jobs overlap, or when you need
            to delete rows. Iceberg makes the lake behave like a database while
            keeping the lake open. You get ACID semantics, predictable query
            planning, and a path to multi engine analytics without moving your
            data.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Key Features You Actually Feel in Production
          </h2>
          <p>
            Iceberg features are not abstract, they show up in daily operations.
            Schema evolution means you can add columns safely without breaking
            downstream jobs. You can rename columns and change types with
            explicit rules, and the schema history is tracked so old snapshots
            still read correctly.
          </p>
          <p>
            Time travel and snapshot isolation are the safety net. Every write
            creates a snapshot, and readers see a consistent view of the table
            even while writers commit. That makes debugging and auditing much
            simpler. You can query a snapshot by ID or timestamp and validate
            exactly what a report used last week.
          </p>
          <p>
            Partition evolution and hidden partitioning are the most underrated
            wins. Iceberg stores partition values in metadata, not in the file
            path. You can change partitioning strategy without rewriting the
            table, and you avoid leaking partition logic into every query. That
            saves both compute and human time.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Iceberg vs Delta Lake vs Hudi
          </h2>
          <p>
            These formats solve the same class of problems, but they optimize
            for different tradeoffs. Here is the short comparison I use when
            advising teams:
          </p>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Iceberg</th>
                <th>Delta Lake</th>
                <th>Hudi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Engine support</td>
                <td>Broad, vendor neutral</td>
                <td>Best in Spark and Databricks</td>
                <td>Strong in Spark, evolving elsewhere</td>
              </tr>
              <tr>
                <td>Schema evolution</td>
                <td>Yes, with rename and type changes</td>
                <td>Yes, with merge and alter options</td>
                <td>Yes, but less uniform across engines</td>
              </tr>
              <tr>
                <td>Time travel</td>
                <td>Snapshot based</td>
                <td>Version based</td>
                <td>Commit based</td>
              </tr>
              <tr>
                <td>Partition evolution</td>
                <td>First class and flexible</td>
                <td>Supported, but path based in many cases</td>
                <td>Supported with more operational tuning</td>
              </tr>
              <tr>
                <td>Streaming upserts</td>
                <td>Good, improving quickly</td>
                <td>Good, especially on Databricks</td>
                <td>Excellent, core strength</td>
              </tr>
              <tr>
                <td>Catalog options</td>
                <td>Hive, Glue, Nessie, REST</td>
                <td>Hive and proprietary catalogs</td>
                <td>Hive, Glue, and others</td>
              </tr>
            </tbody>
          </table>
          <p>
            If you are deep in Spark and Databricks, Delta Lake is still the
            smoothest operational experience. If you need streaming upserts at
            low latency, Hudi has real advantages. If you need vendor neutrality
            and a clean separation between compute and storage, Iceberg is the
            default answer.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Integration With the Modern Stack
          </h2>
          <p>
            Iceberg is not tied to a single engine. Spark has first class
            support, and you can read and write tables using the Iceberg
            catalog APIs. Flink supports Iceberg for streaming and batch, which
            is useful for near real time pipelines. Trino and Presto allow fast
            interactive queries across Iceberg tables without moving data.
          </p>
          <p>
            dbt integrates through adapters and can manage Iceberg models in
            platforms like Spark, Trino, and Athena. Snowflake supports Iceberg
            tables in an open catalog and can query them without copying into
            internal storage. BigQuery supports Iceberg external tables on GCS,
            which is a major shift for teams already invested in GCP.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Open Lakehouse Architecture
          </h2>
          <p>
            The open lakehouse pattern is simple and powerful. Store data in
            object storage like S3 or GCS, define tables with Iceberg, and let
            compute engines attach through a shared catalog. Your data lives in
            open files, your metadata lives in open tables, and your compute can
            change over time.
          </p>
          <p>
            Iceberg is the foundation because it separates storage from compute
            without losing correctness. You can run Spark for batch, Flink for
            streaming, Trino for BI, and let each engine see the same table
            state. That is the difference between a lakehouse and a pile of
            Parquet files.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Production Patterns That Keep Iceberg Healthy
          </h2>
          <p>
            The first pattern is compaction. Iceberg tables can accumulate
            small files from streaming and micro batch jobs. Run periodic
            compaction jobs to rewrite small files into larger ones, and avoid
            slow metadata scans. Many teams run nightly compaction or trigger
            it when file counts exceed a threshold.
          </p>
          <p>
            The second pattern is metadata management. Iceberg uses manifests
            and metadata files, and these can grow over time. Use snapshot
            expiration and manifest rewrite operations to keep metadata
            efficient. You should also track metrics like file count, manifest
            count, and metadata size as part of operational monitoring.
          </p>
          <p>
            The third pattern is catalog choice. Hive Metastore is common for
            self managed clusters. AWS Glue is the default on AWS. Nessie adds
            Git like branching and tagging on metadata, which is great for data
            lifecycle control. The REST catalog is the emerging standard for
            tool interoperability and managed services. Pick the catalog that
            matches your governance and multi engine needs.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            When to Use Iceberg and When Not To
          </h2>
          <p>
            Use Iceberg when you need a vendor neutral table format, when you
            want multiple engines to read the same data, or when you care about
            long term ownership of your data architecture. It shines for
            append heavy analytics, slowly changing dimensions, and large
            datasets that need reliable evolution.
          </p>
          <p>
            Do not use Iceberg if you need ultra low latency streaming upserts
            at extreme scale and you are already committed to a Hudi stack. Do
            not use it if you want a fully managed warehouse and do not care
            about open storage. A lakehouse is not always the answer if your
            data is small and your queries are simple.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            PySpark Examples
          </h2>
          <p>
            The API surface is clean and familiar. Here is how to create an
            Iceberg table in Spark using a catalog:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`spark.sql("""
CREATE TABLE prod.analytics.orders (
  order_id STRING,
  customer_id STRING,
  order_total DOUBLE,
  order_ts TIMESTAMP
)
USING iceberg
PARTITIONED BY (days(order_ts))
""")`}
          </pre>
          <p>
            Time travel is snapshot based. You can query by snapshot ID or
            timestamp:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`df = spark.read.format("iceberg") \\
    .option("snapshot-id", 4928382749921) \\
    .load("prod.analytics.orders")`}
          </pre>
          <p>
            Schema evolution is explicit and safe. This example adds a column
            without rewriting the full dataset:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`spark.sql("""
ALTER TABLE prod.analytics.orders
ADD COLUMN order_channel STRING
""")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">Closing</h2>
          <p>
            The open lakehouse is here, and Iceberg is one of its most important
            building blocks. It gives you reliability, portability, and room to
            grow as your stack changes. If you are a data engineer in 2026,
            learn Iceberg deeply. It will show up in interviews, architecture
            reviews, and real world pipelines. More importantly, it will make
            your lakehouse feel like a database without giving up the benefits
            of open storage.
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
