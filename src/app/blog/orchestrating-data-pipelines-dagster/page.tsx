import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Orchestrating Data Pipelines with Dagster: A Production Guide | Ryan Kirsch",
  description:
    "A practical guide to Dagster for data pipeline orchestration: software-defined assets, schedules, sensors, partitions, resource management, and how Dagster compares to Airflow for modern data teams.",
  openGraph: {
    title: "Orchestrating Data Pipelines with Dagster: A Production Guide",
    description:
      "A practical guide to Dagster for data pipeline orchestration: software-defined assets, schedules, sensors, partitions, resource management, and how Dagster compares to Airflow for modern data teams.",
    type: "article",
    url: "https://ryankirsch.dev/blog/orchestrating-data-pipelines-dagster",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchestrating Data Pipelines with Dagster: A Production Guide",
    description:
      "A practical guide to Dagster for data pipeline orchestration: software-defined assets, schedules, sensors, partitions, resource management, and how Dagster compares to Airflow for modern data teams.",
  },
  alternates: { canonical: "/blog/orchestrating-data-pipelines-dagster" },
};

export default function DagsterOrchestrationPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/orchestrating-data-pipelines-dagster"
  );
  const postTitle = encodeURIComponent(
    "Orchestrating Data Pipelines with Dagster: A Production Guide"
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
              Orchestration
            </span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Orchestrating Data Pipelines with Dagster: A Production Guide
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Dagster takes a different approach to orchestration than Airflow: assets first, not tasks. Here is what that means in practice and how to build pipelines that are observable, testable, and maintainable.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Dagster has matured into a serious production orchestration platform over the last few years. The core insight that distinguishes it from Airflow is the asset-centric model: instead of defining tasks and dependencies between tasks, you define the data assets you want to produce and let Dagster figure out what needs to run to materialize them. This is a meaningful shift, not just a syntax difference.
          </p>
          <p>
            This guide covers Dagster concepts that matter for production use: software-defined assets, schedules and sensors, partitioning, resource management, and a realistic comparison with Airflow to help you decide when Dagster is the right choice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Software-Defined Assets: The Core Concept
          </h2>
          <p>
            A software-defined asset (SDA) is a Python function decorated with <code>@asset</code> that produces a data artifact: a table, a file, a model, or anything else that can be stored and referenced downstream. The key difference from an Airflow task is that the asset is named after what it produces, not what it does.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset, AssetIn
import pandas as pd

@asset
def raw_orders(context) -> pd.DataFrame:
    """Raw orders from the source database."""
    # Could be a database read, S3 read, API call, etc.
    df = pd.read_sql("SELECT * FROM orders", con=get_db_connection())
    context.log.info(f"Loaded {len(df)} orders")
    return df

@asset
def cleaned_orders(raw_orders: pd.DataFrame) -> pd.DataFrame:
    """Orders with nulls removed and types cast."""
    return (
        raw_orders
        .dropna(subset=["order_id", "customer_id", "amount"])
        .assign(
            amount=lambda df: df["amount"].astype(float),
            order_date=lambda df: pd.to_datetime(df["order_date"])
        )
    )

@asset
def daily_revenue(cleaned_orders: pd.DataFrame) -> pd.DataFrame:
    """Daily revenue aggregated from cleaned orders."""
    return (
        cleaned_orders
        .groupby(cleaned_orders["order_date"].dt.date)
        .agg(revenue=("amount", "sum"), order_count=("order_id", "count"))
        .reset_index()
    )`}
          </pre>
          <p>
            Dagster infers the dependency graph from the function signatures. <code>cleaned_orders</code> depends on <code>raw_orders</code> because it takes <code>raw_orders</code> as an argument. This makes dependencies explicit in the code rather than requiring separate graph construction as Airflow does.
          </p>
          <p>
            The asset graph is visible in the Dagster UI, where you can see which assets are up to date, which need to be materialized, and the full lineage from source to output. This observability is one of Dagster&apos;s strongest production features.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Resources: Managing Connections and Configuration
          </h2>
          <p>
            Resources in Dagster are shared, configurable objects: database connections, API clients, cloud storage handles. They are injected into assets via function arguments and configured at the job or deployment level rather than hardcoded in the asset logic.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset, resource, ResourceDefinition
from sqlalchemy import create_engine

class PostgresResource:
    def __init__(self, connection_string: str):
        self.engine = create_engine(connection_string)
    
    def read_table(self, table: str) -> pd.DataFrame:
        return pd.read_sql(f"SELECT * FROM {table}", self.engine)
    
    def write_table(self, df: pd.DataFrame, table: str, if_exists: str = "replace"):
        df.to_sql(table, self.engine, if_exists=if_exists, index=False)

@asset(required_resource_keys={"postgres"})
def raw_orders(context) -> pd.DataFrame:
    return context.resources.postgres.read_table("orders")

# Configure resources per environment
resources = {
    "prod": {"postgres": PostgresResource(os.environ["PROD_DB_URL"])},
    "dev": {"postgres": PostgresResource(os.environ["DEV_DB_URL"])},
}`}
          </pre>
          <p>
            This pattern makes testing straightforward: you can inject a mock resource in tests without modifying the asset logic. It also makes environment promotion clean, since the same asset code runs against dev and prod databases via different resource configurations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Schedules and Sensors
          </h2>
          <p>
            Schedules trigger jobs on a cron-based schedule. A job is a selection of assets to materialize together.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import define_asset_job, ScheduleDefinition, AssetSelection

# Define a job that materializes the full pipeline
daily_pipeline_job = define_asset_job(
    name="daily_pipeline",
    selection=AssetSelection.all()
)

# Schedule it to run at 6 AM UTC daily
daily_schedule = ScheduleDefinition(
    job=daily_pipeline_job,
    cron_schedule="0 6 * * *",
)`}
          </pre>
          <p>
            Sensors are more powerful: they trigger runs based on external events rather than a fixed schedule. A common pattern is triggering a pipeline when a new file lands in S3.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import sensor, RunRequest, SensorEvaluationContext
import boto3

@sensor(job=daily_pipeline_job)
def s3_arrival_sensor(context: SensorEvaluationContext):
    """Trigger pipeline when a new file lands in the landing zone."""
    s3 = boto3.client("s3")
    bucket = "my-data-bucket"
    prefix = "landing/"
    
    # Check for files newer than last sensor run
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    
    new_files = [
        obj for obj in response.get("Contents", [])
        if obj["LastModified"].timestamp() > (context.last_run_key or 0)
    ]
    
    if new_files:
        latest = max(new_files, key=lambda x: x["LastModified"])
        yield RunRequest(
            run_key=str(latest["LastModified"].timestamp()),
            run_config={"ops": {"raw_orders": {"config": {"s3_key": latest["Key"]}}}}
        )`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Partitioning for Incremental Processing
          </h2>
          <p>
            Dagster has first-class support for partitioned assets, which maps naturally to incremental data processing. You define a partition definition (daily, monthly, or custom) and Dagster tracks which partitions have been materialized.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset, DailyPartitionsDefinition
from datetime import datetime

daily_partitions = DailyPartitionsDefinition(start_date="2026-01-01")

@asset(partitions_def=daily_partitions)
def daily_orders(context) -> pd.DataFrame:
    partition_date = context.asset_partition_key_for_output()
    context.log.info(f"Processing partition: {partition_date}")
    
    df = pd.read_sql(
        "SELECT * FROM orders WHERE DATE(order_date) = %(date)s",
        params={"date": partition_date},
        con=get_db_connection()
    )
    return df

@asset(partitions_def=daily_partitions)
def daily_revenue_partitioned(daily_orders: pd.DataFrame) -> pd.DataFrame:
    return daily_orders.groupby("customer_id").agg(
        daily_spend=("amount", "sum")
    ).reset_index()`}
          </pre>
          <p>
            With partitioned assets, you can backfill historical data by running specific partition ranges, check which partitions are stale, and trigger only the partitions that need refreshing. The Dagster UI shows a partition status grid where you can see at a glance which dates are materialized, which are missing, and which failed.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Asset Checks for Data Quality
          </h2>
          <p>
            Asset checks are validations that run after an asset is materialized. They produce a pass/fail result that shows up in the Dagster UI and can block downstream materializations.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset_check, AssetCheckResult, AssetCheckSeverity

@asset_check(asset=daily_orders)
def orders_not_empty(daily_orders: pd.DataFrame) -> AssetCheckResult:
    row_count = len(daily_orders)
    return AssetCheckResult(
        passed=row_count > 0,
        metadata={"row_count": row_count},
        severity=AssetCheckSeverity.ERROR
    )

@asset_check(asset=daily_orders)
def no_negative_amounts(daily_orders: pd.DataFrame) -> AssetCheckResult:
    negative_count = (daily_orders["amount"] < 0).sum()
    return AssetCheckResult(
        passed=negative_count == 0,
        metadata={"negative_count": int(negative_count)},
        severity=AssetCheckSeverity.WARN
    )`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Dagster vs. Airflow: When to Choose Each
          </h2>
          <p>
            Airflow has a larger ecosystem, more community plugins, and is installed at more companies. If you are joining a team that already runs Airflow, you will use Airflow. The choice matters most when you are building something new.
          </p>
          <p>
            Choose Dagster when: you are building a modern data platform from scratch, your team values observability and testability, you work heavily with dbt (the Dagster-dbt integration is excellent), or you want asset-level tracking rather than task-level tracking. The local development experience with Dagster is also noticeably better: you can run the full UI locally, inspect assets, and trigger runs without a complex setup.
          </p>
          <p>
            Choose Airflow when: your organization has existing Airflow infrastructure and expertise, you need specific Airflow providers that have no Dagster equivalent, your pipelines are task-oriented rather than asset-oriented, or you need to integrate with a managed service like MWAA or Cloud Composer that your company already pays for.
          </p>
          <p>
            The honest comparison: Dagster&apos;s abstractions are more aligned with how data engineers actually think about their work. The asset model maps to tables and files rather than arbitrary task steps. The testing story is better. The UI is more useful for debugging. The tradeoff is a smaller ecosystem and a steeper initial learning curve for engineers coming from Airflow.
          </p>
          <p>
            Both tools are viable for production. The choice is less about which is objectively better and more about which fits your team&apos;s context. If you have the opportunity to choose, Dagster is worth the investment. The observability and testability payoffs compound over time as your pipeline grows.
          </p>
        </div>

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

        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
