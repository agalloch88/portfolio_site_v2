import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Pipeline Reliability: How to Build Pipelines That Don't Break at 2 AM | Ryan Kirsch",
  description:
    "The patterns that separate pipelines that quietly fail from ones you can trust: idempotency, dead letter queues, circuit breakers, alerting strategy, runbooks, and the on-call mindset.",
  openGraph: {
    title: "Data Pipeline Reliability: How to Build Pipelines That Don't Break at 2 AM",
    description:
      "The patterns that separate pipelines that quietly fail from ones you can trust: idempotency, dead letter queues, circuit breakers, alerting strategy, runbooks, and the on-call mindset.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-pipeline-reliability",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Pipeline Reliability: How to Build Pipelines That Don't Break at 2 AM",
    description:
      "The patterns that separate pipelines that quietly fail from ones you can trust: idempotency, dead letter queues, circuit breakers, alerting strategy, runbooks, and the on-call mindset.",
  },
  alternates: { canonical: "/blog/data-pipeline-reliability" },
};

export default function PipelineReliabilityPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-pipeline-reliability");
  const postTitle = encodeURIComponent("Data Pipeline Reliability: How to Build Pipelines That Don't Break at 2 AM");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Pipeline Reliability: How to Build Pipelines That Don&apos;t Break at 2 AM
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Unreliable pipelines are not bad luck. They are the result of specific missing patterns. Here is how to build pipelines that fail loudly, recover cleanly, and do not wake you up.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The first time a critical dashboard is wrong because a pipeline silently failed overnight, the conversation about reliability becomes very real very fast. The problem is not that pipelines break: all pipelines break eventually. The problem is pipelines that break quietly, recover incorrectly, or require manual intervention to get back to a known good state.
          </p>
          <p>
            This post covers the patterns that prevent the 2 AM page: idempotency, retry design, dead letter queues, alerting strategy, runbooks, and the mental model that separates pipelines built to be maintained from pipelines built to be launched.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Idempotency First</h2>
          <p>
            An idempotent pipeline produces the same result whether it runs once or ten times against the same input. This is the single most important reliability property a pipeline can have, because it is what makes safe retries possible.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Non-idempotent: running twice doubles the rows
def load_events(events: list[dict]) -> None:
    db.execute("INSERT INTO events VALUES (?)", events)

# Idempotent: running twice produces the same result
def load_events_idempotent(events: list[dict], batch_id: str) -> None:
    db.execute("""
        INSERT INTO events (event_id, user_id, amount, batch_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (event_id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            amount = EXCLUDED.amount,
            batch_id = EXCLUDED.batch_id
    """, [(e['event_id'], e['user_id'], e['amount'], batch_id) 
          for e in events])`}
          </pre>
          <p>
            For batch pipelines, idempotency usually means: delete the output for the target partition before writing, or use MERGE/upsert logic with a natural key. For streaming pipelines, it means deduplicating on event ID before processing, since at-least-once delivery means you will see duplicates.
          </p>
          <p>
            The batch_id pattern is useful for debugging: it tells you which pipeline run produced which rows, which helps identify whether a data issue appeared before or after a specific run.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Retry Design</h2>
          <p>
            Most pipeline failures are transient: a network timeout, a rate limit hit, a temporary database unavailability. Retries handle these without human intervention. The key is not whether to retry but how.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import time
import random
from typing import Callable, TypeVar

T = TypeVar('T')

def with_exponential_backoff(
    fn: Callable[[], T],
    max_attempts: int = 5,
    base_delay_seconds: float = 1.0,
    max_delay_seconds: float = 60.0,
    jitter: bool = True
) -> T:
    """Retry fn with exponential backoff and optional jitter."""
    for attempt in range(max_attempts):
        try:
            return fn()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise  # Final attempt, re-raise
            
            delay = min(base_delay_seconds * (2 ** attempt), max_delay_seconds)
            if jitter:
                delay *= (0.5 + random.random() * 0.5)  # 50-100% of delay
            
            print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.1f}s")
            time.sleep(delay)

# Usage
result = with_exponential_backoff(
    lambda: api_client.fetch_data(start_date, end_date),
    max_attempts=5
)`}
          </pre>
          <p>
            Jitter is important when multiple pipeline instances are retrying simultaneously. Without jitter, they all retry at the same moment, creating a thundering herd that hammers the downstream system in synchronized waves. Jitter spreads the retries out.
          </p>
          <p>
            Not all errors should be retried. A 404 Not Found response means the resource does not exist; retrying it will not help. A 401 Unauthorized means your credentials are wrong; retrying wastes time. Build retry logic that distinguishes retryable errors (network timeouts, 429 rate limits, 503 service unavailable) from non-retryable errors (authentication failures, resource not found, invalid input).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Dead Letter Queues</h2>
          <p>
            A dead letter queue (DLQ) is where messages or records go when they cannot be processed after exhausting retries. Instead of blocking the pipeline or silently discarding failed records, you route them to a separate destination for investigation.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`def process_event_batch(events: list[dict]) -> dict:
    """Process events, routing failures to DLQ."""
    successes = []
    failures = []
    
    for event in events:
        try:
            processed = transform_event(event)
            successes.append(processed)
        except Exception as e:
            failures.append({
                "original_event": event,
                "error": str(e),
                "error_type": type(e).__name__,
                "failed_at": datetime.utcnow().isoformat(),
                "pipeline_run_id": get_run_id()
            })
    
    if successes:
        write_to_warehouse(successes)
    
    if failures:
        write_to_dlq(failures)  # S3 path, separate DB table, etc.
        alert_if_failure_rate_high(len(failures), len(events))
    
    return {"processed": len(successes), "failed": len(failures)}`}
          </pre>
          <p>
            DLQs serve two purposes: they keep the pipeline moving (one bad record does not block the rest) and they create a record of what failed and why. Build a process to review the DLQ regularly. Failures that accumulate without review mean data loss that nobody notices until an analyst asks a question that cannot be answered.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Alerting Strategy</h2>
          <p>
            The goal of alerting is to wake someone up only when human intervention is required, and to give them enough context to act quickly. Bad alerting does one of two things: it alerts on everything (alert fatigue, people start ignoring alerts) or it alerts on nothing (problems accumulate silently).
          </p>
          <p>
            Alert on outcomes, not just on errors. A pipeline that runs successfully but produces zero rows is as broken as one that throws an exception. Build row count checks, freshness checks, and aggregate validation into your alerting alongside error rate monitoring.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# dbt test for freshness
# models/schema.yml
sources:
  - name: raw
    tables:
      - name: events
        freshness:
          warn_after: {count: 6, period: hour}
          error_after: {count: 12, period: hour}
        loaded_at_field: _ingested_at

# Custom row count anomaly check
def check_daily_row_count(table: str, date: str, threshold: float = 0.3) -> bool:
    """Alert if today's row count deviates > 30% from 7-day average."""
    query = f"""
        WITH daily_counts AS (
            SELECT 
                event_date,
                COUNT(*) AS row_count
            FROM {table}
            WHERE event_date >= CURRENT_DATE - 8
            GROUP BY event_date
        ),
        stats AS (
            SELECT
                AVG(row_count) FILTER (WHERE event_date < CURRENT_DATE) AS avg_7d,
                MAX(row_count) FILTER (WHERE event_date = CURRENT_DATE) AS today_count
            FROM daily_counts
        )
        SELECT 
            ABS(today_count - avg_7d) / avg_7d AS deviation
        FROM stats
    """
    deviation = run_query(query)[0]['deviation']
    return deviation <= threshold`}
          </pre>
          <p>
            Severity tiering matters. A pipeline that failed in the last 5 minutes at 3 AM is not the same urgency as one that has been failing for 6 hours before the business day starts. Use warn/error/critical tiers with different notification channels (Slack for warn, PagerDuty for critical) and suppress duplicate alerts.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Runbooks</h2>
          <p>
            A runbook is a document that tells an on-call engineer how to diagnose and fix a specific type of failure. Writing runbooks forces you to think through failure modes before they happen. They also mean that a junior engineer can handle an incident at 2 AM without waking up the senior who built the system.
          </p>
          <p>
            A good runbook for a data pipeline covers: what the alert means, what the likely causes are (in order of probability), how to confirm each cause, the fix for each cause, and how to verify that the fix worked. It also covers when to escalate and who to escalate to.
          </p>
          <p>
            Template:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Runbook: Daily Orders Pipeline SLA Miss

## Alert: daily_orders_pipeline_sla_miss

### What it means
The daily orders pipeline did not complete by 6:00 AM UTC.
Business impact: revenue dashboard stale; analytics team blocked.

### Likely causes (in order)
1. Source DB connection timeout (60% of incidents)
2. Upstream data late from payment processor (25%)
3. Warehouse query timeout during mart build (10%)
4. Other / infra issue (5%)

### How to diagnose
1. Check Dagster UI for last run status and error message
   → https://dagster.internal/runs?pipeline=daily_orders
2. Check source DB connectivity:
   → run: python scripts/check_source_db.py
3. Check payment processor status page:
   → https://status.paymentco.com
4. Check Snowflake query history for timeouts:
   → Snowflake UI → Activity → Query History → filter last 2h

### Fixes
- If source DB timeout: re-trigger run in Dagster (usually self-resolves)
- If upstream data late: wait until data arrives, then re-trigger
- If warehouse timeout: increase warehouse size in Snowflake, re-trigger

### Verification
Run passes in Dagster + dashboard shows today's date in "Last Updated"

### Escalation
If not resolved in 30 min → page @data-eng-lead`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Production Mindset</h2>
          <p>
            The difference between a pipeline that was built to be launched and one that was built to be maintained is visible in the first incident. The launch pipeline has no runbook, ambiguous error messages, and requires the original author to debug. The maintained pipeline has all three, which means the original author can sleep through most incidents.
          </p>
          <p>
            Building for maintainability is not extra work on top of building the feature. It is a different set of decisions made during the build: naming things so error messages make sense to someone who did not write the code, logging at the right granularity (not too noisy, not too sparse), building in the checks that would catch the failure modes you already know exist, and writing the runbook when the context is fresh.
          </p>
          <p>
            The test: could someone who has never seen this pipeline diagnose and fix the most likely failure modes using only the logs, the alerts, and the documentation? If yes, the pipeline is production-ready. If no, it is a prototype that happens to be running in production.
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
