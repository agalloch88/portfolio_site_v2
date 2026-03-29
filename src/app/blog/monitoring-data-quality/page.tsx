import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Monitoring Data Quality in Production: A Practical Framework | Ryan Kirsch",
  description:
    "How to build data quality monitoring that actually catches problems: freshness checks, volume anomaly detection, schema change alerting, referential integrity, and the Great Expectations vs. dbt tests tradeoff.",
  openGraph: {
    title: "Monitoring Data Quality in Production: A Practical Framework",
    description:
      "How to build data quality monitoring that actually catches problems: freshness checks, volume anomaly detection, schema change alerting, referential integrity, and the Great Expectations vs. dbt tests tradeoff.",
    type: "article",
    url: "https://ryankirsch.dev/blog/monitoring-data-quality",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitoring Data Quality in Production: A Practical Framework",
    description:
      "How to build data quality monitoring that actually catches problems: freshness checks, volume anomaly detection, schema change alerting, referential integrity, and the Great Expectations vs. dbt tests tradeoff.",
  },
  alternates: { canonical: "/blog/monitoring-data-quality" },
};

export default function DataQualityMonitoringPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/monitoring-data-quality");
  const postTitle = encodeURIComponent("Monitoring Data Quality in Production: A Practical Framework");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Quality</span>
            <span className="text-sm text-gray-500">February 4, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Monitoring Data Quality in Production: A Practical Framework
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Data quality problems that reach dashboards erode trust faster than pipeline downtime. Here is how to catch them before your stakeholders do.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The most common data quality story in engineering goes like this: a stakeholder notices a number that looks wrong, asks the data team about it, and the data team investigates and finds a pipeline bug that has been running silently for days or weeks. The pipeline was healthy by infrastructure metrics. No alerts fired. The data was just wrong.
          </p>
          <p>
            Infrastructure monitoring tells you whether your pipelines are running. Data quality monitoring tells you whether they are running correctly. Both are necessary. Most data teams have the former and underinvest in the latter.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Four Categories of Data Quality</h2>
          <p>
            Before building monitoring, it helps to be precise about what you are monitoring for. Data quality problems fall into four categories, each requiring different detection approaches.
          </p>
          <p>
            <strong>Freshness:</strong> data that has not been updated recently enough. A table that should refresh hourly but has not updated in six hours. This is the most common category and the easiest to detect.
          </p>
          <p>
            <strong>Volume:</strong> data that has too many or too few rows relative to historical patterns. A table that normally receives 50,000 rows per hour suddenly receiving 5,000 (upstream issue) or 500,000 (duplicate ingestion).
          </p>
          <p>
            <strong>Schema:</strong> unexpected changes to column names, types, or the addition/removal of columns. Schema changes in source systems are a frequent cause of silent downstream failures.
          </p>
          <p>
            <strong>Distribution:</strong> values that fall outside expected ranges or distributions. Null rates that spike, categorical values that appear or disappear, numeric columns with unexpected min/max values.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Freshness Checks</h2>
          <p>
            Freshness is the simplest quality metric to implement and one of the highest-value. For any table that should update on a schedule, track the maximum value of a load timestamp and alert when it exceeds the expected window.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- SQL freshness check
SELECT
  table_name,
  MAX(loaded_at) AS last_loaded,
  CURRENT_TIMESTAMP - MAX(loaded_at) AS staleness,
  CASE
    WHEN CURRENT_TIMESTAMP - MAX(loaded_at) > INTERVAL '2 hours' THEN 'ERROR'
    WHEN CURRENT_TIMESTAMP - MAX(loaded_at) > INTERVAL '1 hour' THEN 'WARN'
    ELSE 'OK'
  END AS status
FROM information_schema_freshness  -- custom view
GROUP BY table_name;

-- dbt source freshness (built-in)
# models/schema.yml
sources:
  - name: raw
    tables:
      - name: orders
        loaded_at_field: _ingested_at
        freshness:
          warn_after: {count: 1, period: hour}
          error_after: {count: 2, period: hour}`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Volume Anomaly Detection</h2>
          <p>
            Volume checks based on fixed thresholds are brittle: a table that seasonally receives 10x more data on weekends will always trigger false positives with a fixed row count check. Statistical anomaly detection is more robust.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import pandas as pd
import numpy as np
from typing import Optional

def detect_volume_anomaly(
    table: str,
    current_count: int,
    historical_counts: list[int],
    z_score_threshold: float = 3.0
) -> dict:
    """
    Detect volume anomalies using z-score against recent history.
    Returns: {status, z_score, expected_range}
    """
    if len(historical_counts) < 7:
        return {"status": "insufficient_history", "z_score": None}
    
    mean = np.mean(historical_counts)
    std = np.std(historical_counts)
    
    if std == 0:
        return {"status": "ok", "z_score": 0.0}
    
    z_score = abs((current_count - mean) / std)
    
    return {
        "status": "anomaly" if z_score > z_score_threshold else "ok",
        "z_score": round(z_score, 2),
        "current_count": current_count,
        "expected_mean": round(mean),
        "expected_range": (
            round(mean - z_score_threshold * std),
            round(mean + z_score_threshold * std)
        )
    }

# Example usage in a Dagster asset check
from dagster import asset_check, AssetCheckResult

@asset_check(asset=fct_orders)
def orders_volume_check(context) -> AssetCheckResult:
    current = get_today_count("fct_orders")
    history = get_historical_counts("fct_orders", days=28)
    
    result = detect_volume_anomaly("fct_orders", current, history)
    
    return AssetCheckResult(
        passed=result["status"] == "ok",
        metadata=result
    )`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Schema Change Detection</h2>
          <p>
            Schema changes in source systems are one of the most common causes of silent pipeline failures. A column gets renamed in the production database, the ingestion pipeline continues running without error (it just ignores the new column name), and downstream models produce nulls where they previously had values.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import json
from pathlib import Path
from datetime import datetime

def snapshot_schema(table: str, con) -> dict:
    """Capture current schema as a dict."""
    result = con.execute(f"""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '{table}'
        ORDER BY ordinal_position
    """).fetchall()
    
    return {
        "table": table,
        "captured_at": datetime.utcnow().isoformat(),
        "columns": [
            {"name": row[0], "type": row[1], "nullable": row[2]}
            for row in result
        ]
    }

def compare_schemas(current: dict, previous: dict) -> dict:
    """Detect additions, removals, and type changes."""
    current_cols = {c["name"]: c for c in current["columns"]}
    previous_cols = {c["name"]: c for c in previous["columns"]}
    
    added = [c for c in current_cols if c not in previous_cols]
    removed = [c for c in previous_cols if c not in current_cols]
    type_changes = [
        {"column": name, "from": previous_cols[name]["type"], "to": current_cols[name]["type"]}
        for name in current_cols
        if name in previous_cols and current_cols[name]["type"] != previous_cols[name]["type"]
    ]
    
    return {
        "has_changes": bool(added or removed or type_changes),
        "added_columns": added,
        "removed_columns": removed,
        "type_changes": type_changes
    }`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Distribution Checks with dbt Tests</h2>
          <p>
            dbt schema tests cover the most common distribution checks with minimal configuration. The built-in tests handle not_null, unique, accepted_values, and relationships (referential integrity). Custom generic tests and the dbt_utils package extend this significantly.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# models/schema.yml
models:
  - name: fct_orders
    columns:
      - name: order_id
        tests:
          - not_null
          - unique
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      - name: amount
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0"
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id

    # Table-level tests
    tests:
      - dbt_utils.expression_is_true:
          expression: "order_date <= CURRENT_DATE"
          name: no_future_orders
      - dbt_utils.recency:
          datepart: hour
          field: order_date
          interval: 24
          name: orders_updated_within_24h`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Great Expectations vs. dbt Tests</h2>
          <p>
            The choice between Great Expectations (GE) and dbt tests for data quality is mostly a question of where in the pipeline you want to validate and how much configuration overhead you are willing to accept.
          </p>
          <p>
            <strong>dbt tests</strong> are the right choice for transformation output validation. They run as part of the dbt job, are version-controlled with the models they test, and have excellent integration with dbt Cloud and most orchestrators. The configuration is lightweight and readable. The limitation is that they only run after dbt has transformed the data, so they catch errors in the mart layer but not in the staging layer or source data.
          </p>
          <p>
            <strong>Great Expectations</strong> is better for source data validation at ingestion time, complex distribution checks that require more statistical sophistication than dbt tests support, and environments where you need detailed data docs and expectation suites shared across teams. The configuration overhead is real: GE requires more setup than dbt tests and has a steeper learning curve. The payoff is a more complete validation framework.
          </p>
          <p>
            Most mature data teams use both: GE or equivalent for source validation at ingestion, dbt tests for transformation output validation. The cost of running both is justified by catching different classes of problems at different points in the pipeline.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Building the Monitoring Dashboard</h2>
          <p>
            All quality checks produce the same output: a status (ok, warn, error), a timestamp, and metadata. Aggregating this into a simple monitoring view gives you a single place to assess data health.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Data quality status summary
CREATE VIEW data_quality_status AS
SELECT
  table_name,
  check_type,
  status,
  details,
  checked_at
FROM (
  SELECT table_name, 'freshness' AS check_type, freshness_status AS status,
         JSON_OBJECT('staleness_minutes', staleness_minutes) AS details,
         checked_at
  FROM freshness_checks
  UNION ALL
  SELECT table_name, 'volume' AS check_type, volume_status AS status,
         JSON_OBJECT('z_score', z_score, 'current_count', current_count) AS details,
         checked_at
  FROM volume_checks
  UNION ALL
  SELECT table_name, 'schema' AS check_type,
         CASE WHEN has_changes THEN 'warn' ELSE 'ok' END AS status,
         schema_diff AS details, checked_at
  FROM schema_checks
)
ORDER BY CASE status WHEN 'error' THEN 1 WHEN 'warn' THEN 2 ELSE 3 END, table_name;`}
          </pre>
          <p>
            The goal is not to eliminate all data quality issues. It is to catch them before stakeholders do, understand their root causes, and resolve them faster than they erode trust. A team that discovers its own data problems and fixes them proactively has a fundamentally different relationship with its stakeholders than one that learns about problems from the people who needed the data.
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
