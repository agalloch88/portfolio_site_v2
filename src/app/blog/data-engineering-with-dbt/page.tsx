import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "dbt in Production: The Patterns That Scale | Ryan Kirsch",
  description:
    "Advanced dbt patterns for production data teams: project structure at scale, macro libraries, environment-specific configs, CI/CD with dbt Cloud, custom schema generation, and the practices that separate well-maintained dbt projects from brittle ones.",
  openGraph: {
    title: "dbt in Production: The Patterns That Scale",
    description:
      "Advanced dbt patterns for production data teams: project structure at scale, macro libraries, environment-specific configs, CI/CD with dbt Cloud, custom schema generation, and the practices that separate well-maintained dbt projects from brittle ones.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineering-with-dbt",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "dbt in Production: The Patterns That Scale",
    description:
      "Advanced dbt patterns for production data teams: project structure at scale, macro libraries, environment-specific configs, CI/CD with dbt Cloud, custom schema generation, and the practices that separate well-maintained dbt projects from brittle ones.",
  },
  alternates: { canonical: "/blog/data-engineering-with-dbt" },
};

export default function DbtProductionPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-engineering-with-dbt");
  const postTitle = encodeURIComponent("dbt in Production: The Patterns That Scale");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">dbt</span>
            <span className="text-sm text-gray-500">February 11, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            dbt in Production: The Patterns That Scale
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Getting a dbt project to work is easy. Keeping it maintainable at 200 models, across multiple environments, with a team of engineers, is the harder problem. Here are the patterns that scale.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The first dbt project most engineers build is simple: a handful of staging models, a few marts, everything in one folder. This works fine at small scale. The problems appear around 50-100 models, when staging models start referencing each other, test coverage is inconsistent, naming conventions have drifted, and nobody is quite sure what the canonical source for a given metric is.
          </p>
          <p>
            This post covers the architectural and operational patterns that keep dbt projects maintainable as they grow: project structure, environment configuration, macro libraries, CI/CD, custom schema generation, and the testing philosophy that actually gets followed rather than abandoned when the team gets busy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Project Structure at Scale</h2>
          <p>
            The folder structure of a dbt project is the primary navigation mechanism for new engineers. A clear, consistent structure means anyone can find what they are looking for without asking. The three-layer structure (staging, intermediate, marts) is the right foundation; the question is how to organize within each layer as the project grows.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`models/
  staging/
    salesforce/
      _salesforce__sources.yml   # source definitions
      _salesforce__models.yml    # model docs + tests
      stg_salesforce__accounts.sql
      stg_salesforce__contacts.sql
    stripe/
      _stripe__sources.yml
      stg_stripe__charges.sql
      stg_stripe__refunds.sql
  intermediate/
    int_orders_with_payments.sql
    int_customer_sessions.sql
  marts/
    core/
      _core__models.yml
      fct_orders.sql
      dim_customers.sql
    finance/
      fct_revenue.sql
      fct_refunds.sql
    marketing/
      fct_campaign_performance.sql

tests/
  generic/
    test_column_is_url.sql      # custom generic tests
  singular/
    test_revenue_reconciliation.sql

macros/
  generate_schema_name.sql
  surrogate_key.sql
  get_fiscal_period.sql`}
          </pre>
          <p>
            Source-scoped folders in staging (one subfolder per source system) make it clear which staging models correspond to which sources. The YAML convention (underscore prefix, double underscore separator) makes schema files visually distinct from SQL models and keeps source definitions co-located with their models.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Environment Configuration</h2>
          <p>
            dbt profiles and environment variables control how the project behaves across development, staging, and production. Key configurations to manage explicitly:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# dbt_project.yml — project-level configuration
name: 'analytics'
version: '1.0.0'
profile: 'analytics'

vars:
  # Override in environment-specific profiles
  start_date: '2020-01-01'
  payment_methods: ['card', 'bank_transfer']

models:
  analytics:
    staging:
      +materialized: view
      +schema: staging
    intermediate:
      +materialized: ephemeral
    marts:
      +materialized: table
      core:
        +schema: core
      finance:
        +schema: finance

# profiles.yml — environment-specific
analytics:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      database: dev_db
      schema: "{{ env_var('DBT_USER', 'anonymous') }}_analytics"
      warehouse: transform_wh
    prod:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      database: prod_db
      schema: analytics
      warehouse: transform_wh`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Custom Schema Generation</h2>
          <p>
            By default, dbt appends the schema defined in the model config to the target schema, producing names like <code>prod_analytics</code>. For production systems, you usually want schemas like <code>core</code> and <code>finance</code> without the environment prefix. The <code>generate_schema_name</code> macro controls this behavior.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- macros/generate_schema_name.sql
{% macro generate_schema_name(custom_schema_name, node) -%}
  {%- set default_schema = target.schema -%}
  
  {%- if custom_schema_name is none -%}
    {{ default_schema }}
  {%- elif target.name == 'prod' -%}
    -- In production: use the custom schema name directly (no prefix)
    {{ custom_schema_name | trim }}
  {%- else -%}
    -- In dev/staging: prefix with user schema to avoid conflicts
    {{ default_schema }}_{{ custom_schema_name | trim }}
  {%- endif -%}
{%- endmacro %}`}
          </pre>
          <p>
            This macro ensures that production deployments write to clean schema names (core, finance, marketing) while development environments use user-prefixed schemas (rkirsch_analytics_core) to avoid collisions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Macro Libraries</h2>
          <p>
            Custom macros eliminate repeated logic and enforce consistency. Three categories of macros worth building early:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Surrogate key generation (consistent across all fact tables)
-- macros/surrogate_key.sql
{% macro surrogate_key(field_list) %}
  MD5(
    CONCAT_WS('|',
      {% for field in field_list %}
        COALESCE(CAST({{ field }} AS VARCHAR), 'NULL')
        {%- if not loop.last %}, {% endif %}
      {% endfor %}
    )
  )
{% endmacro %}

-- Usage
SELECT
  {{ surrogate_key(['order_id', 'line_item_id']) }} AS order_line_sk

-- Date spine for filling gaps
-- macros/date_spine.sql  (or use dbt_utils.date_spine)
{% macro get_fiscal_period(date_column) %}
  CASE
    WHEN MONTH({{ date_column }}) IN (1, 2, 3)   THEN 'Q1'
    WHEN MONTH({{ date_column }}) IN (4, 5, 6)   THEN 'Q2'
    WHEN MONTH({{ date_column }}) IN (7, 8, 9)   THEN 'Q3'
    WHEN MONTH({{ date_column }}) IN (10, 11, 12) THEN 'Q4'
  END
{% endmacro %}`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">CI/CD for dbt</h2>
          <p>
            A dbt CI pipeline should run on every pull request, test only changed models and their downstream dependencies, and block merges when tests fail. The slim CI pattern achieves this efficiently:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# .github/workflows/dbt-ci.yml
name: dbt CI

on:
  pull_request:
    branches: [main]

jobs:
  dbt-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dbt
        run: pip install dbt-snowflake
      
      - name: dbt deps
        run: dbt deps
        env:
          DBT_TARGET: ci
      
      - name: dbt build (changed models + downstream)
        run: |
          # Get list of changed files
          CHANGED=$(git diff --name-only origin/main...HEAD -- 'models/*')
          
          if [ -z "$CHANGED" ]; then
            echo "No model changes, skipping dbt run"
            exit 0
          fi
          
          # Build and test only changed models + their dependents
          dbt build --select "state:modified+" \
                    --defer --state ./prod_artifacts
        env:
          DBT_TARGET: ci
          SNOWFLAKE_ACCOUNT: ${"$"}{{ secrets.SNOWFLAKE_ACCOUNT }}`}
          </pre>
          <p>
            The <code>--defer</code> flag and <code>--state</code> reference allow the CI run to use production artifacts for models that did not change, avoiding rebuilding the entire project on every PR.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Testing Philosophy That Gets Followed</h2>
          <p>
            The testing approaches that work in practice are the ones that are easy to add, fast to run, and generate actionable output when they fail. The approaches that get abandoned are the ones that require significant setup per model, take too long to run, or produce noise.
          </p>
          <p>
            The minimum test set per model: not_null on every required column, unique on every primary key, and accepted_values on every categorical column with a bounded set. These three tests can be defined in 10 lines of YAML and catch the majority of common data quality issues.
          </p>
          <p>
            For business-critical models, add relationship tests (foreign key integrity) and custom singular tests for specific business rules (revenue cannot be negative, dates cannot be in the future). These take more time to write but provide stronger guarantees for the models stakeholders depend on most.
          </p>
          <p>
            The meta field in model YAML is useful for tracking which models have reached test coverage standards, enabling reporting on test coverage across the project and identifying the models that need attention.
          </p>
          <p>
            A dbt project that is well-tested, well-structured, and well-documented reduces the cognitive load of onboarding new engineers, reduces the frequency of data quality incidents, and makes refactoring safer. The investment in these practices pays off in proportion to how long the project lives and how many engineers work on it.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on X</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on LinkedIn</a>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">← Back to all posts</Link>
        </div>
      </article>
    </main>
  );
}
