import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Apache Airflow in Production: Lessons from Running It at Scale | Ryan Kirsch",
  description:
    "Hard-won lessons from running Apache Airflow in production. DAG design patterns that prevent scheduler bottlenecks, the operator choices that matter, handling failures gracefully, and when Airflow is the wrong tool.",
  openGraph: {
    title:
      "Apache Airflow in Production: Lessons from Running It at Scale",
    description:
      "Hard-won lessons from running Apache Airflow in production. DAG design, scheduler bottlenecks, operator choices, failure handling, and when Airflow is the wrong tool.",
    type: "article",
    url: "https://ryankirsch.dev/blog/apache-airflow-production-lessons",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Apache Airflow in Production: Lessons from Running It at Scale",
    description:
      "Hard-won lessons from running Apache Airflow in production. DAG design, scheduler bottlenecks, operator choices, failure handling, and when Airflow is the wrong tool.",
  },
  alternates: { canonical: "/blog/apache-airflow-production-lessons" },
};

export default function AirflowProductionPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/apache-airflow-production-lessons"
  );
  const postTitle = encodeURIComponent(
    "Apache Airflow in Production: Lessons from Running It at Scale"
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
            Apache Airflow in Production: Lessons from Running It at Scale
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 12, 2025 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Airflow is the most widely deployed data orchestrator in the world.
            It is also one of the most commonly misused. The Airflow
            documentation tells you how to write a DAG. It does not tell you
            why your DAGs are making the scheduler crawl, why your tasks keep
            zombie-ing, or what the right retry configuration is for a
            production pipeline that runs at 6 AM when someone has a board
            meeting at 8.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Scheduler Is a Single Thread
            </h2>
            <p>
              Everything about Airflow DAG design flows from one constraint:
              the scheduler is fundamentally serial. It scans all active DAGs,
              evaluates dependencies, and queues tasks in a single loop. When
              this loop takes too long, tasks queue but do not start, and the
              UI shows a growing backlog with no errors.
            </p>
            <p>
              The scheduler loop slows down primarily because of DAG complexity.
              Every imported library, every database call in DAG-level code,
              and every dynamically generated task adds time to the scan.
              The rule: DAG files should be fast to parse and should do zero
              I/O at import time.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# BAD: database call at DAG-level (runs every scheduler scan)
from mydb import get_table_list

tables = get_table_list()  # This runs every time the file is parsed

with DAG("process_tables") as dag:
    for table in tables:
        PythonOperator(task_id=f"process_{table}", ...)

# GOOD: defer expensive operations into task execution
with DAG("process_tables") as dag:
    tables_task = PythonOperator(
        task_id="get_tables",
        python_callable=get_table_list,
    )
    # Use dynamic task mapping (Airflow 2.3+) or XCom for downstream tasks`}</code>
            </pre>
            <p>
              Beyond import-time code, keep your DAG count manageable. More
              than 200-300 active DAGs on a single Airflow deployment starts
              to create scheduler pressure. If you have hundreds of similar
              DAGs (one per table, one per customer), consider consolidating
              into a parameterized DAG with dynamic task mapping rather than
              separate DAG files.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Operator Selection: The Choice That Determines Reliability
            </h2>
            <p>
              Most Airflow operators fall into two categories: those that run
              code in the worker process, and those that submit work to an
              external system and wait. The second category is far more
              reliable in production.
            </p>
            <p>
              <strong>PythonOperator</strong> runs code directly in the Airflow
              worker. This means the worker must have all dependencies installed,
              the task holds a worker slot for its entire duration, and a
              worker crash means the task is lost. It is the right choice for
              lightweight, fast operations (triggering APIs, checking conditions,
              transforming small data).
            </p>
            <p>
              <strong>KubernetesPodOperator</strong> submits a pod to Kubernetes
              and waits for completion. Each task gets its own isolated
              environment with its own dependencies. The worker releases its
              slot after submitting the pod. This is the right choice for
              heavy computation, ML training, or anything with significant
              dependencies.
            </p>
            <p>
              <strong>SnowflakeOperator, BigQueryInsertJobOperator</strong> --
              these submit SQL to the warehouse and poll for completion. The
              worker holds minimal resources while the warehouse does the work.
              Right choice for all warehouse-side transformations.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from airflow.providers.snowflake.operators.snowflake import SnowflakeOperator
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator

# Warehouse SQL: submit and poll, worker barely used
transform_task = SnowflakeOperator(
    task_id="transform_silver_orders",
    sql="""
        CREATE OR REPLACE TABLE silver.orders AS
        SELECT order_id, customer_id, amount_cents / 100.0 AS amount_usd
        FROM bronze.raw_orders
        WHERE order_id IS NOT NULL
    """,
    snowflake_conn_id="snowflake_default",
)

# Heavy Python: isolated container, no dependency conflicts
ml_task = KubernetesPodOperator(
    task_id="train_churn_model",
    image="myrepo/ml-trainer:v2.1",
    cmds=["python", "train.py"],
    arguments=["--date", "{{ ds }}"],
    namespace="airflow",
    get_logs=True,
    is_delete_operator_pod=True,
)`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Retry Configuration That Actually Works
            </h2>
            <p>
              Default Airflow retry behavior is too aggressive for data
              pipelines. Three immediate retries on a task that failed because
              a source API is down will fail three more times before you even
              get an alert, and they will consume worker slots doing so.
            </p>
            <p>
              The retry configuration I use for production ETL tasks:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from datetime import timedelta
from airflow.models import DAG
from airflow.operators.python import PythonOperator

default_args = {
    "owner": "data-platform",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,  # 5min, 10min (doubles each time)
    "max_retry_delay": timedelta(minutes=30),
    "email_on_failure": True,
    "email_on_retry": False,  # Don't spam on retries, only final failure
}

with DAG(
    "daily_etl",
    default_args=default_args,
    schedule="0 5 * * *",  # 5 AM
    catchup=False,          # NEVER enable catchup for ETL dags
    max_active_runs=1,      # Prevent concurrent runs of the same dag
) as dag:
    ...`}</code>
            </pre>
            <p>
              The two settings that prevent the most production pain:
            </p>
            <p>
              <strong>catchup=False</strong> is mandatory for ETL DAGs.
              With catchup enabled, if you deploy a DAG that was paused for
              two weeks, Airflow will attempt to run every daily interval
              for those two weeks at once, overwhelming your workers and
              potentially re-running pipelines on stale data. Always disable
              catchup unless you explicitly need historical backfill.
            </p>
            <p>
              <strong>max_active_runs=1</strong> prevents multiple concurrent
              runs of the same DAG. Without this, a slow DAG run can stack
              up with the next scheduled run, and you end up with two
              concurrent ETL jobs writing to the same destination table.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Handling Failures: The Alerting Hierarchy
            </h2>
            <p>
              Airflow&apos;s built-in email alerting is coarse. Task failure, task
              retry, DAG failure -- all can generate email notifications, and
              most teams either turn them all on (alert fatigue) or turn them
              all off (silent failures). The right answer is a tiered approach:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from airflow.models import DAG
from airflow.utils.email import send_email

def on_failure_callback(context):
    """Alert Slack on task failure, email on DAG failure."""
    dag_id = context['dag'].dag_id
    task_id = context['task_instance'].task_id
    exec_date = context['execution_date']
    log_url = context['task_instance'].log_url
    
    # Slack for immediate visibility (task-level)
    slack_message = (
        f":red_circle: *Task Failed*\n"
        f"DAG: {dag_id} | Task: {task_id}\n"
        f"Date: {exec_date}\n"
        f"<{log_url}|View Logs>"
    )
    send_slack_alert(slack_message)

def on_dag_failure_callback(context):
    """Email the data team when a full DAG fails."""
    dag_id = context['dag'].dag_id
    exec_date = context['execution_date']
    
    send_email(
        to=["data-platform@company.com"],
        subject=f"[AIRFLOW] DAG Failed: {dag_id}",
        html_content=f"<p>DAG <b>{dag_id}</b> failed at {exec_date}.</p>",
    )

default_args = {
    "on_failure_callback": on_failure_callback,
}

with DAG(
    "critical_etl",
    on_failure_callback=on_dag_failure_callback,
    default_args=default_args,
) as dag:
    ...`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              XCom: Use It Sparingly
            </h2>
            <p>
              XCom (cross-communication) lets tasks pass values to downstream
              tasks. It is stored in the Airflow metadata database, which is
              where most teams run into trouble. Storing large data (DataFrames,
              query results, file contents) in XCom bloats the metadata
              database and slows down the scheduler.
            </p>
            <p>
              XCom is designed for small values: counts, status codes, file
              paths, configuration parameters. If you need to pass large data
              between tasks, write it to object storage (S3, GCS) and pass
              the path via XCom:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# BAD: pushing a large DataFrame via XCom
def extract(**context):
    df = fetch_million_rows()
    context['ti'].xcom_push(key='data', value=df.to_json())  # Kills metadata DB

# GOOD: write to S3, pass the path
def extract(**context):
    df = fetch_million_rows()
    path = f"s3://my-bucket/tmp/{context['ds']}/extract.parquet"
    df.to_parquet(path)
    context['ti'].xcom_push(key='extract_path', value=path)

def transform(**context):
    path = context['ti'].xcom_pull(key='extract_path', task_ids='extract')
    df = pd.read_parquet(path)
    # ... transform ...`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Connection and Variable Management
            </h2>
            <p>
              Airflow Connections and Variables are stored in the metadata
              database by default, which means they are visible to anyone
              with database access. For production, use a secrets backend:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# airflow.cfg or environment variable
# Route secrets to AWS Secrets Manager
AIRFLOW__SECRETS__BACKEND=airflow.providers.amazon.aws.secrets.secrets_manager.SecretsManagerBackend
AIRFLOW__SECRETS__BACKEND_KWARGS='{"connections_prefix": "airflow/connections", "variables_prefix": "airflow/variables"}'

# Or HashiCorp Vault
AIRFLOW__SECRETS__BACKEND=airflow.providers.hashicorp.secrets.vault.VaultBackend
AIRFLOW__SECRETS__BACKEND_KWARGS='{"connections_path": "connections", "variables_path": "variables", "mount_point": "airflow"}'`}</code>
            </pre>
            <p>
              With a secrets backend configured, Airflow fetches credentials
              at task execution time rather than storing them in the metadata
              database. Rotation is handled in the secrets manager without
              touching Airflow configuration.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When Airflow Is the Wrong Tool
            </h2>
            <p>
              Airflow excels at scheduling and dependency management for
              batch workflows. It is the wrong tool for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Real-time or near-real-time processing.</strong>{" "}
                Airflow&apos;s minimum scheduling granularity is effectively
                minutes. Sub-minute workflows belong in Kafka, Flink,
                or a dedicated streaming system.
              </li>
              <li>
                <strong>Long-running tasks with external progress.</strong>{" "}
                A 12-hour Spark job should be submitted to Spark and monitored
                externally. Running it directly in an Airflow task ties up
                a worker slot for 12 hours.
              </li>
              <li>
                <strong>Asset-oriented thinking.</strong> If you care more
                about &ldquo;is my customers table fresh?&rdquo; than &ldquo;did my DAG run
                successfully?&rdquo;, Dagster&apos;s asset model serves that mental model
                better. Airflow is task-centric; the data asset is implicit.
              </li>
              <li>
                <strong>Teams starting from scratch with modern tooling.</strong>{" "}
                Airflow&apos;s operational overhead (metadata database, scheduler,
                workers, web server, all require separate management) is
                significant. For greenfield deployments, Dagster or Prefect
                offer better developer experience with lower operational
                complexity.
              </li>
            </ul>
            <p>
              Airflow is an excellent tool when you know what it is good at
              and design your DAGs accordingly. The teams that struggle with
              it are usually the ones who discovered its constraints after
              building on top of it for two years.
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
