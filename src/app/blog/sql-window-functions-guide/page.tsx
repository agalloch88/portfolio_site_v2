import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SQL Window Functions: The Complete Guide for Data Engineers | Ryan Kirsch",
  description:
    "A practical guide to SQL window functions: ROW_NUMBER, RANK, LAG/LEAD, running aggregates, sessionization, gaps and islands, and the patterns that come up constantly in real data engineering work.",
  openGraph: {
    title: "SQL Window Functions: The Complete Guide for Data Engineers",
    description:
      "A practical guide to SQL window functions: ROW_NUMBER, RANK, LAG/LEAD, running aggregates, sessionization, gaps and islands, and the patterns that come up constantly in real data engineering work.",
    type: "article",
    url: "https://ryankirsch.dev/blog/sql-window-functions-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Window Functions: The Complete Guide for Data Engineers",
    description:
      "A practical guide to SQL window functions: ROW_NUMBER, RANK, LAG/LEAD, running aggregates, sessionization, gaps and islands, and the patterns that come up constantly in real data engineering work.",
  },
  alternates: { canonical: "/blog/sql-window-functions-guide" },
};

export default function SqlWindowFunctionsGuidePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/sql-window-functions-guide");
  const postTitle = encodeURIComponent("SQL Window Functions: The Complete Guide for Data Engineers");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">SQL</span>
            <span className="text-sm text-gray-500">March 15, 2026</span>
            <span className="text-sm text-gray-500">11 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            SQL Window Functions: The Complete Guide for Data Engineers
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Window functions are where SQL stops being a reporting shortcut and becomes a real analytical tool. Once you understand the frame, the patterns compound quickly.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Window functions are the most powerful feature most data professionals learned too late. They look intimidating at first, mostly because of the <code>OVER()</code> syntax and the distinction between <code>PARTITION BY</code> and <code>GROUP BY</code>. Once that clicks, the functions themselves are straightforward and the patterns they unlock solve a huge category of analytical problems elegantly.
          </p>
          <p>
            This guide covers the mechanics, the common patterns, and the real-world use cases that come up repeatedly in data engineering and analytics work.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How Window Functions Work</h2>
          <p>
            A window function operates on a set of rows related to the current row, without collapsing them into a single result. This is the key difference from <code>GROUP BY</code> aggregation. <code>GROUP BY</code> reduces rows. Window functions preserve them while adding computed values based on related rows.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- GROUP BY collapses 5 rows to 1
SELECT customer_id, SUM(amount) AS total
FROM orders
GROUP BY customer_id;

-- Window function keeps all rows and adds the total
SELECT
  order_id,
  customer_id,
  amount,
  SUM(amount) OVER (PARTITION BY customer_id) AS customer_total
FROM orders;`}
          </pre>
          <p>
            The <code>OVER()</code> clause defines the window. <code>PARTITION BY</code> is the grouping equivalent (which rows are included in the calculation). <code>ORDER BY</code> inside the window specifies the sort order for ordered functions. <code>ROWS</code> or <code>RANGE</code> defines the frame for running calculations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Ranking Functions</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`SELECT
  customer_id,
  order_date,
  amount,
  -- Unique rank, no ties, sequential
  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn,
  -- Ties get same rank, gaps after ties
  RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rnk,
  -- Ties get same rank, no gaps after ties
  DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS dense_rnk
FROM orders;`}
          </pre>
          <p>
            <strong>ROW_NUMBER</strong> assigns a unique sequential integer starting at 1 within each partition. Use this when you need exactly one row per group, like the most recent order per customer.
          </p>
          <p>
            <strong>RANK</strong> gives tied rows the same rank but skips subsequent ranks. <strong>DENSE_RANK</strong> gives tied rows the same rank without skipping.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Most recent order per customer
SELECT * FROM (
  SELECT
    order_id,
    customer_id,
    order_date,
    amount,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date DESC
    ) AS rn
  FROM orders
) ranked
WHERE rn = 1;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">LAG and LEAD</h2>
          <p>
            <code>LAG</code> and <code>LEAD</code> access values from previous or following rows within a partition. They are essential for period-over-period comparisons, churn analysis, and identifying state transitions.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`SELECT
  customer_id,
  order_date,
  amount,
  LAG(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS prev_order_amount,
  amount - LAG(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS amount_change,
  LEAD(order_date) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS next_order_date
FROM orders;`}
          </pre>
          <p>
            The optional second argument to <code>LAG</code>/<code>LEAD</code> specifies how many rows to look back or forward (default 1). The third argument provides a default value when the offset goes out of bounds.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Running Aggregates and Frames</h2>
          <p>
            Window aggregates with an <code>ORDER BY</code> clause compute running totals by default. The frame clause (<code>ROWS BETWEEN</code> or <code>RANGE BETWEEN</code>) controls exactly which rows are included.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`SELECT
  order_date,
  daily_revenue,
  -- Running total (all rows from first to current)
  SUM(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total,
  -- 7-day rolling average
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_avg,
  -- Trailing 30-day sum
  SUM(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) AS trailing_30d_revenue
FROM daily_summary
ORDER BY order_date;`}
          </pre>
          <p>
            <code>ROWS BETWEEN</code> counts physical rows. <code>RANGE BETWEEN</code> includes rows with equal values in the ORDER BY column. For time-series work, <code>ROWS</code> is usually more predictable.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">NTILE and Percentiles</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`SELECT
  customer_id,
  lifetime_value,
  -- Divide into 4 equal buckets (quartiles)
  NTILE(4) OVER (ORDER BY lifetime_value) AS ltv_quartile,
  -- Percentile rank (0 to 1)
  PERCENT_RANK() OVER (ORDER BY lifetime_value) AS ltv_pct_rank,
  -- Cumulative distribution
  CUME_DIST() OVER (ORDER BY lifetime_value) AS ltv_cume_dist
FROM customer_ltv;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Sessionization</h2>
          <p>
            Sessionization groups events into sessions based on a time gap threshold. It is one of the most common real-world window function patterns for clickstream and product analytics.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`WITH events_with_gaps AS (
  SELECT
    user_id,
    event_timestamp,
    LAG(event_timestamp) OVER (
      PARTITION BY user_id
      ORDER BY event_timestamp
    ) AS prev_event_timestamp
  FROM events
),
session_starts AS (
  SELECT
    user_id,
    event_timestamp,
    CASE
      WHEN prev_event_timestamp IS NULL
        OR DATEDIFF('minute', prev_event_timestamp, event_timestamp) > 30
      THEN 1
      ELSE 0
    END AS is_session_start
  FROM events_with_gaps
)
SELECT
  user_id,
  event_timestamp,
  SUM(is_session_start) OVER (
    PARTITION BY user_id
    ORDER BY event_timestamp
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS session_id
FROM session_starts;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Gaps and Islands</h2>
          <p>
            Gaps and islands problems involve finding contiguous sequences. The classic approach uses a difference between row number and a ranked column to identify group boundaries.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Find consecutive streaks of daily activity
WITH activity AS (
  SELECT
    user_id,
    activity_date,
    -- Subtract sequential row number from date
    -- Dates in the same streak produce the same difference
    DATEADD(day,
      -ROW_NUMBER() OVER (
        PARTITION BY user_id
        ORDER BY activity_date
      ),
      activity_date
    ) AS streak_group
  FROM user_activity
)
SELECT
  user_id,
  MIN(activity_date) AS streak_start,
  MAX(activity_date) AS streak_end,
  COUNT(*) AS streak_days
FROM activity
GROUP BY user_id, streak_group
ORDER BY user_id, streak_start;`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">First and Last Values</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`SELECT
  customer_id,
  order_date,
  -- First order date for this customer
  FIRST_VALUE(order_date) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS first_order_date,
  -- Most recent order amount for this customer
  LAST_VALUE(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS latest_amount
FROM orders;`}
          </pre>
          <p>
            Note the frame specification for <code>LAST_VALUE</code>: without <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, the default frame only goes up to the current row and <code>LAST_VALUE</code> will equal the current row value for most rows.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Performance Considerations</h2>
          <p>
            Window functions are often much faster than self-joins or correlated subqueries for the same logic. However, multiple window functions on the same partition can be expensive if the optimizer materializes the sort for each one. Most modern warehouses optimize multiple window functions over the same window into a single sort pass, but it is worth verifying with explain plans on critical queries.
          </p>
          <p>
            Avoid applying window functions inside <code>WHERE</code> clauses directly. They are computed after filtering but before the outer select. If you need to filter on a window function result, wrap the query in a CTE or subquery first.
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
