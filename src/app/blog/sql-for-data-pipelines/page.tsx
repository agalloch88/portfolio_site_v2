import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Writing SQL for Data Pipelines: Patterns That Scale | Ryan Kirsch",
  description:
    "SQL patterns that make data pipelines more reliable, readable, and cost-efficient: CTEs for layered logic, window functions for sessionization and SCD, idempotency techniques, and the anti-patterns that cause silent data quality failures.",
  openGraph: {
    title: "Writing SQL for Data Pipelines: Patterns That Scale",
    description:
      "CTE layering, window functions, idempotency, and the SQL anti-patterns that cause silent data quality failures in production pipelines.",
    type: "article",
    url: "https://ryankirsch.dev/blog/sql-for-data-pipelines",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing SQL for Data Pipelines: Patterns That Scale",
    description:
      "SQL patterns that make data pipelines more reliable, readable, and cost-efficient.",
  },
  alternates: { canonical: "/blog/sql-for-data-pipelines" },
};

export default function SQLPipelinesPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/sql-for-data-pipelines"
  );
  const postTitle = encodeURIComponent(
    "Writing SQL for Data Pipelines: Patterns That Scale"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">←</span>
          <Link href="/" className="ml-2 text-electricBlue hover:text-white transition-colors">
            Home
          </Link>
          <span className="mx-2 text-steel">/</span>
          <Link href="/blog" className="text-electricBlue hover:text-white transition-colors">
            Blog
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">Blog</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Writing SQL for Data Pipelines: Patterns That Scale
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Pipeline SQL has different constraints than analytical SQL. It runs on a schedule, gets called
            with different inputs over time, and its failures are often silent. The patterns in this post
            are not about writing clever queries. They are about writing SQL that stays correct under the
            messy conditions production data actually creates.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">CTEs as Layers, Not Just Readability</h2>
            <p>
              Common table expressions improve readability, but in pipeline SQL they serve a more important
              function: they create explicit transformation layers that you can test, inspect, and reason about
              independently. A model that does everything in one monolithic query is hard to debug and impossible
              to test at the unit level.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Layer 1: clean the raw source data
with raw as (
    select
        id,
        lower(trim(email)) as email,
        cast(created_at as timestamp) as created_at,
        amount
    from raw.transactions
    where id is not null  -- explicit null guard
),

-- Layer 2: business logic
enriched as (
    select
        t.id,
        t.email,
        t.created_at,
        t.amount,
        u.tier as customer_tier,
        case
            when t.amount >= 1000 then 'high_value'
            when t.amount >= 100  then 'standard'
            else 'micro'
        end as transaction_category
    from raw t
    left join dim_customers u on t.email = u.email
),

-- Layer 3: final aggregation
final as (
    select
        date_trunc('day', created_at) as transaction_date,
        customer_tier,
        transaction_category,
        count(*) as transaction_count,
        sum(amount) as total_amount
    from enriched
    group by 1, 2, 3
)

select * from final`}</code>
            </pre>
            <p>
              Each CTE layer does one thing. If the aggregation numbers look wrong, you can query the
              <code>enriched</code> layer directly. If the cleaning step is producing unexpected results,
              you can check <code>raw</code>. The layering is not aesthetic; it is a debugging affordance
              built into the query structure.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Window Functions for Sessionization</h2>
            <p>
              Sessionization is one of the most common analytical challenges in pipeline SQL, and it is also
              the problem that trips up engineers who understand window functions syntactically but not
              conceptually. The goal is to group consecutive events into sessions with a gap threshold.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`with events_with_gaps as (
    select
        user_id,
        event_time,
        -- flag when a new session starts (gap > 30 minutes)
        case
            when event_time - lag(event_time) over (
                partition by user_id
                order by event_time
            ) > interval '30 minutes'
            then 1
            else 0
        end as is_new_session
    from user_events
),

sessions_numbered as (
    select
        user_id,
        event_time,
        -- cumulative sum of new_session flags = session number per user
        sum(is_new_session) over (
            partition by user_id
            order by event_time
            rows unbounded preceding
        ) as session_number
    from events_with_gaps
)

select
    user_id,
    session_number,
    min(event_time) as session_start,
    max(event_time) as session_end,
    count(*) as event_count,
    datediff('minute', min(event_time), max(event_time)) as session_duration_minutes
from sessions_numbered
group by 1, 2`}</code>
            </pre>
            <p>
              The key insight is using <code>LAG</code> to detect gaps, then <code>SUM</code> as a running
              counter of session boundaries. This is more robust than approaches that try to assign sessions
              using a single pass.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Slowly Changing Dimensions with Window Functions</h2>
            <p>
              Type 2 SCD tracking (keeping full history of attribute changes) is another place where window
              functions are the right tool. The pattern builds valid-from and valid-to date ranges from
              a log of change events:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`with changes as (
    select
        customer_id,
        status,
        changed_at,
        lead(changed_at) over (
            partition by customer_id
            order by changed_at
        ) as next_changed_at
    from customer_status_log
)

select
    customer_id,
    status,
    changed_at as valid_from,
    coalesce(next_changed_at, '9999-12-31'::timestamp) as valid_to,
    next_changed_at is null as is_current
from changes`}</code>
            </pre>
            <p>
              The <code>LEAD</code> function gets the start time of the next record for the same customer,
              which becomes the end time of the current record. The <code>COALESCE</code> to a far-future
              date marks currently active records without needing a separate flag or nullable end date.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Idempotent Incremental Patterns</h2>
            <p>
              An idempotent pipeline produces the same result whether it runs once or ten times. This matters
              because pipelines get retried. The standard pattern for incremental models in dbt:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- In dbt: models/orders_incremental.sql
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        on_schema_change='append_new_columns'
    )
}}

select
    order_id,
    customer_id,
    order_total,
    status,
    created_at,
    updated_at
from {{ source('raw', 'orders') }}

{% if is_incremental() %}
    -- only process records updated since last run
    -- using a 1-hour buffer for late-arriving data
    where updated_at > (
        select dateadd('hour', -1, max(updated_at))
        from {{ this }}
    )
{% endif %}`}</code>
            </pre>
            <p>
              The <code>unique_key</code> config tells dbt to merge on <code>order_id</code> rather than
              append, so a retry will update existing rows rather than duplicate them. The one-hour lookback
              buffer handles late-arriving updates that might otherwise get missed.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Anti-Patterns That Cause Silent Failures</h2>
            <p>
              These are the SQL patterns that do not cause immediate errors but produce wrong answers quietly:
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Fan-out joins.</strong> Joining a many-to-many relationship without aggregating first
                multiplies rows silently. Always verify row counts before and after joins in pipeline SQL.
                A query that doubles your fact table is not noisy -- it just looks like more data.
              </li>
              <li>
                <strong>NULL handling assumptions.</strong>{" "}
                <code>WHERE status != &apos;cancelled&apos;</code> excludes NULLs because NULL comparisons
                return NULL, not TRUE. If cancelled rows sometimes have a NULL status, this filter silently
                misclassifies them. Explicit null handling is not defensive overhead; it is correctness.
              </li>
              <li>
                <strong>Implicit type coercions.</strong> Joining a VARCHAR user ID to an INTEGER user ID
                may work in some warehouses and produce wrong results or errors in others. Cast explicitly
                at the boundary between source and staging layers.
              </li>
              <li>
                <strong>Aggregations that mask problems.</strong> A SUM that produces a plausible number
                when your join had duplicates looks correct in a dashboard until someone spots the discrepancy
                weeks later. Add intermediate row count assertions -- in dbt these are schema tests that run
                automatically on every model execution.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Partition Filtering as a Discipline</h2>
            <p>
              In cost-sensitive warehouses like Snowflake and BigQuery, partition filtering is not optional.
              A pipeline that does a full table scan when it could filter to the last 7 days is burning
              compute every run. The pattern is to push partition filters as deep as possible:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Expensive: full scan, partition filter applied late
with base as (
    select * from fact_events
),
filtered as (
    select * from base where event_date >= current_date - 7
)
select count(*) from filtered

-- Efficient: filter at the source, warehouse can prune partitions
with base as (
    select * from fact_events
    where event_date >= current_date - 7  -- partition filter here
)
select count(*) from base`}</code>
            </pre>
            <p>
              The first query reads the entire table before filtering. The second allows the query planner
              to skip all partitions before the filter date. On a large fact table this difference can be
              10x or more in both cost and query time.
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
                Senior Data Engineer with experience building production pipelines at scale.
                Works with dbt, Snowflake, and Dagster, and writes about data engineering patterns from production experience.{" "}
                <Link href="/" className="text-electricBlue hover:text-white transition-colors">
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
