import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "dbt Best Practices for Senior Data Engineers: Beyond the Tutorial | Ryan Kirsch",
  description:
    "The dbt patterns that separate senior engineers from analysts who learned dbt last year. Project structure, incremental model strategy, data contracts, testing philosophy, and the meta-skills that make a dbt project maintainable at scale.",
  openGraph: {
    title:
      "dbt Best Practices for Senior Data Engineers: Beyond the Tutorial",
    description:
      "The dbt patterns that separate senior engineers from analysts who learned dbt last year. Project structure, incremental models, data contracts, testing philosophy, and the meta-skills that make a dbt project maintainable at scale.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-best-practices-senior-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "dbt Best Practices for Senior Data Engineers: Beyond the Tutorial",
    description:
      "The dbt patterns that separate senior engineers from analysts who learned dbt last year. Project structure, incremental models, data contracts, testing philosophy, and the meta-skills that make a dbt project maintainable at scale.",
  },
  alternates: { canonical: "/blog/dbt-best-practices-senior-engineers" },
};

export default function DbtBestPracticesPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dbt-best-practices-senior-engineers"
  );
  const postTitle = encodeURIComponent(
    "dbt Best Practices for Senior Data Engineers: Beyond the Tutorial"
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
            dbt Best Practices for Senior Data Engineers: Beyond the Tutorial
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · November 30, 2025 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            The dbt getting-started guide teaches you to write a model, run it,
            and test it. That covers about 20% of what a senior engineer needs
            to know. The other 80% -- project architecture, incremental
            strategy, cross-team contracts, and the meta-skills that keep a
            project maintainable as it scales -- is learned the hard way.
            Here is the short path.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Project Structure: The Decision That Compounds
            </h2>
            <p>
              The structure you choose in week one compounds into either
              clarity or chaos by month six. The standard dbt project layout
              works well if you apply it deliberately:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`models/
  staging/          # One-to-one with source tables. Minimal transforms.
    salesforce/
      stg_sf_accounts.sql
      stg_sf_opportunities.sql
    stripe/
      stg_stripe_charges.sql
  intermediate/     # Business logic that isn't ready for gold.
    int_revenue_attribution.sql
    int_customer_lifecycle.sql
  marts/            # Business-facing. Organized by domain.
    finance/
      fct_monthly_revenue.sql
      dim_customers.sql
    product/
      fct_user_activity.sql
      fct_feature_adoption.sql
  core/             # Shared dimensions used across marts.
    dim_date.sql
    dim_geography.sql`}</code>
            </pre>
            <p>
              The staging layer is the most frequently violated. Staging models
              should do exactly four things: rename columns to consistent
              conventions, cast types, add a surrogate key if needed, and
              deduplicate. If your staging model has a JOIN or a business
              condition filter, you have promoted business logic into the
              source layer, and now it is load-bearing in ways you will regret.
            </p>
            <p>
              The intermediate layer is where senior engineers earn their keep.
              Most teams skip it entirely, pushing everything from staging
              directly into marts. The result is mart models with 8 CTEs and
              150 lines of SQL that no one wants to touch. Intermediate models
              are the place for shared business logic -- revenue attribution
              rules, customer lifecycle calculations, funnel definitions --
              that multiple marts consume. They also make the mart models
              readable.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Incremental Models: Getting the Strategy Right
            </h2>
            <p>
              Incremental models are the source of most dbt production
              incidents. The configuration looks simple; the edge cases are
              not.
            </p>
            <p>
              The three strategies and when to use each:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Strategy 1: append_only
-- Use when: immutable event data (clicks, logs, impressions)
-- Risk: will duplicate rows if run twice in the same window
{{ config(
    materialized='incremental',
    incremental_strategy='append',
    unique_key=none,
) }}

-- Strategy 2: delete+insert (default on most warehouses)
-- Use when: events that can update (order status changes, etc.)
-- Risk: full partition scan on large tables
{{ config(
    materialized='incremental',
    incremental_strategy='delete+insert',
    unique_key='order_id',
    partition_by={'field': 'order_date', 'data_type': 'date'},
) }}

-- Strategy 3: merge
-- Use when: slowly changing dimensions, upsert patterns
-- Risk: requires warehouse support; most expensive per row
{{ config(
    materialized='incremental',
    incremental_strategy='merge',
    unique_key='customer_id',
    merge_update_columns=['status', 'updated_at', 'email'],
) }}`}</code>
            </pre>
            <p>
              The <code>unique_key</code> setting is the most commonly
              misconfigured. When you set a unique_key, dbt issues a DELETE
              for matching records before inserting. On a table with 500M rows
              and no partition filter, this is a full-table scan. Always pair
              a unique_key with a partition filter or an incremental predicate
              that limits the DELETE scope:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Good: limit the incremental window to recent partitions
{% if is_incremental() %}
WHERE order_date >= (
    SELECT DATE_SUB(MAX(order_date), INTERVAL 3 DAY)
    FROM {{ this }}
)
{% endif %}

-- Why 3 days instead of 1: late-arriving data buffer.
-- If your source delivers late events up to 48 hours after
-- the event time, a 1-day lookback will miss them.
-- Size the window to your actual late-arrival SLA.`}</code>
            </pre>
            <p>
              On schema_change: set it to <code>sync_all_columns</code> in
              development and <code>fail</code> in production. In production,
              you want to know when upstream source schemas change, not silently
              adapt to them.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Testing Philosophy: What to Test and Why
            </h2>
            <p>
              Most dbt projects under-test or test the wrong things. The goal
              of dbt tests is not to achieve coverage. It is to catch the
              specific failures that would reach stakeholders undetected.
            </p>
            <p>
              Tests by layer and purpose:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Staging layer: test the source contract
# Goal: catch upstream schema changes early
models:
  - name: stg_stripe_charges
    columns:
      - name: charge_id
        tests: [unique, not_null]
      - name: amount_cents
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0"
      - name: status
        tests:
          - accepted_values:
              values: ['succeeded', 'pending', 'failed', 'refunded']

# Mart layer: test business logic
# Goal: catch transformation bugs and business rule violations
models:
  - name: fct_monthly_revenue
    tests:
      # Total revenue should never decrease month-over-month by >50%
      # (catches accidental data loss in incremental)
      - dbt_utils.expression_is_true:
          expression: "revenue_usd >= 0"
    columns:
      - name: month
        tests: [unique, not_null]
      - name: revenue_usd
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: "> 0"`}</code>
            </pre>
            <p>
              Avoid the trap of testing everything with <code>not_null</code>{" "}
              and <code>unique</code>. Those are useful, but they tell you
              nothing about correctness. A row count comparison between source
              and staging -- a reconciliation test -- catches far more real
              bugs:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- tests/reconcile_staging_orders.sql
-- Fail if staging drops >0.1% of source rows
SELECT
    source_count,
    staging_count,
    ABS(source_count - staging_count) / NULLIF(source_count, 0) AS drop_rate
FROM (
    SELECT COUNT(*) AS source_count FROM {{ source('raw', 'orders') }}
) s
CROSS JOIN (
    SELECT COUNT(*) AS staging_count FROM {{ ref('stg_orders') }}
) t
WHERE drop_rate > 0.001`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Data Contracts and Cross-Team Governance
            </h2>
            <p>
              In a single-team dbt project, a model is a model. In a
              multi-team organization, a model is an API. The difference
              matters when another team builds a dashboard or a downstream
              pipeline on your mart models -- any breaking change you make
              silently breaks their work.
            </p>
            <p>
              dbt 1.5+ introduced contracts as a first-class feature:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/marts/finance/fct_monthly_revenue.yml
models:
  - name: fct_monthly_revenue
    config:
      contract:
        enforced: true  # dbt will error if actual schema != declared schema
    columns:
      - name: month
        data_type: date
        constraints:
          - type: not_null
          - type: unique
      - name: revenue_usd
        data_type: numeric
        constraints:
          - type: not_null
      - name: order_count
        data_type: integer
        constraints:
          - type: not_null`}</code>
            </pre>
            <p>
              With contract enforcement on, dbt checks at compile time that
              the SQL produces exactly the declared column names and types.
              If you rename a column or change a type, the run fails before
              anything reaches the warehouse. This is the dbt equivalent of
              typed function signatures -- your mart model cannot silently
              break its consumers.
            </p>
            <p>
              For public models that other teams depend on, also set the
              access level:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# dbt_project.yml
models:
  myproject:
    staging:
      +access: private   # staging models: internal only
    intermediate:
      +access: private   # intermediate: internal only
    marts:
      +access: public    # marts: cross-team consumption OK
      finance:
        +access: public`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Performance Patterns Worth Knowing
            </h2>
            <p>
              dbt is a SQL orchestrator, not a query optimizer. The
              performance work still happens in your warehouse SQL. But there
              are dbt-specific patterns that significantly affect runtime:
            </p>
            <p>
              <strong>Avoid ref() chains that force sequential runs.</strong>{" "}
              If model C depends on B which depends on A, they run in series.
              Consider whether B and C can both depend directly on A if the
              intermediate logic is simple. Shorter chains parallelize better.
            </p>
            <p>
              <strong>Use ephemeral models sparingly.</strong> Ephemeral
              models are inlined as CTEs into the models that reference them.
              This is convenient but creates deeply nested SQL that is hard
              to debug. Prefer views for shared staging logic that does not
              need to be materialized.
            </p>
            <p>
              <strong>Pre-hook and post-hook for warehouse optimization:</strong>
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Snowflake: cluster the table after building
{{ config(
    materialized='table',
    post_hook=[
        "ALTER TABLE {{ this }} CLUSTER BY (order_date, customer_id)"
    ]
) }}

# BigQuery: partition and cluster
{{ config(
    materialized='table',
    partition_by={'field': 'created_date', 'data_type': 'date'},
    cluster_by=['customer_id', 'product_id'],
) }}`}</code>
            </pre>
            <p>
              <strong>Use <code>dbt ls</code> before large runs.</strong>{" "}
              <code>dbt ls --select +model_name</code> shows you every
              upstream dependency of a model. Running this before a{" "}
              <code>dbt run --select +model_name</code> in production tells
              you exactly what will execute. No surprises.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Meta-Skills: What Separates Senior from Mid
            </h2>
            <p>
              Technical dbt knowledge is table stakes at the senior level.
              The differentiation comes from three meta-skills:
            </p>
            <p>
              <strong>Naming discipline.</strong> Model names communicate
              purpose. <code>fct_</code> prefix means a fact table (one row
              per event). <code>dim_</code> means a dimension (one row per
              entity). <code>int_</code> means intermediate business logic.
              <code>stg_</code> means a source-aligned staging model. Enforce
              these conventions in code review, not just documentation. A model
              named <code>customer_data</code> in a production dbt project is
              a maintenance problem waiting to happen.
            </p>
            <p>
              <strong>Deprecation strategy.</strong> Old models accumulate.
              A mart model that used to power a dashboard no one uses is still
              running, still costing compute, still confusing new team members
              who think it matters. Mark models with <code>meta:</code> flags
              in their YAML when they are deprecated candidates. Build a
              quarterly review into your team process. Delete things.
            </p>
            <p>
              <strong>Documentation as a forcing function.</strong> Writing
              a model description forces you to articulate what the model
              actually does. If you cannot write two clear sentences about
              what a model produces and who uses it, the model is probably
              doing too much. Use the documentation requirement as a design
              review, not just a compliance checkbox.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Good documentation forces clarity
models:
  - name: fct_monthly_revenue
    description: >
      Monthly revenue aggregated from delivered orders.
      One row per calendar month. Excludes refunded and
      cancelled orders. Source of truth for the Finance
      team's MRR dashboard and board reporting.
      Owner: data-platform@company.com
    meta:
      owner: data-platform
      consumers: [finance-dashboard, board-reporting-pipeline]
      sla: "updated by 6am on the 1st of each month"
      deprecated: false`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Part No Tutorial Covers
            </h2>
            <p>
              The hardest part of senior dbt work is not the SQL or the
              configuration. It is the organizational work: establishing
              conventions before the project grows past the point where
              everyone agrees, getting engineering and analytics to share
              ownership of the same models, and convincing stakeholders that
              a slow build with proper testing is faster than a fast build
              that breaks every time upstream changes.
            </p>
            <p>
              dbt is a coordination tool as much as a transformation tool.
              The engineers who get the most out of it are the ones who
              treat model design as an API design problem -- thinking about
              downstream consumers, change management, and long-term
              maintainability before writing the first SELECT.
            </p>
            <p>
              The SQL is the easy part. Getting the team to agree on what
              &ldquo;monthly revenue&rdquo; means and encoding that definition in a
              contract that does not break silently -- that is the senior
              engineer&apos;s actual job.
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
