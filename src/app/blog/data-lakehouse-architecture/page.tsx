import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Lakehouse Architecture: When to Use It and How to Build One | Ryan Kirsch",
  description:
    "A practical guide to data lakehouse architecture: Delta Lake vs. Iceberg vs. Hudi, medallion patterns, when a lakehouse beats a warehouse, and hands-on patterns with DuckDB and Spark.",
  openGraph: {
    title: "Data Lakehouse Architecture: When to Use It and How to Build One",
    description:
      "A practical guide to data lakehouse architecture: Delta Lake vs. Iceberg vs. Hudi, medallion patterns, when a lakehouse beats a warehouse, and hands-on patterns with DuckDB and Spark.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-lakehouse-architecture",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Lakehouse Architecture: When to Use It and How to Build One",
    description:
      "A practical guide to data lakehouse architecture: Delta Lake vs. Iceberg vs. Hudi, medallion patterns, when a lakehouse beats a warehouse, and hands-on patterns with DuckDB and Spark.",
  },
  alternates: { canonical: "/blog/data-lakehouse-architecture" },
};

export default function DataLakehousePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-lakehouse-architecture"
  );
  const postTitle = encodeURIComponent(
    "Data Lakehouse Architecture: When to Use It and How to Build One"
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Blog
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              Data Engineering
            </span>
            <span className="text-sm text-gray-500">October 6, 2025</span>
            <span className="text-sm text-gray-500">7 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Lakehouse Architecture: When to Use It and How to Build One
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The lakehouse pattern combines the scalability of a data lake with the reliability guarantees of a warehouse. Here is when that tradeoff actually makes sense and how to build it well.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            I have built data platforms on both ends of the spectrum: tightly coupled cloud warehouses where everything runs through Snowflake, and loosely coupled lake architectures where Spark jobs write Parquet to S3 and hope for the best. The lakehouse pattern sits between those two extremes, and after working with it in production for a couple of years, my view is that it is genuinely the right default for a certain class of data platform.
          </p>
          <p>
            The core idea is straightforward: store data in open formats on cheap object storage (S3, GCS, or Azure Data Lake), then apply a table format layer on top that gives you ACID transactions, schema evolution, time travel, and efficient query planning. The result is something that behaves like a warehouse from the query perspective but has the economics and flexibility of a lake.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Three Open Table Formats: Delta Lake, Iceberg, and Hudi
          </h2>
          <p>
            The table format layer is where most teams get stuck, because there are three credible options and the differences between them are real but not always obvious from documentation alone.
          </p>
          <p>
            <strong>Delta Lake</strong> is the Databricks-originated format and is deeply integrated into the Databricks runtime. If your team is already on Databricks, Delta Lake is the default choice and the right one. The tooling, documentation, and community support are excellent. Outside of Databricks, Delta Lake has improved significantly with the Delta Standalone and Delta Kernel projects, but it historically felt most native in that ecosystem.
          </p>
          <p>
            <strong>Apache Iceberg</strong> has become the format I reach for on AWS and multi-engine environments. Iceberg has strong support across Spark, Flink, Trino, DuckDB, and most cloud-managed services (AWS Glue, Athena, and Redshift all support it natively). The catalog abstraction in Iceberg is particularly clean: it supports REST catalogs, Glue catalogs, and Hive Metastore, which matters when you need multiple compute engines reading the same tables. I have built Iceberg-based pipelines where Spark writes, Flink reads for real-time aggregations, and DuckDB queries for local development, all against the same table definition. That interoperability is hard to match.
          </p>
          <p>
            <strong>Apache Hudi</strong> (Hadoop Upserts Deletes and Incrementals) originated at Uber and has strong CDC and streaming upsert capabilities. If your primary use case is near-real-time CDC from operational databases into your lake, Hudi deserves serious consideration. The Copy-on-Write vs. Merge-on-Read configuration gives you explicit control over the read/write performance tradeoff. Outside of that specific use case, Hudi has a steeper operational curve than Iceberg or Delta Lake.
          </p>
          <p>
            For most greenfield projects in 2026, my recommendation is Iceberg on AWS or GCP, Delta Lake on Databricks. Hudi when CDC is the dominant workload.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Medallion Architecture: Bronze, Silver, Gold
          </h2>
          <p>
            The medallion architecture is the standard layering pattern for lakehouse data. I have seen it called different things (raw/cleansed/curated is common), but the structure is the same. Bronze is raw ingested data. Silver is cleansed and conformed. Gold is business-ready, query-optimized data for analytics and reporting.
          </p>
          <p>
            Bronze is append-only and schema-on-read. You write exactly what you received from the source, including any weirdness. This is your insurance policy: if your transformation logic is wrong, you can reprocess from bronze without touching the source system again.
          </p>
          <p>
            Silver is where most of the transformation work happens: null handling, deduplication, type casting, join to reference data, and application of business rules. Silver tables should have explicit schemas, dbt tests, and freshness SLAs. This is the layer that downstream teams depend on.
          </p>
          <p>
            Gold is optimized for consumption: aggregated fact tables, pre-joined dimensions, materialized metrics. Gold tables are often the most expensive to produce and should only exist for workloads that are actually query-heavy. I have seen teams create gold tables for every possible view of data and then watch their pipeline costs triple for no real benefit. Be deliberate about what goes in gold.
          </p>
          <p>
            One pattern I have found valuable: separate gold layers by domain. The analytics gold layer has different SLAs and optimization choices than the gold layer feeding a reverse ETL sync to Salesforce. Treating them as the same layer creates contention and brittle dependencies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            When a Lakehouse Beats a Data Warehouse
          </h2>
          <p>
            A cloud warehouse (Snowflake, BigQuery, Redshift) is still the right default for many teams. The operational burden is low, the SQL experience is excellent, and for teams under a few terabytes with primarily SQL workloads, the cost is often competitive. I am not arguing against warehouses. I am arguing for being deliberate about the choice.
          </p>
          <p>
            A lakehouse is the better choice when one or more of these conditions apply:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Your data volumes are large enough that per-byte warehouse costs become a significant budget item</li>
            <li>You have multiple compute engines that need to read the same data (Spark for ML feature engineering, SQL for analytics, Flink for streaming aggregations)</li>
            <li>You need to retain raw data indefinitely for compliance or reprocessing, and warehouse storage costs are prohibitive</li>
            <li>Your team has machine learning workloads that need access to unstructured or semi-structured data alongside tabular data</li>
            <li>You are building on AWS and want to avoid cloud vendor lock-in on your primary data storage</li>
          </ul>
          <p>
            The teams that struggle with lakehouses are usually the ones that underestimated the operational overhead. You own the table compaction, the vacuum jobs, the catalog management, and the access control in a way you do not with a managed warehouse. If your team does not have dedicated data engineering capacity, start with a warehouse and move toward lakehouse patterns as scale demands it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Hands-On: DuckDB and Spark Against Iceberg Tables
          </h2>
          <p>
            One of the most useful development patterns I have found is using DuckDB locally to query the same Iceberg tables that Spark writes in the pipeline. This removes the need for a running cluster during development and makes iteration dramatically faster.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Query an Iceberg table locally with DuckDB
-- Requires: INSTALL iceberg; LOAD iceberg;
SELECT
  event_date,
  COUNT(*) as event_count,
  SUM(revenue_cents) / 100.0 as revenue
FROM iceberg_scan(
  's3://my-bucket/silver/events/',
  allow_moved_paths = true
)
WHERE event_date >= current_date - INTERVAL 7 DAYS
GROUP BY 1
ORDER BY 1 DESC;`}
          </pre>
          <p>
            For Spark writes, the pattern I default to for silver-layer upserts:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \\
    .config("spark.sql.catalog.glue_catalog", "org.apache.iceberg.spark.SparkCatalog") \\
    .config("spark.sql.catalog.glue_catalog.warehouse", "s3://my-bucket/warehouse/") \\
    .config("spark.sql.catalog.glue_catalog.catalog-impl", "org.apache.iceberg.aws.glue.GlueCatalog") \\
    .getOrCreate()

# Merge upsert into silver layer
spark.sql("""
    MERGE INTO glue_catalog.silver.events t
    USING (SELECT * FROM new_events_staging) s
    ON t.event_id = s.event_id
    WHEN MATCHED THEN UPDATE SET *
    WHEN NOT MATCHED THEN INSERT *
""")

# Compact small files after write
spark.sql("""
    CALL glue_catalog.system.rewrite_data_files(
        table => 'silver.events',
        strategy => 'binpack',
        options => map('target-file-size-bytes', '134217728')
    )
""")`}
          </pre>
          <p>
            The rewrite_data_files call is important and easy to forget. Iceberg tables accumulate small files over time from incremental writes. Compaction keeps read performance acceptable and reduces the metadata overhead that slows down query planning on large tables.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Operational Reality
          </h2>
          <p>
            I want to be direct about the operational side, because the lakehouse pitch often glosses over it. Running a lakehouse well requires ongoing maintenance: table compaction, orphan file cleanup, snapshot expiration, and catalog management. None of it is particularly difficult, but it needs to be scheduled and monitored. I run these as Dagster assets on a weekly cadence, with asset checks that alert if compaction has not run or if table sizes have grown anomalously.
          </p>
          <p>
            Access control is also more complex than a managed warehouse. You are managing S3 bucket policies, IAM roles, and potentially Ranger or Lake Formation policies depending on your setup. If your team has strong security and compliance requirements, factor in the engineering time to implement that correctly.
          </p>
          <p>
            None of this is a reason to avoid the lakehouse pattern. It is a reason to plan for it. The cost savings and flexibility at scale are real. The operational overhead is also real, and the teams that treat it as an afterthought end up with data swamps rather than lakehouses.
          </p>
        </div>

        {/* Share section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
