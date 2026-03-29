import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "dbt Macros: The Power Feature Most Engineers Underuse | Ryan Kirsch",
  description:
    "A practical guide to dbt macros for mid-to-senior data engineers: what they are, when to use them over models, cross-database compatibility patterns, generic tests, utility macros, and the mistakes that cost teams time.",
  openGraph: {
    title:
      "dbt Macros: The Power Feature Most Engineers Underuse",
    description:
      "A practical guide to dbt macros for mid-to-senior data engineers: what they are, when to use them over models, cross-database compatibility patterns, generic tests, utility macros, and the mistakes that cost teams time.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-macros-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "dbt Macros: The Power Feature Most Engineers Underuse",
    description:
      "A practical guide to dbt macros for mid-to-senior data engineers: what they are, when to use them over models, cross-database compatibility patterns, generic tests, utility macros, and the mistakes that cost teams time.",
  },
  alternates: { canonical: "/blog/dbt-macros-guide" },
};

export default function DbtMacrosPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dbt-macros-guide"
  );
  const postTitle = encodeURIComponent(
    "dbt Macros: The Power Feature Most Engineers Underuse"
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
              Data Engineering
            </span>
            <span className="text-sm text-gray-500">October 3, 2025</span>
            <span className="text-sm text-gray-500">8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            dbt Macros: The Power Feature Most Engineers Underuse
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Most dbt projects use macros for one or two things and leave the rest of the surface area untouched. Here is what you are missing and how to use it.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The first time most engineers encounter dbt macros, it is because they need to handle a date_trunc difference between Snowflake and BigQuery, or because they saw a ref macro and needed to understand how it worked. They solve the immediate problem, file macros under &quot;advanced feature,&quot; and move on.
          </p>
          <p>
            That is understandable. Macros are not the first thing you reach for in dbt, and the documentation, while thorough, does not always make clear when macros are genuinely the right tool versus a premature abstraction. After using dbt in production across multiple organizations and warehouse platforms, my view is this: most projects underuse macros significantly, and the gap between a project that uses them well and one that doesn&apos;t is visible in code quality, maintenance burden, and how easily new engineers can get productive.
          </p>
          <p>
            This post is the guide I wish had existed when I was learning where macros actually fit.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            What Macros Actually Are
          </h2>
          <p>
            dbt macros are Jinja2 functions defined in .sql files inside the macros/ directory of your dbt project. When dbt compiles your models, it executes the Jinja2 template engine, which resolves macros into plain SQL before that SQL runs against your warehouse.
          </p>
          <p>
            The simplest possible macro looks like this:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name) %}
  ({{ column_name }} / 100.0)::numeric(10,2)
{% endmacro %}`}
          </pre>
          <p>
            Used in a model:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- models/marts/fct_orders.sql
select
  order_id,
  {{ cents_to_dollars('amount_cents') }} as amount_dollars,
  {{ cents_to_dollars('tax_cents') }}    as tax_dollars
from {{ ref('stg_orders') }}`}
          </pre>
          <p>
            That compiles to standard SQL before execution. The macro is invisible to the warehouse. It only exists at compile time inside dbt.
          </p>
          <p>
            This is the key mental model for macros: they are compile-time code generation tools, not runtime functions. They run in dbt&apos;s compilation step, not inside the database. That distinction matters when you are reasoning about what macros can and cannot do.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Macros vs. Models: When to Use Each
          </h2>
          <p>
            The confusion between macros and models is common and worth addressing directly. Both live in your dbt project and both produce SQL, but they serve completely different purposes.
          </p>
          <p>
            A model is a transformation that produces a table or view in your warehouse. It represents a specific data artifact: a staging table, a fact table, an entity. You ref() it from other models. It has lineage. It gets tested.
          </p>
          <p>
            A macro is reusable code logic that generates SQL fragments. It has no lineage in the DAG. It does not produce a table. It is a function that gets called inside models, tests, and other macros.
          </p>
          <p>
            Use a model when: you are transforming data into a named, reusable artifact that other models depend on.
          </p>
          <p>
            Use a macro when: you are writing the same SQL expression or pattern in multiple places and want to centralize it. Good signal cases for reaching for a macro:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>The same date truncation or type cast appears in a dozen models</li>
            <li>You need different SQL syntax for Snowflake vs. BigQuery vs. Redshift</li>
            <li>You want to generate a standard test that dbt&apos;s built-in tests do not cover</li>
            <li>You are building utility logic that gets used as a building block across multiple models</li>
            <li>You need to generate SQL programmatically based on configuration or metadata</li>
          </ul>
          <p>
            The anti-pattern to watch for: using macros to abstract business logic that should live in a model. If the logic is significant enough to test, document, and expose to analysts, it belongs in a model, not a macro.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Cross-Database Compatibility: The Macro Pattern That Earns Its Keep
          </h2>
          <p>
            If your project runs against multiple warehouse targets, macros are the correct abstraction layer for SQL dialect differences. This comes up more often than people expect: development against DuckDB or SQLite, staging on BigQuery, and production on Snowflake is a real pattern. So is migrating between warehouses, or running the same dbt project for multiple clients on different platforms.
          </p>
          <p>
            The adapter_dispatch function is built for exactly this. It lets you define a default macro implementation and then override it per adapter:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/date_spine.sql

-- Default implementation
{% macro date_spine(start_date, end_date) %}
  {{ return(adapter.dispatch('date_spine', 'my_project')(start_date, end_date)) }}
{% endmacro %}

-- BigQuery override
{% macro bigquery__date_spine(start_date, end_date) %}
  generate_date_array({{ start_date }}, {{ end_date }})
{% endmacro %}

-- Snowflake override
{% macro snowflake__date_spine(start_date, end_date) %}
  (
    select dateadd(day, seq4(), {{ start_date }}) as date_day
    from table(generator(rowcount => datediff(day, {{ start_date }}, {{ end_date }}) + 1))
  )
{% endmacro %}

-- DuckDB override (local dev)
{% macro duckdb__date_spine(start_date, end_date) %}
  (
    select ({{ start_date }} + interval (n) day)::date as date_day
    from generate_series(0, datediff('day', {{ start_date }}, {{ end_date }})) as t(n)
  )
{% endmacro %}`}
          </pre>
          <p>
            This pattern centralizes dialect differences in one place. Models that call date_spine do not know or care which warehouse they are running on. The macro handles it. The same model works in development (DuckDB), CI (BigQuery sandbox), and production (Snowflake) without any changes to the model file.
          </p>
          <p>
            Common candidates for adapter dispatch: date arithmetic, string aggregation (listagg vs. array_agg vs. string_agg), pivot/unpivot patterns, and any function that has notably different syntax across warehouse platforms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Generic Tests with Macros
          </h2>
          <p>
            dbt&apos;s built-in schema tests (not_null, unique, accepted_values, relationships) cover a lot of ground, but production data is full of edge cases that the built-in tests do not reach. Custom generic tests, implemented as macros, fill that gap.
          </p>
          <p>
            A generic test is a macro in the tests/ subdirectory that returns a query. If the query returns any rows, the test fails. Here is an example for a test that checks whether a numeric column is within an expected range:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/tests/test_between.sql
{% test between(model, column_name, min_value, max_value) %}
  select *
  from {{ model }}
  where {{ column_name }} < {{ min_value }}
     or {{ column_name }} > {{ max_value }}
{% endtest %}`}
          </pre>
          <p>
            Applied in schema.yml:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`models:
  - name: fct_orders
    columns:
      - name: discount_pct
        tests:
          - between:
              min_value: 0
              max_value: 100`}
          </pre>
          <p>
            Generic tests are one of the highest-leverage macro patterns because they convert one-off data quality checks into reusable, configurable assertions. Once you have a test_between, test_not_negative, or test_row_count_between macro in your project, every model gets access to those tests through schema.yml configuration with no additional SQL.
          </p>
          <p>
            A few generic tests worth building early in any project: row count threshold tests (flag if a model&apos;s row count drops by more than X percent), referential integrity checks against external systems, null proportion tests (fail if more than X percent of a column is null), and expression tests that validate complex business rules inline.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Utility Macros: Reducing Repetition at Scale
          </h2>
          <p>
            Some of the most practical macros are the unglamorous utility ones: they do not enable new capabilities, they just eliminate copy-paste and standardize patterns across a codebase.
          </p>
          <p>
            A clean example is a macro that generates the standard set of audit columns for every model:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/generate_audit_columns.sql
{% macro generate_audit_columns() %}
  current_timestamp()                 as dbt_created_at,
  '{{ invocation_id }}'               as dbt_invocation_id,
  '{{ this.identifier }}'             as dbt_model_name
{% endmacro %}`}
          </pre>
          <p>
            Used at the end of any model:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`select
  order_id,
  customer_id,
  amount_cents,
  {{ generate_audit_columns() }}
from {{ ref('stg_orders') }}`}
          </pre>
          <p>
            The benefit compounds as the codebase grows. If the audit column pattern changes (adding a new column, renaming something), one macro update propagates to every model. Without the macro, you are making the same change in dozens of files and hoping nothing is missed.
          </p>
          <p>
            Other utility macros worth building: a standard SCD Type 2 hash key generator, a macro that generates surrogate keys consistently (star_hash or dbt_utils.generate_surrogate_key are common starting points), column-level comment formatters, and schema-aware SELECT * with explicit column exclusions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Dynamic SQL Generation with Macros
          </h2>
          <p>
            One of the less obvious macro capabilities is generating SQL programmatically based on metadata. This is useful when you have a pattern that repeats across multiple similar models with different parameters.
          </p>
          <p>
            A practical example: you have twenty event tables with the same structure but different event types. Instead of twenty near-identical staging models, a macro can generate them:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/stage_event.sql
{% macro stage_event(source_name, table_name, event_type) %}
  select
    id                                    as event_id,
    user_id,
    occurred_at,
    properties,
    '{{ event_type }}'                    as event_type,
    _fivetran_synced                      as _loaded_at
  from {{ source(source_name, table_name) }}
  where _fivetran_deleted is false
{% endmacro %}`}
          </pre>
          <p>
            Each staging model for an event type becomes a one-liner:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- models/staging/stg_page_viewed.sql
{{ stage_event('segment', 'pages', 'page_viewed') }}`}
          </pre>
          <p>
            This pattern is powerful but carries a tradeoff: the logic is less visible. A new engineer reading stg_page_viewed.sql needs to track down the macro to understand what the model actually does. Use dynamic generation when the repetition is high and the pattern is genuinely stable. Do not use it to be clever when a straightforward model would be clearer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Common Mistakes and How to Avoid Them
          </h2>
          <p>
            <strong>Over-abstracting with macros.</strong> Every abstraction has a cost in readability. A macro that wraps a simple case statement or a two-line coalesce expression is adding indirection without meaningful benefit. Write the SQL directly in the model unless the repetition is real and the abstraction genuinely simplifies the codebase.
          </p>
          <p>
            <strong>Putting business logic in macros instead of models.</strong> Business logic belongs in tested, documented models. Macros are infrastructure. If a calculation defines a KPI or encodes a business rule, it should live in a model where it can be documented in schema.yml, tested explicitly, and tracked in lineage.
          </p>
          <p>
            <strong>Missing the macros/ directory structure.</strong> As your macro library grows, a flat macros/ directory becomes hard to navigate. Organize macros into subdirectories by category: macros/tests/, macros/utils/, macros/adapters/, macros/staging/. dbt picks them all up regardless of subdirectory structure.
          </p>
          <p>
            <strong>Not documenting macro arguments.</strong> dbt supports documenting macros in schema.yml with argument descriptions. Do this for any macro used widely across the project. The friction of reading an undocumented macro is non-trivial for engineers joining the team later.
          </p>
          <p>
            <strong>Reinventing what dbt-utils already provides.</strong> The dbt-utils package includes a large and well-maintained macro library covering surrogate keys, date spines, pivot/unpivot, null handling, and more. Check whether a macro you need already exists there before building your own.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            A Practical Starting Point for Your Project
          </h2>
          <p>
            If you are building out a new dbt project or improving an existing one, here is a practical order for introducing macros:
          </p>
          <p>
            First, install dbt-utils and dbt-expectations. These two packages cover a substantial portion of the macro functionality most projects need and are better maintained than custom implementations.
          </p>
          <p>
            Second, identify the SQL patterns that appear in three or more models and centralize them. Three is a reasonable threshold: one occurrence is a coincidence, two is a pattern, three is a library candidate.
          </p>
          <p>
            Third, build generic tests for data quality assertions that your team makes repeatedly in ad hoc queries. If you are regularly checking that revenue columns are non-negative or that event timestamps are not in the future, those checks belong in schema.yml, not in your BI tool.
          </p>
          <p>
            Fourth, if you are running against multiple warehouse targets, audit your SQL for dialect-specific functions and build adapter dispatch macros for the ones that vary.
          </p>
          <p>
            The macro library you build is infrastructure for your project. Like any infrastructure, it pays back proportionally to how much the project grows. A project with ten models and two engineers does not need an extensive macro library. A project with a hundred models and a team of analysts writing SQL directly against the warehouse most certainly does.
          </p>
        </div>

        {/* Share section */}
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

        {/* Back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
