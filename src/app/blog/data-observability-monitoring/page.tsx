import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Observability: How to Know When Your Pipeline Is Lying to You | Ryan Kirsch",
  description:
    "A practical guide to data observability in production. How to implement freshness checks, volume anomaly detection, schema change alerts, and lineage tracking so you find data problems before your stakeholders do.",
  openGraph: {
    title:
      "Data Observability: How to Know When Your Pipeline Is Lying to You",
    description:
      "A practical guide to data observability in production. Freshness checks, volume anomaly detection, schema change alerts, and lineage tracking -- so you find data problems before your stakeholders do.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-observability-monitoring",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Observability: How to Know When Your Pipeline Is Lying to You",
    description:
      "A practical guide to data observability in production. Freshness checks, volume anomaly detection, schema change alerts, and lineage tracking -- so you find data problems before your stakeholders do.",
  },
  alternates: { canonical: "/blog/data-observability-monitoring" },
};

export default function DataObservabilityPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-observability-monitoring"
  );
  const postTitle = encodeURIComponent(
    "Data Observability: How to Know When Your Pipeline Is Lying to You"
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
            Data Observability: How to Know When Your Pipeline Is Lying to You
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · November 28, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            A pipeline that fails loudly is the best kind of problem. You get
            an alert, you fix it, you move on. The dangerous pipeline is the
            one that succeeds silently while delivering wrong data. Data
            observability is the discipline of catching that second type before
            your finance team builds a quarterly report on corrupted numbers.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What Data Observability Actually Means
            </h2>
            <p>
              The term borrows from software observability (logs, metrics,
              traces) but applies to data assets instead of services. Where
              software observability asks &ldquo;is the system behaving correctly,&rdquo;
              data observability asks &ldquo;is the data trustworthy.&rdquo;
            </p>
            <p>
              The five pillars that cover most production data problems:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Freshness</strong> -- Is the data as recent as it
                should be? A table that was supposed to refresh at 6 AM and
                still shows yesterday&apos;s max timestamp at 9 AM is stale.
              </li>
              <li>
                <strong>Volume</strong> -- Did the expected amount of data
                arrive? A table that normally receives 50K rows per day
                suddenly receiving 500 or 5 million is a signal something
                changed upstream.
              </li>
              <li>
                <strong>Schema</strong> -- Did the shape of the data change?
                A column that disappeared or changed type will break downstream
                models silently if you do not catch it at ingestion.
              </li>
              <li>
                <strong>Distribution</strong> -- Are values within expected
                ranges? Null rates spiking, numeric columns going negative,
                categorical fields gaining unexpected values -- all signs of
                upstream data quality degradation.
              </li>
              <li>
                <strong>Lineage</strong> -- Which tables depend on which?
                When something breaks, lineage tells you what downstream assets
                are affected without manually tracing every dependency.
              </li>
            </ul>
            <p>
              Most data quality tests cover schema and distribution. Most data
              teams neglect freshness and volume. Lineage is often absent
              entirely. A complete observability setup covers all five.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Freshness Monitoring with dbt and Python
            </h2>
            <p>
              dbt has built-in freshness checks for source tables. You declare
              an expected freshness threshold, and dbt warns or errors when
              the source timestamp exceeds it:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# sources.yml
sources:
  - name: raw_orders
    database: raw
    schema: public
    tables:
      - name: orders
        loaded_at_field: _ingested_at
        freshness:
          warn_after: {count: 6, period: hour}
          error_after: {count: 12, period: hour}
      - name: payments
        loaded_at_field: updated_at
        freshness:
          warn_after: {count: 1, period: hour}
          error_after: {count: 4, period: hour}`}</code>
            </pre>
            <p>
              Run <code>dbt source freshness</code> on a schedule and pipe the
              results to your alerting channel. For custom freshness logic --
              checking multiple timestamp columns, or applying different
              thresholds by business day vs. weekend -- a Python check gives
              you more control:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`import snowflake.connector
from datetime import datetime, timedelta, timezone
import os

def check_table_freshness(
    table: str,
    timestamp_col: str,
    warn_hours: int,
    error_hours: int,
) -> dict:
    conn = snowflake.connector.connect(
        account=os.environ["SNOWFLAKE_ACCOUNT"],
        user=os.environ["SNOWFLAKE_USER"],
        password=os.environ["SNOWFLAKE_PASSWORD"],
        database="ANALYTICS",
        schema="PUBLIC",
    )
    
    cursor = conn.cursor()
    cursor.execute(
        f"SELECT MAX({timestamp_col}) FROM {table}"
    )
    max_ts = cursor.fetchone()[0]
    conn.close()
    
    if max_ts is None:
        return {"status": "error", "message": f"{table} has no rows"}
    
    now = datetime.now(timezone.utc)
    age_hours = (now - max_ts).total_seconds() / 3600
    
    if age_hours > error_hours:
        return {
            "status": "error",
            "table": table,
            "age_hours": round(age_hours, 1),
            "message": f"Data is {age_hours:.1f}h old (error threshold: {error_hours}h)"
        }
    elif age_hours > warn_hours:
        return {
            "status": "warn",
            "table": table,
            "age_hours": round(age_hours, 1),
            "message": f"Data is {age_hours:.1f}h old (warn threshold: {warn_hours}h)"
        }
    return {"status": "ok", "table": table, "age_hours": round(age_hours, 1)}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Volume Anomaly Detection
            </h2>
            <p>
              Fixed thresholds break quickly as business grows. A table that
              receives 50K rows per day in January might receive 200K per day
              in December. The better approach is statistical anomaly detection
              against a rolling baseline.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`import numpy as np
from typing import List

def detect_volume_anomaly(
    recent_counts: List[int],
    today_count: int,
    z_threshold: float = 3.0,
) -> dict:
    """
    Flag today's row count if it's more than z_threshold
    standard deviations from the rolling mean.
    
    recent_counts: list of daily row counts (last 14-30 days)
    today_count: today's row count
    z_threshold: how many std devs = anomaly (3.0 = ~0.3% false positive rate)
    """
    mean = np.mean(recent_counts)
    std = np.std(recent_counts)
    
    if std == 0:
        # No variance in history -- exact match check
        is_anomaly = today_count != mean
        return {
            "is_anomaly": is_anomaly,
            "today": today_count,
            "expected_mean": mean,
            "z_score": None,
        }
    
    z_score = (today_count - mean) / std
    is_anomaly = abs(z_score) > z_threshold
    
    direction = "high" if z_score > 0 else "low"
    
    return {
        "is_anomaly": is_anomaly,
        "today": today_count,
        "expected_mean": round(mean),
        "std": round(std),
        "z_score": round(z_score, 2),
        "direction": direction if is_anomaly else None,
        "message": (
            f"Volume anomaly: {today_count:,} rows ({direction} by {abs(z_score):.1f} std devs)"
            if is_anomaly else "Volume normal"
        ),
    }`}</code>
            </pre>
            <p>
              Integrate this into a Dagster asset that runs after each pipeline
              load, reads the last 30 days of row counts from a metadata table,
              and fires a Slack alert on anomaly. The key parameters to tune
              are window size (30 days works for stable tables, 7 days for
              volatile ones) and the Z threshold (3.0 is conservative -- 2.0
              is more sensitive but noisier).
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Schema Change Detection at Ingestion
            </h2>
            <p>
              Schema changes from upstream sources are one of the most common
              causes of silent data failures. A source API removes a field,
              a database column gets renamed, a JSON payload adds a new nested
              object -- if you do not catch these at ingestion, they propagate
              through your entire transformation layer.
            </p>
            <p>
              The pattern is to store expected schemas in a registry and diff
              against actual schemas at ingestion time:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from pydantic import BaseModel
from typing import Optional, Dict, Any
import json

class ColumnSpec(BaseModel):
    name: str
    dtype: str
    nullable: bool = True

class SchemaRegistry:
    """Stores expected schemas and diffs against incoming data."""
    
    def __init__(self, schema_store_path: str):
        self.path = schema_store_path
        self._load()
    
    def _load(self):
        try:
            with open(self.path) as f:
                self.store: Dict[str, list] = json.load(f)
        except FileNotFoundError:
            self.store = {}
    
    def register(self, table: str, columns: list[ColumnSpec]):
        self.store[table] = [c.model_dump() for c in columns]
        with open(self.path, "w") as f:
            json.dump(self.store, f, indent=2)
    
    def diff(self, table: str, actual_columns: list[str]) -> dict:
        if table not in self.store:
            return {"status": "unregistered", "table": table}
        
        expected = {c["name"] for c in self.store[table]}
        actual = set(actual_columns)
        
        added = actual - expected
        removed = expected - actual
        
        if added or removed:
            return {
                "status": "schema_changed",
                "table": table,
                "added": sorted(added),
                "removed": sorted(removed),
            }
        return {"status": "ok", "table": table}`}</code>
            </pre>
            <p>
              Run this diff before every ingestion job. On schema change, pause
              ingestion and alert -- do not attempt to load data with an
              unknown schema into a typed destination. The cost of a missed
              load is a pipeline delay. The cost of loading malformed data is
              corrupted downstream models that are much harder to identify and
              remediate.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lineage: Knowing What Breaks When Something Breaks
            </h2>
            <p>
              dbt builds a lineage graph automatically from <code>ref()</code>{" "}
              and <code>source()</code> calls. This is one of the most
              underutilized features in a dbt project. The lineage graph tells
              you, for any given table, every downstream model that depends on
              it.
            </p>
            <p>
              When an upstream source fails, instead of scrambling to identify
              impact, you query the lineage:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Query dbt's manifest.json for downstream dependencies
import json
from pathlib import Path

def find_downstream(
    manifest_path: str,
    target_node: str,  # e.g. "source.myproject.raw_orders.orders"
) -> list[str]:
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    # Build a parent -> children index
    children: dict[str, list[str]] = {}
    for node_id, node in manifest.get("nodes", {}).items():
        for parent in node.get("depends_on", {}).get("nodes", []):
            children.setdefault(parent, []).append(node_id)
    
    # BFS from target node
    visited = set()
    queue = [target_node]
    while queue:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)
        for child in children.get(current, []):
            queue.append(child)
    
    visited.discard(target_node)
    return sorted(visited)

# Usage
affected = find_downstream(
    "target/manifest.json",
    "source.myproject.raw_orders.orders"
)
print(f"{len(affected)} downstream models affected:"
for m in affected:
    print(f"  {m}")`}</code>
            </pre>
            <p>
              Integrate this into your incident response. When a source fails,
              automatically compute the blast radius and include it in your
              alert. &ldquo;Source raw_orders.orders is stale -- 14 downstream
              models affected, including gold.monthly_revenue&rdquo; is far more
              actionable than &ldquo;pipeline failure.&rdquo;
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Choosing a Data Observability Tool
            </h2>
            <p>
              The commercial observability landscape has matured significantly.
              The main options:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Monte Carlo</strong> -- The most established platform.
                ML-based anomaly detection, automated lineage, strong dbt and
                Snowflake integration. Expensive at scale. Best for larger
                teams with a data reliability mandate.
              </li>
              <li>
                <strong>Anomalo</strong> -- Strong on automatic anomaly
                detection without manual threshold configuration. Good fit for
                teams that want ML-driven quality without full Monte Carlo
                pricing.
              </li>
              <li>
                <strong>Elementary (open source)</strong> -- dbt-native
                observability. Runs entirely within your dbt project, stores
                results in your warehouse, and generates an HTML report.
                Zero additional infrastructure for teams already on dbt.
              </li>
              <li>
                <strong>Great Expectations</strong> -- Explicit, code-defined
                expectations rather than automatic anomaly detection. Higher
                engineering effort but more precise control. Best when you have
                specific domain knowledge to encode.
              </li>
              <li>
                <strong>dbt tests + custom Python</strong> -- The DIY path.
                Sufficient for smaller data platforms, expensive to maintain
                at scale. Good starting point before committing to a platform.
              </li>
            </ul>
            <p>
              The right choice depends on team size and budget. Under 5 data
              engineers: Elementary + dbt tests covers most ground at zero
              cost. 5-20 engineers: Anomalo or Elementary with custom Python
              layers. 20+ engineers or a data reliability product mandate:
              Monte Carlo.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Practical Starting Point
            </h2>
            <p>
              If you have no observability today, do not try to implement all
              five pillars at once. Start with the two that catch the most
              common production failures:
            </p>
            <p>
              <strong>First:</strong> Add freshness checks to your top 10
              most-queried tables. Configure dbt source freshness or write
              simple Python checks. Set error thresholds at 2x the expected
              latency. Run them on a schedule before business hours so problems
              surface before stakeholders open dashboards.
            </p>
            <p>
              <strong>Second:</strong> Add volume tracking to your fact tables.
              Store daily row counts in a metadata table, compute a 30-day
              rolling baseline, and alert when today&apos;s count is outside 3
              standard deviations. This catches the majority of upstream data
              issues -- missed loads, truncated feeds, duplicate ingestion --
              without requiring ML infrastructure.
            </p>
            <p>
              Schema change detection and distribution checks come next. Lineage
              is often already available from dbt -- the work is wiring it into
              your alerting so it surfaces automatically.
            </p>
            <p>
              The goal is not a perfect observability system on day one. The
              goal is to stop finding out about data problems from stakeholders.
              Even partial observability -- freshness and volume alone -- cuts
              the time-to-detection dramatically. Build from there.
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
