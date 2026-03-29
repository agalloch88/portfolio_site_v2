import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Snowflake Performance Optimization: The Queries, Warehouses, and Patterns That Actually Move the Needle | Ryan Kirsch",
  description:
    "A practical guide to Snowflake performance optimization. Clustering keys, query pruning, warehouse sizing, result caching, and the specific SQL patterns that cause the most expensive scans in production.",
  openGraph: {
    title:
      "Snowflake Performance Optimization: The Queries, Warehouses, and Patterns That Actually Move the Needle",
    description:
      "Practical Snowflake optimization: clustering keys, query pruning, warehouse sizing, result caching, and the SQL anti-patterns that cause expensive scans in production.",
    type: "article",
    url: "https://ryankirsch.dev/blog/snowflake-performance-optimization",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Snowflake Performance Optimization: The Queries, Warehouses, and Patterns That Actually Move the Needle",
    description:
      "Practical Snowflake optimization: clustering keys, query pruning, warehouse sizing, result caching, and the SQL anti-patterns that cause expensive scans in production.",
  },
  alternates: { canonical: "/blog/snowflake-performance-optimization" },
};

export default function SnowflakePerformancePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/snowflake-performance-optimization"
  );
  const postTitle = encodeURIComponent(
    "Snowflake Performance Optimization: The Queries, Warehouses, and Patterns That Actually Move the Needle"
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
            Snowflake Performance Optimization: The Queries, Warehouses, and
            Patterns That Actually Move the Needle
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 7, 2025 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Snowflake is elastic by design -- you can throw more compute at
            most performance problems. But the right answer is rarely
            &ldquo;bigger warehouse.&rdquo; Most slow Snowflake queries are slow because
            of how they scan data, not because of compute limits. This guide
            covers the optimizations that actually matter, in order of impact.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How Snowflake Stores Data (and Why It Matters for Performance)
            </h2>
            <p>
              Snowflake stores data in micro-partitions: compressed columnar
              files of roughly 50-500MB each. Every micro-partition has
              metadata that records the min and max values for each column.
              When you run a query with a WHERE clause, Snowflake uses this
              metadata to prune partitions -- it skips any partition whose
              column range cannot contain the values you are filtering for.
            </p>
            <p>
              This is called partition pruning, and it is the single most
              important performance concept in Snowflake. A query that scans
              10% of partitions is not 10x faster than one that scans
              everything -- it is often 50-100x faster because it reads far
              less data from storage and requires much less compute.
            </p>
            <p>
              The implication: queries that filter on high-cardinality columns
              with poor natural ordering get poor pruning, and queries that
              filter on naturally sorted columns get excellent pruning. A table
              ordered by <code>created_at</code> will have strong pruning on
              date range queries because recent rows land in recent partitions.
              A table ordered by <code>user_id</code> will have poor pruning
              on date range queries because users are scattered across all
              partitions.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Clustering Keys: When to Use Them and When Not To
            </h2>
            <p>
              Snowflake clustering keys let you explicitly control how data is
              sorted across micro-partitions. When you define a clustering key,
              Snowflake automatically re-sorts new data and periodically
              re-clusters the table to maintain good ordering.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Add a clustering key on a large fact table
ALTER TABLE analytics.fct_orders
CLUSTER BY (order_date, customer_segment);

-- Check clustering depth (lower = better, <3 is well-clustered)
SELECT SYSTEM$CLUSTERING_INFORMATION(
    'analytics.fct_orders',
    '(order_date, customer_segment)'
)::variant:average_depth AS avg_depth;

-- Monitor clustering over time
SELECT *
FROM TABLE(INFORMATION_SCHEMA.AUTOMATIC_CLUSTERING_HISTORY(
    TABLE_NAME => 'analytics.fct_orders',
    DATE_RANGE_START => DATEADD('day', -7, CURRENT_DATE)
));`}</code>
            </pre>
            <p>
              Clustering keys make sense when:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The table is very large (100GB+) and frequently queried</li>
              <li>Queries consistently filter on a small set of columns</li>
              <li>
                Those columns have poor natural clustering (e.g., a UUID
                primary key loaded in random order)
              </li>
            </ul>
            <p>
              Clustering keys do NOT make sense when:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The table is small (Snowflake scans small tables fast regardless)</li>
              <li>Queries filter on many different column combinations</li>
              <li>
                The data is already naturally ordered (e.g., a table appended
                by <code>created_at</code> already clusters well on date)
              </li>
            </ul>
            <p>
              Automatic clustering costs Snowflake credits. Check the{" "}
              <code>AUTOMATIC_CLUSTERING_HISTORY</code> view to confirm the
              cost is justified by the query performance gain.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Query Anti-Patterns That Kill Performance
            </h2>
            <p>
              Most slow Snowflake queries share one of five anti-patterns:
            </p>
            <p>
              <strong>1. Functions on filter columns.</strong> Wrapping a
              column in a function prevents partition pruning because Snowflake
              cannot evaluate the function against stored min/max metadata.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- BAD: function prevents pruning
SELECT * FROM orders
WHERE DATE_TRUNC('month', order_date) = '2026-03-01';

-- GOOD: range filter allows pruning
SELECT * FROM orders
WHERE order_date >= '2026-03-01'
  AND order_date < '2026-04-01';`}</code>
            </pre>
            <p>
              <strong>2. SELECT * on wide tables.</strong> Snowflake is
              columnar. Reading 50 columns when you need 5 means reading 10x
              more data.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- BAD: reads all 60 columns
SELECT * FROM orders WHERE order_date = CURRENT_DATE;

-- GOOD: reads only the 4 columns needed
SELECT order_id, customer_id, amount_usd, status
FROM orders
WHERE order_date = CURRENT_DATE;`}</code>
            </pre>
            <p>
              <strong>3. DISTINCT where it is not needed.</strong> DISTINCT
              forces a sort and deduplication of the entire result set.
              If uniqueness is already guaranteed by the table design or
              the JOIN logic, remove it.
            </p>
            <p>
              <strong>4. Unbounded CTEs referenced multiple times.</strong>{" "}
              Snowflake does not materialize CTEs by default -- it re-evaluates
              them each time they are referenced. A CTE scanning 500M rows
              referenced 3 times in a query scans 1.5B rows.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- BAD: large_cte scanned twice
WITH large_cte AS (
    SELECT * FROM events WHERE event_date >= '2026-01-01'
)
SELECT a.user_id, b.event_count
FROM large_cte a
JOIN (SELECT user_id, COUNT(*) AS event_count FROM large_cte GROUP BY 1) b
  ON a.user_id = b.user_id;

-- GOOD: materialize to a temp table first
CREATE OR REPLACE TEMPORARY TABLE filtered_events AS
SELECT * FROM events WHERE event_date >= '2026-01-01';

-- Then reference filtered_events twice without rescanning`}</code>
            </pre>
            <p>
              <strong>5. Exploding JOINs.</strong> A JOIN that unexpectedly
              multiplies rows (many-to-many without deduplication) forces
              Snowflake to process a result set far larger than either input.
              Always verify join cardinality with a COUNT before running
              expensive downstream aggregations.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Result Caching and Query Caching
            </h2>
            <p>
              Snowflake has two caching layers that are often overlooked:
            </p>
            <p>
              <strong>Result cache</strong>: If the exact same query runs
              twice within 24 hours and the underlying data has not changed,
              Snowflake returns the cached result instantly with zero compute
              cost. This works for identical query text -- even a comment
              change breaks the cache. Design dashboard queries to be
              deterministic and avoid session-specific variables that
              prevent caching.
            </p>
            <p>
              <strong>Metadata cache</strong>: Snowflake caches micro-partition
              metadata in memory on each warehouse. The first query after a
              warehouse cold start is slower because the metadata must be
              loaded. Queries 2+ benefit from warm metadata. This is why
              keeping a warehouse running for frequently-accessed tables
              improves p50 latency even when the result cache is not hit.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Check if a query hit the result cache
SELECT 
    query_id,
    query_text,
    execution_status,
    -- These are 0 for result cache hits
    bytes_scanned,
    partitions_scanned,
    -- This is 0 for result cache hits
    credits_used_cloud_services
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_USER(
    USER_NAME => CURRENT_USER(),
    RESULT_LIMIT => 10
))
ORDER BY start_time DESC;`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Warehouse Sizing: The Right Way to Think About It
            </h2>
            <p>
              Snowflake virtual warehouses scale by doubling: XS, S, M, L, XL,
              2XL, 3XL, 4XL. Each size tier doubles the compute and roughly
              halves the execution time -- but also doubles the credit cost.
              The break-even is straightforward: if doubling the warehouse
              size cuts execution time in half, cost is identical. If it cuts
              execution time by 30%, you pay 2x for 30% improvement.
            </p>
            <p>
              The sizing rules that hold in practice:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Analytical queries with many concurrent users:</strong>{" "}
                Scale out with multiple warehouses rather than a single large
                one. Query concurrency, not compute, is often the bottleneck.
              </li>
              <li>
                <strong>ETL/ELT jobs (dbt, Dagster):</strong> Size to the
                largest model in your run. Most transformations are IO-bound,
                not compute-bound, so M or L is sufficient unless you are
                running complex window functions on billions of rows.
              </li>
              <li>
                <strong>Ad hoc queries:</strong> XS or S with auto-suspend at
                1-5 minutes. These should hit the result cache frequently, and
                when they do not, they are one-off so cost is low.
              </li>
              <li>
                <strong>Large batch loads:</strong> Larger warehouses improve
                COPY INTO throughput almost linearly up to 2XL. For one-time
                historical loads, the credit cost of a short 2XL run is often
                less than a long S run.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Using Query Profile to Diagnose Slow Queries
            </h2>
            <p>
              Snowflake&apos;s Query Profile is the most useful tool for
              diagnosis. For any query in the query history, you can see a
              visual execution plan with time and byte counts per operator.
            </p>
            <p>
              The patterns that show up most often in slow query profiles:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>TableScan operator uses high % of time:</strong>{" "}
                Poor pruning. Check the &ldquo;Partitions scanned&rdquo; vs &ldquo;Partitions
                total&rdquo; ratio. If it is above 50%, the query is not pruning
                well and a clustering key or query rewrite is needed.
              </li>
              <li>
                <strong>Sort operator is large:</strong> Often caused by
                window functions, ORDER BY on large intermediate results, or
                DISTINCT. Consider pushing the sort earlier or materializing
                intermediate results.
              </li>
              <li>
                <strong>Join is very large:</strong> Verify cardinality.
                An unexpected many-to-many join is usually a missing dedup
                step, not a compute problem.
              </li>
              <li>
                <strong>Spillage to local or remote disk:</strong> The query
                exceeds warehouse memory. Either the warehouse is undersized
                for this specific query, or the query is producing an
                intermediate result that can be reduced by filtering earlier.
              </li>
            </ul>
            <p>
              The diagnostic workflow: run the query, open Query Profile,
              identify the largest operator by execution time, read the
              operator stats, apply a targeted fix, re-run. One specific
              change per iteration. This is faster than guessing.
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
