import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Apache Airflow in Production: 8 Best Practices From Real Deployments | Ryan Kirsch - Data Engineer",
  description:
    "Eight Apache Airflow best practices from running Airflow in production: DAG design principles, sensors vs operators, retry strategy, monitoring, avoiding common pitfalls, and keeping your scheduler healthy.",
  openGraph: {
    title:
      "Apache Airflow in Production: 8 Best Practices From Real Deployments | Ryan Kirsch - Data Engineer",
    description:
      "Eight Apache Airflow best practices from running Airflow in production: DAG design principles, sensors vs operators, retry strategy, monitoring, avoiding common pitfalls, and keeping your scheduler healthy.",
    type: "article",
    url: "https://ryankirsch.dev/blog/airflow-best-practices-production",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Apache Airflow in Production: 8 Best Practices From Real Deployments | Ryan Kirsch - Data Engineer",
    description:
      "Eight Apache Airflow best practices from running Airflow in production: DAG design principles, sensors vs operators, retry strategy, monitoring, avoiding common pitfalls, and keeping your scheduler healthy.",
  },
  alternates: { canonical: "/blog/airflow-best-practices-production" },
};

export default function AirflowBestPracticesProductionPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/airflow-best-practices-production"
  );
  const postTitle = encodeURIComponent(
    "Apache Airflow in Production: 8 Best Practices From Real Deployments"
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
            {["Apache Airflow", "Workflow Orchestration", "Data Pipelines", "DAGs", "Production", "Data Engineering"].map(
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
            Apache Airflow in Production: 8 Best Practices From Real Deployments
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 10 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Airflow is powerful and notoriously easy to misuse. Teams that treat it as a cron
            replacement with Python scripts bolted on inevitably end up with scheduler performance
            problems, brittle DAGs, and on-call incidents at 2 AM. These eight practices come from
            running Airflow in production environments with hundreds of DAGs and thousands of daily
            task runs.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            1. Keep DAG Files Lightweight
          </h2>
          <p>
            The Airflow scheduler parses every DAG file on a configurable interval (default: every
            30 seconds). Any top-level code in a DAG file runs during every parse cycle. Database
            queries, API calls, file reads, and expensive imports at module level will degrade
            scheduler performance as your DAG count grows.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Bad: database query runs on every scheduler parse
from mymodule import get_table_list  # this queries a DB at import time

table_list = get_table_list()  # runs every 30 seconds

with DAG("process_tables", ...) as dag:
    for table in table_list:
        ...

# Better: use Airflow Variables or a static config file
from airflow.models import Variable
import json

with DAG("process_tables", ...) as dag:
    # Variables are fetched once per DAG run, not per parse
    @dag.task
    def get_tables():
        return json.loads(Variable.get("tables_to_process"))`}
          </pre>
          <p>
            As a rule: no I/O at DAG file level. No database connections. No HTTP calls. No
            expensive computations. Keep DAG files as pure graph definitions.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            2. Use the TaskFlow API for Python Tasks
          </h2>
          <p>
            Airflow 2.x&apos;s TaskFlow API, introduced in Airflow 2.0, makes Python-heavy DAGs
            dramatically cleaner. Decorate Python functions with <code>@task</code> and pass
            return values directly between tasks. XCom push and pull happen automatically. The
            resulting code reads like a normal Python program, not a dependency graph definition.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from airflow.decorators import dag, task
from datetime import datetime

@dag(
    schedule="0 6 * * *",
    start_date=datetime(2025, 1, 1),
    catchup=False,
    tags=["etl", "orders"]
)
def orders_etl():

    @task()
    def extract() -> list[dict]:
        # returns data that flows to next task via XCom
        return fetch_orders_from_api()

    @task()
    def transform(raw_orders: list[dict]) -> list[dict]:
        return [clean_order(o) for o in raw_orders]

    @task()
    def load(clean_orders: list[dict]) -> int:
        return write_to_warehouse(clean_orders)

    raw = extract()
    cleaned = transform(raw)
    load(cleaned)

dag_instance = orders_etl()`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            3. Choose Sensors Carefully
          </h2>
          <p>
            Sensors poll for a condition (file exists, partition is ready, S3 key present) and
            block until it is true. The pitfall: sensors hold a worker slot while they wait.
            In a busy environment with many concurrent sensors, this exhausts your worker pool
            and blocks actual work from running.
          </p>
          <p>
            Use <code>mode=&quot;reschedule&quot;</code> for sensors that may wait for a long time. In
            reschedule mode, the sensor releases its worker slot between polling attempts and
            only occupies a slot while actively running the check.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from airflow.sensors.s3_key_sensor import S3KeySensor
from airflow.sensors.external_task import ExternalTaskSensor

# Good: reschedule mode releases the worker between polls
wait_for_file = S3KeySensor(
    task_id="wait_for_input_file",
    bucket_name="my-data-bucket",
    bucket_key="input/{{ ds }}/data.parquet",
    aws_conn_id="aws_default",
    mode="reschedule",          # release slot between checks
    poke_interval=300,          # check every 5 minutes
    timeout=3600 * 6,           # fail after 6 hours
    dag=dag,
)

# For cross-DAG dependencies, use ExternalTaskSensor
wait_for_upstream = ExternalTaskSensor(
    task_id="wait_for_upstream_dag",
    external_dag_id="upstream_pipeline",
    external_task_id="final_task",
    mode="reschedule",
    timeout=3600 * 4,
    dag=dag,
)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            4. Configure Retries and Timeouts Explicitly
          </h2>
          <p>
            The default retry behavior in Airflow is zero retries. For production pipelines
            that hit external APIs, databases, or cloud services, this is too fragile.
            Set retries at the DAG level as a default, and override at the task level for
            tasks that should fail fast or that have specific backoff requirements.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from datetime import timedelta
from airflow import DAG
from airflow.utils.dates import days_ago

default_args = {
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "max_retry_delay": timedelta(minutes=30),
    "execution_timeout": timedelta(hours=2),
    "email_on_failure": True,
    "email": ["data-eng-alerts@company.com"],
}

with DAG(
    "production_pipeline",
    default_args=default_args,
    schedule="@daily",
    start_date=days_ago(1),
    catchup=False,
) as dag:
    ...`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            5. Avoid Dynamic DAG Generation at Scale
          </h2>
          <p>
            Generating DAGs dynamically from a database query or config file is tempting for
            multi-tenant pipelines. The problem: Airflow serializes the full DAG structure to
            the metadata database on every parse. Ten thousand dynamically generated tasks across
            fifty DAGs will make your metadata DB unhappy and your scheduler slow.
          </p>
          <p>
            Instead, use dynamic task mapping (Airflow 2.3+) to generate tasks at runtime based
            on data, without creating heavyweight DAG structures at parse time.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from airflow.decorators import dag, task

@dag(schedule="@daily", start_date=datetime(2025, 1, 1), catchup=False)
def dynamic_table_pipeline():

    @task()
    def get_tables() -> list[str]:
        # Fetch list at runtime, not at parse time
        return ["orders", "customers", "products", "events"]

    @task()
    def process_table(table_name: str) -> str:
        run_dbt_model(table_name)
        return f"processed:{table_name}"

    tables = get_tables()
    # Dynamic task mapping: one task instance per table, resolved at runtime
    process_table.expand(table_name=tables)

dag_instance = dynamic_table_pipeline()`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            6. Use Pools to Control Resource Contention
          </h2>
          <p>
            Airflow Pools limit concurrent task execution across specific resources.
            If you have ten DAGs that all query the same database, running all their tasks
            concurrently will overwhelm the database connection limit. Define a Pool for
            that database and assign tasks to it. Airflow will queue tasks that exceed the
            pool&apos;s slot limit.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Define pools in Admin > Pools UI, or via CLI:
# airflow pools set snowflake_pool 10 "Limit concurrent Snowflake queries"

# Assign tasks to the pool
run_query = SnowflakeOperator(
    task_id="run_heavy_query",
    sql="call analytics.refresh_summary()",
    snowflake_conn_id="snowflake_prod",
    pool="snowflake_pool",    # limited to 10 concurrent across all DAGs
    pool_slots=2,             # this task consumes 2 slots (heavy query)
    dag=dag,
)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            7. Monitor the Scheduler, Not Just Tasks
          </h2>
          <p>
            Most Airflow alerting focuses on task failures. The scheduler is often unmonitored
            until it silently falls behind. Key metrics to track: scheduler heartbeat lag,
            DAG parse duration, task queued duration (time between scheduled and started),
            and zombie task count. A scheduler that is parsing DAGs slowly will delay task
            scheduling, and that delay may not surface as a visible failure until SLAs are missed.
          </p>
          <p>
            Export Airflow metrics to StatsD or the built-in OpenTelemetry integration. Set an
            alert on <code>scheduler_heartbeat</code> and on <code>dag_processing.total_parse_time</code>.
            If parse time trends upward, you have a DAG file quality problem.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            8. Set catchup=False and Use Data Intervals Deliberately
          </h2>
          <p>
            <code>catchup=True</code> is the Airflow default and the source of many production
            incidents. When a DAG is unpaused or created with a historical <code>start_date</code>,
            Airflow will try to backfill every missed run back to that date. In a production
            environment, this can queue hundreds of runs simultaneously and overwhelm your workers
            and downstream systems.
          </p>
          <p>
            Set <code>catchup=False</code> as the default for all production DAGs. Trigger
            explicit backfills via the CLI when needed and under controlled conditions.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`with DAG(
    "production_pipeline",
    schedule="@daily",
    start_date=datetime(2025, 1, 1),
    catchup=False,               # CRITICAL: prevent backfill storms
    max_active_runs=1,           # prevent concurrent runs of the same DAG
    max_active_tasks=5,          # limit parallelism within this DAG
) as dag:
    ...

# Explicit backfill when you need it:
# airflow dags backfill production_pipeline \\
#   --start-date 2025-12-01 \\
#   --end-date 2025-12-31 \\
#   --max-active-runs 3`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Pattern That Ties It Together
          </h2>
          <p>
            Airflow is an orchestrator, not an executor. Its job is to schedule, monitor, and
            retry tasks. The actual work should happen in external systems: Spark clusters,
            Snowflake, dbt, or purpose-built compute. Keep your tasks thin: they should trigger
            external work and check its status, not perform heavy computation inline in a Python
            operator. This pattern scales well, fails gracefully, and keeps your Airflow workers
            available for scheduling work rather than tied up running data transformations.
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
