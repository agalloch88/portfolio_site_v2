import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Engineering Interview Questions: What Senior Roles Actually Ask | Ryan Kirsch",
  description:
    "The data engineering interview questions that actually separate candidates at the senior level -- system design, pipeline failure scenarios, SQL edge cases, and the behavioral questions that reveal how you think under pressure.",
  openGraph: {
    title:
      "Data Engineering Interview Questions: What Senior Roles Actually Ask",
    description:
      "The data engineering interview questions that separate senior candidates: system design, pipeline failure scenarios, SQL edge cases, and behavioral questions that reveal how you think under pressure.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-interview-questions",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Engineering Interview Questions: What Senior Roles Actually Ask",
    description:
      "The data engineering interview questions that separate senior candidates at senior roles.",
  },
  alternates: { canonical: "/blog/data-engineering-interview-questions" },
};

export default function DEInterviewQuestionsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineering-interview-questions"
  );
  const postTitle = encodeURIComponent(
    "Data Engineering Interview Questions: What Senior Roles Actually Ask"
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
            Data Engineering Interview Questions: What Senior Roles Actually Ask
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 14, 2025 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most data engineering interview prep resources focus on SQL puzzles
            and system design frameworks. Senior-level interviews go further:
            they probe how you handle ambiguity, how you reason about failure,
            and whether your instincts about trade-offs match the judgment a
            senior engineer is expected to have. These are the questions that
            actually separate candidates at senior level, with the framing
            interviewers are really evaluating.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              System Design Questions
            </h2>
            <p>
              System design is the highest-signal section of a senior DE
              interview. The interviewer is not looking for the right answer --
              they are looking for the right questions.
            </p>

            <p>
              <strong>Q: Design a pipeline that ingests clickstream events
              and produces a daily active users metric available by 7 AM.</strong>
            </p>
            <p>
              What they are evaluating: Do you ask about scale before proposing
              architecture? Do you identify the late-arrival problem (events
              submitted after midnight for yesterday&apos;s session)? Do you think
              about failure modes (what if the pipeline fails at 6:55 AM)?
            </p>
            <p>
              Strong answer structure: clarify scale (events/day), clarify
              consumer (BI dashboard vs. API), identify the late-data window
              (typically 2-4 hours for clickstream), propose architecture
              (Kafka for ingestion, Snowflake/BigQuery for aggregation, dbt
              or Spark for the DAU model), address failure (monitoring,
              alerting, on-call runbook, rerun strategy).
            </p>

            <p>
              <strong>Q: Your company is switching from Postgres to a new
              operational database. How do you migrate the data pipelines
              that depend on it?</strong>
            </p>
            <p>
              What they are evaluating: Do you think about dual-write periods,
              data validation, stakeholder communication, and rollback? Do you
              identify the hidden risks (schema differences, type mapping,
              timezone handling)?
            </p>
            <p>
              Strong answer: define success criteria before touching anything,
              run both sources in parallel for a validation period, build a
              reconciliation check that compares counts and key aggregates
              between old and new, plan the cutover with a rollback window,
              communicate the timeline to downstream consumers before the migration.
            </p>

            <p>
              <strong>Q: How would you build a self-serve analytics
              platform where business users can query data without
              engineering involvement?</strong>
            </p>
            <p>
              What they are evaluating: Do you think about the semantic layer
              (consistent metric definitions)? Do you identify the governance
              problem (who decides what data is accessible and to whom)?
              Do you know the difference between self-serve that works and
              self-serve that creates a mess of conflicting numbers?
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Pipeline Failure and Production Mindset Questions
            </h2>

            <p>
              <strong>Q: Your morning ETL ran successfully at 6 AM but
              revenue numbers in the dashboard are wrong. Walk me through
              how you investigate.</strong>
            </p>
            <p>
              What they are evaluating: Do you have a systematic debugging
              process? Do you know the difference between a pipeline failure
              (something broke) and a data quality failure (it ran but produced
              wrong output)? Do you know where to look (dbt tests, row counts,
              source comparison)?
            </p>
            <p>
              Strong answer: check if the pipeline ran at all and completed
              (scheduler logs), check row counts at each layer (bronze/silver/gold),
              compare source vs. destination totals for the relevant time period,
              check dbt test results for the relevant models, identify whether
              the error is in the transformation logic or the source data,
              communicate the status to stakeholders with an ETA before you
              have a fix.
            </p>

            <p>
              <strong>Q: A source API you depend on has been returning
              duplicate records for the last 3 days. How do you handle this?</strong>
            </p>
            <p>
              What they are evaluating: Idempotency instincts. Do you know
              how to identify the scope of impact? Do you have a deduplication
              strategy? Do you know how to communicate this to stakeholders
              without causing panic?
            </p>
            <p>
              Strong answer: determine the blast radius (which tables were
              affected, which reports or dashboards consumed those tables),
              identify the dedup key (what uniquely identifies a record),
              run a deduplication query on the affected period, validate the
              fixed counts against source, communicate impact and resolution
              timeline to stakeholders, add a data quality check to detect
              this pattern in the future.
            </p>

            <p>
              <strong>Q: Your incremental dbt model is running and
              suddenly you realize it has been silently dropping late-arriving
              records for 6 months. What do you do?</strong>
            </p>
            <p>
              What they are evaluating: Do you know what a full refresh costs
              vs. a targeted remediation? Do you prioritize communicating
              the issue or fixing it first? Do you know how to prevent it
              from happening again?
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              SQL and Technical Questions That Go Beyond Basics
            </h2>

            <p>
              <strong>Q: Write a query to find users who were active in
              January but not in February.</strong>
            </p>
            <p>
              The basic answer: LEFT JOIN or NOT IN subquery. The senior answer
              also asks: what is the grain of the events table? What counts
              as &ldquo;active&rdquo;? Is session-level or event-level? And then
              produces the query with a note about the approach:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Left join approach (handles NULLs correctly)
SELECT jan.user_id
FROM (
    SELECT DISTINCT user_id
    FROM events
    WHERE event_date >= '2026-01-01' AND event_date < '2026-02-01'
) jan
LEFT JOIN (
    SELECT DISTINCT user_id
    FROM events
    WHERE event_date >= '2026-02-01' AND event_date < '2026-03-01'
) feb ON jan.user_id = feb.user_id
WHERE feb.user_id IS NULL;

-- EXCEPT approach (cleaner, same result)
SELECT DISTINCT user_id FROM events
WHERE event_date >= '2026-01-01' AND event_date < '2026-02-01'
EXCEPT
SELECT DISTINCT user_id FROM events
WHERE event_date >= '2026-02-01' AND event_date < '2026-03-01';`}</code>
            </pre>

            <p>
              <strong>Q: Explain the difference between RANK(), DENSE_RANK(),
              and ROW_NUMBER(). When does the difference matter in production?</strong>
            </p>
            <p>
              What they are evaluating: Have you actually hit a real bug caused
              by using the wrong window function? The answer should include a
              concrete scenario where the choice matters -- typically
              deduplication logic where ROW_NUMBER is correct and RANK could
              include duplicate rows.
            </p>

            <p>
              <strong>Q: What is a slowly changing dimension? How would
              you implement Type 2 in dbt?</strong>
            </p>
            <p>
              What they are evaluating: Do you understand the full lifecycle
              (valid_from, valid_to, is_current flag)? Can you describe the
              snapshot strategy in dbt? Do you know the performance implications
              of Type 2 on a large dimension table?
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# dbt_project.yml
snapshots:
  myproject:
    dim_customers_snapshot:
      +target_schema: snapshots
      +strategy: timestamp
      +unique_key: customer_id
      +updated_at: updated_at

# snapshots/dim_customers_snapshot.sql
{% snapshot dim_customers_snapshot %}
{{ config(
    target_schema='snapshots',
    unique_key='customer_id',
    strategy='timestamp',
    updated_at='updated_at',
    invalidate_hard_deletes=True,
) }}
SELECT * FROM {{ source('raw', 'customers') }}
{% endsnapshot %}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Behavioral Questions That Reveal Engineering Judgment
            </h2>

            <p>
              <strong>Q: Tell me about a time you had to push back on
              a stakeholder request. How did you handle it?</strong>
            </p>
            <p>
              What they are evaluating: Can you disagree professionally?
              Do you explain the trade-offs rather than just saying no?
              Did you propose an alternative?
            </p>
            <p>
              Strong structure: describe the request and why you had concerns
              (technical risk, timeline, scope creep), explain how you
              communicated the concern (specific trade-offs, not just &ldquo;it&apos;s
              hard&rdquo;), describe the outcome (negotiated a simpler version,
              found a middle path, agreed to phase it).
            </p>

            <p>
              <strong>Q: Describe the most complex data pipeline you have
              built. What would you do differently now?</strong>
            </p>
            <p>
              What they are evaluating: Self-awareness and growth. The &ldquo;what
              would you do differently&rdquo; is the real question. A candidate
              who cannot identify something they would change either lacks
              experience or lacks honesty.
            </p>

            <p>
              <strong>Q: How do you stay current with the data engineering
              ecosystem? What was the last thing you learned and how did
              you apply it?</strong>
            </p>
            <p>
              What they are evaluating: Genuine curiosity vs. resume padding.
              The specific &ldquo;how did you apply it&rdquo; follow-up separates
              people who read newsletters from people who actually experiment.
              Have a concrete answer ready -- a specific tool, pattern, or
              approach you learned and used.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Questions You Should Ask the Interviewer
            </h2>
            <p>
              The questions you ask reveal as much as the questions you answer.
              These signal senior-level thinking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                &ldquo;What does a good first 90 days look like on this team?
                What would make you say someone hit the ground running?&rdquo;
              </li>
              <li>
                &ldquo;What is the biggest data quality or reliability problem
                the team is dealing with right now?&rdquo;
              </li>
              <li>
                &ldquo;How does the data team collaborate with engineering on
                schema changes and new data sources?&rdquo;
              </li>
              <li>
                &ldquo;What does on-call look like for this team? What kinds
                of issues typically come up?&rdquo;
              </li>
              <li>
                &ldquo;How are technical decisions made? Does the data team
                own its own tooling choices, or does it flow through a platform
                org?&rdquo;
              </li>
            </ul>
            <p>
              These questions demonstrate that you are evaluating the role
              as seriously as they are evaluating you -- which is exactly
              what a senior engineer does.
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
