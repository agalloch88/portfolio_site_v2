import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Getting to Senior Data Engineer: The Skills Interviewers Actually Test | Ryan Kirsch",
  description:
    "What separates mid-level from senior data engineering in interviews and on the job. System design thinking, production mindset, the ability to say no intelligently, and how to demonstrate seniority when everyone claims the same tools.",
  openGraph: {
    title:
      "Getting to Senior Data Engineer: The Skills Interviewers Actually Test",
    description:
      "What separates mid-level from senior data engineering. System design thinking, production mindset, the ability to say no intelligently, and how to demonstrate seniority when everyone claims the same tools.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-career-senior",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Getting to Senior Data Engineer: The Skills Interviewers Actually Test",
    description:
      "What separates mid-level from senior data engineering. System design thinking, production mindset, the ability to say no intelligently, and how to demonstrate seniority.",
  },
  alternates: { canonical: "/blog/data-engineering-career-senior" },
};

export default function DataEngineeringCareerSeniorPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineering-career-senior"
  );
  const postTitle = encodeURIComponent(
    "Getting to Senior Data Engineer: The Skills Interviewers Actually Test"
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
            Getting to Senior Data Engineer: The Skills Interviewers Actually
            Test
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 10, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Every data engineer above junior level claims the same tools on
            their resume. dbt, Spark, Airflow or Dagster, a cloud warehouse,
            Python. The tools are not what interviewers are testing when they
            interview for senior roles. They are testing how you think -- and
            that is harder to fake and harder to teach yourself by reading
            documentation.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Tool Gap Is Not Real
            </h2>
            <p>
              Mid-level and senior data engineers often have surprisingly
              similar tool portfolios. Both have used dbt and Spark. Both have
              built pipelines in Airflow or Dagster. Both can write the SQL
              to build a fact table. The difference is not in what tools they
              know -- it is in how they reason about problems where those tools
              are being applied.
            </p>
            <p>
              Senior engineers have made expensive mistakes and learned from
              them. They have shipped a pipeline that seemed correct and
              produced subtly wrong numbers for three weeks before anyone
              noticed. They have built a &ldquo;simple&rdquo; ETL that turned into a
              production incident at scale. They have inherited a codebase
              where every table has a different naming convention and no tests.
            </p>
            <p>
              These experiences produce a specific set of instincts -- patterns
              of thinking that show up in interviews as architectural judgment,
              production mindset, and the ability to identify risks that
              mid-level engineers miss. The good news: you can develop these
              instincts deliberately, without waiting to make every mistake
              yourself.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              System Design Thinking
            </h2>
            <p>
              Senior data engineering interviews almost always include a system
              design component. &ldquo;Design a pipeline that ingests order events
              and produces daily revenue reporting.&rdquo; The mid-level answer
              describes a series of steps: fetch the data, transform it,
              load it to the warehouse, run the reports.
            </p>
            <p>
              The senior answer treats the design as a problem with multiple
              valid solutions and explicit trade-offs:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>What are the SLA requirements?</strong> If revenue
                needs to be queryable by 7 AM, the pipeline needs to be
                scheduled, monitored, and have a recovery path for failures.
                If it needs to be real-time, the architecture changes entirely.
              </li>
              <li>
                <strong>What is the volume and growth trajectory?</strong>
                A pipeline that handles 10K orders per day works very
                differently from one handling 10M. Design for the scale
                you will reach, not just the scale you have today.
              </li>
              <li>
                <strong>Who are the consumers and what do they trust?</strong>
                Analysts who run ad hoc SQL need different guarantees than
                a finance system that pulls revenue for board reports.
              </li>
              <li>
                <strong>What are the failure modes?</strong> Senior engineers
                design systems that fail detectably, not silently. They plan
                for late-arriving data, schema changes, partial failures, and
                the pipeline that runs successfully but produces wrong output.
              </li>
            </ul>
            <p>
              Practice this by taking a data system you have built and writing
              down every assumption it makes that could be wrong. Late-arriving
              events. Duplicate source records. Upstream API downtime.
              Schema evolution. Each one is a failure mode that a senior
              engineer would have explicitly handled.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Production Mindset
            </h2>
            <p>
              Mid-level engineers build things that work. Senior engineers
              build things that work reliably over time, in the hands of
              other people, on data they did not generate. This distinction
              shows up in the small decisions that accumulate into either
              a maintainable platform or a fragile one.
            </p>
            <p>
              The production mindset shows up as:
            </p>
            <p>
              <strong>Idempotency by default.</strong> Every pipeline job
              should be safe to re-run. If you re-run a load job on the same
              data, you should get the same result, not duplicated rows.
              Senior engineers think about this automatically; mid-level
              engineers think about it after the first production incident.
            </p>
            <p>
              <strong>Explicit over implicit.</strong> A function named
              <code>process_data(df)</code> that silently drops rows with
              null customer IDs is implicit. A function named
              <code>filter_orders_with_valid_customer(df, raise_on_high_drop_rate=True)</code>{" "}
              is explicit. Senior engineers prefer the second pattern even
              when it is more verbose, because implicit behavior in
              data pipelines becomes invisible bugs.
            </p>
            <p>
              <strong>Alerting on the absence of data, not just the
              presence of errors.</strong> A pipeline that runs successfully
              but processes zero rows because the source API returned an
              empty response will not fire an error alert. Senior engineers
              add volume checks. &ldquo;This pipeline should load at least 1,000
              rows. Alert if it loads less.&rdquo;
            </p>
            <p>
              <strong>Documentation as a production artifact.</strong>
              Every production model should have a description, a documented
              grain, an owner, and a freshness SLA. Not because documentation
              is a bureaucratic requirement, but because the absence of it
              means the next engineer to touch this model has to reverse-engineer
              the business logic from the SQL.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Ability to Say No Intelligently
            </h2>
            <p>
              This one surprises people. Senior engineers are distinguished
              not just by what they build, but by what they decline to build
              and how they explain it.
            </p>
            <p>
              A stakeholder asks for a real-time dashboard that updates every
              30 seconds. A mid-level engineer either builds it (expensive,
              complex, probably overkill) or says &ldquo;that&apos;s not possible&rdquo;
              (wrong, and unhelpful). A senior engineer asks: &ldquo;What decision
              are you making that requires 30-second updates? If you&apos;re
              monitoring for fraud, here is what that architecture looks like
              and costs. If you&apos;re checking daily revenue before a meeting,
              a 15-minute refresh is sufficient and costs 1% of the real-time
              solution. Which problem are we actually solving?&rdquo;
            </p>
            <p>
              The same principle applies to technical choices. A team wants
              to adopt a new streaming technology because a competitor uses it.
              A mid-level engineer evaluates the technology. A senior engineer
              evaluates whether the problem the technology solves is a problem
              the team actually has, before evaluating the technology itself.
            </p>
            <p>
              Saying no intelligently requires understanding the business need
              well enough to propose a simpler alternative. That requires
              asking clarifying questions rather than immediately scoping
              the request as given. In interviews, this shows up as candidates
              who ask clarifying questions before jumping to architecture.
              Interviewers notice.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Cross-Functional Communication
            </h2>
            <p>
              Data engineers sit at an unusual intersection: they need to
              understand source systems (engineering), business logic
              (analytics), and infrastructure (platform). Senior engineers
              communicate fluently in all three directions.
            </p>
            <p>
              With engineers: clear technical specifications, willingness to
              read source code when documentation is incomplete, ability to
              discuss schema design and API contracts without sounding like
              a data person complaining about software engineers.
            </p>
            <p>
              With analysts: translating between &ldquo;the pipeline failed&rdquo; and
              &ldquo;here is what data is missing and here is when it will be
              available.&rdquo; Understanding what business questions analysts
              are trying to answer before building models, not after.
            </p>
            <p>
              With leadership: translating technical decisions into business
              impact. &ldquo;The incremental model strategy will reduce our daily
              compute cost by 40% and cut pipeline latency from 4 hours to
              45 minutes&rdquo; lands differently than &ldquo;I refactored the dbt
              models.&rdquo;
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How to Demonstrate Seniority in Interviews
            </h2>
            <p>
              Given that tools do not differentiate senior from mid-level,
              the demonstration has to come from how you talk about your work:
            </p>
            <p>
              <strong>Lead with impact, not activity.</strong> &ldquo;I built a
              dbt project with 50 models&rdquo; is activity. &ldquo;I built a dbt
              project that reduced analyst query time from 45 minutes to
              30 seconds for daily reporting, enabling the finance team to
              complete their monthly close 2 days faster&rdquo; is impact. Every
              technical story should have a business consequence.
            </p>
            <p>
              <strong>Discuss the mistakes.</strong> Mid-level candidates
              describe what they built. Senior candidates describe what they
              built, what went wrong, and how they fixed it. &ldquo;The incremental
              model I designed worked well in testing but had a bug where
              late-arriving data was silently dropped. I caught it when revenue
              numbers were off by 3%. Here is what I changed and what I added
              to prevent it from happening again.&rdquo; This is seniority in
              three sentences.
            </p>
            <p>
              <strong>Ask questions that demonstrate system thinking.</strong>
              When an interviewer describes a system design problem, ask about
              scale, latency requirements, consumer types, and failure modes
              before proposing an architecture. This demonstrates that you
              do not default to a single solution -- you gather information
              to choose the right one.
            </p>
            <p>
              <strong>Have opinions about trade-offs.</strong> &ldquo;I prefer
              Dagster over Airflow for new projects because the asset model
              gives better observability, though I recognize the team&apos;s
              existing Airflow expertise has real value and I would not push
              for a migration until we have a clear forcing function.&rdquo;
              This is the kind of opinion that distinguishes a senior engineer
              from someone who lists both tools on a resume.
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
