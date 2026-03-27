import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Platform Cost Optimization: Reducing Cloud Spend Without Sacrificing Reliability | Ryan Kirsch",
  description:
    "A practical guide to reducing data platform costs. The high-leverage levers in Snowflake, S3, and compute, the patterns that waste money silently, and how to build cost visibility before the bill surprises you.",
  openGraph: {
    title:
      "Data Platform Cost Optimization: Reducing Cloud Spend Without Sacrificing Reliability",
    description:
      "The high-leverage cost levers in Snowflake, S3, and compute, the patterns that waste money silently, and how to build cost visibility before the bill surprises you.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-platform-cost-optimization",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Platform Cost Optimization: Reducing Cloud Spend Without Sacrificing Reliability",
    description:
      "The high-leverage cost levers in data platforms and the patterns that waste money silently.",
  },
  alternates: { canonical: "/blog/data-platform-cost-optimization" },
};

export default function DataPlatformCostOptimizationPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-platform-cost-optimization"
  );
  const postTitle = encodeURIComponent(
    "Data Platform Cost Optimization: Reducing Cloud Spend Without Sacrificing Reliability"
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
            Data Platform Cost Optimization: Reducing Cloud Spend Without
            Sacrificing Reliability
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data platform costs scale faster than most engineering teams expect.
            A data warehouse that costs $5K/month at 50GB becomes $50K/month
            at 500GB if you have not built optimization habits into the
            platform from the start. This guide covers the specific levers
            that move the needle, in order of impact.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Build Cost Visibility Before Optimization
            </h2>
            <p>
              You cannot optimize what you cannot measure. The first step is
              not to reduce costs -- it is to understand where costs come from.
              Most data platforms have a small number of queries and pipelines
              that drive the majority of spend.
            </p>
            <p>
              In Snowflake, the cost attribution queries that matter:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Top queries by credit consumption (last 30 days)
SELECT
    query_id,
    LEFT(query_text, 100) AS query_preview,
    user_name,
    warehouse_name,
    credits_used_cloud_services,
    execution_time / 1000 AS execution_seconds,
    bytes_scanned / 1e9 AS gb_scanned
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY(
    DATE_RANGE_START => DATEADD('day', -30, CURRENT_DATE),
    RESULT_LIMIT => 10000
))
WHERE execution_status = 'SUCCESS'
  AND credits_used_cloud_services > 0
ORDER BY credits_used_cloud_services DESC
LIMIT 50;

-- Credit consumption by warehouse (last 30 days)
SELECT
    warehouse_name,
    SUM(credits_used) AS total_credits,
    SUM(credits_used) * 3.0 AS estimated_cost_usd  -- Adjust for your rate
FROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_METERING_HISTORY(
    DATE_RANGE_START => DATEADD('day', -30, CURRENT_DATE)
))
GROUP BY warehouse_name
ORDER BY total_credits DESC;`}</code>
            </pre>
            <p>
              Run this monthly. The top 10 queries by credit consumption will
              tell you where to focus optimization effort. A single
              poorly-written query that runs every hour on a large warehouse
              can represent 20-30% of your total bill.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Warehouse Configuration: The Fastest Wins
            </h2>
            <p>
              Warehouse configuration is usually the highest-impact lever
              because it affects every query. The two settings that matter most:
            </p>
            <p>
              <strong>Auto-suspend.</strong> Snowflake warehouses continue
              to run (and cost money) until suspended. The default auto-suspend
              is 10 minutes for most warehouse sizes. For ad hoc query
              warehouses, set this to 1-2 minutes. A warehouse that runs
              one query per hour should not be paying for 58 minutes of idle
              time between queries.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Set aggressive auto-suspend for dev/ad-hoc warehouses
ALTER WAREHOUSE analytics_dev
    SET AUTO_SUSPEND = 60;  -- 1 minute

-- ETL warehouses: slightly longer to avoid cold-start overhead
ALTER WAREHOUSE etl_medium
    SET AUTO_SUSPEND = 300;  -- 5 minutes

-- Check current settings
SHOW WAREHOUSES;`}</code>
            </pre>
            <p>
              <strong>Resource monitors.</strong> Without resource monitors,
              a runaway query or a misconfigured pipeline can consume unlimited
              credits. Set credit quotas at the warehouse level:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Create a resource monitor for analytics warehouse
CREATE OR REPLACE RESOURCE MONITOR analytics_monthly
    WITH CREDIT_QUOTA = 500  -- Alert at 500 credits/month
    FREQUENCY = MONTHLY
    START_TIMESTAMP = IMMEDIATELY
    TRIGGERS
        ON 75 PERCENT DO NOTIFY       -- Email at 75%
        ON 90 PERCENT DO NOTIFY       -- Email at 90%
        ON 100 PERCENT DO SUSPEND;    -- Suspend at 100%

ALTER WAREHOUSE analytics_medium
    SET RESOURCE_MONITOR = analytics_monthly;`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Storage Cost Patterns
            </h2>
            <p>
              Storage is cheaper than compute for most cloud warehouses, but
              it accumulates quietly. The two main storage cost drivers:
            </p>
            <p>
              <strong>Time Travel storage.</strong> Snowflake&apos;s Time Travel
              feature retains changed data for up to 90 days by default for
              Enterprise accounts. For large tables with high change rates,
              this can significantly multiply effective storage costs. Set
              appropriate Time Travel windows per table type:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- High-churn staging tables: short Time Travel
ALTER TABLE staging.raw_events
    SET DATA_RETENTION_TIME_IN_DAYS = 1;

-- Gold tables with business-critical data: full retention
ALTER TABLE analytics.fct_monthly_revenue
    SET DATA_RETENTION_TIME_IN_DAYS = 90;

-- Check storage breakdown by table
SELECT
    table_schema,
    table_name,
    ROUND(bytes / 1e9, 2) AS table_gb,
    ROUND(bytes_fail_safe / 1e9, 2) AS fail_safe_gb,
    data_retention_time_in_days
FROM information_schema.tables
WHERE bytes > 1e9  -- Tables over 1 GB
ORDER BY bytes DESC
LIMIT 20;`}</code>
            </pre>
            <p>
              <strong>S3/GCS object storage patterns.</strong> For platforms
              using object storage, the most common cost mistake is storing
              data in uncompressed formats. Parquet with Snappy compression
              typically reduces storage costs by 60-80% vs. uncompressed CSV,
              and also reduces scan costs since compressed files transfer
              faster.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Query-Level Optimizations That Compound
            </h2>
            <p>
              The query patterns that generate disproportionate cost:
            </p>
            <p>
              <strong>Full table scans on large tables.</strong> A query
              that scans a 500GB table with no partition pruning costs 10x
              more than one that prunes 90% of partitions. Enforce filter
              requirements on large tables:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Add a row access policy that requires date filters on large fact tables
-- (Snowflake Enterprise+)
CREATE OR REPLACE ROW ACCESS POLICY require_date_filter
AS (order_date DATE) RETURNS BOOLEAN ->
    CURRENT_ROLE() IN ('ADMIN_ROLE')  -- Admins bypass
    OR order_date >= DATEADD('year', -2, CURRENT_DATE)  -- Others: 2-year limit
;

ALTER TABLE fct_orders ADD ROW ACCESS POLICY require_date_filter ON (order_date);`}</code>
            </pre>
            <p>
              <strong>Repeated expensive subqueries.</strong> A CTE or
              subquery that references a large table and is used multiple
              times in a query re-scans the large table each time. Materialize
              it to a temp table first.
            </p>
            <p>
              <strong>Over-scheduled pipelines.</strong> A dbt pipeline
              that runs every 15 minutes when analysts only check dashboards
              twice per day wastes compute. Audit your pipeline schedules
              against actual consumer behavior. Most analytical pipelines
              do not need to run more than hourly.
            </p>
            <p>
              <strong>Dev environments using production warehouse sizes.</strong>
              Development workloads run on the same Large warehouse as
              production pipelines. Create separate XS or S warehouses for
              development and enforce them via role-based warehouse access.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              dbt-Specific Cost Optimizations
            </h2>
            <p>
              dbt project structure decisions have direct cost implications:
            </p>
            <p>
              <strong>Incremental vs. full refresh.</strong> Every dbt model
              materialized as a table runs as a full rebuild on each execution.
              For large fact tables (hundreds of millions of rows), converting
              to incremental materialization can reduce per-run cost by 80-95%.
              The cost of getting incremental logic wrong (missed late-arriving
              data, duplicates) is lower than the cost of full-table scans
              on large production runs.
            </p>
            <p>
              <strong>dbt model tags for selective runs.</strong> Running the
              full dbt project on every schedule is expensive. Use tags to
              run only the models that need to be refreshed at each interval:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/marts/finance/fct_monthly_revenue.yml
models:
  - name: fct_monthly_revenue
    config:
      tags: ["hourly", "finance"]  # This model needs hourly refresh

  - name: dim_customers
    config:
      tags: ["daily", "dimensions"]  # Only needs daily refresh

# Run only hourly-tagged models every hour:
# dbt run --select tag:hourly

# Run only daily-tagged models at midnight:
# dbt run --select tag:daily`}</code>
            </pre>
            <p>
              <strong>View vs. table materialization.</strong> Not every dbt
              model needs to be materialized as a table. Staging models and
              infrequently-queried intermediate models can be views. They have
              zero storage cost and are recomputed only when queried. Use
              tables only when materialization genuinely improves query
              performance for the consumers.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Building a Cost Culture
            </h2>
            <p>
              Technical optimizations only go so far. The bigger leverage
              is building cost awareness into the team&apos;s culture:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Tag all warehouse usage by team/project.</strong>
                Snowflake&apos;s query tags let you attribute cost to the pipeline
                or team that generated it. Without attribution, cost reduction
                conversations have no specific owner.
              </li>
              <li>
                <strong>Include cost in pipeline reviews.</strong> When a
                new pipeline is proposed, estimate the monthly credit cost
                alongside the business value. A pipeline that costs $5K/month
                and enables $50K in business value is clearly justified.
                One that costs $5K/month for a report that five people view
                once a week requires harder justification.
              </li>
              <li>
                <strong>Regular cost retrospectives.</strong> Monthly review
                of top cost drivers, with ownership assigned and improvement
                targets set. Costs that no one reviews tend to grow.
              </li>
            </ul>
            <p>
              The goal is not to minimize cost at the expense of reliability
              -- it is to eliminate cost that produces no business value.
              A platform that is 30% cheaper and equally reliable is a better
              platform, not a worse one.
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
