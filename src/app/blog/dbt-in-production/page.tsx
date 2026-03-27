import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "dbt in Production: Testing, CI/CD, and the Medallion Architecture",
  description:
    "How to build a production-grade dbt project: medallion architecture, data tests, CI/CD pipelines, and the practices that turn a collection of SQL files into a reliable data platform.",
  openGraph: {
    title: "dbt in Production: Testing, CI/CD, and the Medallion Architecture",
    description:
      "How to build a production-grade dbt project: medallion architecture, data tests, CI/CD pipelines, and the practices that turn a collection of SQL files into a reliable data platform.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-in-production",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "dbt in Production: Testing, CI/CD, and the Medallion Architecture",
    description:
      "How to build a production-grade dbt project: medallion architecture, data tests, CI/CD pipelines, and the practices that turn a collection of SQL files into a reliable data platform.",
  },
  alternates: { canonical: "/blog/dbt-in-production" },
};

export default function DbtInProductionPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/dbt-in-production");
  const postTitle = encodeURIComponent(
    "dbt in Production: Testing, CI/CD, and the Medallion Architecture"
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
            dbt in Production: Testing, CI/CD, and the Medallion Architecture
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">8 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most teams stop at a handful of dbt models and call it a project. I did the
            same until I had to support analytics for a news publisher with 1.5M+
            subscribers. The difference between a dbt project and a dbt platform is not
            the SQL. It is the testing, governance, and CI/CD that keep the SQL honest.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <p className="leading-relaxed">
              dbt is deceptively approachable. You can start with a single model, run
              <code className="text-cyberTeal bg-black/30 px-1 rounded">dbt run</code>, and
              feel productive in an afternoon. That first win is important. It is also
              where most teams stop. They ship a few models, then add a few more, and
              suddenly the folder is full of SQL files that no one really owns. When the
              data quality drifts or a metric breaks, the team blames upstream sources,
              reruns jobs, and moves on.
            </p>
            <p className="leading-relaxed">
              The hard lesson from production is that SQL files are the least important
              part of a dbt platform. The real value comes from disciplined structure,
              automated tests, and a delivery workflow that treats models like code.
              That is what makes dbt scale across teams and time. In the rest of this
              post, I will walk through the patterns I use to keep a dbt project
              production-grade, including how we ran it for that 1.5M+ subscriber news
              publisher without the analytics team losing trust.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Medallion Architecture With dbt</h2>
            <p className="leading-relaxed">
              The medallion architecture is not a buzzword. It is the simplest mental
              model that keeps analytics sane. Each layer has a purpose. Bronze is raw
              and minimally cleaned. Silver is standardized and ready for reuse. Gold
              is curated, business-facing data that drives dashboards and product
              decisions.
            </p>
            <p className="leading-relaxed">
              In dbt terms, that typically maps to staging, intermediate, and marts. I
              treat staging models as the Bronze to Silver boundary. They rename
              columns, standardize types, and make the raw data consistent. Intermediate
              models are where I centralize business logic, joins, and calculations.
              Those models are still internal, but they are reusable building blocks.
              Finally, marts are Gold models designed for specific analytics use cases.
              If a model is directly queried by an analyst or a BI tool, it belongs in
              the mart layer.
            </p>
            <p className="leading-relaxed">
              This separation matters because it makes change safe. When a source field
              shifts, I update the staging model and keep the rest of the stack stable.
              When a metric definition evolves, I change an intermediate model and
              propagate it to the marts without rewriting every dashboard. That is how
              you keep a platform reliable across years of changes, not just weeks.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`models/
  staging/
    stg_users.sql
    stg_subscriptions.sql
  intermediate/
    int_user_lifecycle.sql
    int_subscription_status.sql
  marts/
    mart_user_growth.sql
    mart_revenue_retention.sql`}
              </pre>
            </div>
            <p className="leading-relaxed">
              At the news publisher, this structure let us scale fast. Editorial
              analytics, subscription growth, and ad performance all had different
              needs. By anchoring everything in shared staging and intermediate models,
              we reduced duplicate logic and made the final marts more trustworthy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Data Testing Is the CI Gate</h2>
            <p className="leading-relaxed">
              dbt ships with a testing framework that is easy to ignore and painful to
              skip. The basics are powerful: <code className="text-cyberTeal bg-black/30 px-1 rounded">not_null</code>,
              <code className="text-cyberTeal bg-black/30 px-1 rounded">unique</code>,
              <code className="text-cyberTeal bg-black/30 px-1 rounded">accepted_values</code>, and
              <code className="text-cyberTeal bg-black/30 px-1 rounded">relationships</code>.
              Those four cover the majority of real data quality failures I see in
              production.
            </p>
            <p className="leading-relaxed">
              The moment you move beyond the basics, custom generic tests become
              essential. I lean on dbt-expectations for common patterns like row count
              comparisons, percent thresholds, and column type enforcement. I also write
              a few in-house generic tests for business-specific rules. The key is that
              tests live next to the models and run automatically in CI. If a test
              fails, the PR does not merge. That gate is what separates a dbt platform
              from a loose collection of SQL files.
            </p>
            <p className="leading-relaxed">
              Here is a real example from a user mart model. We had an email dimension
              that marketing and growth both used, and duplicates caused real campaign
              errors. The solution was a simple uniqueness test, but the impact was
              massive because it ran every time anyone touched the model.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`version: 2

models:
  - name: mart_users
    description: "Analytics-ready user dimension"
    columns:
      - name: user_id
        tests:
          - not_null
          - unique
      - name: email_address
        tests:
          - not_null
          - unique
      - name: subscription_status
        tests:
          - accepted_values:
              values: ["active", "canceled", "trial", "expired"]`}
              </pre>
            </div>
            <p className="leading-relaxed">
              At the 1.5M+ subscriber publisher, we treated tests as a contract. If a
              test failed, the on-call data engineer investigated before analytics
              teams felt the issue. That discipline changed how much the business
              trusted data, which is the real KPI for any data platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">CI/CD for dbt</h2>
            <p className="leading-relaxed">
              dbt makes local development easy, but it is useless without a consistent
              delivery pipeline. My default setup is GitHub Actions on every pull
              request. The workflow runs <code className="text-cyberTeal bg-black/30 px-1 rounded">dbt build</code>
              for modified models, then <code className="text-cyberTeal bg-black/30 px-1 rounded">dbt test</code>, then
              <code className="text-cyberTeal bg-black/30 px-1 rounded">dbt docs generate</code> to keep documentation
              and lineage current. This is the basic CI contract for dbt.
            </p>
            <p className="leading-relaxed">
              To keep CI fast, I use the slim CI pattern with the
              <code className="text-cyberTeal bg-black/30 px-1 rounded">state:modified+</code> selector. That means we
              only build models that changed and their downstream dependencies. It keeps
              PR feedback fast without sacrificing coverage.
            </p>
            <p className="leading-relaxed">
              For deployments, I prefer branch per environment. Main merges deploy to
              production. A long-lived <code className="text-cyberTeal bg-black/30 px-1 rounded">develop</code> or
              <code className="text-cyberTeal bg-black/30 px-1 rounded">staging</code> branch deploys to a staging
              warehouse. Feature branches run CI only. This mirrors how application
              engineering teams ship code, and it works just as well for analytics.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`name: dbt-ci

on:
  pull_request:
    branches: ["main"]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install deps
        run: |
          pip install dbt-core dbt-snowflake
      - name: dbt build (slim CI)
        run: |
          dbt build --select state:modified+ --defer --state ./target
      - name: dbt test
        run: |
          dbt test --select state:modified+ --defer --state ./target
      - name: dbt docs generate
        run: |
          dbt docs generate`}
              </pre>
            </div>
            <p className="leading-relaxed">
              At the publisher, this workflow meant a model change could not land
              without tests, and everyone knew it. It is one of the highest leverage
              changes you can make to a dbt project.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Incremental Models Done Right</h2>
            <p className="leading-relaxed">
              Incremental models are a blessing and a trap. The macro
              <code className="text-cyberTeal bg-black/30 px-1 rounded">is_incremental()</code> makes it easy to filter
              for new records, but it does not protect you from late arriving data,
              updated records, or silent duplication. If you are not careful, you will
              miss changes and never notice.
            </p>
            <p className="leading-relaxed">
              The fix is a lookback window and a deterministic unique key. Every
              incremental model should reprocess a small slice of recent history. For
              example, we often reprocess the last three days of data, then upsert by a
              stable unique key. That catches late arriving events without forcing a
              full refresh. It also keeps the model idempotent, which is the real goal.
            </p>
            <p className="leading-relaxed">
              When I built subscriber revenue models at the news publisher, a lookback
              window was essential. Subscription changes arrive late, and refunds can
              show up days after the initial transaction. The model needed to stay
              correct, not just fast.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`{{
  config(
    materialized='incremental',
    unique_key='subscription_event_id'
  )
}}

with source as (
  select
    subscription_event_id,
    user_id,
    event_type,
    occurred_at,
    amount_cents
  from {{ ref('stg_subscription_events') }}
  {% if is_incremental() %}
    where occurred_at >= dateadd(day, -3, current_timestamp)
  {% endif %}
)

select * from source`}
              </pre>
            </div>
            <p className="leading-relaxed">
              This pattern is simple, but it avoids the most common incremental bug I
              see: silently missing updates. The cost of reprocessing a few days is
              trivial compared to the cost of bad revenue data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Monitoring and Observability</h2>
            <p className="leading-relaxed">
              dbt artifacts are a foundation for observability. The manifest, run
              results, and catalog files already contain everything you need to build
              lineage views, freshness checks, and model-level monitoring. Many teams
              ignore them, which is a missed opportunity.
            </p>
            <p className="leading-relaxed">
              In practice, I pair dbt artifacts with a tool like Elementary or re_data
              for anomaly detection. They read dbt metadata, track row counts and
              distribution shifts, and alert when something changes. The result is a
              monitoring layer that is tied directly to your dbt models, not a separate
              data quality system that no one remembers to maintain.
            </p>
            <p className="leading-relaxed">
              For the 1.5M+ subscriber publisher, this was the difference between
              reactive and proactive. When a source table dropped 30 percent of its
              daily volume, we caught it before the morning dashboards went live. That
              is the level of reliability a production data platform needs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What Makes dbt Scale</h2>
            <p className="leading-relaxed">
              dbt scales when you treat it like software, not a pile of SQL. The
              medallion architecture creates separation of concerns. Tests encode data
              contracts. CI/CD enforces those contracts. Incremental models respect
              reality instead of assuming sources are perfect. Monitoring closes the
              loop so you can trust what ships.
            </p>
            <p className="leading-relaxed">
              That is the governance layer. It is not glamorous, but it is what makes a
              dbt project a dbt platform. At the news publisher, that governance turned
              1.5M+ subscriber analytics into something people trusted enough to make
              revenue decisions on. If you want dbt to scale in your organization, this
              is the work that matters.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-steel/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-mutedGray">
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
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Airflow,
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
