import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Spark vs. dbt: When to Use Each for Large-Scale Data Transformations | Ryan Kirsch",
  description:
    "A practical decision framework for choosing between Apache Spark and dbt for data transformations. The workloads each handles best, how to use them together, and the common mistake of using the wrong tool for the wrong job.",
  openGraph: {
    title:
      "Spark vs. dbt: When to Use Each for Large-Scale Data Transformations",
    description:
      "The workloads Spark handles best vs. dbt, how they complement each other, and the common mistake of using the wrong tool.",
    type: "article",
    url: "https://ryankirsch.dev/blog/spark-vs-dbt-transformations",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Spark vs. dbt: When to Use Each for Large-Scale Data Transformations",
    description:
      "The workloads Spark handles best vs. dbt, how they complement each other, and the common mistake of using the wrong tool.",
  },
  alternates: { canonical: "/blog/spark-vs-dbt-transformations" },
};

export default function SparkVsDbtPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/spark-vs-dbt-transformations"
  );
  const postTitle = encodeURIComponent(
    "Spark vs. dbt: When to Use Each for Large-Scale Data Transformations"
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
          <span className="mx-2 text-steel">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">
            Blog
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Spark vs. dbt: When to Use Each for Large-Scale Data Transformations
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 26, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            The question &ldquo;Spark or dbt?&rdquo; comes up constantly in data
            engineering interviews and architecture discussions. It is usually
            the wrong question. They are not competing tools -- they solve
            different problems, and the right answer for most platforms is
            both, applied to the workloads each handles well.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What Each Tool Is Actually For
            </h2>
            <p>
              <strong>dbt</strong> is a transformation framework that runs
              SQL against your data warehouse. It does not move or process
              data itself -- it tells your warehouse to execute SQL, and the
              warehouse does the work. dbt adds version control, testing,
              documentation, lineage, and dependency management on top of
              SQL. Its execution environment is your warehouse (Snowflake,
              BigQuery, Redshift), and its scaling is the warehouse&apos;s scaling.
            </p>
            <p>
              <strong>Apache Spark</strong> is a distributed computing engine.
              It processes data in parallel across a cluster of machines, in
              memory when possible, on disk otherwise. It executes Python,
              Scala, Java, or SQL code. Its execution environment is a Spark
              cluster (Databricks, EMR, Dataproc), and its scaling is
              horizontal cluster scaling.
            </p>
            <p>
              The key question is not which is &ldquo;better&rdquo; -- it is which
              computational model fits the transformation you need to run.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When dbt Is the Right Choice
            </h2>
            <p>
              dbt is the right tool when:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Transformations are expressible in SQL.</strong>
                Joining tables, aggregating metrics, building slowly changing
                dimensions, creating dimensional models -- these are SQL
                operations. If the transformation is naturally expressed as
                a SELECT statement, dbt is simpler than Spark.
              </li>
              <li>
                <strong>The primary consumers are analysts.</strong> Analysts
                who write SQL can read, debug, and modify dbt models. Spark
                code requires Python or Scala expertise that most analytics
                teams do not have.
              </li>
              <li>
                <strong>The warehouse is the bottleneck, not compute.</strong>
                Modern cloud warehouses (Snowflake, BigQuery) can process
                hundreds of gigabytes in seconds with the right queries. If
                the warehouse can handle the workload efficiently, adding
                Spark introduces unnecessary complexity.
              </li>
              <li>
                <strong>You need lineage and documentation.</strong> dbt&apos;s
                built-in documentation and lineage graph are significant
                advantages over raw Spark jobs, which have no native equivalent.
              </li>
            </ul>
            <p>
              For the majority of analytics engineering work -- building the
              gold layer, creating reporting tables, building dimensional models
              -- dbt on a modern cloud warehouse is sufficient and simpler to
              operate.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When Spark Is the Right Choice
            </h2>
            <p>
              Spark is the right tool when:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Transformations require procedural logic.</strong>
                Complex state machines, recursive algorithms, custom serialization,
                graph traversals -- these are awkward or impossible to express
                in SQL. Spark Python (PySpark) handles them naturally.
              </li>
              <li>
                <strong>Data volume exceeds warehouse economics.</strong>
                At very large scales (terabytes per hour, petabytes total),
                Snowflake credit costs can exceed the cost of running a Spark
                cluster. For high-volume bronze ingestion or large-scale
                historical reprocessing, Spark on object storage (S3/GCS)
                is often cheaper.
              </li>
              <li>
                <strong>ML feature engineering with complex Python logic.</strong>
                Feature pipelines that use scikit-learn, numpy operations,
                custom embedding models, or complex business logic benefit
                from PySpark&apos;s distributed Python execution.
              </li>
              <li>
                <strong>Streaming at high volume.</strong> Spark Structured
                Streaming handles high-throughput event streams natively.
                dbt has no streaming execution mode.
              </li>
              <li>
                <strong>Multi-format, multi-source ingestion.</strong>
                Spark reads natively from S3/GCS, HDFS, Kafka, databases,
                and dozens of file formats. For complex ingestion pipelines
                that combine multiple sources, Spark is often the right
                Swiss Army knife.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Architecture That Uses Both
            </h2>
            <p>
              Most production data platforms at significant scale use Spark
              and dbt in complementary layers:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Layer allocation
# Bronze (ingestion + initial processing): Spark
# Reason: Multi-format reads, custom parsing, high-volume loads

# Silver (cleansing, conformation): dbt or Spark
# Simple cases: dbt SQL models
# Complex cases (ML features, recursive logic): PySpark

# Gold (analytics models): dbt
# Reason: SQL is the natural language for analytics modeling,
# lineage + documentation are critical at this layer

# Example Dagster asset graph combining both:
from dagster import asset, AssetIn
from dagster_dbt import dbt_assets

@asset(group_name="bronze")
def bronze_clickstream():
    """PySpark: ingest 50M+ events per day from S3"""
    spark = SparkSession.builder.getOrCreate()
    df = spark.read.parquet("s3://raw/clickstream/")
    # ... complex parsing logic
    df.write.format("delta").mode("append").save("s3://bronze/clickstream/")

@asset(group_name="silver", deps=["bronze_clickstream"])
def silver_sessions():
    """PySpark: sessionize clickstream events (recursive-style logic)"""
    # Window functions + complex stateful logic
    pass

# dbt handles gold from silver onward
@dbt_assets(manifest=...)
def gold_models(context, dbt):
    yield from dbt.cli(["run", "--select", "tag:gold"]).stream()`}</code>
            </pre>
            <p>
              The handoff point is typically at the silver layer. Spark handles
              the heavy lifting (ingestion, complex transformations, ML features),
              writes to a warehouse or Delta/Iceberg table, and dbt picks up
              from there to build the analytics layer.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Common Mistakes
            </h2>
            <p>
              <strong>Using Spark for everything because it can.</strong>
              Spark can execute SQL transformations, but dbt does them better
              from an engineering practice perspective -- versioning, testing,
              lineage, documentation. A team that runs all their SQL models
              in Spark because &ldquo;we already have Spark&rdquo; is trading
              maintainability for familiarity.
            </p>
            <p>
              <strong>Using dbt for transformations that need Python.</strong>
              dbt Python models (available in dbt 1.3+) let you run Python
              transformations within dbt, but they run on Snowpark or
              Databricks -- they are not native Python execution. For complex
              procedural logic, a dedicated Spark job or Dagster Python asset
              is cleaner than forcing it into a dbt Python model.
            </p>
            <p>
              <strong>No shared lineage between layers.</strong> When Spark
              handles bronze/silver and dbt handles gold, the end-to-end
              lineage can break at the handoff point. Use Dagster&apos;s
              asset-based model or a catalog tool (DataHub, OpenMetadata)
              to stitch lineage across both layers.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              PySpark Patterns That Complement dbt
            </h2>
            <p>
              When Spark writes data that dbt will consume, use a consistent
              schema and write pattern:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp, lit

spark = SparkSession.builder.getOrCreate()

def write_to_warehouse_silver(df, table_name: str, unique_key: str):
    """
    Standard pattern for Spark -> warehouse writes that dbt will consume.
    Uses MERGE to support dbt incremental models.
    """
    # Add standard metadata columns that dbt expects
    df_with_meta = df.withColumn(
        "_spark_processed_at", current_timestamp()
    ).withColumn(
        "_source_system", lit("spark_pipeline")
    )
    
    # Write to Delta format for ACID support
    df_with_meta.write \
        .format("delta") \
        .mode("overwrite") \
        .option("mergeSchema", "true") \
        .partitionBy("event_date") \
        .save(f"s3://silver/{table_name}/")
    
    # Register in Glue/Hive metastore so dbt can source() it
    spark.sql(f"""
        CREATE TABLE IF NOT EXISTS silver.{table_name}
        USING DELTA
        LOCATION 's3://silver/{table_name}/'
    """)`}</code>
            </pre>
            <p>
              The consistent metadata columns (<code>_spark_processed_at</code>,
              <code>_source_system</code>) make dbt incremental models
              predictable. The Delta format ensures ACID semantics at the
              handoff point. And registering in the metastore means dbt can
              reference the table with a standard <code>source()</code> call.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-steel">
          <p className="text-sm text-mutedGray">Share this post:</p>
          <div className="mt-3 flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              Twitter/X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-steel">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-cyberTeal/20 border border-cyberTeal/40 flex items-center justify-center flex-shrink-0">
              <span className="text-cyberTeal font-bold text-sm">RK</span>
            </div>
            <div>
              <p className="font-semibold text-white">Ryan Kirsch</p>
              <p className="text-sm text-mutedGray mt-1">
                Senior Data Engineer with experience building production
                pipelines at scale. Works with dbt, Snowflake, and Dagster, and
                writes about data engineering patterns from production
                experience.{" "}
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
      </div>
    </main>
  );
}
