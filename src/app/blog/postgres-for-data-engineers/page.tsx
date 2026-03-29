import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "PostgreSQL for Data Engineers: Beyond Basic Queries | Ryan Kirsch",
  description:
    "PostgreSQL patterns that matter for data engineering: window functions, CTEs, JSONB, partitioning, EXPLAIN ANALYZE, and when Postgres is the right tool versus when to reach for a data warehouse.",
  openGraph: {
    title: "PostgreSQL for Data Engineers: Beyond Basic Queries",
    description:
      "PostgreSQL patterns that matter for data engineering: window functions, CTEs, JSONB, partitioning, EXPLAIN ANALYZE, and when Postgres is the right tool versus when to reach for a data warehouse.",
    type: "article",
    url: "https://ryankirsch.dev/blog/postgres-for-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostgreSQL for Data Engineers: Beyond Basic Queries",
    description:
      "PostgreSQL patterns that matter for data engineering: window functions, CTEs, JSONB, partitioning, EXPLAIN ANALYZE, and when Postgres is the right tool versus when to reach for a data warehouse.",
  },
  alternates: { canonical: "/blog/postgres-for-data-engineers" },
};

export default function PostgresPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/postgres-for-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "PostgreSQL for Data Engineers: Beyond Basic Queries"
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
              SQL
            </span>
            <span className="text-sm text-gray-500">January 16, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            PostgreSQL for Data Engineers: Beyond Basic Queries
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Postgres is a Swiss Army knife that most data engineers underuse. Here are the patterns that actually matter for pipeline work, data modeling, and operational analytics.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            PostgreSQL occupies an interesting position in the modern data stack. It is the operational database for many applications, which means data engineers encounter it constantly as a source system. It is also genuinely powerful for analytics workloads up to a certain scale, which means knowing it well lets you avoid reaching for a cloud warehouse when you do not need one.
          </p>
          <p>
            This post covers the PostgreSQL features that matter most for data engineering: advanced query patterns, JSONB for semi-structured data, table partitioning, query analysis with EXPLAIN ANALYZE, and a clear-eyed view of when Postgres is the right tool versus when to move to a dedicated warehouse.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Window Functions
          </h2>
          <p>
            Window functions are the single most important SQL feature for analytical queries. They perform calculations across a set of rows related to the current row without collapsing the result set the way GROUP BY does.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Running total by customer
SELECT
  order_id,
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total,
  -- Row number within customer (for deduplication)
  ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date DESC
  ) AS rn
FROM orders;`}
          </pre>
          <p>
            The PARTITION BY clause defines the grouping (equivalent to GROUP BY, but without collapsing rows). ORDER BY within the window defines the ordering for running calculations. The frame clause (ROWS BETWEEN) controls which rows are included in each calculation.
          </p>
          <p>
            Common window function patterns for data engineering:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Deduplication: keep the most recent record per entity
SELECT * FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY entity_id ORDER BY updated_at DESC
    ) AS rn
  FROM source_table
) t WHERE rn = 1;

-- Session detection: gap > 30 min = new session
SELECT
  user_id,
  event_timestamp,
  SUM(is_new_session) OVER (
    PARTITION BY user_id ORDER BY event_timestamp
  ) AS session_id
FROM (
  SELECT *,
    CASE WHEN event_timestamp - LAG(event_timestamp) OVER (
      PARTITION BY user_id ORDER BY event_timestamp
    ) > INTERVAL '30 minutes'
    THEN 1 ELSE 0 END AS is_new_session
  FROM events
) t;

-- Percentile ranking
SELECT
  customer_id,
  lifetime_revenue,
  NTILE(10) OVER (ORDER BY lifetime_revenue DESC) AS decile,
  PERCENT_RANK() OVER (ORDER BY lifetime_revenue DESC) AS pct_rank
FROM customer_metrics;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            CTEs and Recursive Queries
          </h2>
          <p>
            Common Table Expressions (CTEs) improve query readability and enable recursive queries. A basic CTE:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`WITH
  daily_revenue AS (
    SELECT
      DATE_TRUNC('day', order_date) AS day,
      SUM(amount) AS revenue
    FROM orders
    GROUP BY 1
  ),
  rolling_7d AS (
    SELECT
      day,
      revenue,
      AVG(revenue) OVER (
        ORDER BY day
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
      ) AS rolling_7d_avg
    FROM daily_revenue
  )
SELECT * FROM rolling_7d ORDER BY day;`}
          </pre>
          <p>
            Recursive CTEs handle hierarchical data like org charts, category trees, or bill-of-materials structures:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Walk an org hierarchy from any employee up to the CEO
WITH RECURSIVE org_hierarchy AS (
  -- Base case: the employee
  SELECT id, name, manager_id, 0 AS depth
  FROM employees
  WHERE id = :employee_id
  
  UNION ALL
  
  -- Recursive case: join to manager
  SELECT e.id, e.name, e.manager_id, h.depth + 1
  FROM employees e
  JOIN org_hierarchy h ON e.id = h.manager_id
)
SELECT * FROM org_hierarchy ORDER BY depth;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            JSONB for Semi-Structured Data
          </h2>
          <p>
            PostgreSQL JSONB stores JSON as a binary representation that supports indexing and efficient querying. It is significantly better than the JSON type (which stores raw text) for anything beyond simple retrieval.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Store event properties as JSONB
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  event_type TEXT,
  user_id BIGINT,
  occurred_at TIMESTAMPTZ,
  properties JSONB
);

-- Create a GIN index for fast JSONB queries
CREATE INDEX idx_events_properties ON events USING GIN (properties);

-- Query nested JSONB
SELECT
  event_id,
  properties->>'page_url' AS page_url,
  (properties->>'duration_ms')::INTEGER AS duration_ms,
  properties->'utm'->>'source' AS utm_source
FROM events
WHERE event_type = 'page_view'
  AND properties @> '{"device": "mobile"}';  -- containment check

-- Extract and aggregate JSONB fields
SELECT
  properties->>'country' AS country,
  COUNT(*) AS events,
  AVG((properties->>'revenue')::NUMERIC) AS avg_revenue
FROM events
WHERE properties ? 'revenue'  -- existence check
GROUP BY 1
ORDER BY 2 DESC;`}
          </pre>
          <p>
            The GIN index makes containment queries and key existence checks fast. For frequently queried scalar paths, a functional index on the extracted value is even faster:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Functional index on a specific JSONB path
CREATE INDEX idx_events_country
  ON events ((properties->>'country'));`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Table Partitioning
          </h2>
          <p>
            Partitioning splits a large table into smaller physical segments based on a partition key. The most common pattern for data engineering is range partitioning by date:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Partitioned events table
CREATE TABLE events (
  event_id UUID NOT NULL,
  user_id BIGINT,
  event_type TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  properties JSONB
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions
CREATE TABLE events_2026_01
  PARTITION OF events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE events_2026_02
  PARTITION OF events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Queries with a date filter only scan relevant partitions
SELECT COUNT(*) FROM events
WHERE occurred_at >= '2026-02-01'
  AND occurred_at < '2026-03-01';`}
          </pre>
          <p>
            Partition pruning eliminates irrelevant partitions at the query planning stage. For a table with years of event data, a single-month query might scan 1/24th of the data instead of all of it. This matters most for queries that filter on the partition key.
          </p>
          <p>
            Partitioning also simplifies data retention: dropping old partitions is nearly instantaneous compared to a DELETE on a large unpartitioned table.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            EXPLAIN ANALYZE: Reading Query Plans
          </h2>
          <p>
            EXPLAIN ANALYZE runs the query and shows both the estimated and actual execution plan. It is the primary tool for diagnosing slow queries.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.user_id, u.email, COUNT(o.order_id) AS order_count
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE u.created_at >= '2026-01-01'
GROUP BY u.user_id, u.email;`}
          </pre>
          <p>
            Key things to look for in the output:
          </p>
          <p>
            <strong>Sequential scans on large tables</strong> indicate a missing index. If you see Seq Scan on a table with millions of rows and a filter condition, add an index on the filter column.
          </p>
          <p>
            <strong>Large row count estimates vs. actuals</strong> indicate stale statistics. Run ANALYZE on the table to refresh the planner statistics.
          </p>
          <p>
            <strong>Hash joins vs. nested loop joins</strong>: hash joins are generally better for large tables; nested loops are better when one side is small. If you see a nested loop on two large tables, something is wrong with the plan.
          </p>
          <p>
            <strong>The Buffers output</strong> shows how much data was read from disk vs. cache. High disk reads on a query that runs frequently suggest the working set does not fit in shared_buffers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Useful Postgres Features for Data Engineering
          </h2>
          <p>
            <strong>COPY for bulk loads</strong>: COPY is significantly faster than INSERT for loading large datasets. It bypasses much of the per-row overhead of INSERT and is the right tool for loading CSV files or binary dumps.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Load from CSV (server-side)
COPY staging_events FROM '/path/to/events.csv'
WITH (FORMAT CSV, HEADER TRUE, NULL '');

-- Load from stdin (client-side, works with psycopg2)
COPY staging_events (col1, col2, col3) FROM STDIN
WITH (FORMAT CSV);`}
          </pre>
          <p>
            <strong>Materialized views</strong>: pre-computed query results that can be refreshed on demand. Useful for expensive aggregations that are queried frequently but do not need to be real-time.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`CREATE MATERIALIZED VIEW daily_revenue_summary AS
SELECT
  DATE_TRUNC('day', order_date)::DATE AS day,
  SUM(amount) AS revenue,
  COUNT(*) AS order_count
FROM orders
GROUP BY 1;

-- Refresh (can be scheduled via cron or orchestrator)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue_summary;`}
          </pre>
          <p>
            <strong>Generated columns</strong>: computed columns stored physically in the table, updated automatically when dependent columns change. Useful for derived values you query frequently.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            When Postgres Is the Right Tool
          </h2>
          <p>
            Postgres is the right choice when: your dataset fits in tens of gigabytes and query times are acceptable, you need ACID transactions alongside analytics, your team does not want to manage a separate warehouse, or you are building a transactional application that also needs light analytics.
          </p>
          <p>
            Reach for a dedicated warehouse (Snowflake, BigQuery, Redshift, DuckDB) when: your dataset is hundreds of gigabytes or more, you need columnar storage for analytical scan performance, you need to separate compute from storage for cost control, or your query patterns involve full table scans that would kill an OLTP database.
          </p>
          <p>
            The middle ground is DuckDB, which can query Postgres via its postgres_scanner extension and handles analytical workloads in-process without a server. For many data engineering tasks that do not need a full warehouse, DuckDB running against Postgres or Parquet files is a compelling option.
          </p>
          <p>
            Postgres expertise transfers. The SQL you write for Postgres is largely portable to Snowflake, BigQuery, and DuckDB. The indexing and query planning concepts apply everywhere. It is one of the highest-return skills in the data engineering toolkit precisely because it underpins so many other systems.
          </p>
        </div>

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

        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
