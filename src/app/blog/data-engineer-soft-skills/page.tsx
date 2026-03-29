import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "The Soft Skills That Make Data Engineers Irreplaceable | Ryan Kirsch",
  description:
    "Technical skills get you hired. These soft skills determine how far you go: translating data concepts for business stakeholders, pushing back on bad requirements, and making the work visible.",
  openGraph: {
    title: "The Soft Skills That Make Data Engineers Irreplaceable",
    description:
      "Technical skills get you hired. These soft skills determine how far you go as a data engineer.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineer-soft-skills",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Soft Skills That Make Data Engineers Irreplaceable",
    description:
      "Technical skills get you hired. These soft skills determine how far you go as a data engineer.",
  },
  alternates: { canonical: "/blog/data-engineer-soft-skills" },
};

export default function DEsoftSkillsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineer-soft-skills"
  );
  const postTitle = encodeURIComponent(
    "The Soft Skills That Make Data Engineers Irreplaceable"
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
            The Soft Skills That Make Data Engineers Irreplaceable
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · February 20, 2026 · <span className="text-cyberTeal">7 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Technical skills are the floor. They get you in the room. What determines whether you
            stay senior, get promoted, and become someone the team cannot imagine losing -- that is
            almost never the technical work alone. These are the skills that actually separate
            good data engineers from great ones.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Translating Data Concepts Without Losing People</h2>
            <p>
              The ability to explain data work to non-technical stakeholders is one of the most underrated
              skills in the discipline. Not dumbing things down -- actually communicating what the work does
              and why it matters in terms that connect to business outcomes.
            </p>
            <p>
              The failure mode is technical specificity that obscures meaning. When a product manager asks
              why a metric changed, they do not need to understand partition pruning. They need to understand
              whether the change represents a real business shift or a data artifact. The data engineer who
              can answer that clearly -- and do it quickly in a Slack message -- becomes someone
              stakeholders trust and route their questions through.
            </p>
            <p>
              Building this skill is deliberate practice. Write the Slack update first, then check whether
              it requires technical context to interpret. If it does, rewrite it until it does not. The goal
              is a person who has never opened your pipeline code understanding whether they should be worried.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Knowing When and How to Push Back</h2>
            <p>
              Data engineers get asked for things that are technically possible but analytically wrong, or
              that create technical debt that will cost the company significantly more than the short-term
              value of the feature. The ability to push back on bad requirements -- clearly, constructively,
              and without sounding obstructionist -- is a senior-level skill.
            </p>
            <p>
              The effective pushback has a specific structure:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Acknowledge the underlying business need (not just the stated solution)</li>
              <li>Explain the specific technical concern concisely</li>
              <li>Offer an alternative that addresses the need without the downside</li>
              <li>Quantify the tradeoff where possible</li>
            </ol>
            <p>
              What does not work: vague resistance (&ldquo;that would be complicated&rdquo;), technical jargon
              as a shield, or capitulating under pressure and then quietly resenting the work. The engineer
              who can say &ldquo;I can build exactly what you described, but it will break every time the
              source schema changes. Here is a version that does not&rdquo; is solving a business problem, not
              blocking one.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Making the Work Visible</h2>
            <p>
              Data engineering work is largely invisible when it is working correctly. The pipeline runs,
              the data arrives, the dashboards load. Nobody celebrates this. When something breaks -- or
              when it looks like something might break but you caught it -- how you communicate that work
              determines how your contribution is perceived.
            </p>
            <p>
              Practical visibility techniques:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Brief incident summaries when you fix a production issue, even a small one. Not a postmortem --
                a two-paragraph Slack message: what happened, how you fixed it, what prevents recurrence.
              </li>
              <li>
                Quantify improvements. &ldquo;Refactored the orders model&rdquo; is invisible.
                &ldquo;Refactored the orders model, cut query runtime from 4 minutes to 35 seconds&rdquo;
                is visible and memorable.
              </li>
              <li>
                Write good commit messages. Engineers and managers who look at the git log see evidence of
                quality thinking in well-described commits. It is documentation that happens automatically.
              </li>
              <li>
                Surface proactive catches. When you notice that a source is sending duplicates before
                downstream teams are affected, say something. You do not have to be dramatic about it --
                a quick note that a potential issue was caught and handled builds a reputation over time.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Asking the Right Questions Before Building</h2>
            <p>
              Junior engineers tend to build what they are asked for. Senior engineers ask enough questions
              to understand what is actually needed before touching a keyboard. The questions are not
              stalling -- they are scoping, and the difference is obvious in hindsight.
            </p>
            <p>
              Questions worth asking before any non-trivial data work:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Who will consume this, and how do they define correctness?</li>
              <li>What is the expected query pattern -- aggregated daily, row-level lookups, or mixed?</li>
              <li>What is the acceptable latency? (The answer often reveals that batch is fine.)</li>
              <li>What happens if this is unavailable for an hour?</li>
              <li>Is there an existing model we could extend rather than build fresh?</li>
            </ul>
            <p>
              Asking these questions in a kickoff saves work. It also demonstrates the kind of thinking
              that gets people trusted with larger scope.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Documentation That People Actually Use</h2>
            <p>
              Most data engineers know documentation is important. Most do not actually write it in a form
              that gets used. The failure mode is documentation that describes what the code does rather
              than why decisions were made and what the consumer needs to know.
            </p>
            <p>
              The documentation that actually helps:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Decision records.</strong> A paragraph explaining why you chose an incremental
                model over a full refresh, or why a specific column is nullable by design. This is what
                saves the next engineer from re-investigating something you already thought through.
              </li>
              <li>
                <strong>Known limitations.</strong> What the model does not capture. Sources that have
                known quality issues. Logic that is approximate rather than exact. Writing this down
                prevents someone building on a false premise.
              </li>
              <li>
                <strong>dbt column descriptions.</strong> Short, specific, in plain language. A column
                called <code>revenue_net</code> should have a description explaining what it excludes
                and which transactions are in scope.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Calibrated Estimation</h2>
            <p>
              Data engineers are regularly asked how long something will take. The ability to give estimates
              that are roughly correct -- and to communicate confidence levels honestly -- is a skill that
              builds trust with managers and product stakeholders faster than almost anything else.
            </p>
            <p>
              What makes estimates go wrong: underestimating discovery time, not accounting for dependencies
              outside your control, and optimism bias toward the happy path. A useful habit is the
              &ldquo;what could go wrong&rdquo; check: before giving an estimate, list the three most likely
              complications and whether your estimate includes time to handle them.
            </p>
            <p>
              When you are uncertain, say so explicitly and give a range. &ldquo;Three to five days depending
              on what the source data looks like&rdquo; is more useful than &ldquo;probably two days&rdquo;
              followed by a three-day overrun. Honest uncertainty is respected; false confidence is not.
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
