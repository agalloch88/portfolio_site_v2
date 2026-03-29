import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Pipeline Monitoring and Observability: What Senior DEs Actually Do | Ryan Kirsch",
  description:
    "Beyond basic alerting: circuit breakers, data quality gates with Great Expectations and dbt tests, lineage tracking, incident runbooks, and what senior DE interviewers actually want to hear about observability.",
  openGraph: {
    title:
      "Data Pipeline Monitoring and Observability: What Senior DEs Actually Do",
    description:
      "Beyond basic alerting: circuit breakers, data quality gates, lineage tracking, incident runbooks, and what senior DE interviewers want to hear about observability.",
    type: "article",
    url: "https://ryankirsch.dev/data-pipeline-monitoring-observability",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Pipeline Monitoring and Observability: What Senior DEs Actually Do",
    description:
      "Beyond basic alerting: circuit breakers, data quality gates, lineage tracking, incident runbooks, and what senior DE interviewers want to hear about observability.",
  },
  alternates: { canonical: "/data-pipeline-monitoring-observability" },
};

export default function PipelineMonitoringPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/data-pipeline-monitoring-observability"
  );
  const postTitle = encodeURIComponent(
    "Data Pipeline Monitoring and Observability: What Senior DEs Actually Do"
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
            Data Pipeline Monitoring and Observability: What Senior DEs Actually Do
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 29, 2026 ·{" "}
            <span className="text-cyberTeal">11 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Junior data engineers monitor pipelines by checking whether they
            ran. Senior data engineers monitor whether the data is correct.
            That distinction, between pipeline health and data health, is the
            core of what observability means in data engineering, and it is
            where most interview conversations separate strong candidates
            from average ones.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Gap Between Alerting and Observability
            </h2>
            <p>
              Basic alerting tells you a task failed. This is necessary but
              not sufficient. A pipeline can complete successfully and produce
              completely wrong data. Row counts can look normal while a schema
              change upstream silently nulls out a critical column. A join
              can fan out unexpectedly and multiply your revenue numbers by 3x.
              These failures are silent at the orchestration layer.
            </p>
            <p>
              True observability gives you three capabilities that alerting
              alone does not: the ability to detect data quality degradation
              before downstream consumers notice, the ability to trace a bad
              number back to its source, and the ability to answer
              &ldquo;when did this break and why&rdquo; without hours of manual investigation.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Circuit Breakers: Stop Propagating Bad Data
            </h2>
            <p>
              A circuit breaker in data pipelines is a gate that halts
              downstream processing when upstream data fails a quality check.
              The concept is borrowed from electrical engineering and
              distributed systems: when something is wrong, stop the spread.
            </p>
            <p>
              Without circuit breakers, a bad upstream table propagates its
              corruption to every downstream model, every report, and every
              dashboard that depends on it before anyone notices. With
              circuit breakers, the pipeline fails loudly at the source
              and downstream tables are simply not updated rather than
              updated with bad data.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Circuit breaker pattern in Python/Airflow
from airflow.operators.python import PythonOperator
from airflow.exceptions import AirflowFailException

def check_source_quality(**context):
    """Gate: fail fast if source data quality is unacceptable."""
    import snowflake.connector
    
    conn = snowflake.connector.connect(**get_snowflake_creds())
    cursor = conn.cursor()
    
    # Check 1: Row count within expected range (20% tolerance)
    cursor.execute("""
        SELECT COUNT(*) FROM raw.orders
        WHERE created_at::DATE = CURRENT_DATE - 1
    """)
    row_count = cursor.fetchone()[0]
    
    if row_count < 5000:
        raise AirflowFailException(
            f"Circuit breaker: orders count {row_count} below threshold 5000. "
            "Halting pipeline to prevent propagation of incomplete data."
        )
    
    # Check 2: No nulls in critical columns
    cursor.execute("""
        SELECT COUNT(*) FROM raw.orders
        WHERE created_at::DATE = CURRENT_DATE - 1
          AND (order_id IS NULL OR customer_id IS NULL OR amount_cents IS NULL)
    """)
    null_count = cursor.fetchone()[0]
    
    if null_count > 0:
        raise AirflowFailException(
            f"Circuit breaker: {null_count} rows with null critical fields. "
            "Investigate source extraction before proceeding."
        )
    
    print(f"Quality gate passed: {row_count} rows, 0 nulls in critical fields.")

quality_gate = PythonOperator(
    task_id="source_quality_gate",
    python_callable=check_source_quality,
)

# transform_task only runs if quality_gate passes
quality_gate >> transform_task`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Data Quality Gates with dbt Tests
            </h2>
            <p>
              dbt tests are the most ergonomic way to codify data quality
              expectations in a warehouse-first stack. The built-in generic
              tests cover the basics. The real power comes from singular tests
              and custom generic tests for business logic validation.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/staging/stg_orders.yml
version: 2

models:
  - name: stg_orders
    description: Cleaned orders from raw source
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('stg_customers')
              field: customer_id
      - name: amount_usd
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 100000
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'completed', 'cancelled', 'refunded']

    # Table-level test: row count should be within 20% of yesterday
    tests:
      - dbt_utils.recency:
          datepart: hour
          field: created_at
          interval: 25  # Fail if no orders in last 25 hours`}</code>
            </pre>
            <p>
              Run tests in your CI/CD pipeline and as a post-run step in
              production. In Airflow, this looks like:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from airflow.operators.bash import BashOperator

run_dbt_models = BashOperator(
    task_id="run_dbt_models",
    bash_command="dbt run --select staging --target prod",
)

run_dbt_tests = BashOperator(
    task_id="run_dbt_tests",
    # --store-failures writes failures to a table for investigation
    bash_command="dbt test --select staging --target prod --store-failures",
)

load_to_marts = BashOperator(
    task_id="load_to_marts",
    bash_command="dbt run --select marts --target prod",
)

# Tests act as a quality gate between staging and marts
run_dbt_models >> run_dbt_tests >> load_to_marts`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Data Quality Tooling: Build vs Buy
            </h2>
            <p>
              The commercial data observability space has matured quickly.
              The main options and their appropriate use cases:
            </p>
            <p>
              <strong>Monte Carlo</strong> is the market leader for large
              enterprises. Its automated anomaly detection learns baseline
              distributions for your tables (row counts, freshness, field
              distributions) and alerts when metrics deviate without requiring
              you to write every check manually. Appropriate for teams with
              hundreds of tables and budget for a $50K+/year tool.
            </p>
            <p>
              <strong>Bigeye</strong> offers similar automated ML-based
              monitoring with a stronger focus on metric tracking and SLA
              management. Better fit for data teams where business metrics
              observability (not just pipeline health) is the primary concern.
            </p>
            <p>
              <strong>Elementary (open source)</strong> integrates directly
              with dbt and adds anomaly detection, test result history, and
              a monitoring UI on top of your existing dbt tests. The right
              starting point for dbt-native shops that want observability
              without a new vendor contract.
            </p>
            <p>
              <strong>Custom Great Expectations pipelines</strong> are the
              right choice when you have complex domain-specific validations
              that no off-the-shelf tool handles, or when you need tight
              integration with a non-standard stack. The maintenance cost
              is real: plan for ongoing updates as your schema evolves.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lineage Tracking: Where Did That Number Come From
            </h2>
            <p>
              Data lineage is the ability to trace a value in a dashboard
              back through every transformation to its origin. Without it,
              a data quality incident can take hours to diagnose. With it,
              you can answer &ldquo;why is revenue wrong today&rdquo; in minutes.
            </p>
            <p>
              dbt generates lineage automatically as a DAG of model
              dependencies. Expose this in your data catalog (Atlan, DataHub,
              or dbt&apos;s own docs site) so analysts and engineers can trace
              dependencies without reading SQL. For cross-system lineage
              (Airflow jobs that feed dbt models that feed Looker dashboards),
              OpenLineage is the emerging standard:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Emit OpenLineage events from Airflow tasks
# Install: pip install openlineage-airflow
# Configure in airflow.cfg:
# [openlineage]
# transport = {"type": "http", "url": "https://your-marquez-server"}

# OpenLineage auto-instruments standard operators (PythonOperator,
# SnowflakeOperator, BigQueryInsertJobOperator) via the Airflow plugin.
# For custom operators, emit manually:

from openlineage.client import OpenLineageClient
from openlineage.client.run import RunEvent, RunState, Job, Run, Dataset

def custom_transform(**context):
    client = OpenLineageClient.from_environment()
    
    # Emit START event
    client.emit(RunEvent(
        eventType=RunState.START,
        eventTime=context['ts'],
        run=Run(runId=str(context['run_id'])),
        job=Job(namespace="my-pipeline", name="custom_transform"),
        inputs=[Dataset(namespace="snowflake", name="raw.orders")],
        outputs=[Dataset(namespace="snowflake", name="silver.orders")],
    ))
    
    # ... do the transformation ...
    
    # Emit COMPLETE event
    client.emit(RunEvent(
        eventType=RunState.COMPLETE,
        # ... same fields ...
    ))`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Incident Runbooks: The Difference Between 15 Minutes and 4 Hours
            </h2>
            <p>
              A runbook is a documented procedure for diagnosing and resolving
              a class of incidents. Data teams that maintain runbooks resolve
              incidents faster and with less senior engineer involvement than
              teams that rely on tribal knowledge.
            </p>
            <p>
              A minimal runbook for a daily ETL failure looks like this:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Symptom:</strong> Daily ETL DAG failed or downstream
                dashboard shows stale data
              </li>
              <li>
                <strong>Step 1:</strong> Check Airflow logs for the failed task.
                Note the error message and execution date.
              </li>
              <li>
                <strong>Step 2:</strong> Check source system availability.
                Run the source row count query (linked). If count is zero
                or below threshold, escalate to the source team.
              </li>
              <li>
                <strong>Step 3:</strong> Check for schema changes in the
                source. Run the schema drift query (linked). If columns
                were added or removed, update the dbt model and redeploy.
              </li>
              <li>
                <strong>Step 4:</strong> If source is healthy and schema
                is unchanged, check for warehouse quota or concurrency
                issues. Review the query history in Snowflake/BigQuery.
              </li>
              <li>
                <strong>Step 5:</strong> Once root cause is resolved, clear
                the failed task in Airflow and trigger a manual run.
                Verify downstream tables update correctly.
              </li>
              <li>
                <strong>Step 6:</strong> Write a 3-sentence post-mortem in
                the incident log: what failed, why, and what changed to
                prevent recurrence.
              </li>
            </ul>
            <p>
              Runbooks are living documents. Update them every time you
              encounter a new failure mode. The best signal that your
              observability is mature is when an on-call rotation member
              who has never seen a particular failure can resolve it using
              the runbook alone.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What Interviewers Want to Hear
            </h2>
            <p>
              When a senior DE role interviewer asks about monitoring and
              observability, they are testing for two things: whether you
              think about data health separately from pipeline health, and
              whether you have dealt with production incidents at scale.
            </p>
            <p>
              Strong answers include specific examples of the four layers
              of observability you own: freshness (is the data recent),
              volume (is the row count in the expected range), schema
              (have columns changed unexpectedly), and distribution (are
              the values within expected statistical ranges). Mention that
              you run quality gates between pipeline stages, not just at
              the end. Describe how you use lineage to accelerate incident
              diagnosis. Talk about the runbooks you have written and how
              they enable non-senior engineers to handle common incidents.
            </p>
            <p>
              What separates a $200K+ senior DE answer from a mid-level one
              is ownership of the full reliability story: not just &ldquo;I set up
              alerts&rdquo; but &ldquo;I built a framework where data quality is enforced
              at every layer, failures stop propagating rather than silently
              corrupting downstream tables, and any engineer on the team can
              diagnose and resolve 80% of incidents from the runbook without
              escalating.&rdquo; That is what production-grade observability
              actually looks like.
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
