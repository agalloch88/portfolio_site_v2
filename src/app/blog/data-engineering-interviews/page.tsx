import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral | Ryan Kirsch",
  description:
    "A complete guide to data engineering interviews: the SQL problems that actually appear, how to approach system design rounds, what behavioral questions are really probing, and how to negotiate the offer.",
  openGraph: {
    title: "How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral",
    description:
      "A complete guide to data engineering interviews: the SQL problems that actually appear, how to approach system design rounds, what behavioral questions are really probing, and how to negotiate the offer.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-interviews",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral",
    description:
      "A complete guide to data engineering interviews: the SQL problems that actually appear, how to approach system design rounds, what behavioral questions are really probing, and how to negotiate the offer.",
  },
  alternates: { canonical: "/blog/data-engineering-interviews" },
};

export default function InterviewsPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-engineering-interviews");
  const postTitle = encodeURIComponent("How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Career</span>
            <span className="text-sm text-gray-500">February 23, 2026</span>
            <span className="text-sm text-gray-500">11 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Data engineering interviews test different things than software engineering interviews. Here is what to prepare, how to think about each round, and how to negotiate once you get the offer.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data engineering interviews have a reputation for being inconsistent, and they are. Some companies run rigorous technical loops with multiple SQL rounds, a system design round, and deep technical discussions. Others have light technical screens and mostly evaluate on experience and communication. The variance makes preparation feel uncertain.
          </p>
          <p>
            The most reliable preparation targets the union of what most companies test: SQL proficiency, system design thinking, knowledge of the modern data stack, and the behavioral patterns that signal senior-level engineering judgment. This guide covers all four, plus the negotiation conversation most candidates handle poorly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SQL: What Actually Gets Tested</h2>
          <p>
            SQL in data engineering interviews is not LeetCode SQL. The questions are more practical and oriented around the kinds of problems data engineers actually solve. The categories that appear most often:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Window Functions</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Classic: find the second highest revenue per customer
SELECT customer_id, order_date, revenue
FROM (
  SELECT
    customer_id,
    order_date,
    revenue,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY revenue DESC
    ) AS rn
  FROM orders
) ranked
WHERE rn = 2;

-- Running total with 7-day rolling average
SELECT
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_total,
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_avg
FROM daily_summary
ORDER BY order_date;`}
          </pre>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Gap and Island Problems</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Find consecutive days of user activity (sessions)
WITH activity_with_gaps AS (
  SELECT
    user_id,
    activity_date,
    LAG(activity_date) OVER (
      PARTITION BY user_id ORDER BY activity_date
    ) AS prev_date,
    CASE
      WHEN activity_date - LAG(activity_date) OVER (
        PARTITION BY user_id ORDER BY activity_date
      ) = 1 THEN 0
      ELSE 1
    END AS is_new_session
  FROM user_activity
),
sessions AS (
  SELECT
    user_id,
    activity_date,
    SUM(is_new_session) OVER (
      PARTITION BY user_id ORDER BY activity_date
    ) AS session_id
  FROM activity_with_gaps
)
SELECT
  user_id,
  session_id,
  MIN(activity_date) AS session_start,
  MAX(activity_date) AS session_end,
  COUNT(*) AS days_in_session
FROM sessions
GROUP BY user_id, session_id
ORDER BY user_id, session_start;`}
          </pre>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">SCD Type 2 Queries</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Point-in-time lookup: what segment was a customer in on a given date?
SELECT
  o.order_id,
  o.customer_id,
  o.order_date,
  o.revenue,
  c.segment  -- segment as of order date
FROM orders o
JOIN dim_customers_scd2 c
  ON o.customer_id = c.customer_id
  AND o.order_date BETWEEN c.effective_from AND COALESCE(c.effective_to, '9999-12-31')`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">System Design: The Mental Framework</h2>
          <p>
            Data engineering system design interviews are fundamentally about demonstrating that you can translate ambiguous requirements into concrete architecture decisions with explicit tradeoffs. The five-step approach applies to every prompt:
          </p>
          <p>
            <strong>1. Clarify before designing.</strong> Volume, latency, consumers, SLA, failure tolerance. Spend 3-5 minutes asking. This is not stalling; it is demonstrating that you do not build things before you understand what is needed.
          </p>
          <p>
            <strong>2. State the high-level approach.</strong> Batch vs. streaming. Push vs. pull. Which storage layer. Before any tools, get alignment on the architectural pattern.
          </p>
          <p>
            <strong>3. Choose tools with justification.</strong> Not just Kafka, but Kafka because the throughput is X and we need multiple consumer groups. Every choice should have a one-sentence rationale.
          </p>
          <p>
            <strong>4. Walk through the data flow.</strong> Source to sink, end to end. Make the dependencies explicit.
          </p>
          <p>
            <strong>5. Address failure modes.</strong> What happens when the ingestion goes down? How do you recover? What is the SLA for recovery?
          </p>
          <p>
            Common system design prompts and the key considerations:
          </p>
          <p>
            <strong>Design a real-time dashboard.</strong> The answer almost always involves Kafka for ingestion, a stream processor (Flink, Spark Streaming) for aggregation, and a serving layer (ClickHouse, Druid) optimized for analytical queries. The interesting discussion is the tradeoff between pre-aggregation (faster queries, less flexible) and raw event storage (slower queries, fully flexible).
          </p>
          <p>
            <strong>Design a data warehouse from scratch.</strong> Layered approach (raw, staging, marts), ingestion via managed connector or custom pipeline, dbt for transformation, orchestration via Dagster or Airflow. The interesting discussion is schema evolution handling and the SLA for daily refresh.
          </p>
          <p>
            <strong>Design a pipeline for a machine learning feature store.</strong> Point-in-time correct feature computation is the core challenge. Every feature needs to be computed as of the time of the training example, not the current time. This requires careful timestamp handling and often a separate feature serving layer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Behavioral Questions: What They&apos;re Really Asking</h2>
          <p>
            Behavioral questions in data engineering interviews are evaluating five things: how you handle ambiguity, how you manage stakeholders, how you handle technical conflict, how you think about production incidents, and how you grow.
          </p>
          <p>
            <strong>Ambiguity questions</strong> (tell me about a time you had to work with unclear requirements): they want to hear that you drove clarity rather than waiting for it. You asked specific questions, proposed options, and got the decision made.
          </p>
          <p>
            <strong>Stakeholder questions</strong> (tell me about a time you disagreed with a non-technical stakeholder): they want to hear that you explained technical tradeoffs in business terms, listened to the business constraint you had not fully understood, and found a solution that served both needs.
          </p>
          <p>
            <strong>Production incident questions</strong> (tell me about a time a pipeline failed and impacted stakeholders): they want to hear that you communicated proactively, diagnosed methodically, fixed the issue, and did a retrospective that produced actual improvements.
          </p>
          <p>
            The STAR format (Situation, Task, Action, Result) is the right structure. Keep situations brief, focus most of the answer on the actions you specifically took, and quantify the result wherever possible.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Questions to Ask</h2>
          <p>
            The questions you ask signal whether you are thinking like someone who already has the job or someone who just wants to get the offer. Five questions that consistently land well:
          </p>
          <p>
            &quot;What does the data platform look like today, and what is the most important thing the team is trying to change about it in the next 12 months?&quot; This shows you are thinking about the actual work, not just the job description.
          </p>
          <p>
            &quot;What does a successful first 90 days look like for someone in this role?&quot; This surfaces concrete expectations and gives you information for deciding whether the role is the right fit.
          </p>
          <p>
            &quot;What are the biggest data quality or reliability challenges the team is dealing with right now?&quot; This often produces the most candid answer you will get and reveals the real state of the platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Negotiation</h2>
          <p>
            The most common negotiation mistake is accepting the first offer or negotiating only on base salary. Total compensation includes base, equity, signing bonus, target bonus, and benefits. Each is negotiable independently.
          </p>
          <p>
            The anchor: provide a range where your target is at the bottom of the range. &quot;Based on my experience and the market data I have seen, I am targeting $180-200K base.&quot; If $180K is your target, this framing pulls the negotiation upward.
          </p>
          <p>
            When a company says the offer is final: it usually is not. Counter with a specific ask: &quot;I understand the base is firm. Is there flexibility on the signing bonus or equity refresh?&quot; This moves the negotiation to dimensions the recruiter may have more authority over.
          </p>
          <p>
            Multiple offers are the strongest leverage. If you have a competing offer, share the number: &quot;I have a competing offer at $195K base. I prefer this role for these reasons, but there is a meaningful gap. Is there room to close it?&quot; This is not a bluff; it is information sharing that makes the decision easier for the hiring manager.
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
