import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Engineering System Design: How to Approach Architecture Interviews | Ryan Kirsch",
  description:
    "A framework for data engineering system design interviews: how to scope requirements, choose between batch and streaming, design for scale, handle failures, and communicate tradeoffs clearly.",
  openGraph: {
    title:
      "Data Engineering System Design: How to Approach Architecture Interviews",
    description:
      "A framework for data engineering system design interviews: how to scope requirements, choose between batch and streaming, design for scale, handle failures, and communicate tradeoffs clearly.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-system-design",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Engineering System Design: How to Approach Architecture Interviews",
    description:
      "A framework for data engineering system design interviews: how to scope requirements, choose between batch and streaming, design for scale, handle failures, and communicate tradeoffs clearly.",
  },
  alternates: { canonical: "/blog/data-engineering-system-design" },
};

export default function SystemDesignPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineering-system-design"
  );
  const postTitle = encodeURIComponent(
    "Data Engineering System Design: How to Approach Architecture Interviews"
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
              Career
            </span>
            <span className="text-sm text-gray-500">January 18, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Engineering System Design: How to Approach Architecture Interviews
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            System design interviews test whether you can think like a senior engineer: requirements first, tradeoffs explicit, failure modes considered. Here is a repeatable framework that works.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data engineering system design interviews are simultaneously the most important and most misunderstood part of the senior DE hiring process. Candidates who have built excellent pipelines often struggle here because they are used to having the requirements handed to them. In a system design interview, scoping the requirements is part of the test.
          </p>
          <p>
            This post covers a repeatable framework for data engineering system design interviews, with worked examples for common prompts and a guide to communicating tradeoffs in a way that signals senior thinking.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Framework: Five Steps
          </h2>
          <p>
            Before drawing any architecture, work through these five steps. They apply to almost every data engineering system design prompt.
          </p>
          <p>
            <strong>Step 1: Clarify requirements.</strong> Ask questions before proposing anything. What is the data volume? What is the latency requirement (real-time, near-real-time, hourly, daily)? What are the consumers (dashboards, ML models, APIs, analysts writing SQL)? What are the SLA expectations for freshness and availability? What does failure look like and what is the recovery requirement?
          </p>
          <p>
            <strong>Step 2: Establish the data flow.</strong> Sketch the high-level flow: source, ingestion, storage, transformation, serving. Do not jump to specific tools yet. Understand the shape of the data movement first.
          </p>
          <p>
            <strong>Step 3: Choose the architecture pattern.</strong> Batch, streaming, or lambda (both). The choice follows from the latency requirement, not from tool preference.
          </p>
          <p>
            <strong>Step 4: Make technology decisions with justification.</strong> For each layer, propose a tool and say why. Not just Kafka, but Kafka because the volume is high, the consumers need independent offsets, and we have existing expertise. Interviewers want to see that you understand what problems tools solve.
          </p>
          <p>
            <strong>Step 5: Address failure modes and scale.</strong> What happens when the ingestion layer goes down? How do you handle schema changes in the source? What does backfill look like? How does the design handle 10x volume?
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Common Prompt: Design a Real-Time Analytics System
          </h2>
          <p>
            The prompt: design a system to track user events from a web application and make them queryable for dashboards within 60 seconds of occurring.
          </p>
          <p>
            <strong>Clarifying questions:</strong> How many events per second at peak? (Answer: 50,000.) How many unique users? (Answer: 10M.) What dashboard queries need to be supported? (Answer: counts and aggregations by event type and user segment, last 30 days.) What is the source? (Answer: web servers sending JSON events over HTTP.)
          </p>
          <p>
            <strong>Architecture:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`Web Servers
    ↓ (HTTP POST, batched)
Kafka (event ingestion)
    ↓ (Kafka Consumer)
Flink / Spark Streaming (enrichment + aggregation)
    ↓
Two outputs:
  1. ClickHouse / Druid (real-time serving, last 30 days)
  2. S3 Parquet (cold storage, Athena queryable)
    ↓
BI Tool (Grafana / Superset) reads from ClickHouse`}
          </pre>
          <p>
            <strong>Justification by layer:</strong>
          </p>
          <p>
            Kafka handles the ingestion spike at 50k events/second without dropping events. The web servers batch events into 500ms windows and POST to a Kafka producer, which handles the buffering. Consumer groups let multiple downstream consumers read independently.
          </p>
          <p>
            Flink processes the stream with a 30-second window to aggregate event counts by type and segment. It also enriches events with user segment information from a Redis lookup (avoiding a database join in the hot path). Output goes to ClickHouse for the real-time serving layer and S3 for cold storage.
          </p>
          <p>
            ClickHouse handles the dashboard queries because it is optimized for analytical aggregations on event data with low-latency reads. For 30 days of data at 50k events/second, that is roughly 130 billion events. ClickHouse handles this at query times under a second with proper table partitioning.
          </p>
          <p>
            S3 Parquet provides the historical archive at low cost. Athena or Trino can query it for ad-hoc analysis beyond the 30-day window that ClickHouse serves.
          </p>
          <p>
            <strong>Failure modes:</strong> If Kafka goes down, web servers buffer locally and replay when Kafka recovers. If Flink goes down, Kafka retains events for 7 days, allowing a full replay. If ClickHouse has a node failure, replication handles reads while the node recovers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Common Prompt: Design a Data Warehouse Ingestion Pipeline
          </h2>
          <p>
            The prompt: design a system to ingest data from 20 operational databases into a central data warehouse and make it available for analysts daily.
          </p>
          <p>
            <strong>Clarifying questions:</strong> What database types? (Mix of Postgres and MySQL.) What is the data volume per source? (5M to 50M rows, 100GB total.) Full load or incremental? (Incremental preferred, full acceptable for small tables.) Target warehouse? (Snowflake.) What is the freshness requirement? (Daily, by 8 AM.)
          </p>
          <p>
            <strong>Architecture:</strong>
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`20 Operational DBs (Postgres, MySQL)
    ↓ (Fivetran or Airbyte)
Snowflake Raw Layer (source-aligned schemas)
    ↓ (dbt)
Snowflake Staging Layer (cleaned, typed)
    ↓ (dbt)
Snowflake Marts Layer (business-ready)
    ↓
BI Tool (Tableau, Looker, etc.)`}
          </pre>
          <p>
            Fivetran for the ingestion layer if budget allows: managed connectors for Postgres and MySQL, handles schema drift, automatic incremental loads via CDC or watermark. Airbyte for a self-hosted, cost-controlled alternative with the same connector coverage.
          </p>
          <p>
            Dagster or Airflow orchestrates the dbt runs after ingestion completes. The schedule targets completion by 7 AM to leave margin before the 8 AM SLA.
          </p>
          <p>
            dbt handles all transformations with tested, version-controlled SQL. The three-layer structure (raw, staging, marts) means analysts query only the marts layer, which has well-defined grain, validated relationships, and documented columns.
          </p>
          <p>
            <strong>Schema change handling:</strong> Fivetran handles additive changes (new columns) automatically. Breaking changes (column rename, type change) trigger an alert in Fivetran&apos;s UI. dbt schema tests catch downstream breaks before they reach the marts layer. The runbook for breaking changes: pause the affected connector, coordinate with the source team on timing, update the dbt model, validate, and re-enable.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            What Interviewers Are Actually Evaluating
          </h2>
          <p>
            The system design interview is not primarily a test of whether you know the right tools. It is a test of how you think about problems. Interviewers at senior levels are evaluating four things:
          </p>
          <p>
            <strong>Requirements discipline.</strong> Did you ask before designing? A candidate who immediately starts drawing architecture without asking questions is a candidate who would build the wrong thing in production. Ask, even if the questions feel obvious.
          </p>
          <p>
            <strong>Tradeoff awareness.</strong> Every architectural decision has a cost. Kafka gives you durability and consumer independence but adds operational complexity. ClickHouse gives you fast analytical queries but requires dedicated infrastructure. Saying what you chose and why, including what you gave up, demonstrates senior thinking.
          </p>
          <p>
            <strong>Failure mode reasoning.</strong> What breaks? How bad is it when it breaks? How do you recover? A design that has no answer for what happens when the ingestion layer goes down is not a production design.
          </p>
          <p>
            <strong>Communication clarity.</strong> Can you explain the system to someone who is not you? Use diagrams if you have a whiteboard. Summarize each layer before moving on. Check whether the interviewer is following. The ability to communicate architecture clearly is itself a senior engineering skill.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Phrases That Signal Senior Thinking
          </h2>
          <p>
            A few phrasings that consistently land well in system design interviews:
          </p>
          <p>
            &quot;Before I propose anything, let me make sure I understand the requirements.&quot; Opens the requirements discussion without asking permission.
          </p>
          <p>
            &quot;I would choose X here because of Y, and the tradeoff is Z.&quot; Every tool choice should follow this pattern.
          </p>
          <p>
            &quot;The failure mode I am most concerned about here is...&quot; Proactively surfacing risks before being asked shows production experience.
          </p>
          <p>
            &quot;I would validate this design by...&quot; Showing how you would prove the design works before committing to it.
          </p>
          <p>
            &quot;If the volume grew 10x, the bottleneck would be X and we would address it by Y.&quot; Scale reasoning does not need to be exhaustive; it needs to demonstrate that you thought about it.
          </p>
          <p>
            System design interviews are more comfortable once you internalize that the goal is not to produce the perfect architecture. The goal is to demonstrate that you are the kind of engineer who asks before building, justifies every decision, and thinks about what goes wrong. The architecture itself is secondary to the thinking process you show to get there.
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
