import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Engineering Skills That Actually Matter in 2026 | Ryan Kirsch",
  description:
    "What the data engineering job market actually rewards in 2026: the skills hiring managers probe for, the ones that are oversold, and how to build a portfolio that signals senior-level thinking.",
  openGraph: {
    title: "Data Engineering Skills That Actually Matter in 2026",
    description:
      "What the data engineering job market actually rewards in 2026: the skills hiring managers probe for, the ones that are oversold, and how to build a portfolio that signals senior-level thinking.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-skills-2026",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Engineering Skills That Actually Matter in 2026",
    description:
      "What the data engineering job market actually rewards in 2026.",
  },
  alternates: { canonical: "/blog/data-engineering-skills-2026" },
};

export default function DESkills2026Post() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineering-skills-2026"
  );
  const postTitle = encodeURIComponent(
    "Data Engineering Skills That Actually Matter in 2026"
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
            Data Engineering Skills That Actually Matter in 2026
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · February 15, 2026 · <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Job descriptions in data engineering have always been a mix of real requirements and aspirational
            wish lists. In 2026 that gap has widened. Some skills that appear prominently in postings are
            genuinely probed in interviews. Others are listed because someone copied the template. Here is
            what actually moves the needle -- from someone who has been on both sides of the table.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">SQL Still Wins Interviews</h2>
            <p>
              This is not a controversial take, but it is one that candidates consistently under-prepare for.
              Strong SQL separates mid-level candidates from senior ones more reliably than most other signals.
              Not syntax recall -- problem-solving fluency under constraints.
            </p>
            <p>
              The specific areas that come up most in senior DE interviews:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Window functions at depth (ROWS vs RANGE frames, LAG/LEAD for sessionization, running totals)</li>
              <li>Set-based thinking -- recognizing when a problem is a join problem versus a window problem</li>
              <li>Query optimization instincts: partition pruning, clustering, scan patterns</li>
              <li>Dealing with duplicates, late-arriving data, and slowly changing dimensions</li>
            </ul>
            <p>
              Candidates who can talk through their SQL approach and explain the tradeoffs -- not just
              produce a correct query -- consistently land senior roles. The explanation is the signal.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">System Design Is Where Senior Roles Are Won or Lost</h2>
            <p>
              Most mid-level DE interviews focus on tool knowledge. Senior interviews shift heavily toward
              system design: given a problem, how would you architect the solution? What tradeoffs are you making?
              What breaks first at 10x scale?
            </p>
            <p>
              The skills that matter here are not memorized architectures. They are the underlying reasoning:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Understanding failure modes.</strong> What happens when a pipeline runs twice? When a
                source schema changes silently? When downstream consumers stop reading? Senior candidates
                anticipate failure rather than just building the happy path.
              </li>
              <li>
                <strong>Cost awareness.</strong> Real production systems have bills attached. Understanding
                the cost implications of warehouse compute choices, incremental vs full refresh tradeoffs,
                and storage tier decisions is something interviewers probe specifically at senior levels.
              </li>
              <li>
                <strong>Operational thinking.</strong> How do you know the pipeline ran correctly? How would
                you debug it at 3am without touching the warehouse? Monitoring, alerting, and observability
                are core to senior DE thinking, not afterthoughts.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">The dbt + Orchestration Pairing Is Now Table Stakes</h2>
            <p>
              In 2022, having production dbt experience was a differentiator. In 2026, it is an expected
              baseline for most senior roles. The same is true for orchestration -- Airflow, Dagster, or Prefect
              experience is assumed at the senior level, not a bonus.
            </p>
            <p>
              What differentiates candidates now is not whether they have used these tools but how they have
              used them under real constraints:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>dbt in a multi-developer environment with staging environments and CI/CD</li>
              <li>Managing long DAGs in Airflow without the scheduler degrading</li>
              <li>Software-defined assets in Dagster versus task-centric Airflow mental models</li>
              <li>When not to use orchestration -- recognizing that some pipelines do not need a DAG</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Python Beyond the Script</h2>
            <p>
              Most data engineers write Python. What separates senior candidates is how they write it.
              The signals interviewers are looking for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Type hints and Pydantic for data validation -- treating schemas as code, not assumptions</li>
              <li>Testing discipline: pytest patterns for transformation logic, not just for APIs</li>
              <li>Generator patterns for large datasets to avoid memory issues</li>
              <li>Error handling that is specific -- catching the right exceptions, not broad try/except</li>
              <li>Understanding when to use pandas, when to use Polars, and when SQL is the right tool entirely</li>
            </ul>
            <p>
              The underlying skill is writing Python that other engineers can maintain, not just Python that runs.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Streaming Is Not Optional Anymore for Many Roles</h2>
            <p>
              In 2024, Kafka or Flink experience was a genuine differentiator. The market has shifted. More
              companies run event-driven data platforms, and more senior roles expect at least working familiarity
              with streaming concepts:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consumer group mechanics and lag management</li>
              <li>Exactly-once vs at-least-once semantics and when each matters</li>
              <li>CDC patterns: using Debezium or similar to stream database changes</li>
              <li>The operational reality of streaming: monitoring lag, handling consumer failures, schema evolution</li>
            </ul>
            <p>
              You do not need to be a Kafka expert for most roles. You need to be able to reason about
              streaming architectures and explain the tradeoffs against batch alternatives.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Skills That Are Oversold in Job Postings</h2>
            <p>
              Some things appear in job descriptions at a rate that does not match how often they are
              actually probed or used:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Spark expertise.</strong> Many teams list Spark but primarily run dbt on Snowflake.
                Spark knowledge is valuable for roles at companies actually processing at scale, but a lot
                of postings list it aspirationally.
              </li>
              <li>
                <strong>ML engineering.</strong> Data engineers adjacent to ML teams are increasingly asked
                about feature pipelines and model serving infrastructure. But most roles that list ML experience
                still primarily need solid batch pipeline work.
              </li>
              <li>
                <strong>Real-time everything.</strong> Not every use case needs sub-second latency. Many roles
                that list real-time requirements are actually fine with five-minute micro-batch schedules.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">How to Signal Senior-Level Thinking in a Portfolio</h2>
            <p>
              A GitHub repo with a working dbt project does not signal senior-level thinking. It signals
              that you have used dbt. The things that do signal senior-level thinking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Documented architecture decisions with tradeoffs explicitly stated -- not just what you built
                but why you chose that approach over alternatives
              </li>
              <li>
                Evidence of thinking about failure: retry logic, idempotency, monitoring hooks, test coverage
              </li>
              <li>
                Writing that demonstrates how you explain technical decisions to non-technical stakeholders --
                a blog post or README that could actually be understood by a product manager
              </li>
              <li>
                Cost awareness worked into the design: partition strategies that reduce scan cost, warehouse
                sizing choices documented, incremental models used deliberately
              </li>
            </ul>
            <p>
              The underlying principle is the same as the interview question: show your reasoning, not just
              your output. Senior engineers are hired to make good decisions. The portfolio has to show you
              make them.
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
