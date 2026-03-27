import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Lake Architecture: From Swamp to Lakehouse | Ryan Kirsch",
  description:
    "How data lakes work, why they become swamps, and the architectural patterns (delta lake, Iceberg, partitioning, catalog) that make them reliable. A practical guide for data engineers building on S3 or GCS.",
  openGraph: {
    title: "Data Lake Architecture: From Swamp to Lakehouse",
    description:
      "How data lakes work, why they become swamps, and the architectural patterns (delta lake, Iceberg, partitioning, catalog) that make them reliable. A practical guide for data engineers building on S3 or GCS.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-lake-architecture",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Lake Architecture: From Swamp to Lakehouse",
    description:
      "How data lakes work, why they become swamps, and the architectural patterns (delta lake, Iceberg, partitioning, catalog) that make them reliable. A practical guide for data engineers building on S3 or GCS.",
  },
  alternates: { canonical: "/blog/data-lake-architecture" },
};

export default function DataLakePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-lake-architecture");
  const postTitle = encodeURIComponent("Data Lake Architecture: From Swamp to Lakehouse");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Architecture</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Lake Architecture: From Swamp to Lakehouse
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A data lake starts as a flexible storage layer. It becomes a swamp when nobody can find anything, nothing is reliable, and the answer to every data question is &quot;it&apos;s somewhere in S3.&quot; Here is how to build one that stays navigable.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The data lake concept is simple: store all your data in object storage (S3, GCS, Azure Blob) in open formats, and query it with whatever compute engine you need. The reality is that without discipline around organization, table formats, and metadata management, a data lake degrades into a graveyard of files where schema has been lost, updates are impossible, and queries scan the entire bucket to answer basic questions.
          </p>
          <p>
            This guide covers the foundational patterns that keep data lakes functional: folder structure, open table formats, partitioning, catalogs, and the lakehouse architecture that has become the standard for modern data platforms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Data Lakes Become Swamps</h2>
          <p>
            The swamp pattern is consistent: it starts with ungoverned ingestion. Teams dump data into S3 without consistent naming conventions, folder structures, or format requirements. CSV files coexist with Parquet. Some folders have dates in the path, others do not. Schema is undocumented and changes silently when source systems change.
          </p>
          <p>
            The second phase is the query problem. Without a catalog, consumers have to know the exact path to every dataset. Without table format metadata, every query must scan the entire partition to determine what data is relevant. Performance is unpredictable and slow.
          </p>
          <p>
            The third phase is the update problem. Plain Parquet files cannot be updated or deleted. When a source system corrects a historical record, the only option is to rewrite entire partitions. When GDPR deletion requests arrive, fulfilling them requires custom tooling on top of plain files.
          </p>
          <p>
            Open table formats (Apache Iceberg, Delta Lake) solve all of these problems. They are the reason the lakehouse architecture has emerged as the dominant pattern.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Open Table Formats: Iceberg and Delta Lake</h2>
          <p>
            Apache Iceberg and Delta Lake add a metadata layer on top of Parquet files that enables ACID transactions, schema evolution, time travel, and efficient query planning. They turn a folder of files into a proper table with the reliability guarantees of a traditional database.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Apache Iceberg with PySpark
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \
    .config("spark.sql.catalog.glue", "org.apache.iceberg.spark.SparkCatalog") \
    .config("spark.sql.catalog.glue.type", "glue") \
    .config("spark.sql.catalog.glue.warehouse", "s3://my-data-lake/warehouse/") \
    .getOrCreate()

# Create an Iceberg table
spark.sql("""
    CREATE TABLE IF NOT EXISTS glue.analytics.fct_orders (
        order_id STRING,
        customer_id STRING,
        amount DECIMAL(10,2),
        order_date DATE,
        status STRING
    )
    USING iceberg
    PARTITIONED BY (days(order_date))
    LOCATION 's3://my-data-lake/warehouse/analytics/fct_orders/'
""")

# ACID upsert — updates existing rows, inserts new ones
spark.sql("""
    MERGE INTO glue.analytics.fct_orders t
    USING updates u ON t.order_id = u.order_id
    WHEN MATCHED THEN UPDATE SET t.status = u.status
    WHEN NOT MATCHED THEN INSERT *
""")

# Time travel — query historical state
spark.sql("""
    SELECT * FROM glue.analytics.fct_orders
    TIMESTAMP AS OF '2026-03-01 00:00:00'
    WHERE order_date = '2026-03-01'
""")`}
          </pre>
          <p>
            Iceberg maintains a metadata tree: table metadata files point to manifest lists, which point to manifest files, which describe the actual Parquet data files. This enables partition pruning at planning time without scanning any data files, schema evolution without rewriting data, and point-in-time queries by selecting the appropriate snapshot.
          </p>
          <p>
            Delta Lake (Databricks) provides similar capabilities with a transaction log approach. The choice between Iceberg and Delta Lake is primarily a function of which compute engines you use: Iceberg has broader cross-engine support (Spark, Trino, Flink, DuckDB), while Delta Lake is tightly integrated with Databricks and has excellent Spark performance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Folder Structure and Naming Conventions</h2>
          <p>
            Even with open table formats, folder structure matters for human navigability and for the non-table data that still lives as raw files.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`s3://my-data-lake/
  raw/                    # Source data, immutable after ingestion
    salesforce/
      accounts/
        year=2026/month=03/day=27/
          part-0001.parquet
    stripe/
      charges/
        year=2026/month=03/day=27/
  warehouse/              # Iceberg/Delta managed tables
    analytics/
      fct_orders/         # Iceberg table files (managed by engine)
      dim_customers/
    staging/
      stg_salesforce__accounts/
  scratch/                # Temporary processing, auto-deleted after 30d
    user_rkirsch/
  archive/                # Data beyond retention window`}
          </pre>
          <p>
            The raw zone uses Hive-style partitioning (year=/month=/day=) for compatibility with the widest range of query engines. The warehouse zone is managed by the Iceberg catalog and should not be manipulated directly. Naming conventions with double underscores for source-scoped tables match dbt conventions and make lineage clearer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Data Catalog: Making the Lake Navigable</h2>
          <p>
            A data catalog registers table schemas, ownership, documentation, and lineage in a searchable interface. Without a catalog, the lake is only navigable by the people who put data into it.
          </p>
          <p>
            AWS Glue Data Catalog is the native AWS option: it integrates directly with Athena, EMR, and Glue ETL jobs. It stores table schemas and partition metadata, enabling efficient query planning without scanning entire prefixes.
          </p>
          <p>
            Apache Hive Metastore is the traditional option for Spark-based data lakes. Iceberg and Delta Lake both support Hive Metastore as a catalog backend.
          </p>
          <p>
            For data discovery and documentation beyond raw schema metadata, tools like DataHub, OpenMetadata, or dbt docs provide richer search, lineage visualization, and business context. These run alongside the technical catalog (Glue/Hive) rather than replacing it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Lakehouse: Marrying Lake and Warehouse</h2>
          <p>
            The lakehouse architecture uses open table formats on object storage as the storage foundation, with one or more compute engines providing SQL analytics, ML workloads, and streaming processing from the same data.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# One dataset, multiple consumers
s3://data-lake/warehouse/analytics/fct_orders/
  ↓ Iceberg metadata layer
  
  Trino     → SQL analytics, ad-hoc queries
  Spark     → Batch ETL, ML feature engineering  
  Flink     → Streaming reads/writes
  DuckDB    → Local development, small queries
  Snowflake → External table (read via Iceberg REST catalog)
  Athena    → Serverless SQL for occasional large scans`}
          </pre>
          <p>
            The key properties of a well-functioning lakehouse: all tables use Iceberg or Delta, a central catalog provides discovery and schema management, compute engines are chosen based on workload characteristics (streaming vs. batch vs. ad-hoc), and the raw zone is kept immutable for auditability and reprocessing.
          </p>
          <p>
            The lakehouse has largely replaced both the pure data warehouse (expensive, vendor-specific) and the pure data lake (cheap but unusable) as the architectural target for new data platform builds. The combination of open formats, flexible compute, and reasonable operational overhead makes it the right choice for most organizations building a new platform today.
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
