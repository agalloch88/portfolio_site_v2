import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Dagster Assets: How Software-Defined Assets Change the Way You Think About Pipelines | Ryan Kirsch",
  description:
    "A practical guide to Dagster's Software-Defined Assets (SDAs). How asset-based orchestration differs from op-based pipelines, when to use each, and how to structure a production data platform around assets.",
  openGraph: {
    title:
      "Dagster Assets: How Software-Defined Assets Change the Way You Think About Pipelines",
    description:
      "A practical guide to Dagster's Software-Defined Assets. How asset-based orchestration differs from op-based pipelines, when to use each, and how to structure a production data platform around assets.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dagster-assets-software-defined",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dagster Assets: How Software-Defined Assets Change the Way You Think About Pipelines",
    description:
      "A practical guide to Dagster's Software-Defined Assets. How asset-based orchestration differs from op-based pipelines, when to use each, and how to structure a production data platform around assets.",
  },
  alternates: { canonical: "/blog/dagster-assets-software-defined" },
};

export default function DagsterAssetsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dagster-assets-software-defined"
  );
  const postTitle = encodeURIComponent(
    "Dagster Assets: How Software-Defined Assets Change the Way You Think About Pipelines"
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
            Dagster Assets: How Software-Defined Assets Change the Way You
            Think About Pipelines
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 5, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most orchestration tools are built around tasks: discrete units of
            work that run in sequence. Dagster&apos;s Software-Defined Assets
            flip this model. You define the data artifacts you want to exist
            -- tables, ML models, reports -- and Dagster figures out how to
            produce and keep them fresh. The difference is not cosmetic. It
            changes how you debug, observe, and evolve a data platform.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Tasks vs. Assets: The Core Distinction
            </h2>
            <p>
              In Airflow, you define a DAG of tasks. Each task does something:
              run a query, call an API, move a file. The DAG describes process
              -- the sequence of operations. If you want to know what data
              exists in your platform, you have to read the task code and
              infer it.
            </p>
            <p>
              In Dagster with assets, you define what data should exist and
              how to produce it. The asset is the table, the file, the trained
              model. The computation is attached to the asset, not the other
              way around. If you want to know what data exists in your
              platform, you look at the asset catalog.
            </p>
            <p>
              This distinction matters for three operational reasons:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Observability.</strong> Dagster knows which assets are
                fresh, which are stale, and which have failed. You can answer
                &ldquo;is the customers table up to date?&rdquo; without reading logs.
              </li>
              <li>
                <strong>Lineage.</strong> Asset dependencies are declared
                explicitly. When an upstream asset changes, Dagster knows
                exactly which downstream assets are potentially stale.
              </li>
              <li>
                <strong>Selective materialization.</strong> You can materialize
                a single asset and all its dependencies without running the
                entire pipeline. This makes development and debugging
                dramatically faster.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Defining Your First Asset
            </h2>
            <p>
              An asset in Dagster is a Python function decorated with{" "}
              <code>@asset</code>. The function returns the data (or writes
              it to a storage system and returns metadata). Dagster stores
              the record of when it was last materialized and whether the
              materialization succeeded.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dagster import asset, MaterializeResult, MetadataValue
import pandas as pd
import snowflake.connector

@asset(
    group_name="bronze",
    description="Raw order events from the payments API, partitioned by ingestion date",
    tags={"layer": "bronze", "source": "payments_api"},
)
def raw_orders() -> MaterializeResult:
    """Ingests raw order data from the Payments API into the bronze layer."""
    # ... fetch from API
    df = fetch_orders_from_api()
    
    # Write to Snowflake bronze table
    conn = snowflake.connector.connect(...)
    write_dataframe(conn, df, "bronze.raw_orders")
    
    return MaterializeResult(
        metadata={
            "row_count": MetadataValue.int(len(df)),
            "preview": MetadataValue.md(df.head().to_markdown()),
            "source": MetadataValue.text("payments_api_v2"),
        }
    )

@asset(
    group_name="silver",
    deps=["raw_orders"],
    description="Cleansed and deduplicated orders, one row per order_id",
)
def silver_orders(raw_orders) -> MaterializeResult:
    """Transforms bronze raw_orders into the silver cleansed layer."""
    conn = snowflake.connector.connect(...)
    
    conn.execute("""
        CREATE OR REPLACE TABLE silver.orders AS
        SELECT
            order_id,
            customer_id,
            amount_cents / 100.0 AS amount_usd,
            TRIM(UPPER(status)) AS status,
            order_date::DATE AS order_date,
            _ingested_at
        FROM (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY _ingested_at DESC) AS rn
            FROM bronze.raw_orders
        )
        WHERE rn = 1
    """)
    
    row_count = conn.execute("SELECT COUNT(*) FROM silver.orders").fetchone()[0]
    
    return MaterializeResult(
        metadata={"row_count": MetadataValue.int(row_count)}
    )`}</code>
            </pre>
            <p>
              The <code>{`deps=["raw_orders"]`}</code> declaration is what makes
              this an asset graph rather than a collection of independent jobs.
              Dagster understands that <code>silver_orders</code> cannot be
              fresh unless <code>raw_orders</code> has been materialized first.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Asset Checks: Quality as a First-Class Concern
            </h2>
            <p>
              Dagster 1.5 introduced asset checks -- quality assertions that
              are attached to specific assets and run after materialization.
              Unlike external test suites, asset checks are part of the asset
              definition and show up in the asset catalog alongside lineage
              and freshness information.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dagster import asset_check, AssetCheckResult, AssetCheckSeverity

@asset_check(asset="silver_orders", blocking=True)
def silver_orders_no_nulls() -> AssetCheckResult:
    """Verify that order_id and customer_id are never null."""
    conn = snowflake.connector.connect(...)
    null_count = conn.execute("""
        SELECT COUNT(*) FROM silver.orders
        WHERE order_id IS NULL OR customer_id IS NULL
    """).fetchone()[0]
    
    return AssetCheckResult(
        passed=null_count == 0,
        severity=AssetCheckSeverity.ERROR,
        metadata={"null_count": null_count},
    )

@asset_check(asset="silver_orders", blocking=False)
def silver_orders_volume_check() -> AssetCheckResult:
    """Warn if today's order volume is unusually low."""
    conn = snowflake.connector.connect(...)
    
    today_count = conn.execute("""
        SELECT COUNT(*) FROM silver.orders
        WHERE order_date = CURRENT_DATE
    """).fetchone()[0]
    
    avg_count = conn.execute("""
        SELECT AVG(daily_count) FROM (
            SELECT order_date, COUNT(*) AS daily_count
            FROM silver.orders
            WHERE order_date >= DATEADD(day, -30, CURRENT_DATE)
            GROUP BY order_date
        )
    """).fetchone()[0]
    
    low_threshold = avg_count * 0.5 if avg_count else 0
    
    return AssetCheckResult(
        passed=today_count >= low_threshold,
        severity=AssetCheckSeverity.WARN,
        metadata={
            "today_count": today_count,
            "30d_avg": round(avg_count or 0),
        },
    )`}</code>
            </pre>
            <p>
              The <code>blocking=True</code> check stops downstream assets
              from materializing if it fails. The <code>blocking=False</code>{" "}
              check records the failure as a warning but lets the pipeline
              continue. This is the right default split: hard correctness
              checks are blocking, volume anomalies are non-blocking.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Partitioned Assets: Incremental Processing Done Right
            </h2>
            <p>
              Dagster&apos;s partition system makes incremental processing explicit.
              Instead of writing custom backfill logic, you declare that an
              asset is partitioned by date (or any other dimension) and Dagster
              tracks which partitions have been materialized.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dagster import asset, DailyPartitionsDefinition, AssetExecutionContext

daily_partitions = DailyPartitionsDefinition(start_date="2025-01-01")

@asset(
    partitions_def=daily_partitions,
    group_name="bronze",
)
def raw_orders_partitioned(context: AssetExecutionContext) -> MaterializeResult:
    """Daily-partitioned raw orders. Each partition = one day of data."""
    partition_date = context.partition_key  # e.g. "2026-03-27"
    
    df = fetch_orders_for_date(partition_date)
    
    conn = snowflake.connector.connect(...)
    conn.execute(f"""
        DELETE FROM bronze.raw_orders_partitioned
        WHERE partition_date = '{partition_date}'
    """)
    write_dataframe(conn, df, "bronze.raw_orders_partitioned")
    
    return MaterializeResult(
        metadata={
            "partition_date": partition_date,
            "row_count": len(df),
        }
    )

# Backfill all partitions from the start date
# dagster asset backfill --asset raw_orders_partitioned --all-partitions
# Or materialize a specific range:
# dagster asset backfill --asset raw_orders_partitioned \\
#   --partition-range 2026-01-01...2026-03-27`}</code>
            </pre>
            <p>
              Dagster&apos;s UI shows the materialization status of every partition.
              You can see at a glance that March 1-20 are materialized, March
              21 failed, and March 22-27 are missing. Click to backfill the
              missing partitions without writing any custom logic.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Integrating dbt with Dagster Assets
            </h2>
            <p>
              The <code>dagster-dbt</code> integration auto-generates Dagster
              assets from your dbt project. Every dbt model becomes a Dagster
              asset, with lineage derived from dbt&apos;s ref() graph. You get
              the dbt transformation layer and the Dagster observability layer
              without writing any integration code.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dagster_dbt import DbtCliResource, dbt_assets
from pathlib import Path

DBT_PROJECT_DIR = Path(__file__).parent.parent / "dbt_project"

@dbt_assets(manifest=DBT_PROJECT_DIR / "target" / "manifest.json")
def my_dbt_assets(context, dbt: DbtCliResource):
    yield from dbt.cli(["build"], context=context).stream()

# In your Definitions:
from dagster import Definitions, define_asset_job

defs = Definitions(
    assets=[
        raw_orders,           # Python ingestion asset
        my_dbt_assets,        # All dbt models as Dagster assets
    ],
    resources={
        "dbt": DbtCliResource(project_dir=DBT_PROJECT_DIR),
    },
    jobs=[
        define_asset_job(
            "full_pipeline",
            selection="raw_orders+ my_dbt_assets+",
        )
    ],
)`}</code>
            </pre>
            <p>
              The result is a single asset graph in the Dagster UI that shows
              your Python ingestion assets feeding into your dbt silver models
              feeding into your dbt gold models. One lineage view, one
              observability surface, one place to trigger backfills.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When to Use Ops vs. Assets
            </h2>
            <p>
              Assets are not always the right abstraction. Dagster still
              supports the original op-and-job model, and there are cases where
              it is the better choice.
            </p>
            <p>
              <strong>Use assets when:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The output is a persistent data artifact (table, file, model)</li>
              <li>You care about freshness and want observable staleness</li>
              <li>The asset has upstream or downstream dependencies you want to track</li>
              <li>You want partitioning and backfill management built in</li>
            </ul>
            <p>
              <strong>Use ops when:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The task produces no durable artifact (send an email, trigger an API)</li>
              <li>The computation is ephemeral or streaming</li>
              <li>You are wrapping an external system that manages its own state</li>
              <li>You need fine-grained retry logic at the op level with complex fan-out</li>
            </ul>
            <p>
              In practice, a production data platform uses both. The ingestion
              and transformation layers are assets. The notification jobs,
              export triggers, and operational side effects are ops that run
              downstream of asset materialization events.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Operational Advantage
            </h2>
            <p>
              The best argument for Software-Defined Assets is not a feature --
              it is what happens at 2 AM when something breaks.
            </p>
            <p>
              With task-based pipelines, you get an alert that a task failed.
              You read the logs, figure out which data artifact is affected,
              trace the downstream dependencies manually, and decide what to
              re-run. If the pipeline ran partially, you need to check each
              table manually to know what landed.
            </p>
            <p>
              With Dagster assets, you open the UI and see a graph where
              <code>silver_orders</code> is red, <code>raw_orders</code> is
              green, and three downstream gold models are marked stale. You
              click the failed asset, read the check results, fix the issue,
              and click &ldquo;Materialize&rdquo; on the affected subgraph. Dagster
              re-runs only what is stale, in the right order, with checks
              at each step.
            </p>
            <p>
              This is the real value of the asset model: it makes the implicit
              explicit. Every data engineer knows their pipelines are more
              complex than they appear. Dagster surfaces that complexity in
              a way you can actually operate.
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
