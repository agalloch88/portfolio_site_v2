import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "dbt Testing Best Practices: Beyond the Basics | Ryan Kirsch - Data Engineer",
  description:
    "Most teams only scratch the surface with dbt tests. Here is how to build a comprehensive dbt testing strategy that catches real bugs and keeps your data trustworthy.",
  openGraph: {
    title:
      "dbt Testing Best Practices: Beyond the Basics | Ryan Kirsch - Data Engineer",
    description:
      "Most teams only scratch the surface with dbt tests. Here is how to build a comprehensive dbt testing strategy that catches real bugs and keeps your data trustworthy.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-testing-best-practices",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "dbt Testing Best Practices: Beyond the Basics | Ryan Kirsch - Data Engineer",
    description:
      "Most teams only scratch the surface with dbt tests. Here is how to build a comprehensive dbt testing strategy that catches real bugs and keeps your data trustworthy.",
  },
  alternates: { canonical: "/blog/dbt-testing-best-practices" },
};

export default function DbtTestingBestPracticesPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dbt-testing-best-practices"
  );
  const postTitle = encodeURIComponent(
    "dbt Testing Best Practices: Beyond the Basics"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">&larr;</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="mt-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {["dbt", "Data Quality", "Testing", "SQL", "Data Engineering", "Analytics Engineering"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            dbt Testing Best Practices: Beyond the Basics
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 8 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Most dbt projects I have reviewed have the same testing pattern:
            a handful of <code>not_null</code> and <code>unique</code> tests on
            primary keys, and not much else. The tests pass on every run, the
            team feels confident, and then a stakeholder finds a revenue figure
            that is off by 40% because a source-layer join started producing
            duplicates three weeks ago.
          </p>
          <p>
            The built-in tests are not the problem. They are genuinely useful.
            The problem is treating them as the complete testing strategy rather
            than the starting point. A mature dbt testing approach layers
            multiple test types across different model layers, uses severity
            levels intentionally, and catches the bugs that actually show up
            in production, not just the obvious ones.
          </p>
          <p>
            Here is how I structure dbt testing in the stacks I build and
            maintain.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Built-In Tests: What They Actually Check
          </h2>
          <p>
            dbt ships with four generic tests:{" "}
            <code>unique</code>, <code>not_null</code>,{" "}
            <code>accepted_values</code>, and <code>relationships</code>.
            Understanding exactly what each one checks (and what it does not
            check) is the prerequisite for knowing when they are sufficient and
            when you need something more.
          </p>
          <p>
            <strong className="text-white">
              <code>unique</code>
            </strong>{" "}
            checks that no two rows share the same value in a column. It does
            not check that the column is not null. A column with two null values
            passes a <code>unique</code> test in most SQL dialects because null
            is not equal to null. If your grain key can be null, combine{" "}
            <code>unique</code> and <code>not_null</code>.
          </p>
          <p>
            <strong className="text-white">
              <code>not_null</code>
            </strong>{" "}
            checks that no row has a null value in the column. Straightforward,
            but note it will not catch empty strings, sentinel values like{" "}
            <code>-1</code> or <code>&apos;unknown&apos;</code>, or values that
            look like IDs but are not (a string of zeros, for example). If your
            source system uses empty strings instead of nulls, this test will
            not catch missing data.
          </p>
          <p>
            <strong className="text-white">
              <code>accepted_values</code>
            </strong>{" "}
            checks that every non-null value in a column belongs to a specified
            list. This is your first line of defense against unexpected enum
            values from source systems. Typical usage:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# models/staging/schema.yml
models:
  - name: stg_orders
    columns:
      - name: status
        tests:
          - accepted_values:
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
              quote: true`}
          </pre>
          <p>
            If your source system adds a new status value like{" "}
            <code>returned</code> without telling you, this test breaks. That
            is the correct behavior. You want to know.
          </p>
          <p>
            <strong className="text-white">
              <code>relationships</code>
            </strong>{" "}
            checks referential integrity between two models. Every value in{" "}
            <code>stg_order_items.order_id</code> must exist in{" "}
            <code>stg_orders.order_id</code>. This test catches orphaned records
            that would cause silent data loss in a downstream join. It is one
            of the most valuable tests and one of the most commonly skipped.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`- name: order_id
  tests:
    - relationships:
        to: ref('stg_orders')
        field: order_id`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Custom Singular Tests: When Generic Tests Are Not Enough
          </h2>
          <p>
            Singular tests live in the <code>tests/</code> directory and are
            plain SQL files that return rows when the test fails. If the query
            returns zero rows, the test passes. If it returns any rows, those
            rows represent the failing records and the test fails.
          </p>
          <p>
            Singular tests are the right tool when your data quality rule is
            too specific for a generic test or when the rule spans multiple
            columns or multiple models. A few examples from real projects:
          </p>
          <p>
            <strong className="text-white">
              Revenue cannot be negative for completed orders:
            </strong>
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- tests/assert_completed_orders_positive_revenue.sql
select
    order_id,
    status,
    revenue_usd
from {{ ref('fct_orders') }}
where
    status = 'completed'
    and revenue_usd < 0`}
          </pre>
          <p>
            <strong className="text-white">
              Event timestamp cannot be in the future:
            </strong>
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- tests/assert_event_timestamps_not_future.sql
select
    event_id,
    event_at
from {{ ref('stg_events') }}
where event_at > current_timestamp`}
          </pre>
          <p>
            <strong className="text-white">
              User&apos;s first order date cannot be after their signup date:
            </strong>
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- tests/assert_first_order_after_signup.sql
select
    u.user_id,
    u.signed_up_at,
    o.first_order_at
from {{ ref('dim_users') }} u
left join {{ ref('fct_user_orders') }} o using (user_id)
where
    o.first_order_at is not null
    and o.first_order_at < u.signed_up_at`}
          </pre>
          <p>
            These are the tests that actually catch production bugs. The kinds
            of issues where a source system ETL runs out of order, where a
            timezone conversion goes wrong, or where a business logic assumption
            is violated.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The dbt-expectations Package
          </h2>
          <p>
            The{" "}
            <a
              href="https://github.com/calogica/dbt-expectations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors"
            >
              dbt-expectations
            </a>{" "}
            package ports the Great Expectations test vocabulary into dbt schema
            tests. It is the fastest way to add range checks, row count checks,
            distribution checks, and pattern matching without writing singular
            SQL for each one.
          </p>
          <p>
            The tests I reach for most often:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Check that a metric column stays within a reasonable range
- name: conversion_rate
  tests:
    - dbt_expectations.expect_column_values_to_be_between:
        min_value: 0.0
        max_value: 1.0

# Check that revenue is never suspiciously high (data entry error guard)
- name: revenue_usd
  tests:
    - dbt_expectations.expect_column_values_to_be_between:
        min_value: 0
        max_value: 1000000

# Check that an ID column matches an expected format
- name: user_id
  tests:
    - dbt_expectations.expect_column_values_to_match_regex:
        regex: "^usr_[a-z0-9]{12}$"

# Check row count is above a minimum threshold
models:
  - name: fct_daily_sessions
    tests:
      - dbt_expectations.expect_table_row_count_to_be_between:
          min_value: 1000
          max_value: 10000000`}
          </pre>
          <p>
            The row count test on fact tables is particularly useful in CI.
            A model that suddenly produces 5 rows when it should produce 500,000
            indicates a broken join or a source table that did not load, not a
            successful test run.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Testing Staging vs. Mart Layers Differently
          </h2>
          <p>
            A common mistake is applying the same tests uniformly across all
            model layers. Staging models and mart models have different
            guarantees and different failure modes, and the tests should reflect
            that.
          </p>
          <p>
            <strong className="text-white">Staging layer tests</strong> should
            validate the contract with the source system. The primary goal is
            catching unexpected changes in source data: new null values in
            previously populated columns, enum values that were not in the
            original accepted list, referential integrity violations that suggest
            a load ordering issue. Test aggressively here because this is where
            source data drift enters your stack.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Staging layer: validate the source contract
models:
  - name: stg_users
    columns:
      - name: user_id
        tests:
          - unique
          - not_null
      - name: email
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_match_regex:
              regex: ".+@.+\\..+"
      - name: plan_type
        tests:
          - accepted_values:
              values: ['free', 'pro', 'enterprise']`}
          </pre>
          <p>
            <strong className="text-white">Mart layer tests</strong> should
            validate business logic and output guarantees. The mart is what
            stakeholders actually query. Test the things that would produce
            wrong numbers in a dashboard: grain uniqueness on the primary key
            of your fact tables, metric ranges that reflect business reality,
            and cross-model relationships that your join logic depends on.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Mart layer: validate business logic and output guarantees
models:
  - name: fct_orders
    tests:
      - dbt_expectations.expect_table_row_count_to_be_between:
          min_value: 10000
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: revenue_usd
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 100000
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers')
              field: customer_id`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Test Severity Levels
          </h2>
          <p>
            Not every test failure should block a production run. dbt provides
            two severity levels: <code>error</code> (default, blocks the run)
            and <code>warn</code> (logs the failure but continues). Using these
            intentionally is the difference between a testing strategy that is
            useful and one that either blocks legitimate runs or gets disabled
            because it is too noisy.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`- name: revenue_usd
  tests:
    - not_null:
        severity: error        # always block on missing revenue
    - dbt_expectations.expect_column_values_to_be_between:
        min_value: 0
        max_value: 50000
        severity: warn         # alert but don't block on unusual values`}
          </pre>
          <p>
            I use <code>error</code> for tests that indicate data is
            fundamentally wrong or missing: null primary keys, broken
            relationships, counts that are zero when they should have thousands
            of rows. These failures mean a downstream consumer will get bad data
            and the run should stop.
          </p>
          <p>
            I use <code>warn</code> for tests that indicate something unusual
            but not necessarily wrong: metric values outside the expected range,
            row counts significantly lower than typical, enum values outside
            the expected set that might be legitimate new values. These failures
            deserve investigation but should not silently disable downstream
            pipelines.
          </p>
          <p>
            The <code>error_if</code> and <code>warn_if</code> config options
            give you even more granularity: fail only if more than N rows
            violate the test, which is useful for tests where a small number
            of failures is acceptable but a large number indicates a systematic
            problem.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`- name: email
  tests:
    - not_null:
        error_if: ">100"   # error if more than 100 nulls
        warn_if: ">10"     # warn if more than 10 nulls`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            When Not to Test
          </h2>
          <p>
            Testing everything is not the goal. Over-testing creates a
            maintenance burden that causes teams to either disable tests or
            stop adding them. A few situations where tests add noise without
            value:
          </p>
          <p>
            Do not test intermediate models heavily. Models in your{" "}
            <code>intermediate/</code> directory are building blocks for marts,
            not consumer-facing outputs. Test the inputs (staging) and the
            outputs (marts). Testing every intermediate step adds runtime and
            alert fatigue without catching bugs that would not already surface
            at the mart layer.
          </p>
          <p>
            Do not add <code>accepted_values</code> tests for high-cardinality
            columns. A column with 10,000 possible values is not a good
            candidate for an accepted values list. Use regex or range tests
            instead, or skip the test if there is no meaningful constraint to
            enforce.
          </p>
          <p>
            Do not test things that are guaranteed by your warehouse or your
            transformation logic. If your model uses a{" "}
            <code>row_number() = 1</code> deduplication pattern to produce one
            row per key, testing uniqueness on that key adds runtime without
            adding information. The transformation already guarantees it.
          </p>
          <p>
            A well-tested dbt project has tests on every staging model&apos;s
            primary key, referential integrity on every foreign key used in a
            mart join, at least one custom singular test per domain area, and
            row count bounds on every fact table. That coverage is achievable,
            maintainable, and catches the bugs that actually matter.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
              Questions on any of this?{" "}
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
              data engineer with 8+ years building data infrastructure at media,
              SaaS, and fintech companies. He specializes in Kafka, dbt,
              Snowflake, and Spark, and writes about data engineering patterns
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
