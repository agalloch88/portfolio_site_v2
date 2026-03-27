import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Pipeline Testing Strategies: How to Know Your Pipeline Is Correct Before Production Finds Out | Ryan Kirsch",
  description:
    "A practical guide to testing data pipelines. Unit tests for transformation logic, integration tests for end-to-end validation, contract tests for source systems, and the testing pyramid that catches the most bugs with the least overhead.",
  openGraph: {
    title:
      "Data Pipeline Testing Strategies: How to Know Your Pipeline Is Correct Before Production Finds Out",
    description:
      "Unit tests for transformation logic, integration tests for end-to-end validation, contract tests for source systems, and the testing pyramid for data pipelines.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-pipeline-testing-strategies",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Pipeline Testing Strategies: How to Know Your Pipeline Is Correct Before Production Finds Out",
    description:
      "Unit tests, integration tests, contract tests, and the testing pyramid for data pipelines.",
  },
  alternates: { canonical: "/blog/data-pipeline-testing-strategies" },
};

export default function DataPipelineTestingPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-pipeline-testing-strategies"
  );
  const postTitle = encodeURIComponent(
    "Data Pipeline Testing Strategies: How to Know Your Pipeline Is Correct Before Production Finds Out"
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
            Data Pipeline Testing Strategies: How to Know Your Pipeline Is
            Correct Before Production Finds Out
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data pipeline bugs are uniquely costly. Unlike application bugs
            that surface immediately, data bugs can run silently for days or
            weeks, corrupting downstream models and business reports before
            anyone notices. A testing strategy that catches them before
            production is not optional -- it is the difference between a
            reliable data platform and one that erodes stakeholder trust
            one silent error at a time.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Data Pipeline Testing Pyramid
            </h2>
            <p>
              Software engineering has the testing pyramid: many unit tests,
              fewer integration tests, even fewer end-to-end tests. Data
              pipelines have an equivalent, though the names differ:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Unit tests</strong> -- Test individual transformation
                functions in isolation. Fast, cheap, run on every commit.
                Cover the logic that is most likely to have edge cases:
                null handling, type casting, business rule implementations.
              </li>
              <li>
                <strong>dbt tests (schema tests)</strong> -- Test the shape
                and constraints of data after it lands in the warehouse.
                Uniqueness, not_null, accepted_values, referential integrity.
                Run after every pipeline execution.
              </li>
              <li>
                <strong>Integration tests</strong> -- Test end-to-end
                pipeline behavior against a sample of real data in a
                staging environment. Catch issues that only appear when
                multiple components interact.
              </li>
              <li>
                <strong>Contract tests</strong> -- Test that source systems
                still deliver the schema and format your pipeline expects.
                Run before ingestion begins.
              </li>
              <li>
                <strong>Reconciliation tests</strong> -- Validate that counts
                and aggregates in the output match the source. Catch silent
                data loss that other tests miss.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Unit Testing Transformation Logic
            </h2>
            <p>
              Transformation logic that lives in Python functions is the
              easiest to unit test and the most commonly untested. If your
              pipeline has Python functions that clean, transform, or classify
              data, they should have pytest tests.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# transformations/order_processing.py
from datetime import datetime
from typing import Optional

def normalize_order_status(status: Optional[str]) -> str:
    """
    Normalize status strings from source API to canonical values.
    """
    if status is None:
        return "unknown"
    
    cleaned = status.strip().lower()
    STATUS_MAP = {
        "pending": "pending",
        "in_progress": "processing",
        "in-progress": "processing",
        "completed": "delivered",
        "complete": "delivered",
        "shipped": "shipped",
        "cancelled": "cancelled",
        "canceled": "cancelled",  # American/British spelling
    }
    return STATUS_MAP.get(cleaned, "unknown")


# tests/test_order_processing.py
import pytest
from transformations.order_processing import normalize_order_status

class TestNormalizeOrderStatus:
    def test_standard_status(self):
        assert normalize_order_status("pending") == "pending"
    
    def test_case_insensitive(self):
        assert normalize_order_status("PENDING") == "pending"
        assert normalize_order_status("Completed") == "delivered"
    
    def test_whitespace_trimmed(self):
        assert normalize_order_status("  shipped  ") == "shipped"
    
    def test_none_returns_unknown(self):
        assert normalize_order_status(None) == "unknown"
    
    def test_unknown_status_returns_unknown(self):
        assert normalize_order_status("weird_status") == "unknown"
    
    def test_american_and_british_cancelled(self):
        assert normalize_order_status("canceled") == "cancelled"
        assert normalize_order_status("cancelled") == "cancelled"
    
    def test_hyphenated_variant(self):
        assert normalize_order_status("in-progress") == "processing"`}</code>
            </pre>
            <p>
              These tests run in milliseconds, require no database, and catch
              exactly the kinds of edge cases that produce silent data errors
              in production -- variant spellings, null inputs, whitespace.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              dbt Tests: What to Test and at What Layer
            </h2>
            <p>
              dbt tests validate the shape and constraints of data after
              transformation. The principle: test at the layer where a
              failure is most informative, not just at the output.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/staging/stg_orders.yml
models:
  - name: stg_orders
    columns:
      - name: order_id
        tests:
          - unique        # Business rule: one row per order
          - not_null
      - name: status
        tests:
          - not_null
          - accepted_values:
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unknown']
      - name: amount_usd
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= 0"   # No negative amounts at staging

# models/marts/fct_orders.yml
models:
  - name: fct_orders
    tests:
      # Reconciliation: compare counts to source
      - dbt_utils.expression_is_true:
          expression: >
            (SELECT COUNT(*) FROM {{ this }}) >=
            (SELECT COUNT(*) * 0.99 FROM {{ ref('stg_orders') }})
          # Alert if more than 1% of orders dropped in transformation
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: revenue_month
        tests:
          - not_null
          - dbt_utils.expression_is_true:
              expression: ">= '2020-01-01'::date"  # No ancient dates`}</code>
            </pre>
            <p>
              The reconciliation test on the fact table is the most valuable
              test most teams skip. It catches data loss between staging and
              mart transformations -- cases where a JOIN drops rows or a
              WHERE clause is too aggressive.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Contract Tests for Source Systems
            </h2>
            <p>
              Source systems change their schemas without notice. A contract
              test validates that the source still delivers what your pipeline
              expects, before ingestion begins.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# tests/test_source_contracts.py
import pytest
import requests
from datetime import datetime, timezone

EXPECTED_ORDER_SCHEMA = {
    "order_id": str,
    "customer_id": str,
    "amount_cents": int,
    "status": str,
    "created_at": str,
}

REQUIRED_STATUS_VALUES = {"pending", "processing", "shipped", "delivered", "cancelled"}

class TestOrdersAPIContract:
    @pytest.fixture
    def sample_orders(self):
        resp = requests.get(
            "https://api.company.com/orders",
            params={"limit": 100, "since": "2026-03-27"},
            headers={"Authorization": "Bearer test_token"},
        )
        resp.raise_for_status()
        return resp.json()["orders"]
    
    def test_required_fields_present(self, sample_orders):
        for order in sample_orders[:10]:
            for field, expected_type in EXPECTED_ORDER_SCHEMA.items():
                assert field in order, f"Missing field: {field}"
    
    def test_amount_cents_is_positive_integer(self, sample_orders):
        for order in sample_orders[:10]:
            assert isinstance(order["amount_cents"], int), "amount_cents must be int"
            assert order["amount_cents"] >= 0, "amount_cents must be non-negative"
    
    def test_status_values_are_expected(self, sample_orders):
        statuses = {o["status"] for o in sample_orders}
        unexpected = statuses - REQUIRED_STATUS_VALUES - {"unknown"}
        assert not unexpected, f"Unexpected status values: {unexpected}"
    
    def test_created_at_is_parseable_iso8601(self, sample_orders):
        for order in sample_orders[:10]:
            try:
                datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
            except (ValueError, AttributeError) as e:
                pytest.fail(f"Invalid created_at format: {order['created_at']}: {e}")`}</code>
            </pre>
            <p>
              Run contract tests in your CI pipeline against the staging
              environment of the source API. When a contract test fails,
              it means the source changed, and you can investigate before
              ingesting corrupted data into production.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Integration Tests with Sample Data
            </h2>
            <p>
              Integration tests run the full pipeline against a controlled
              sample of data and validate the end-to-end result. They are
              slower than unit tests but catch the category of bugs that
              only appear when components interact.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# tests/integration/test_orders_pipeline.py
import pytest
import pandas as pd
from pipeline.orders import run_orders_pipeline

SAMPLE_ORDERS = [
    {"order_id": "ord_001", "customer_id": "cust_1", "amount_cents": 4999,
     "status": "delivered", "created_at": "2026-03-01T10:00:00Z"},
    {"order_id": "ord_002", "customer_id": "cust_1", "amount_cents": 1999,
     "status": "cancelled", "created_at": "2026-03-15T14:00:00Z"},
    {"order_id": "ord_003", "customer_id": "cust_2", "amount_cents": 9999,
     "status": "delivered", "created_at": "2026-03-20T09:00:00Z"},
    # Duplicate: same order_id should be deduped
    {"order_id": "ord_001", "customer_id": "cust_1", "amount_cents": 4999,
     "status": "delivered", "created_at": "2026-03-01T10:00:01Z"},
]

class TestOrdersPipelineIntegration:
    @pytest.fixture
    def pipeline_output(self, tmp_path):
        return run_orders_pipeline(
            input_data=SAMPLE_ORDERS,
            output_path=tmp_path / "output",
        )
    
    def test_deduplication_removes_duplicate_order(self, pipeline_output):
        assert len(pipeline_output) == 3, "Should have 3 unique orders"
    
    def test_cancelled_orders_excluded_from_revenue(self, pipeline_output):
        revenue = pipeline_output[pipeline_output["status"] != "cancelled"]["amount_usd"].sum()
        assert abs(revenue - 149.98) &lt; 0.01, f"Expected $149.98, got {revenue}"
    
    def test_amount_converted_from_cents_to_usd(self, pipeline_output):
        order_001 = pipeline_output[pipeline_output["order_id"] == "ord_001"].iloc[0]
        assert order_001["amount_usd"] == 49.99
    
    def test_output_schema_correct(self, pipeline_output):
        required_columns = {"order_id", "customer_id", "amount_usd", "status", "created_at"}
        assert required_columns.issubset(set(pipeline_output.columns))`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Building a Testing Culture
            </h2>
            <p>
              Testing strategies fail when they are added retroactively to
              a codebase that was built without them, and succeed when they
              are built in from the start. The practical approach:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Require dbt tests before merge.</strong> Every new
                dbt model in a PR must have at minimum: unique + not_null
                on the primary key. Make this a CI check, not a code review
                comment.
              </li>
              <li>
                <strong>Test when you fix bugs.</strong> Every production data
                bug should result in a new test that would have caught it.
                This builds test coverage organically from real failures.
              </li>
              <li>
                <strong>Unit test Python transformations at write time.</strong>
                It takes 10 minutes to write tests for a new transformation
                function. It takes hours to debug a production data quality
                issue that a unit test would have caught in CI.
              </li>
              <li>
                <strong>Run contract tests on a schedule.</strong> Source
                systems change on their timeline, not yours. Daily contract
                test runs catch schema changes before the next pipeline run.
              </li>
            </ul>
            <p>
              The goal is not 100% test coverage -- it is to cover the code
              paths most likely to produce silent data errors. Business logic,
              null handling, type coercion, and source schema validation are
              the highest-priority areas. Everything else is a bonus.
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
