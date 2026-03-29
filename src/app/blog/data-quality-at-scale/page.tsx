import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Quality at Scale: Great Expectations, dbt Tests, and Monte Carlo",
  description:
    "A practical comparison of data quality tooling at scale: Great Expectations, dbt tests, Monte Carlo, and Soda. How to layer them, when each earns its place, and incident response patterns that actually work.",
  openGraph: {
    title: "Data Quality at Scale: Great Expectations, dbt Tests, and Monte Carlo",
    description:
      "A practical comparison of data quality tooling at scale: Great Expectations, dbt tests, Monte Carlo, and Soda. How to layer them, when each earns its place, and incident response patterns that actually work.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-quality-at-scale",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Quality at Scale: Great Expectations, dbt Tests, and Monte Carlo",
    description:
      "A practical comparison of data quality tooling at scale: Great Expectations, dbt tests, Monte Carlo, and Soda. How to layer them, when each earns its place, and incident response patterns that actually work.",
  },
  alternates: { canonical: "/blog/data-quality-at-scale" },
};

export default function DataQualityAtScalePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-quality-at-scale"
  );
  const postTitle = encodeURIComponent(
    "Data Quality at Scale: Great Expectations, dbt Tests, and Monte Carlo"
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
            Data Quality at Scale: Great Expectations, dbt Tests, and Monte Carlo
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">10-12 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data quality breaks at scale in predictable ways. Schema drift, unexpected
            nulls, freshness gaps, and statistical anomalies each need different
            detection strategies. Here is how to layer the right tools so problems
            surface before stakeholders find them.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <p className="leading-relaxed">
              Most data quality failures are not mysterious. They fall into a small
              number of categories: schema changes that were not communicated,
              upstream sources that went silent, values that drifted outside the
              expected range, and logic bugs introduced by a transformation change.
              The tooling landscape for catching these has matured significantly, but
              it has also fragmented. Understanding which tool solves which problem is
              the prerequisite for building a quality layer that actually works.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Four Categories of Data Quality Checks</h2>
            <p className="leading-relaxed">
              Before comparing tools, it helps to be precise about what you are
              testing. There are four categories worth separating: schema validation,
              constraint-based tests, statistical anomaly detection, and freshness
              checks. Each requires different detection mechanisms and different
              tooling.
            </p>
            <p className="leading-relaxed">
              <strong>Schema validation</strong> catches structural changes: a column
              was dropped, a type changed from string to integer, a new required field
              appeared. This is the most basic layer and should run on every pipeline
              execution.
            </p>
            <p className="leading-relaxed">
              <strong>Constraint-based tests</strong> enforce business rules: no nulls
              in a primary key column, values in a status field must be from a known
              set, a count must be within an expected range. These are deterministic
              and can be expressed as assertions.
            </p>
            <p className="leading-relaxed">
              <strong>Statistical anomaly detection</strong> catches drift that does
              not violate explicit constraints but is unusual: a conversion rate that
              dropped by 40 percent overnight, a row count that is two standard
              deviations below the historical average. These require baseline modeling,
              not just threshold checks.
            </p>
            <p className="leading-relaxed">
              <strong>Freshness checks</strong> confirm that data arrived recently
              enough to be useful. A table that claims to be current but has not
              received a row in four hours is a quality problem even if every row in
              it is perfectly valid.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">dbt Tests: The Right Starting Point</h2>
            <p className="leading-relaxed">
              For teams using dbt, built-in tests are the right place to start.
              They are co-located with your models, easy to write, and run as part
              of the transformation pipeline. The four built-in tests cover the most
              common constraint checks: uniqueness, not-null, accepted values, and
              referential integrity. Generic tests handle a wide range of additional
              cases. The dbt-expectations package extends coverage significantly.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# models/schema.yml
models:
  - name: orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ["pending", "processing", "shipped", "delivered", "cancelled"]
      - name: user_id
        tests:
          - relationships:
              to: ref("users")
              field: user_id
      - name: order_total_usd
        tests:
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 100000`}
              </pre>
            </div>
            <p className="leading-relaxed">
              dbt tests work well for deterministic checks on transformed models. Their
              limitation is that they require explicit thresholds and do not
              automatically adapt to seasonal or trend-based variation in your data.
              They also run only when the pipeline runs, which means they will not
              detect a freshness failure between pipeline executions.
            </p>
            <p className="leading-relaxed">
              dbt source freshness fills the freshness gap: define a loaded-at column
              and an expected freshness window, and dbt will alert when the source
              falls behind.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# models/sources.yml
sources:
  - name: raw_events
    database: analytics
    schema: raw
    loaded_at_field: _loaded_at
    freshness:
      warn_after: {count: 1, period: hour}
      error_after: {count: 4, period: hour}
    tables:
      - name: pageview_events
      - name: order_events`}
              </pre>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Great Expectations: Programmatic Validation at the Source</h2>
            <p className="leading-relaxed">
              Great Expectations is the right tool when you need to validate data at
              ingestion time, before it enters your dbt models, or when your data
              sources are Spark DataFrames, Pandas DataFrames, or raw files rather
              than warehouse tables. It provides a rich library of expectations and
              a checkpoint system that integrates with your pipeline orchestrator.
            </p>
            <p className="leading-relaxed">
              The practical use case is validating raw data before it lands in the
              warehouse or before a heavy transformation runs. Catching a schema
              change or a large percentage of nulls at the landing zone is cheaper
              and less disruptive than catching it after a two-hour Spark job has
              already written bad data downstream.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`import great_expectations as gx
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("gx_validation").getOrCreate()
df = spark.read.parquet("s3://data-lake/raw/orders/2026-03-21/")

context = gx.get_context()
ds = context.sources.add_spark("spark_source")
da = ds.add_dataframe_asset("orders_asset")
batch = da.build_batch_request(dataframe=df)

suite = context.add_or_update_expectation_suite("orders_suite")

validator = context.get_validator(
    batch_request=batch,
    expectation_suite=suite,
)

validator.expect_column_to_exist("order_id")
validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_be_between(
    "order_total_usd", min_value=0, max_value=100000
)
validator.expect_column_values_to_match_regex(
    "email", r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

results = validator.validate()
if not results.success:
    raise ValueError(f"Validation failed: {results.statistics}")`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Great Expectations has more setup friction than dbt tests and requires
              a context configuration that teams often underestimate. The payoff is
              flexibility: it runs anywhere Python runs, handles any data source,
              and provides detailed HTML validation reports that non-engineers can
              read. For source-layer validation, it remains the most capable
              open-source option.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Monte Carlo and Soda: Anomaly Detection and Observability</h2>
            <p className="leading-relaxed">
              dbt tests and Great Expectations require you to define what good looks
              like explicitly. Monte Carlo and Soda take a different approach: they
              learn what normal looks like from your historical data and alert when
              something deviates from that baseline. This is the right tool for the
              statistical anomaly detection category.
            </p>
            <p className="leading-relaxed">
              Monte Carlo is the more mature commercial offering. It monitors your
              warehouse continuously, builds statistical baselines for volume, schema,
              freshness, and distribution, and surfaces anomalies as lineage-aware
              incidents. You can trace an alert through your table dependency graph
              to identify the root cause. The tradeoff is cost: Monte Carlo is priced
              for teams with real data SLAs and engineering budget to match.
            </p>
            <p className="leading-relaxed">
              Soda offers similar capabilities with a more flexible pricing model and
              a strong open-source tier through soda-core. It integrates natively with
              dbt and supports both custom SQL checks and ML-based anomaly detection.
              For teams looking for a middle ground between fully custom dbt tests and
              a full observability platform, Soda is worth evaluating seriously.
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`# soda/checks/orders.yml
checks for orders:
  - row_count > 0
  - missing_count(order_id) = 0
  - duplicate_count(order_id) = 0
  - freshness(created_at) < 4h
  - avg(order_total_usd) between 40 and 200
  - anomaly score for row_count < default`}
              </pre>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">How to Layer the Tools</h2>
            <p className="leading-relaxed">
              The most effective data quality architecture layers these tools by where
              in the pipeline they run and what type of problem they detect. A
              practical pattern for a mature data team:
            </p>
            <div className="rounded-lg border border-steel/30 bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs sm:text-sm text-lightGray">
{`Ingestion layer:    Great Expectations or Soda
                    Schema validation + structural constraints
                    Runs before data enters the warehouse

Transformation:     dbt tests
                    Business rule enforcement on transformed models
                    Runs as part of dbt pipeline execution

Freshness:          dbt source freshness + Soda freshness checks
                    Continuous monitoring between pipeline runs

Anomaly detection:  Monte Carlo or Soda anomaly scores
                    Statistical baseline monitoring
                    Runs continuously against warehouse tables`}
              </pre>
            </div>
            <p className="leading-relaxed">
              Not every team needs all four layers on day one. Start with dbt tests
              and source freshness checks, which cover the majority of actionable
              quality failures with minimal overhead. Add Great Expectations at the
              ingestion layer when you have upstream sources that drift frequently.
              Add Monte Carlo or Soda anomaly detection when you have a track record
              of quality incidents that dbt tests did not catch in time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Incident Response Patterns</h2>
            <p className="leading-relaxed">
              A quality check that fires an alert without a defined response process
              creates alert fatigue rather than reliability. The response pattern
              matters as much as the detection. A simple but effective pattern: each
              quality alert maps to a severity level, a responsible team, and a
              maximum response time. Severity 1 blocks downstream pipelines and
              pages on-call immediately. Severity 2 sends a Slack notification and
              requires acknowledgment within two hours. Severity 3 logs to the
              monitoring dashboard and is addressed in the next sprint.
            </p>
            <p className="leading-relaxed">
              Lineage integration is what separates a good incident response workflow
              from a great one. When a quality failure fires, you want to know
              immediately which downstream tables and dashboards are affected. Monte
              Carlo provides this natively. For dbt-only shops, dbt&apos;s exposure
              documentation and lineage graph approximate this by making dependencies
              explicit, even if the runtime alerting is more manual.
            </p>
            <p className="leading-relaxed">
              Quarantine patterns are worth building into your warehouse schema early.
              A staging layer that holds data awaiting quality validation, separate
              from the tables that analytical consumers query, means a quality failure
              blocks bad data from reaching stakeholders without requiring a rollback
              or a correction job. You can release from quarantine once the failure
              is resolved, with full audit history intact.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Practical Recommendation</h2>
            <p className="leading-relaxed">
              For most data teams in 2026: start with dbt tests and source freshness.
              They are low-friction, co-located with your transformation code, and
              cover the majority of quality failures that engineering teams actually
              encounter. Add Great Expectations at the ingestion layer when upstream
              data is genuinely unreliable. Evaluate Soda or Monte Carlo when you
              need continuous monitoring and anomaly detection that dbt tests cannot
              provide. The goal is not perfect coverage: it is the fastest possible
              detection of the quality failures that actually affect your stakeholders.
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
