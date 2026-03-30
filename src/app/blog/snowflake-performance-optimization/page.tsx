import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Snowflake Performance Optimization: Clustering, Caching, and Query Tuning | Ryan Kirsch - Data Engineer",
  description:
    "A practical guide to Snowflake performance optimization: clustering keys, automatic clustering, result and metadata caching, materialized views, query profiling with EXPLAIN, and warehouse sizing strategy.",
  openGraph: {
    title:
      "Snowflake Performance Optimization: Clustering, Caching, and Query Tuning | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to Snowflake performance optimization: clustering keys, automatic clustering, result and metadata caching, materialized views, query profiling with EXPLAIN, and warehouse sizing strategy.",
    type: "article",
    url: "https://ryankirsch.dev/blog/snowflake-performance-optimization",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Snowflake Performance Optimization: Clustering, Caching, and Query Tuning | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to Snowflake performance optimization: clustering keys, automatic clustering, result and metadata caching, materialized views, query profiling with EXPLAIN, and warehouse sizing strategy.",
  },
  alternates: { canonical: "/blog/snowflake-performance-optimization" },
};

export default function SnowflakePerformanceOptimizationPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/snowflake-performance-optimization"
  );
  const postTitle = encodeURIComponent(
    "Snowflake Performance Optimization: Clustering, Caching, and Query Tuning"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">&larr;</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="mt-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {["Snowflake", "Query Optimization", "Data Warehouse", "SQL", "Performance", "Data Engineering"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Snowflake Performance Optimization: Clustering, Caching, and Query Tuning
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Snowflake&apos;s auto-scaling and managed infrastructure make it easy to get started,
            and easy to spend too much. Throwing a larger warehouse at a slow query is the most
            common response to Snowflake performance problems, and usually the wrong one. Most
            slow queries are slow because of poor pruning, unnecessary full table scans, or
            missing caching opportunities. Fix those first. Scale warehouse size second.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Understanding Micro-Partitions
          </h2>
          <p>
            Snowflake stores table data in micro-partitions: immutable, compressed columnar files
            of 50 to 500 MB uncompressed. Each micro-partition stores the min and max value of
            every column it contains. The query optimizer uses these metadata values to prune
            micro-partitions that cannot contain rows matching a filter condition, without
            reading the actual data.
          </p>
          <p>
            This pruning is the foundation of Snowflake query performance. A query with a
            selective filter on a well-pruned column can skip 90+ percent of a table&apos;s
            micro-partitions. A query on a column with poor pruning reads everything.
            The <code>SYSTEM$CLUSTERING_INFORMATION</code> function tells you how well a table
            is clustered on a given column.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Check clustering depth (lower is better; 1.0 is perfect)
SELECT SYSTEM$CLUSTERING_INFORMATION('orders', '(created_at)');

-- Check micro-partition stats in query profile
-- After running a query, check "Partitions scanned" vs "Partitions total"
-- High ratio = poor pruning = performance opportunity

SELECT
    query_id,
    partitions_scanned,
    partitions_total,
    ROUND(partitions_scanned / NULLIF(partitions_total, 0) * 100, 1) AS pct_scanned
FROM snowflake.account_usage.query_history
WHERE query_text ILIKE '%orders%'
ORDER BY start_time DESC
LIMIT 20;`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Clustering Keys: When and How to Use Them
          </h2>
          <p>
            Natural clustering is what Snowflake provides by default: data is organized in
            micro-partitions roughly in the order it was loaded. If your table is loaded in date
            order and your queries filter by date, natural clustering is often sufficient and free.
          </p>
          <p>
            Explicit clustering keys are for tables where natural clustering has degraded due to
            DML operations (updates, deletes, merges), or where queries consistently filter on a
            column that is not correlated with load order. Set clustering keys on large tables
            (multi-terabyte) where partition pruning is materially poor.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Add a clustering key to an existing large table
ALTER TABLE orders CLUSTER BY (DATE_TRUNC('day', created_at), region);

-- Enable automatic clustering (Snowflake maintains clustering as data changes)
ALTER TABLE orders ENABLE AUTOMATIC CLUSTERING;

-- Check automatic clustering status
SHOW TABLES LIKE 'orders';
-- Look at clustering_key and automatic_clustering columns

-- For high-cardinality columns, use a truncation expression
ALTER TABLE events CLUSTER BY (
    DATE_TRUNC('hour', event_timestamp),
    event_type
);`}
          </pre>
          <p>
            Automatic clustering runs in the background using Snowflake-managed compute and has
            a credit cost. Evaluate it by comparing query performance and credits consumed before
            and after enabling it on a specific table. Do not enable it reflexively on every large
            table.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Snowflake&apos;s Three Caching Layers
          </h2>
          <p>
            Snowflake maintains three distinct caches, each with different behavior and scope.
            Understanding them changes how you structure queries and warehouse configurations.
          </p>
          <p>
            The result cache holds the output of every query for 24 hours. If an identical query
            runs again within that window on unchanged data, Snowflake returns the cached result
            instantly with zero compute cost. This is why dashboards with fixed date ranges often
            feel fast after the first load.
          </p>
          <p>
            The local disk cache (also called the warehouse cache) holds micro-partition data
            that has been read by the current warehouse. Subsequent queries on the same warehouse
            that need the same micro-partitions read from local SSD instead of remote object
            storage. This cache is lost when the warehouse suspends, which is why auto-suspend
            aggressiveness is a real performance tradeoff.
          </p>
          <p>
            The metadata cache stores min/max values, distinct counts, and row counts for
            micro-partitions. Queries that can be fully answered from metadata (e.g.,
            <code>SELECT MIN(created_at) FROM orders</code>) complete in milliseconds without
            scanning any data.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- These queries use the metadata cache and cost near zero
SELECT COUNT(*) FROM orders;
SELECT MIN(created_at), MAX(created_at) FROM orders;
SELECT COUNT(DISTINCT region) FROM orders;

-- Check if a query hit the result cache
SELECT
    query_id,
    query_text,
    is_client_generated_statement,
    execution_status,
    total_elapsed_time,
    credits_used_cloud_services
FROM snowflake.account_usage.query_history
WHERE query_text = 'SELECT COUNT(*) FROM orders'
ORDER BY start_time DESC
LIMIT 5;
-- Look for credits_used_cloud_services = 0 (result cache hit)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Materialized Views for Expensive Aggregations
          </h2>
          <p>
            Materialized views in Snowflake are automatically maintained as the base table
            changes. They are most valuable for aggregation queries that run frequently against
            large append-only tables, where recomputing the aggregation on every query is wasteful.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Create a materialized view for a high-frequency aggregation
CREATE MATERIALIZED VIEW daily_revenue_mv AS
SELECT
    DATE_TRUNC('day', created_at) AS revenue_date,
    region,
    product_category,
    SUM(amount) AS total_revenue,
    COUNT(DISTINCT order_id) AS order_count
FROM orders
WHERE status = 'completed'
GROUP BY 1, 2, 3;

-- Queries on the MV are fast regardless of base table size
SELECT revenue_date, SUM(total_revenue)
FROM daily_revenue_mv
WHERE revenue_date >= DATEADD('day', -30, CURRENT_DATE)
GROUP BY revenue_date
ORDER BY revenue_date;`}
          </pre>
          <p>
            Materialized views have constraints: they do not support joins across multiple base
            tables, and maintenance has a credit cost proportional to how frequently the base
            table changes. Use them for stable aggregations on tables that are primarily appended
            to, not heavily updated.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Query Profiling: Reading the Query Profile
          </h2>
          <p>
            Snowflake&apos;s query profile (accessible via the web UI or
            <code>EXPLAIN USING TABULAR</code>) shows the execution plan and operator-level
            statistics. The most important metrics: bytes scanned (look for unnecessary full
            scans), bytes spilled to local and remote storage (indicates memory pressure),
            and partitions scanned vs. total (the pruning ratio).
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Inspect query profile programmatically
SELECT
    query_id,
    query_text,
    bytes_scanned,
    bytes_spilled_to_local_storage,
    bytes_spilled_to_remote_storage,
    partitions_scanned,
    partitions_total,
    warehouse_size,
    total_elapsed_time / 1000 AS elapsed_seconds,
    execution_time / 1000 AS execution_seconds
FROM snowflake.account_usage.query_history
WHERE
    database_name = 'ANALYTICS'
    AND start_time >= DATEADD('day', -7, CURRENT_TIMESTAMP)
    AND bytes_spilled_to_remote_storage > 0  -- spill = candidate for larger warehouse
ORDER BY bytes_spilled_to_remote_storage DESC
LIMIT 20;`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Warehouse Sizing: The Right Time to Scale Up
          </h2>
          <p>
            Scaling warehouse size (from S to M to L, etc.) adds more compute nodes. Each size
            doubles the compute. More compute means more parallel processing of micro-partitions
            within a single query. Scale up when queries are spilling to local or remote storage,
            when execution time is dominated by processing rather than scanning, or when concurrent
            query throughput needs to increase.
          </p>
          <p>
            Do not scale up to fix poor pruning. A 4X warehouse scanning all micro-partitions
            costs 4X the credits and still does unnecessary work. Fix the clustering or query
            predicate first, then right-size the warehouse for the optimized query.
          </p>
          <p>
            Use multi-cluster warehouses for concurrency scaling: they spin up additional clusters
            when the primary cluster is fully loaded with concurrent queries. This is the right
            tool for BI dashboard load, not for making individual queries faster.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Optimization Checklist
          </h2>
          <p>
            When a Snowflake query is slow, work through this order: check the partition pruning
            ratio in the query profile, verify the filter column is selective and well-clustered,
            check for bytes spilled to storage (memory pressure), look for cartesian joins or
            missing join conditions, and evaluate whether a materialized view or result cache
            policy could serve this query pattern. Only after working through these steps should
            warehouse size enter the conversation.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
              Questions or pushback on any of this?{" "}
              <a
                href="https://www.linkedin.com/in/ryanmkirsch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electricBlue hover:text-white transition-colors"
              >
                Find me on LinkedIn.
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-8 p-5 bg-steel/5 rounded-xl border border-steel/20">
            <p className="text-sm text-mutedGray leading-relaxed">
              <strong className="text-white">Ryan Kirsch</strong> is a senior data
              engineer with 8+ years building data infrastructure at media, SaaS, and
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Spark,
              and writes about data engineering patterns from production experience.{" "}
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
    </main>
  );
}
