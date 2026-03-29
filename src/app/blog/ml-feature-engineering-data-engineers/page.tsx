import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "ML Feature Engineering Patterns for Data Engineers: Building the Pipeline That Feeds the Model | Ryan Kirsch",
  description:
    "A data engineering perspective on feature engineering. How to build reliable feature pipelines, avoid training-serving skew, design for reuse, and when a feature store is worth the investment.",
  openGraph: {
    title:
      "ML Feature Engineering Patterns for Data Engineers: Building the Pipeline That Feeds the Model",
    description:
      "How to build reliable feature pipelines, avoid training-serving skew, design for reuse, and when a feature store is worth the investment.",
    type: "article",
    url: "https://ryankirsch.dev/blog/ml-feature-engineering-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ML Feature Engineering Patterns for Data Engineers: Building the Pipeline That Feeds the Model",
    description:
      "How to build reliable feature pipelines, avoid training-serving skew, design for reuse, and when a feature store is worth the investment.",
  },
  alternates: { canonical: "/blog/ml-feature-engineering-data-engineers" },
};

export default function MLFeatureEngineeringPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/ml-feature-engineering-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "ML Feature Engineering Patterns for Data Engineers: Building the Pipeline That Feeds the Model"
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
            ML Feature Engineering Patterns for Data Engineers: Building the
            Pipeline That Feeds the Model
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 19, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data engineers are not machine learning engineers, but the boundary
            between them has blurred significantly. More data teams own the
            feature pipelines that feed ML models, and the bugs in those
            pipelines -- training-serving skew, feature leakage, inconsistent
            aggregation windows -- are data engineering bugs, not model bugs.
            This guide covers the patterns that prevent them.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Data Engineer&apos;s Role in ML
            </h2>
            <p>
              ML models are only as good as the data they train on and the
              features they receive at inference time. The data engineer&apos;s
              responsibility is the pipeline that produces those features --
              reliably, consistently, and at the right latency for the
              use case.
            </p>
            <p>
              The specific responsibilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Building and maintaining the ETL that cleans and transforms
                raw data into feature-ready datasets
              </li>
              <li>
                Ensuring training data and serving data use identical
                transformation logic (preventing training-serving skew)
              </li>
              <li>
                Making features discoverable and reusable across multiple
                models
              </li>
              <li>
                Monitoring feature quality over time (distribution drift,
                null rates, coverage gaps)
              </li>
            </ul>
            <p>
              The model itself -- the architecture, the loss function, the
              hyperparameter search -- belongs to the ML engineer. The pipeline
              that produces the training set and serves features in production
              belongs to the data engineer.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Feature Engineering Patterns
            </h2>
            <p>
              The most common feature types and how to implement them reliably:
            </p>
            <p>
              <strong>Window aggregations</strong> (most common, most error-prone):
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Customer behavior features with multiple windows
-- This is the canonical pattern: one CTE per window
WITH base AS (
    SELECT
        customer_id,
        event_date,
        order_id,
        amount_usd
    FROM orders
    WHERE status = 'delivered'
),

features_7d AS (
    SELECT
        customer_id,
        event_date AS feature_date,
        COUNT(DISTINCT order_id) AS orders_7d,
        SUM(amount_usd) AS revenue_7d,
        AVG(amount_usd) AS avg_order_value_7d
    FROM base
    WHERE event_date BETWEEN DATEADD('day', -7, event_date) AND event_date
    GROUP BY 1, 2
),

features_30d AS (
    SELECT
        customer_id,
        event_date AS feature_date,
        COUNT(DISTINCT order_id) AS orders_30d,
        SUM(amount_usd) AS revenue_30d
    FROM base
    WHERE event_date BETWEEN DATEADD('day', -30, event_date) AND event_date
    GROUP BY 1, 2
)

SELECT
    b.customer_id,
    b.event_date AS feature_date,
    COALESCE(f7.orders_7d, 0) AS orders_7d,
    COALESCE(f7.revenue_7d, 0) AS revenue_7d,
    COALESCE(f7.avg_order_value_7d, 0) AS avg_order_value_7d,
    COALESCE(f30.orders_30d, 0) AS orders_30d,
    COALESCE(f30.revenue_30d, 0) AS revenue_30d
FROM (SELECT DISTINCT customer_id, event_date FROM base) b
LEFT JOIN features_7d f7 USING (customer_id, feature_date)
LEFT JOIN features_30d f30 USING (customer_id, feature_date)`}</code>
            </pre>
            <p>
              The COALESCE to 0 is important: a customer with no activity in
              the window should have a 0 feature value, not NULL. NULL propagates
              through model calculations in unexpected ways.
            </p>
            <p>
              <strong>Point-in-time correct features</strong> (critical for
              preventing leakage):
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Build features as of a specific snapshot date
-- NOT using current state -- that leaks future information into training

-- BAD: uses current customer tier (includes future data)
SELECT
    o.order_id,
    o.order_date,
    c.tier AS customer_tier  -- This is TODAY's tier, not tier at order time
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id

-- GOOD: use point-in-time customer state
SELECT
    o.order_id,
    o.order_date,
    -- Get customer tier as of the order date
    (
        SELECT tier
        FROM customer_history ch
        WHERE ch.customer_id = o.customer_id
          AND ch.valid_from <= o.order_date
          AND (ch.valid_to > o.order_date OR ch.valid_to IS NULL)
        ORDER BY ch.valid_from DESC
        LIMIT 1
    ) AS customer_tier_at_order_time
FROM orders o`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Training-Serving Skew: The Silent Model Killer
            </h2>
            <p>
              Training-serving skew is when the feature values a model sees
              at inference time differ from the feature values it trained on,
              due to different code paths or different data. It is one of the
              most common causes of models that perform well in evaluation but
              poorly in production.
            </p>
            <p>
              The root causes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Training pipeline uses Python/pandas; serving uses SQL or
                a different Python library. Rounding, null handling, and
                aggregation behavior differ subtly.
              </li>
              <li>
                Training uses a historical snapshot; serving uses real-time
                data. If the real-time aggregation logic differs from the
                historical (different time zone, different cutoff), features
                will be systematically different.
              </li>
              <li>
                Training normalizes using statistics from the training set;
                serving uses the same normalization but those statistics drift
                over time.
              </li>
            </ul>
            <p>
              The prevention pattern: <strong>single source of truth for
              feature logic</strong>. If a feature is defined in SQL for
              training, it must be computed in the exact same SQL for serving.
              Abstract the feature logic into a reusable component (a dbt
              model, a Python function registered in a feature store) rather
              than copying it between training and serving codebases.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Shared feature definition as Python function
# Used identically in training pipeline and serving pipeline
import pandas as pd
from typing import Optional

def compute_customer_rfm(
    orders_df: pd.DataFrame,
    as_of_date: Optional[str] = None,
) -> pd.DataFrame:
    """
    Computes Recency, Frequency, Monetary features per customer.
    
    as_of_date: if None, uses current date (serving mode)
                if provided, computes as of that date (training mode)
    """
    if as_of_date:
        cutoff = pd.Timestamp(as_of_date)
    else:
        cutoff = pd.Timestamp.now()
    
    delivered = orders_df[
        (orders_df['status'] == 'delivered') &
        (orders_df['order_date'] <= cutoff)
    ].copy()
    
    rfm = delivered.groupby('customer_id').agg(
        recency_days=('order_date', lambda x: (cutoff - x.max()).days),
        frequency=('order_id', 'nunique'),
        monetary=('amount_usd', 'sum'),
    ).reset_index()
    
    return rfm

# Training: specify historical date to avoid leakage
training_features = compute_customer_rfm(orders_df, as_of_date='2026-01-01')

# Serving: use current date
serving_features = compute_customer_rfm(orders_df)`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Feature Store: When It Is Worth It
            </h2>
            <p>
              A feature store centralizes feature definitions, storage, and
              serving. It eliminates duplicate feature engineering across
              teams, provides point-in-time correct historical retrieval for
              training, and serves features consistently at low latency in
              production.
            </p>
            <p>
              Feature stores make sense when:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Multiple models use the same features, and those features are
                being computed independently by different teams (duplicate work,
                inconsistency risk)
              </li>
              <li>
                The organization has hit training-serving skew issues in
                production and needs a structural fix
              </li>
              <li>
                Real-time feature serving is required (online store + offline
                store pattern)
              </li>
              <li>
                The team has 5+ models in production that need governance
                and discoverability
              </li>
            </ul>
            <p>
              Feature stores do NOT make sense when:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You have 1-2 models in production</li>
              <li>
                All models are batch (no real-time serving requirement)
              </li>
              <li>
                The team is small and the overhead of maintaining a feature
                store exceeds the benefit
              </li>
            </ul>
            <p>
              The practical starting point before a full feature store: a
              shared dbt project that produces all feature tables, with clear
              naming conventions, grain documentation, and a mandate that
              new ML projects pull from this project rather than building
              their own feature pipelines. This gives you centralization and
              reuse without the operational overhead of a dedicated feature
              store infrastructure.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Feature Monitoring: Detecting When Features Drift
            </h2>
            <p>
              Models degrade when the feature distributions they receive in
              production drift from the distributions they trained on. This
              can happen when: user behavior changes, source systems change,
              a bug is introduced in the feature pipeline, or a data outage
              causes missing values to spike.
            </p>
            <p>
              Basic feature monitoring with Great Expectations:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`import great_expectations as gx
from great_expectations.core.batch import RuntimeBatchRequest

context = gx.get_context()

# Define feature expectations based on training data statistics
suite = context.add_expectation_suite("customer_rfm_features")

# Value range check - catches obvious pipeline failures
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="recency_days",
        min_value=0,
        max_value=3650,  # Max 10 years
    )
)

# Distribution check - catches drift
suite.add_expectation(
    gx.expectations.ExpectColumnMeanToBeBetween(
        column="frequency",
        min_value=1.5,   # From training data stats
        max_value=8.0,   # Warn if avg orders per customer drifts
    )
)

# Null rate check - catches missing data
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(
        column="monetary",
        mostly=0.95,  # Allow up to 5% nulls
    )
)`}</code>
            </pre>
            <p>
              Run these checks after every feature pipeline execution. Alert
              on failures before the model sees the features. A model that
              receives drifted or missing features silently produces wrong
              predictions -- monitoring catches this at the data layer where
              it is diagnosable, not at the prediction layer where it is
              already affecting users.
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
