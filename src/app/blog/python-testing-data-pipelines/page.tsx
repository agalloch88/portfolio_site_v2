import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Testing Data Pipelines with Python: A Practical Guide | Ryan Kirsch",
  description:
    "How to write useful tests for data pipelines in Python: unit tests for transformation logic, integration tests with real databases, pytest fixtures for reusable test infrastructure, and property-based testing with Hypothesis.",
  openGraph: {
    title: "Testing Data Pipelines with Python: A Practical Guide",
    description:
      "How to write useful tests for data pipelines in Python: unit tests for transformation logic, integration tests with real databases, pytest fixtures for reusable test infrastructure, and property-based testing with Hypothesis.",
    type: "article",
    url: "https://ryankirsch.dev/blog/python-testing-data-pipelines",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testing Data Pipelines with Python: A Practical Guide",
    description:
      "How to write useful tests for data pipelines in Python: unit tests for transformation logic, integration tests with real databases, pytest fixtures for reusable test infrastructure, and property-based testing with Hypothesis.",
  },
  alternates: { canonical: "/blog/python-testing-data-pipelines" },
};

export default function PythonTestingPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/python-testing-data-pipelines");
  const postTitle = encodeURIComponent("Testing Data Pipelines with Python: A Practical Guide");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Python</span>
            <span className="text-sm text-gray-500">January 28, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Testing Data Pipelines with Python: A Practical Guide
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Data pipeline tests are underwritten in most codebases and overwritten in almost none. Here is a practical framework for testing the parts that actually matter.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data pipelines are harder to test than application code for a few reasons: they process external data, produce external side effects, and their correctness often depends on subtle behaviors of large datasets that are impractical to reproduce in tests. The result is that most pipeline code has sparse test coverage, which means bugs get caught in production when someone notices a discrepancy in a dashboard rather than in CI before the code ships.
          </p>
          <p>
            This post covers a practical testing strategy for Python data pipelines: what to unit test, how to write integration tests that use real databases without requiring production access, pytest fixtures for managing test infrastructure, and property-based testing for transformation logic.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What to Test (and What Not To)</h2>
          <p>
            Test the logic you write. Do not test the behavior of external libraries and services. Your unit tests should verify that your transformation functions produce the expected output for given input, not that pandas or DuckDB behave correctly (they have their own test suites).
          </p>
          <p>
            The highest-value things to test in data pipelines:
          </p>
          <p>
            <strong>Business logic transformations.</strong> Revenue calculations, session detection, deduplication logic, SCD Type 2 update logic. These are where bugs hide and where incorrect behavior has real business impact.
          </p>
          <p>
            <strong>Edge cases in data cleaning.</strong> Null handling, type coercion, unexpected string values, out-of-range dates. Bugs here produce silent data quality issues.
          </p>
          <p>
            <strong>Filter and partition logic.</strong> Incremental pipeline filters that determine what data gets processed on each run.
          </p>
          <p>
            <strong>Schema validation.</strong> That the output of a transformation has the expected columns, types, and constraints.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Unit Tests: Fast and Focused</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# src/transformations/orders.py
import pandas as pd
from datetime import datetime

def calculate_revenue_tier(df: pd.DataFrame) -> pd.DataFrame:
    """Assign revenue tier based on order amount."""
    import numpy as np
    conditions = [df['amount'] >= 10000, df['amount'] >= 1000]
    choices = ['enterprise', 'growth']
    df['revenue_tier'] = np.select(conditions, choices, default='starter')
    return df

def deduplicate_orders(df: pd.DataFrame) -> pd.DataFrame:
    """Keep the most recent version of each order."""
    return (
        df.sort_values('updated_at', ascending=False)
        .drop_duplicates(subset=['order_id'])
        .reset_index(drop=True)
    )

# tests/test_orders.py
import pytest
import pandas as pd
from datetime import datetime
from src.transformations.orders import calculate_revenue_tier, deduplicate_orders

class TestCalculateRevenueTier:
    def test_enterprise_tier(self):
        df = pd.DataFrame({'amount': [10000, 15000, 99999]})
        result = calculate_revenue_tier(df)
        assert (result['revenue_tier'] == 'enterprise').all()

    def test_growth_tier(self):
        df = pd.DataFrame({'amount': [1000, 5000, 9999]})
        result = calculate_revenue_tier(df)
        assert (result['revenue_tier'] == 'growth').all()

    def test_starter_tier(self):
        df = pd.DataFrame({'amount': [0, 500, 999]})
        result = calculate_revenue_tier(df)
        assert (result['revenue_tier'] == 'starter').all()

    def test_boundary_values(self):
        df = pd.DataFrame({'amount': [999, 1000, 9999, 10000]})
        result = calculate_revenue_tier(df)
        expected = ['starter', 'growth', 'growth', 'enterprise']
        assert result['revenue_tier'].tolist() == expected

    def test_null_amounts(self):
        df = pd.DataFrame({'amount': [None, 1000]})
        result = calculate_revenue_tier(df)
        # Nulls should not raise; behavior should be defined
        assert result['revenue_tier'].notna().all() or result['revenue_tier'].isna().any()

class TestDeduplicateOrders:
    def test_keeps_most_recent(self):
        df = pd.DataFrame({
            'order_id': ['A', 'A', 'B'],
            'status': ['pending', 'shipped', 'pending'],
            'updated_at': [
                datetime(2026, 1, 1),
                datetime(2026, 1, 2),
                datetime(2026, 1, 1)
            ]
        })
        result = deduplicate_orders(df)
        assert len(result) == 2
        assert result[result['order_id'] == 'A']['status'].values[0] == 'shipped'`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Pytest Fixtures for Test Infrastructure</h2>
          <p>
            Fixtures provide reusable setup and teardown for tests. For data pipeline tests, the most valuable fixtures are sample DataFrames, database connections, and test data factories.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# tests/conftest.py
import pytest
import pandas as pd
import duckdb
from datetime import datetime, timedelta

@pytest.fixture
def sample_orders() -> pd.DataFrame:
    """Minimal orders DataFrame for transformation tests."""
    return pd.DataFrame({
        'order_id': ['ORD-001', 'ORD-002', 'ORD-003'],
        'customer_id': ['CUST-A', 'CUST-A', 'CUST-B'],
        'amount': [500, 12000, 3000],
        'status': ['pending', 'shipped', 'delivered'],
        'order_date': [
            datetime(2026, 3, 1),
            datetime(2026, 3, 15),
            datetime(2026, 3, 20)
        ],
        'updated_at': [
            datetime(2026, 3, 1, 10),
            datetime(2026, 3, 15, 14),
            datetime(2026, 3, 20, 9)
        ]
    })

@pytest.fixture
def duckdb_connection():
    """In-memory DuckDB connection for integration tests."""
    con = duckdb.connect(':memory:')
    yield con
    con.close()

@pytest.fixture
def orders_table(duckdb_connection, sample_orders):
    """Populate DuckDB with sample orders for SQL tests."""
    duckdb_connection.execute("""
        CREATE TABLE orders AS SELECT * FROM sample_orders
    """, {'sample_orders': sample_orders})
    yield duckdb_connection
    duckdb_connection.execute("DROP TABLE IF EXISTS orders")`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Integration Tests with DuckDB</h2>
          <p>
            DuckDB&apos;s in-memory mode is ideal for integration tests: no server to start, fast setup and teardown, and full SQL support. You can test the actual SQL queries your pipeline runs without connecting to a production or staging database.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# tests/test_revenue_aggregation.py
import pytest

DAILY_REVENUE_SQL = """
    SELECT
        DATE_TRUNC('day', order_date)::DATE AS order_day,
        SUM(amount) AS daily_revenue,
        COUNT(*) AS order_count
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY 1
    ORDER BY 1
"""

def test_daily_revenue_aggregation(orders_table):
    result = orders_table.execute(DAILY_REVENUE_SQL).df()
    
    # Basic shape assertions
    assert len(result) > 0
    assert set(result.columns) == {'order_day', 'daily_revenue', 'order_count'}
    
    # No nulls in key columns
    assert result['order_day'].notna().all()
    assert result['daily_revenue'].notna().all()
    
    # Revenue is non-negative
    assert (result['daily_revenue'] >= 0).all()

def test_cancelled_orders_excluded(duckdb_connection):
    """Cancelled orders should not appear in revenue."""
    duckdb_connection.execute("""
        CREATE TABLE orders (
            order_id VARCHAR,
            amount FLOAT,
            status VARCHAR,
            order_date DATE
        )
    """)
    duckdb_connection.execute("""
        INSERT INTO orders VALUES
            ('A', 1000.0, 'delivered', '2026-03-01'),
            ('B', 500.0, 'cancelled', '2026-03-01')
    """)
    
    result = duckdb_connection.execute(DAILY_REVENUE_SQL).df()
    assert result['daily_revenue'].values[0] == 1000.0
    assert result['order_count'].values[0] == 1`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Property-Based Testing with Hypothesis</h2>
          <p>
            Property-based testing generates random inputs and verifies that invariants hold across all of them. For data transformations, this catches edge cases you would not have thought to test manually.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from hypothesis import given, settings
from hypothesis import strategies as st
from hypothesis.extra.pandas import column, data_frames
import pandas as pd
from src.transformations.orders import calculate_revenue_tier, deduplicate_orders

@given(
    amounts=st.lists(
        st.one_of(
            st.none(),
            st.floats(min_value=0, max_value=1_000_000, allow_nan=False)
        ),
        min_size=1, max_size=100
    )
)
def test_revenue_tier_always_assigns_valid_tier(amounts):
    df = pd.DataFrame({'amount': amounts})
    result = calculate_revenue_tier(df)
    valid_tiers = {'starter', 'growth', 'enterprise'}
    assert set(result['revenue_tier'].dropna().unique()).issubset(valid_tiers)

@given(
    orders_df=data_frames(
        columns=[
            column('order_id', dtype=str),
            column('updated_at', dtype='datetime64[ns]'),
            column('amount', dtype=float)
        ],
        rows=st.integers(min_value=1, max_value=200)
    )
)
def test_dedup_never_produces_duplicate_order_ids(orders_df):
    orders_df = orders_df.dropna(subset=['order_id'])
    if len(orders_df) == 0:
        return
    result = deduplicate_orders(orders_df)
    assert result['order_id'].nunique() == len(result)`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Testing Incremental Logic</h2>
          <p>
            Incremental pipeline logic is one of the most error-prone areas and one of the least tested. The filter that determines which data gets processed on each run deserves explicit tests.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from datetime import datetime, timedelta
from src.pipeline.incremental import get_incremental_filter

def test_incremental_filter_includes_overlap_window():
    """Filter should include a 3-hour lookback to catch late arrivals."""
    last_run = datetime(2026, 3, 27, 10, 0, 0)
    filter_condition = get_incremental_filter(last_run, overlap_hours=3)
    
    # Should include data from 3 hours before last run
    assert filter_condition.lower_bound == datetime(2026, 3, 27, 7, 0, 0)

def test_incremental_filter_excludes_old_data():
    """Filter should not include data from before the overlap window."""
    last_run = datetime(2026, 3, 27, 10, 0, 0)
    filter_condition = get_incremental_filter(last_run, overlap_hours=3)
    
    old_timestamp = datetime(2026, 3, 27, 6, 59, 59)
    assert not filter_condition.includes(old_timestamp)`}
          </pre>
          <p>
            The testing investment pays off most in the places where failures are hardest to detect: business logic transformations that produce wrong numbers silently, deduplication logic that creates subtle duplicates, and incremental filters that miss records. Start there, build coverage over time, and treat the test suite as documentation of expected behavior that every future engineer can rely on.
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
