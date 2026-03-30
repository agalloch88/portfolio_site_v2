import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Contracts: The Missing Piece in Your Modern Data Stack | Ryan Kirsch - Data Engineer",
  description:
    "What data contracts are, why they matter, and how to implement them: schema enforcement, semantic validation with Great Expectations and Soda, custom contract frameworks, and real-world implementation patterns for data platform teams.",
  openGraph: {
    title:
      "Data Contracts: The Missing Piece in Your Modern Data Stack | Ryan Kirsch - Data Engineer",
    description:
      "What data contracts are, why they matter, and how to implement them: schema enforcement, semantic validation with Great Expectations and Soda, custom contract frameworks, and real-world implementation patterns for data platform teams.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-contracts-modern-data-stack",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Contracts: The Missing Piece in Your Modern Data Stack | Ryan Kirsch - Data Engineer",
    description:
      "What data contracts are, why they matter, and how to implement them: schema enforcement, semantic validation with Great Expectations and Soda, custom contract frameworks, and real-world implementation patterns for data platform teams.",
  },
  alternates: { canonical: "/blog/data-contracts-modern-data-stack" },
};

export default function DataContractsModernDataStackPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-contracts-modern-data-stack"
  );
  const postTitle = encodeURIComponent(
    "Data Contracts: The Missing Piece in Your Modern Data Stack"
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
            {["Data Contracts", "Data Quality", "DataOps", "Great Expectations", "Soda", "Data Platform"].map(
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
            Data Contracts: The Missing Piece in Your Modern Data Stack
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Most data quality problems are not technical failures. They are coordination failures.
            An engineering team renames a column without telling the data team. A product change
            alters the semantics of an event without updating any documentation. A third-party API
            adds a new required field and existing records suddenly fail validation downstream.
            Data contracts are the mechanism for making these coordination failures visible before
            they become production incidents.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            What a Data Contract Actually Is
          </h2>
          <p>
            A data contract is a formal agreement between a data producer and its consumers about
            the structure, semantics, and quality guarantees of a dataset. It specifies: the schema
            (column names, types, nullability), the business rules (ranges, referential integrity,
            uniqueness), freshness expectations (how recently the data should have been updated),
            and the SLA (what happens when the contract is violated).
          </p>
          <p>
            The key distinction from traditional data validation is the ownership model. A data
            contract is owned by the producer, not the consumer. The producer commits to maintaining
            the contract. Consumers can build pipelines against it with confidence. Breaking the
            contract requires a formal change process, not a casual deploy.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Example: YAML-based data contract definition
# contracts/orders.yaml

dataset: orders
version: "2.1.0"
owner: platform-eng@company.com
consumers:
  - analytics-team
  - ml-platform
  - finance-reporting

schema:
  - name: order_id
    type: STRING
    nullable: false
    unique: true
    description: "UUID primary key for the order"

  - name: customer_id
    type: STRING
    nullable: false
    description: "Foreign key to customers dataset"

  - name: status
    type: STRING
    nullable: false
    allowed_values: ["pending", "processing", "shipped", "delivered", "cancelled"]

  - name: total_amount
    type: DECIMAL(12,2)
    nullable: false
    min: 0.01
    max: 999999.99

  - name: created_at
    type: TIMESTAMP_TZ
    nullable: false

quality:
  row_count_min: 1000
  freshness_hours: 1   # fail if not updated within 1 hour during business hours
  null_rate_max:
    customer_id: 0.0
    status: 0.0

sla:
  availability: 0.999
  max_latency_minutes: 30
  violation_channel: "#data-alerts"`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Enforcing Contracts with Great Expectations
          </h2>
          <p>
            Great Expectations is the most mature Python framework for data validation. It
            defines expectations (assertions about your data), validates them against actual
            datasets, and generates documentation and test reports. It integrates with Spark,
            Pandas, SQL databases, and most cloud warehouses.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import great_expectations as gx
from great_expectations.core.batch import RuntimeBatchRequest

context = gx.get_context()

# Build a suite of expectations from your contract
suite = context.add_expectation_suite("orders_contract_v2")

validator = context.get_validator(
    batch_request=RuntimeBatchRequest(
        datasource_name="snowflake_prod",
        data_connector_name="default_runtime_data_connector",
        data_asset_name="orders",
        runtime_parameters={"query": "SELECT * FROM analytics.orders WHERE created_at >= DATEADD('hour', -1, CURRENT_TIMESTAMP)"},
        batch_identifiers={"run_id": "2026-03-29"},
    ),
    expectation_suite_name="orders_contract_v2",
)

# Schema expectations
validator.expect_column_to_exist("order_id")
validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")

# Semantic expectations from the contract
validator.expect_column_values_to_not_be_null("customer_id")
validator.expect_column_values_to_be_in_set(
    "status",
    ["pending", "processing", "shipped", "delivered", "cancelled"]
)
validator.expect_column_values_to_be_between(
    "total_amount", min_value=0.01, max_value=999999.99
)

# Volume check
validator.expect_table_row_count_to_be_between(min_value=1000)

results = validator.validate()
if not results["success"]:
    raise ValueError(f"Data contract violation: {results['statistics']}")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Enforcing Contracts with Soda
          </h2>
          <p>
            Soda uses a YAML-based DSL that maps closely to the contract definition format,
            making it natural to translate a contract spec directly into executable checks.
            Soda Core is open source; Soda Cloud adds alerting, observability, and a
            governance layer.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# soda/checks/orders.yml
checks for orders:

  # Schema enforcement
  - schema:
      name: Orders schema contract v2
      warn:
        when schema changes: any
      fail:
        when required column missing: [order_id, customer_id, status, total_amount, created_at]
        when column type changed: [order_id, total_amount, created_at]

  # Freshness check
  - freshness(created_at) < 1h:
      name: Orders updated within 1 hour

  # Volume check
  - row_count > 1000:
      name: Minimum row count for orders table

  # Null checks
  - missing_count(order_id) = 0:
      name: order_id must not be null
  - missing_count(customer_id) = 0

  # Value domain checks
  - invalid_count(status) = 0:
      name: Order status must be valid enum
      valid values: [pending, processing, shipped, delivered, cancelled]

  # Range check
  - min(total_amount) >= 0.01
  - max(total_amount) <= 999999.99`}
          </pre>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Run from CI or an Airflow task
soda scan -d snowflake_prod -c soda/configuration.yml soda/checks/orders.yml`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Where to Enforce Contracts in the Pipeline
          </h2>
          <p>
            Contracts can be enforced at three points: at ingestion (validate before writing to
            the warehouse), at transformation completion (validate dbt model outputs), or at
            consumption (validate before a downstream system reads data). Each has different
            tradeoffs.
          </p>
          <p>
            Ingestion-time enforcement catches problems earliest but requires more infrastructure.
            Transformation-time enforcement with dbt tests is the most common starting point
            because it requires no additional tooling beyond what most teams already have.
            Consumption-time enforcement is a safety net, not a substitute for upstream validation.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# dbt: schema.yml tests as lightweight contract enforcement
models:
  - name: orders
    description: "Cleaned and validated orders. Contract v2.1.0."
    columns:
      - name: order_id
        tests:
          - not_null
          - unique
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('customers')
              field: customer_id
      - name: status
        tests:
          - not_null
          - accepted_values:
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      - name: total_amount
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0.01
              max_value: 999999.99`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Versioning and Breaking Changes
          </h2>
          <p>
            A data contract without a versioning policy is just documentation. The contract needs
            to define what constitutes a breaking change (removing a column, narrowing a type,
            changing allowed values) vs. a non-breaking change (adding a nullable column, widening
            a type). Breaking changes require a major version bump and a consumer migration period.
          </p>
          <p>
            Store contract definitions in version control alongside the code that produces the
            dataset. Treat contract changes like API changes: review them, communicate them, and
            enforce the migration timeline. Teams that skip this step end up with contracts that
            are technically present but practically ignored because nobody trusts them to be current.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Organizational Case
          </h2>
          <p>
            The hardest part of implementing data contracts is not the tooling. It is convincing
            producing teams to own their output quality. The framing that works: data contracts
            reduce the total interruptions a producing team receives from downstream consumers
            chasing data quality issues. When consumers can trust the contract, they stop filing
            tickets asking whether a column change was intentional. The contract answers that
            question automatically.
          </p>
          <p>
            Start with one high-value, high-traffic dataset. Define the contract in YAML,
            implement the checks in dbt or Soda, wire the checks into CI, and run them in
            production for a month. The first time a contract violation catches a real production
            issue before it reaches a dashboard, the organizational case makes itself.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
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
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Spark,
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
