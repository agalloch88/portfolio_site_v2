import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Using dbt Snapshots for SCD Type 2: A Practical Guide | Ryan Kirsch",
  description:
    "How dbt snapshots handle Slowly Changing Dimension Type 2 automatically. YAML configuration, timestamp vs check strategy, practical SQL examples, and the gotchas that burn teams in production.",
  openGraph: {
    title: "Using dbt Snapshots for SCD Type 2: A Practical Guide",
    description:
      "How dbt snapshots handle Slowly Changing Dimension Type 2 automatically. YAML config, strategy types, practical examples, and production gotchas.",
    type: "article",
    url: "https://ryankirsch.dev/dbt-snapshots-scd-type-2",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Using dbt Snapshots for SCD Type 2: A Practical Guide",
    description:
      "How dbt snapshots handle Slowly Changing Dimension Type 2 automatically. YAML config, strategy types, practical examples, and production gotchas.",
  },
  alternates: { canonical: "/dbt-snapshots-scd-type-2" },
};

export default function DbtSnapshotsScdPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/dbt-snapshots-scd-type-2"
  );
  const postTitle = encodeURIComponent(
    "Using dbt Snapshots for SCD Type 2: A Practical Guide"
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
            Using dbt Snapshots for SCD Type 2: A Practical Guide
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 29, 2026 ·{" "}
            <span className="text-cyberTeal">10 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most data engineering teams need to track how records change over
            time. A customer moves from the free tier to paid. A product
            changes its price. An employee transfers to a different department.
            Slowly Changing Dimensions (SCDs) are the warehouse pattern for
            this, and dbt snapshots are the cleanest implementation of SCD
            Type 2 available today.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What Is SCD Type 2 and Why Does It Matter
            </h2>
            <p>
              A Slowly Changing Dimension (SCD) is a dimension table where
              attributes change over time, but not frequently enough to model
              as a fact. The three common types are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Type 1:</strong> Overwrite the old value. No history
                preserved. Simple, but you lose the ability to answer
                historical questions accurately.
              </li>
              <li>
                <strong>Type 2:</strong> Add a new row for each change, with
                effective date columns marking when each version was valid.
                Full history preserved. More storage, but essential for
                point-in-time correctness.
              </li>
              <li>
                <strong>Type 3:</strong> Keep the current and previous value
                in separate columns. Limited history, rarely used in practice.
              </li>
            </ul>
            <p>
              SCD Type 2 is the standard for any dimension where historical
              accuracy matters. Consider a revenue analysis: if a customer
              was on the Pro plan when they made a purchase, that purchase
              should be attributed to Pro even if the customer later downgraded
              to Free. Without Type 2 history, you&apos;d be joining against
              the customer&apos;s current plan, not their plan at purchase time.
              This corrupts cohort analysis, revenue attribution, and any
              time-based segmentation.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              How dbt Snapshots Work
            </h2>
            <p>
              dbt snapshots are SQL SELECT statements that dbt wraps with
              change detection logic. When you run <code>dbt snapshot</code>,
              dbt compares the current source data against the last snapshot
              state and automatically inserts new rows for changed records,
              closing out old rows by setting their <code>dbt_valid_to</code>{" "}
              timestamp. Currently active records have a null{" "}
              <code>dbt_valid_to</code>.
            </p>
            <p>
              The snapshot table dbt maintains has four generated columns
              added to your source columns:
            </p>
            <ul className="list-disc pl-6 space-y-1 font-mono text-sm">
              <li>dbt_scd_id: unique hash for each row version</li>
              <li>dbt_updated_at: when this snapshot run detected the change</li>
              <li>dbt_valid_from: when this version became active</li>
              <li>dbt_valid_to: when this version was superseded (null = current)</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Snapshot Configuration: The Two Strategies
            </h2>
            <p>
              dbt supports two strategies for detecting changes. Choosing
              the wrong one for your source data is the most common snapshot
              mistake.
            </p>
            <h3 className="text-xl font-semibold text-white mt-6">
              Strategy 1: Timestamp
            </h3>
            <p>
              Use this when your source table has a reliable{" "}
              <code>updated_at</code> timestamp that changes whenever a row
              is modified. This is the preferred strategy when available
              because it is efficient: dbt only compares rows where
              <code>updated_at</code> is newer than the last snapshot run.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- snapshots/customers_snapshot.sql
{% snapshot customers_snapshot %}

{{
    config(
        target_schema='snapshots',
        unique_key='customer_id',
        strategy='timestamp',
        updated_at='updated_at',
        invalidate_hard_deletes=True,
    )
}}

SELECT
    customer_id,
    email,
    plan_tier,
    company_name,
    updated_at
FROM {{ source('app_db', 'customers') }}

{% endsnapshot %}`}</code>
            </pre>
            <h3 className="text-xl font-semibold text-white mt-6">
              Strategy 2: Check
            </h3>
            <p>
              Use this when your source table has no reliable updated_at
              timestamp. dbt hashes the specified columns and compares hashes
              between runs. Any change to a checked column triggers a new
              snapshot row. This is slower because dbt must compare every row,
              not just recently modified ones.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- snapshots/products_snapshot.sql
{% snapshot products_snapshot %}

{{
    config(
        target_schema='snapshots',
        unique_key='product_id',
        strategy='check',
        check_cols=['price_cents', 'category', 'is_active'],
    )
}}

SELECT
    product_id,
    product_name,
    price_cents,
    category,
    is_active
FROM {{ source('app_db', 'products') }}

{% endsnapshot %}`}</code>
            </pre>
            <p>
              You can also use <code>check_cols=&apos;all&apos;</code> to check every
              column, but this is expensive on wide tables and often catches
              irrelevant changes like internal metadata columns.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Querying Snapshot Tables
            </h2>
            <p>
              Once your snapshot is populated, querying it correctly is
              important. The two most common queries are current state and
              point-in-time state:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Current state of all customers (most recent version)
SELECT *
FROM snapshots.customers_snapshot
WHERE dbt_valid_to IS NULL;

-- Point-in-time: what was each customer's plan on 2025-01-01?
SELECT *
FROM snapshots.customers_snapshot
WHERE dbt_valid_from <= '2025-01-01'
  AND (dbt_valid_to > '2025-01-01' OR dbt_valid_to IS NULL);

-- Join purchases to customer plan at time of purchase
SELECT
    p.purchase_id,
    p.amount_cents,
    c.plan_tier AS plan_at_purchase_time,
    c.customer_id
FROM fact_purchases p
JOIN snapshots.customers_snapshot c
    ON p.customer_id = c.customer_id
    AND p.created_at >= c.dbt_valid_from
    AND (p.created_at < c.dbt_valid_to OR c.dbt_valid_to IS NULL);`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Production Gotchas
            </h2>
            <p>
              These are the issues that teams discover the hard way. Learn
              them now.
            </p>
            <p>
              <strong>Snapshot frequency must match your SLA.</strong> dbt
              snapshots capture a point-in-time state when they run. If a
              record changes twice between snapshot runs, you only capture
              the second change. If your customer can change plan tiers
              multiple times per day and you need every change, snapshots
              running hourly are minimum. Daily snapshots miss intra-day
              changes entirely.
            </p>
            <p>
              <strong>Hard deletes require explicit handling.</strong> When
              a record is deleted from the source, dbt does not automatically
              close out the snapshot row unless you set
              <code>invalidate_hard_deletes=True</code>. Without this, deleted
              records stay in your snapshot with a null <code>dbt_valid_to</code>,
              indistinguishable from active records. Always enable this for
              sources that delete rows.
            </p>
            <p>
              <strong>The unique_key must be truly unique.</strong> If your
              source has duplicate primary keys (which happens in messy
              operational databases), dbt snapshot behavior becomes
              non-deterministic. Deduplicate in your snapshot SELECT before
              snapshotting, not after.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Deduplicate in the snapshot SELECT for messy sources
{% snapshot customers_snapshot_safe %}

{{
    config(
        target_schema='snapshots',
        unique_key='customer_id',
        strategy='timestamp',
        updated_at='updated_at',
        invalidate_hard_deletes=True,
    )
}}

-- Deduplicate: keep the latest record per customer_id
WITH deduped AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id ORDER BY updated_at DESC
        ) AS rn
    FROM {{ source('app_db', 'customers') }}
)
SELECT
    customer_id,
    email,
    plan_tier,
    updated_at
FROM deduped
WHERE rn = 1

{% endsnapshot %}`}</code>
            </pre>
            <p>
              <strong>Snapshots do not support incremental merge in all
              warehouses.</strong> On some targets, dbt snapshot uses a
              full table scan plus merge. On very large source tables
              (100M+ rows), this can be slow. Consider adding a filter to
              your snapshot SELECT to only include recently modified rows
              when using the check strategy, or partition your source data
              to limit scan size.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When to Use Snapshots vs Custom SCD Logic
            </h2>
            <p>
              dbt snapshots handle the 80% case well: a single source table,
              a reliable unique key, standard SCD Type 2 semantics. Use custom
              logic (incremental models with manual merge statements) when:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You need SCD Type 6 (combining Type 1, 2, and 3 in one table)
              </li>
              <li>
                Your change detection logic is complex, multi-table joins or
                derived business logic
              </li>
              <li>
                You need surrogate key generation that integrates with your
                existing dim key sequences
              </li>
              <li>
                You are on a warehouse where dbt snapshot performance is
                unacceptable and you need partition-pruning control
              </li>
            </ul>
            <p>
              For most teams starting with SCD Type 2, dbt snapshots are the
              fastest path from requirement to production with the least
              custom code to maintain. Start there and reach for custom logic
              only when you hit a genuine limitation.
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
