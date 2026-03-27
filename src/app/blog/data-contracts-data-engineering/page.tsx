import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026",
  description:
    "A practical guide to implementing data contracts in modern data pipelines. From dbt schema enforcement to Soda checks — how to stop bad data at the source.",
  openGraph: {
    title: "Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026",
    description:
      "A practical guide to implementing data contracts in modern data pipelines. From dbt schema enforcement to Soda checks — how to stop bad data at the source.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-contracts-data-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026",
    description:
      "A practical guide to implementing data contracts in modern data pipelines. From dbt schema enforcement to Soda checks — how to stop bad data at the source.",
  },
  alternates: { canonical: "/blog/data-contracts-data-engineering" },
};

export default function DataContractsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-contracts-data-engineering"
  );
  const postTitle = encodeURIComponent(
    "Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026"
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
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">Blog</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">11 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            I build data platforms that have to survive constant change: upstream product
            launches, new event schemas, vendor migrations, and teams that move fast without
            waiting for me. Data contracts are the only pattern that has consistently kept
            those pipelines stable. This guide is how I implement them in real production
            stacks, with dbt and Soda as enforcement layers and with the cultural work that
            keeps them alive.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Problem</h2>
            <p className="leading-relaxed">
              In my experience, most pipeline failures are not dramatic. They are silent
              breaks caused by a harmless looking upstream change: a column renamed, a type
              widened, a timestamp that switched from UTC to local time. The change ships,
              the pipeline still runs, and the dashboard quietly drifts. Nobody knows until
              a report is wrong or a downstream system stops trusting the data. That delay is
              what kills confidence.
            </p>
            <p className="leading-relaxed">
              When there is no contract, the only defense is tribal knowledge. People ask
              “who broke it?” in Slack, engineers diff schemas by hand, and data teams scramble
              to patch tests after the damage is done. That culture is reactive by design. I
              have watched it drive wedges between producers and consumers because the incentives
              are backwards. Producers want to ship features, consumers want stability, and
              nobody has a shared definition of what “stable” means.
            </p>
            <p className="leading-relaxed">
              Data contracts exist to end that ambiguity. They create a formal agreement about
              what data looks like, how good it needs to be, and when it must arrive. They also
              make that agreement enforceable so that breakage stops at the boundary instead of
              cascading for days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What a Data Contract Is</h2>
            <p className="leading-relaxed">
              I define a data contract as a formal producer and consumer agreement on schema,
              quality, and service levels. It is not a wiki page or a spreadsheet. It is an
              executable spec that gets enforced in the pipeline. That enforcement is the whole
              point. If the contract is violated, the pipeline should fail fast, alert the right
              people, and prevent bad data from becoming truth.
            </p>
            <p className="leading-relaxed">
              In practice, a contract is a set of assertions attached to a dataset. The assertions
              cover the shape of the data, the expectations about its contents, and the timelines
              for availability. I treat it as an API contract for data. Producers own it, consumers
              rely on it, and the platform enforces it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Three Layers of Enforcement</h2>
            <p className="leading-relaxed">
              When I build contracts, I layer enforcement because not all failures are equal.
              The combination gives me clarity and predictable failure modes.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Schema enforcement: column names, data types, nullability, and uniqueness.
                This is the base layer. If a column disappears or changes type, the contract
                should fail immediately.
              </li>
              <li>
                Quality enforcement: completeness, ranges, freshness, and distribution checks.
                This stops silent drift and catches bad upstream logic before it spreads.
              </li>
              <li>
                SLA enforcement: arrival windows, maximum staleness, and late data handling.
                This layer turns “it shows up eventually” into a measurable promise.
              </li>
            </ul>
            <p className="leading-relaxed">
              The trick is to make each layer explicit. If I only do schema checks, I still
              end up with green pipelines and bad metrics. If I only do quality checks, I miss
              breaking changes. The contract needs both, plus the timing guarantees that keep
              stakeholders aligned.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Implementing with dbt</h2>
            <p className="leading-relaxed">
              dbt has become my default place for contract enforcement because it already sits
              at the transformation layer. Starting with dbt Core 1.5, I can set
              <strong> enforced: true </strong> in schema.yml and make contracts real.
              When a contract is violated, dbt fails the run and gives me a precise error.
            </p>
            <p className="leading-relaxed">
              The pattern I use is simple: define the model, define its columns with data types
              and constraints, and add not null or unique tests as gates. I treat those tests
              as the executable contract. If they fail, the model does not publish.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="language-yaml">{`models:
  - name: fact_orders
    description: "Core order fact table for analytics."
    config:
      contract:
        enforced: true
    columns:
      - name: order_id
        data_type: string
        constraints:
          - type: not_null
          - type: unique
      - name: customer_id
        data_type: string
        constraints:
          - type: not_null
      - name: order_total
        data_type: numeric
        constraints:
          - type: not_null
      - name: order_created_at
        data_type: timestamp
        constraints:
          - type: not_null
    tests:
      - dbt_utils.expression_is_true:
          expression: "order_total >= 0"`}</code>
            </pre>
            <p className="leading-relaxed">
              This format forces a conversation. If a producer wants to change a type or drop a
              column, they have to update the contract and communicate the change. That process
              is slower, but it is honest. I would rather be explicit than debug a broken metric
              a week later.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Implementing with Soda</h2>
            <p className="leading-relaxed">
              Soda is the best lightweight layer I have found for declarative data quality
              checks. I use it to enforce the parts of contracts that are harder to express in
              SQL alone, like freshness or percentage thresholds. It also integrates cleanly
              with orchestrators, so failed checks can block a publish step.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="language-yaml">{`checks for fact_orders:
  - row_count > 0
  - missing_count(order_id) = 0
  - missing_count(customer_id) = 0
  - freshness(order_created_at) < 2h
  - invalid_count(order_total) = 0`}</code>
            </pre>
            <p className="leading-relaxed">
              I wire these checks into the pipeline as gating steps. If they fail, the pipeline
              stops, and the incident is on the data producer. That sounds harsh, but it is the
              only way I have found to make contracts meaningful. If the enforcement is optional,
              it gets ignored.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Producer/Consumer Conversation</h2>
            <p className="leading-relaxed">
              Contracts are not a tooling exercise. They are a conversation. I sit down with
              producers and consumers and define what matters, what breaks, and what is negotiable.
              We agree on schema, quality thresholds, and SLAs, then we encode them.
            </p>
            <p className="leading-relaxed">
              Versioning is the part most teams skip. I treat breaking changes like API version
              bumps: dropping a column, renaming it, or tightening constraints is a breaking
              change. Adding a nullable column is usually non-breaking. The contract should reflect
              that, and the release process should reflect it too. I push for changelogs and
              deprecation windows, even if they are short.
            </p>
            <p className="leading-relaxed">
              The best result is trust. Consumers stop building private validation logic because
              they trust the contract. Producers stop getting blamed for unknown breakages because
              the contract defines the rules. That is the feedback loop I want in a healthy data
              organization.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Common Pitfalls</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Over-specifying contracts. If you encode every edge case, you create a brittle
                system that blocks real work. I focus on the 20 percent of rules that stop 80
                percent of failures.
              </li>
              <li>
                Testing only in dev. Contracts that do not run in production are theater. I enforce
                contracts in prod, then relax them in dev if teams need to iterate quickly.
              </li>
              <li>
                No alerting or ownership. If a contract fails and nobody is paged, the contract is
                dead. I wire failures to the owning team and make the path to remediation obvious.
              </li>
            </ul>
            <p className="leading-relaxed">
              The subtle pitfall is forgetting to evolve contracts. If the business changes and
              the contract does not, people will route around it. Contracts must move with the
              data and with the product.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Closing</h2>
            <p className="leading-relaxed">
              Data contracts shift the culture from reactive to proactive ownership. Instead of
              chasing breakages, I can rely on explicit promises that are enforced in code. That
              gives producers a clear surface area to maintain and gives consumers a stable view
              of the data. In my experience, that trust is the real ROI. The tooling just makes it
              enforceable.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-steel/30 flex items-center gap-4">
          <span className="text-sm text-mutedGray font-mono">Share:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter/X
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-steel/30 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-electricBlue/20 border border-electricBlue/30 flex items-center justify-center text-electricBlue font-bold flex-shrink-0 text-sm">
            RK
          </div>
          <div>
            <p className="font-semibold text-white">Ryan Kirsch</p>
            <p className="text-sm text-mutedGray mt-1">
              Data Engineer at the Philadelphia Inquirer. Writing about practical data engineering,
              local-first stacks, and systems that scale without a cloud bill.
            </p>
            <Link
              href="/"
              className="text-sm text-electricBlue hover:text-white transition-colors mt-2 inline-block"
            >
              View portfolio →
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-electricBlue">
          <Link href="/" className="hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="text-steel"> / </span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
