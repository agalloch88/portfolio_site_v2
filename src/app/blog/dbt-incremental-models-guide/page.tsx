import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs | Ryan Kirsch",
  description:
    "A deep dive into dbt incremental model strategies: append, merge, delete+insert, insert_overwrite. When to use each, how to handle late-arriving data, and the common mistakes that cause silent data quality issues.",
  openGraph: {
    title:
      "dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs",
    description:
      "A deep dive into dbt incremental model strategies: append, merge, delete+insert, insert_overwrite. When to use each, how to handle late-arriving data, and the common mistakes that cause silent data quality issues.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-incremental-models-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs",
    description:
      "A deep dive into dbt incremental model strategies: append, merge, delete+insert, insert_overwrite. When to use each, how to handle late-arriving data, and the common mistakes that cause silent data quality issues.",
  },
  alternates: { canonical: "/blog/dbt-incremental-models-guide" },
};

export default function DbtIncrementalPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dbt-incremental-models-guide"
  );
  const postTitle = encodeURIComponent(
    "dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs"
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Blog
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              dbt
            </span>
            <span className="text-sm text-gray-500">January 11, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Incremental models are where most dbt projects start to get complicated. The basic pattern is simple. The edge cases are not. Here is what you actually need to know.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The transition from table to incremental model is often driven by a single trigger: the full refresh takes too long. A model that scans 500 million rows every morning at 6 AM stops being acceptable when the data warehouse bill arrives. Incremental models solve this by processing only new or changed data. They also introduce a new category of bugs that table models never have.
          </p>
          <p>
            This post covers how incremental models actually work, the four main strategies and their tradeoffs, the filtering logic that determines what counts as &quot;new,&quot; and the common mistakes that cause silent data quality issues.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            How Incremental Models Work
          </h2>
          <p>
            On the first run, a dbt incremental model behaves like a table model: it runs the full query and materializes the result. On subsequent runs, dbt adds a filter to your SQL using the <code>is_incremental()</code> macro, processes only the filtered rows, and merges them into the existing table.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- models/fct_events.sql
{{
  config(
    materialized='incremental',
    unique_key='event_id',
    incremental_strategy='merge'
  )
}}

SELECT
  event_id,
  user_id,
  event_type,
  event_timestamp,
  properties
FROM {{ source('raw', 'events') }}

{% if is_incremental() %}
  WHERE event_timestamp >= (
    SELECT MAX(event_timestamp) - INTERVAL '1 hour'
    FROM {{ this }}
  )
{% endif %}`}
          </pre>
          <p>
            The <code>{"{{ this }}"}</code> reference points to the existing incremental table, which is how you query it to determine the latest processed timestamp. The overlap window (1 hour in this example) handles late-arriving data by reprocessing a recent window rather than assuming events arrive in strict order.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Four Incremental Strategies
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            Append
          </h3>
          <p>
            The append strategy inserts new rows without checking for duplicates or updates. It is the simplest and fastest strategy, and it is appropriate only when your data is truly immutable and append-only.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`{{
  config(
    materialized='incremental',
    incremental_strategy='append'
  )
}}`}
          </pre>
          <p>
            Use append for: event streams where events never change after ingestion, log tables where each row is a new entry, and time-series data with no correction mechanism. Do not use append if your source data can send updated versions of existing records. You will end up with duplicates that are difficult to detect and expensive to fix.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            Merge
          </h3>
          <p>
            The merge strategy uses a SQL MERGE statement (or equivalent) to upsert rows. Rows matching the <code>unique_key</code> are updated; rows without a match are inserted. This is the most common strategy for fact tables that can receive updates.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`{{
  config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge'
  )
}}`}
          </pre>
          <p>
            Merge is appropriate for: order tables where order status changes over time, any entity that can be modified after creation, and fact tables with a clear natural key. The performance cost of merge is higher than append because the database must scan for matching keys. For very large tables, consider whether a delete+insert pattern on partitions is more efficient.
          </p>
          <p>
            A common mistake with merge is using a composite key as the <code>unique_key</code> by passing a list of column names. This works in dbt, but the merge predicate becomes a multi-column join, which can be slow if those columns are not indexed or clustered.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            Delete+Insert
          </h3>
          <p>
            The delete+insert strategy deletes all existing rows matching the <code>unique_key</code> and then inserts the new rows. It is semantically equivalent to merge but can be faster on some platforms (particularly BigQuery) because it avoids the row-level scan that merge requires.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`{{
  config(
    materialized='incremental',
    unique_key='event_id',
    incremental_strategy='delete+insert'
  )
}}`}
          </pre>
          <p>
            Use delete+insert when you know the scope of what needs to change (a date partition, for example) and when merge performance is a bottleneck. Be aware that delete+insert is not atomic on all platforms: if the insert fails after the delete, you have a gap. In Snowflake, this is handled within a transaction. In BigQuery, verify atomicity guarantees for your use case.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            Insert Overwrite
          </h3>
          <p>
            Insert overwrite replaces entire partitions rather than individual rows. It is the most performant option for partitioned tables on platforms like BigQuery, Spark, and Databricks, because it avoids row-level comparisons entirely.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`{{
  config(
    materialized='incremental',
    incremental_strategy='insert_overwrite',
    partition_by={
      "field": "event_date",
      "data_type": "date"
    }
  )
}}`}
          </pre>
          <p>
            Insert overwrite is ideal when your incremental filter aligns cleanly with your partitioning scheme. If you process data for the last 3 days, those 3 partitions get fully replaced. It handles late-arriving data naturally: just include all affected partitions in your filter window, and they get recomputed correctly.
          </p>
          <p>
            The limitation of insert overwrite is that it only works with partitioned tables, and your filter window must align with your partition granularity. If your partition is by date but your late-arriving data can arrive up to 7 days late, you must include a 7-day lookback window, which means reprocessing 7 partitions on every run.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Late-Arriving Data Problem
          </h2>
          <p>
            The most dangerous assumption in an incremental model is that events arrive in order. In practice, events can arrive late due to mobile devices coming back online, event collection pipeline delays, source system batch exports, and timezone handling errors.
          </p>
          <p>
            If your filter is strictly <code>WHERE event_timestamp &gt;= MAX(event_timestamp)</code>, a late-arriving event from yesterday will be missed permanently. It arrived after you last processed that time range, and your filter will never include it again.
          </p>
          <p>
            The standard mitigation is an overlap window: process the last N hours or days even on incremental runs, not just the new records. The size of the window depends on your late arrival SLA.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`{% if is_incremental() %}
  -- 3-day lookback handles late-arriving events
  WHERE event_date >= (
    SELECT MAX(event_date) - INTERVAL '3 days'
    FROM {{ this }}
  )
{% endif %}`}
          </pre>
          <p>
            The tradeoff is performance: a larger lookback window means more data scanned on every run. Monitor your actual late arrival distribution in production and size the window accordingly. A 72-hour lookback that covers 99.9% of late arrivals is usually worth the cost.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Full Refresh Strategy
          </h2>
          <p>
            Every incremental model needs a documented full refresh strategy. Two scenarios require it: when the model logic changes (you need to recompute historical data with the new logic), and when you discover that incremental runs have accumulated errors (duplicates, missed records, wrong calculations in a previous version).
          </p>
          <p>
            Running <code>dbt run --full-refresh --select your_model</code> drops the existing table and recomputes from scratch. This should be a planned operation with a defined runbook:
          </p>
          <p>
            How long does a full refresh take? For a large table, it might be hours. During that window, downstream models either need to be blocked or need to tolerate stale data. Does the full refresh affect multiple dependent models? Map the dependency graph before scheduling it. Do you need to coordinate with data consumers? If a BI dashboard runs off this model, its data will be unavailable or wrong during the rebuild.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Testing Incremental Models
          </h2>
          <p>
            Standard dbt schema tests (not_null, unique, accepted_values) run on the full table after each incremental run. This is correct behavior, but it means your unique test on a 500M row table runs every time. Consider these approaches:
          </p>
          <p>
            Use dbt test --store-failures to write failing rows to a test failures table rather than blocking the run. This lets you detect issues without halting the pipeline. Configure tests with a warn severity on incremental models and error severity on a separate validation model that runs less frequently.
          </p>
          <p>
            Add a reconciliation test: after each incremental run, compare a row count or aggregate from your incremental model against the source. A meaningful discrepancy indicates that your filter is missing records.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- models/tests/reconcile_fct_events.sql
-- Alert if incremental model row count deviates >1% from source
SELECT
  ABS(source_count - incremental_count) / source_count AS deviation
FROM (
  SELECT COUNT(*) AS source_count FROM {{ source('raw', 'events') }}
       WHERE event_date = CURRENT_DATE - 1
) s
CROSS JOIN (
  SELECT COUNT(*) AS incremental_count FROM {{ ref('fct_events') }}
       WHERE event_date = CURRENT_DATE - 1
) i
WHERE ABS(source_count - incremental_count) / source_count > 0.01`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Common Mistakes
          </h2>
          <p>
            <strong>Not including the overlap window.</strong> Strict max timestamp filters silently miss late-arriving data. Add at least a few hours of lookback.
          </p>
          <p>
            <strong>Using the wrong unique_key.</strong> If your unique_key does not actually identify unique records in your source, merge will silently skip or overwrite rows incorrectly. Validate uniqueness in a test before trusting the incremental logic.
          </p>
          <p>
            <strong>Not testing the first run.</strong> Incremental models behave differently on first run vs. subsequent runs. Test both paths in development.
          </p>
          <p>
            <strong>Forgetting downstream dependencies during full refreshes.</strong> A full refresh on a large staging model can break downstream incremental models that reference it via <code>{"{{ ref() }}"}</code>.
          </p>
          <p>
            <strong>Choosing append when merge is needed.</strong> If you discover that your append model has duplicates after six months of production use, the remediation is painful. Think carefully about whether your source data can ever send updated versions of existing records.
          </p>
          <p>
            Incremental models are one of the highest-leverage patterns in dbt. They are also one of the easiest places to introduce subtle, persistent data quality issues. The discipline is in treating the filter logic with the same rigor you apply to the transformation logic itself.
          </p>
        </div>

        {/* Share section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
