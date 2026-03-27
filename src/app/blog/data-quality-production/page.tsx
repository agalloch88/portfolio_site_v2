import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Quality in Production: dbt Tests, Great Expectations, and the Medallion Architecture | Ryan Kirsch",
  description:
    "A practical guide to data quality in production pipelines. Comparing dbt tests and Great Expectations, mapping quality checks to the medallion architecture, and the patterns that catch bad data before it reaches dashboards.",
  openGraph: {
    title:
      "Data Quality in Production: dbt Tests, Great Expectations, and the Medallion Architecture",
    description:
      "A practical guide to data quality in production pipelines. Comparing dbt tests and Great Expectations, mapping quality checks to the medallion architecture, and the patterns that catch bad data before it reaches dashboards.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-quality-production",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Quality in Production: dbt Tests, Great Expectations, and the Medallion Architecture",
    description:
      "A practical guide to data quality in production pipelines. Comparing dbt tests and Great Expectations, mapping quality checks to the medallion architecture, and the patterns that catch bad data before it reaches dashboards.",
  },
  alternates: { canonical: "/blog/data-quality-production" },
};

export default function DataQualityProductionPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-quality-production"
  );
  const postTitle = encodeURIComponent(
    "Data Quality in Production: dbt Tests, Great Expectations, and the Medallion Architecture"
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
            Data Quality in Production: dbt Tests, Great Expectations, and the
            Medallion Architecture
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · July 2026 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Bad data does not crash your pipeline. It poisons your dashboards,
            erodes trust in your platform, and creates decisions built on
            fiction. After years of running quality checks on production
            pipelines at The Philadelphia Inquirer, I have strong opinions about
            which tools belong where, and why most teams test too late.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Why Data Quality Fails Silently
            </h2>
            <p className="leading-relaxed">
              Software bugs are loud. A null pointer crashes the app, a broken
              API returns a 500, and someone gets paged. Data bugs are quiet.
              A dimension table silently drops 20 percent of its rows because
              a source system changed its export format. A revenue metric drifts
              by 8 percent because a currency field started arriving as cents
              instead of dollars. Nobody notices until an executive questions a
              dashboard in a board meeting.
            </p>
            <p className="leading-relaxed">
              The core problem is that most data pipelines are optimized for
              throughput, not correctness. They ingest, transform, and load
              without ever asking whether the data makes sense. When I joined
              the data platform team at the Inquirer, we had pipelines that ran
              green every day while serving stale Salesforce data to the
              subscriptions team. The DAG succeeded. The data was wrong. That
              gap between pipeline health and data health is where quality
              frameworks earn their keep.
            </p>
            <p className="leading-relaxed">
              The fix is not more monitoring dashboards. It is embedding quality
              checks directly into the pipeline so bad data fails fast, before
              it reaches a consumer. That means choosing the right tool for each
              layer and treating test failures like production incidents, not
              warnings to scroll past.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Two Frameworks: dbt Tests vs. Great Expectations
            </h2>
            <p className="leading-relaxed">
              The data quality space has plenty of tools, but two dominate
              production pipelines in practice: dbt tests and Great
              Expectations. They solve overlapping problems with different
              philosophies, and understanding when to reach for each one is the
              difference between a quality strategy and a checkbox exercise.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              dbt Tests: Fast, Built-in, Business Logic First
            </h3>
            <p className="leading-relaxed">
              dbt tests live next to your models and run as part of your build.
              That proximity is their greatest strength. The four built-in
              generic tests cover the majority of real-world failures:{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                not_null
              </code>
              ,{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                unique
              </code>
              ,{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                accepted_values
              </code>
              , and{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                relationships
              </code>
              . Add custom macros and packages like dbt-expectations, and you
              can encode complex business rules without leaving your dbt
              project.
            </p>
            <p className="leading-relaxed">
              The key advantage is that dbt tests are declarative and version
              controlled alongside the models they validate. When a model
              changes, the test changes in the same PR. CI catches regressions
              before they land. There is no separate system to maintain, no
              additional orchestration to wire up, and no drift between what you
              test and what you ship.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`version: 2

models:
  - name: mart_subscription_revenue
    description: "Gold-layer revenue model for subscription analytics"
    columns:
      - name: subscription_id
        tests:
          - not_null
          - unique
      - name: mrr_cents
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 100000
              config:
                severity: error
      - name: plan_type
        tests:
          - accepted_values:
              values: ["monthly", "annual", "trial", "comp"]
      - name: user_id
        tests:
          - relationships:
              to: ref('dim_users')
              field: user_id`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Where dbt tests fall short is on raw, external data. If you are
              ingesting files from a third-party vendor or pulling from an API
              you do not control, dbt tests run after the data is already in
              your warehouse. By that point, you have already paid the compute
              cost of loading and transforming bad data. For upstream
              validation, you need something that runs earlier.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Great Expectations: Richer Validation for Raw Data
            </h3>
            <p className="leading-relaxed">
              Great Expectations (GE) is a Python-native framework built around
              the concept of expectations: assertions about your data that
              produce rich, shareable reports. Where dbt tests are tightly
              coupled to the dbt DAG, GE is framework-agnostic. You can run it
              against a Pandas DataFrame, a Spark job, a SQL database, or a
              flat file. That flexibility makes it ideal for the ingestion
              layer, where data arrives before dbt ever touches it.
            </p>
            <p className="leading-relaxed">
              GE checkpoints let you define a suite of expectations and run
              them as a gate in your pipeline. If expectations fail, the
              checkpoint fails, and your orchestrator can halt downstream
              processing. The HTML data docs are genuinely useful for sharing
              quality reports with non-technical stakeholders. When the
              subscriptions team asks why a Salesforce sync looks off, I can
              send them a GE report instead of a Slack thread full of SQL
              output.
            </p>
            <p className="leading-relaxed">
              The tradeoff is complexity. GE has a learning curve, its
              configuration is verbose, and maintaining expectation suites
              alongside a separate dbt project means two systems to keep in
              sync. In my experience, GE earns its complexity at the bronze
              layer, where you are validating data you do not control. Once
              data is in your warehouse and flowing through dbt, dbt tests are
              simpler and faster for the same job.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Medallion Architecture Connection
            </h2>
            <p className="leading-relaxed">
              The medallion architecture is not just a naming convention for
              your tables. It is a quality contract. Each layer, bronze,
              silver, and gold, has a different relationship with data quality,
              and the testing strategy should reflect that.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Bronze: Volume and Schema Checks
            </h3>
            <p className="leading-relaxed">
              Bronze is raw ingestion. The data arrives as-is from source
              systems, and the primary concern is: did it arrive, and does it
              look roughly like what we expected? This is where Great
              Expectations shines. Run checkpoint validations on row counts,
              column presence, and basic type conformance. If the Salesforce
              export that normally has 50,000 rows shows up with 200, that is
              a bronze-layer failure, and you want to catch it before any
              transformation runs.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Silver: Schema Enforcement and Type Validation
            </h3>
            <p className="leading-relaxed">
              Silver is where raw data becomes standardized. Column names are
              consistent, types are cast, and nulls are handled. dbt staging
              models own this layer, and dbt tests are the natural fit. Test
              for not_null on required fields, unique on natural keys, and
              accepted_values on categorical columns. This is also where you
              catch type drift: a field that was always an integer suddenly
              arriving as a string.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Gold: Business Rule Assertions
            </h3>
            <p className="leading-relaxed">
              Gold models serve analysts and dashboards directly. The tests
              here encode business logic: revenue should never be negative,
              every subscription should map to a valid user, churn rates
              should fall within historical bounds. These are dbt tests with
              high severity, and failures should block the pipeline and alert
              the team. A broken gold model means a broken dashboard, and that
              means broken trust.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How I Run Quality at the Inquirer
            </h2>
            <p className="leading-relaxed">
              Our data platform at the Inquirer ingests from Salesforce, Google
              Analytics, internal CMS systems, and a handful of vendor APIs.
              Each source has different reliability characteristics, and the
              quality strategy reflects that.
            </p>
            <p className="leading-relaxed">
              On the bronze layer, Great Expectations runs as a Dagster asset
              check against raw Salesforce data after every sync. The
              checkpoint validates row counts against historical baselines,
              confirms required columns are present, and checks that key
              fields like subscriber IDs are not null. If any expectation
              fails, the Dagster asset fails, and downstream transforms do not
              run. That fail-fast behavior is the single most important
              pattern in our quality stack.
            </p>
            <p className="leading-relaxed">
              On the silver layer, dbt staging models have standard tests:
              not_null, unique, accepted_values on status fields, and
              relationship tests to ensure referential integrity across
              sources. These run as part of{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                dbt build
              </code>{" "}
              in CI and in production.
            </p>
            <p className="leading-relaxed">
              Gold models carry the heaviest test coverage. Subscription
              revenue models have range checks, cross-source reconciliation
              tests, and freshness assertions. If the gold layer passes, the
              data is ready for analyst consumption. If it does not, the
              on-call engineer investigates before the morning standup.
            </p>
            <p className="leading-relaxed">
              The orchestration layer ties it together. Dagster assets
              represent each stage, and quality gates are explicit
              dependencies. A gold model cannot materialize until its silver
              dependencies pass their tests, and silver cannot run until
              bronze validation succeeds. The DAG encodes the quality contract,
              not just the data flow.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Key Patterns That Matter in Production
            </h2>

            <h3 className="text-xl font-semibold text-white mt-6">
              Warn vs. Error Severity
            </h3>
            <p className="leading-relaxed">
              Not every test failure should block the pipeline. dbt supports{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                severity: warn
              </code>{" "}
              and{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                severity: error
              </code>{" "}
              for exactly this reason. Use error severity on gold models and
              any test that protects a business-critical metric. Use warn
              severity on staging models where a small number of nulls is
              expected but worth tracking. The distinction prevents alert
              fatigue while keeping hard failures loud.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Test Coverage Reporting
            </h3>
            <p className="leading-relaxed">
              You cannot improve what you do not measure. I track test coverage
              as a percentage of models with at least one test, and as a ratio
              of tests to columns on gold models. The goal is not 100 percent
              coverage on every column. It is full coverage on every model
              that serves a dashboard or feeds a downstream system. dbt
              artifacts make this easy to compute, and a weekly coverage report
              keeps the team honest.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Alerting on Failures
            </h3>
            <p className="leading-relaxed">
              A test that fails silently is worse than no test at all, because
              it gives false confidence. Every error-severity test failure
              should trigger an alert in the channel the team actually watches.
              For us, that is Slack for the broader data team and Telegram for
              the on-call engineer. Dagster sensors handle the routing: a
              failed asset check posts to Slack with the expectation name,
              the failure count, and a link to the Dagster run.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              Data Observability vs. Data Testing
            </h3>
            <p className="leading-relaxed">
              Testing and observability are complementary, not competing.
              Testing is proactive: you define what correct looks like and
              fail when reality diverges. Observability is reactive: you
              monitor distributions, volumes, and freshness to catch anomalies
              you did not anticipate. Tools like Elementary layer observability
              on top of dbt artifacts. Great Expectations provides both testing
              and basic profiling. In practice, I use dbt tests and GE
              checkpoints for proactive quality gates, and Elementary for
              trend-based anomaly detection that catches the failures I did
              not think to write a test for.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Practical Takeaways
            </h2>
            <p className="leading-relaxed">
              If you are building or inheriting a data platform, here is what
              I would prioritize for data quality:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li className="leading-relaxed">
                <strong>Validate at ingestion, not just transformation.</strong>{" "}
                Use Great Expectations or a similar tool on raw data before it
                enters your warehouse. Catching bad data at the bronze layer
                saves hours of debugging downstream.
              </li>
              <li className="leading-relaxed">
                <strong>
                  Use dbt tests for everything inside your warehouse.
                </strong>{" "}
                They are fast, declarative, and version controlled. Start with
                not_null and unique on every primary key, then layer in business
                logic tests on gold models.
              </li>
              <li className="leading-relaxed">
                <strong>Map your quality strategy to the medallion layers.</strong>{" "}
                Bronze gets volume and schema checks. Silver gets type and
                referential integrity tests. Gold gets business rule
                assertions. Each layer has a different failure mode, and the
                testing should reflect that.
              </li>
              <li className="leading-relaxed">
                <strong>
                  Make test failures block the pipeline, not just log a warning.
                </strong>{" "}
                Use error severity on anything that protects a dashboard or a
                business metric. A pipeline that runs green with bad data is
                worse than a pipeline that fails loudly.
              </li>
              <li className="leading-relaxed">
                <strong>Alert in the channel your team actually reads.</strong>{" "}
                Route error-severity failures to Slack, Telegram, or whatever
                your on-call engineer monitors. A test failure that nobody
                sees is not a test.
              </li>
              <li className="leading-relaxed">
                <strong>
                  Track test coverage and review it regularly.
                </strong>{" "}
                Full coverage on gold models is non-negotiable. Staging model
                coverage should improve over time. A weekly coverage report
                from dbt artifacts keeps the team accountable without adding
                bureaucracy.
              </li>
            </ul>
          </section>

          <section className="space-y-4 mt-8">
            <p className="leading-relaxed">
              Data quality is not a tool you install. It is a discipline you
              embed into every layer of your pipeline. The tools matter, and
              choosing between dbt tests and Great Expectations based on where
              you are in the medallion stack is a real architectural decision.
              But the tools are only as good as the team commitment to treating
              test failures as incidents and quality coverage as a first-class
              metric. That commitment is what turns a data pipeline into a data
              platform people trust.
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
              <strong className="text-white">Ryan Kirsch</strong> is a senior
              data engineer with 8+ years building data infrastructure at
              media, SaaS, and fintech companies. He specializes in Kafka, dbt,
              Snowflake, and Dagster, and writes about data engineering patterns
              from production experience.{" "}
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
