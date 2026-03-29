import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Governance in Practice: The Parts That Actually Work | Ryan Kirsch",
  description:
    "A practical guide to data governance that engineering teams will actually follow. Data ownership, access control, lineage, a data dictionary that stays current, and how to make governance a byproduct of good engineering rather than a separate bureaucratic process.",
  openGraph: {
    title:
      "Data Governance in Practice: The Parts That Actually Work",
    description:
      "Data ownership, access control, lineage, a data dictionary that stays current, and how to make governance a byproduct of good engineering rather than a separate bureaucratic process.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-governance-practical-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Governance in Practice: The Parts That Actually Work",
    description:
      "Making governance a byproduct of good engineering rather than a separate bureaucratic process.",
  },
  alternates: { canonical: "/blog/data-governance-practical-guide" },
};

export default function DataGovernancePracticalPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-governance-practical-guide"
  );
  const postTitle = encodeURIComponent(
    "Data Governance in Practice: The Parts That Actually Work"
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
            Data Governance in Practice: The Parts That Actually Work
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 22, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most data governance frameworks fail for the same reason: they are
            designed as compliance exercises rather than engineering
            infrastructure. They create documentation that goes stale, approval
            processes that slow teams down, and ownership assignments that no
            one enforces. The governance that actually works treats
            accountability, access control, and documentation as natural
            outputs of building the platform well.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Problem with Traditional Governance
            </h2>
            <p>
              Traditional data governance programs typically involve: a data
              catalog that requires manual entry, an ownership matrix that lives
              in a spreadsheet, an approval process for data access that takes
              days, and a data dictionary that was accurate when written and
              has not been touched since.
            </p>
            <p>
              None of these mechanisms are self-maintaining. They all require
              human effort to keep current, and that effort competes with the
              engineering work that produces business value. When the choice
              is between updating a data dictionary and building the next
              pipeline, the dictionary loses every time.
            </p>
            <p>
              The alternative: build governance into the tools and workflows
              that engineers use every day. If owning a table means adding
              a meta block to a dbt YAML file that is already being edited,
              ownership gets maintained. If documenting a model means writing
              the description before the PR is merged, documentation gets
              written. Make the right behavior the path of least resistance.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Data Ownership: Making It Real
            </h2>
            <p>
              Data ownership is only meaningful if it comes with
              responsibilities. A table that has an &ldquo;owner&rdquo; field in a
              spreadsheet but no actual accountability is not owned -- it is
              labeled. Real ownership means someone is on-call for that table,
              reviews schema change requests, and is notified when quality
              checks fail.
            </p>
            <p>
              The dbt implementation that makes ownership functional:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# models/marts/finance/fct_monthly_revenue.yml
models:
  - name: fct_monthly_revenue
    description: >
      Monthly revenue aggregated from delivered orders.
      One row per calendar month. Source of truth for Finance
      team MRR dashboard and board reporting.
    meta:
      owner: "data-platform@company.com"
      team: "data-platform"
      tier: "tier-1"          # Tier 1 = business-critical, monitored 24/7
      consumers:
        - "finance-dashboard"
        - "board-reporting-pipeline"
        - "monthly-close-process"
      sla:
        freshness_hours: 6    # Must refresh within 6h of schedule
        uptime_pct: 99.5
      pii: false
      data_classification: "internal"
    columns:
      - name: month
        description: "First day of the calendar month (e.g., 2026-03-01)"
        data_type: date
      - name: revenue_usd
        description: "Sum of delivered order amounts, net of refunds, in USD"
        data_type: numeric`}</code>
            </pre>
            <p>
              With this structure in dbt, ownership is version-controlled,
              searchable, and co-located with the model it describes. When
              you run <code>dbt docs generate</code>, the owner and consumer
              information is automatically included in the catalog. No separate
              spreadsheet required.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Access Control: Role-Based and Enforced
            </h2>
            <p>
              Access control is governance that engineering teams take
              seriously, because the consequences of getting it wrong are
              visible (security incidents, compliance failures) rather than
              invisible (stale documentation). The implementation in Snowflake:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Role hierarchy for data access control
-- ACCOUNTADMIN
--   SYSADMIN
--     DATA_PLATFORM_ADMIN  (data engineers)
--       ANALYTICS_READ     (analysts: read prod data)
--       ANALYTICS_WRITE    (data engineers: write to silver/gold)
--       STAGING_WRITE      (ingestion pipelines: write to bronze/staging)

-- Create role hierarchy
CREATE ROLE IF NOT EXISTS DATA_PLATFORM_ADMIN;
CREATE ROLE IF NOT EXISTS ANALYTICS_READ;
CREATE ROLE IF NOT EXISTS ANALYTICS_WRITE;
CREATE ROLE IF NOT EXISTS STAGING_WRITE;

GRANT ROLE ANALYTICS_READ TO ROLE ANALYTICS_WRITE;
GRANT ROLE ANALYTICS_WRITE TO ROLE DATA_PLATFORM_ADMIN;
GRANT ROLE DATA_PLATFORM_ADMIN TO ROLE SYSADMIN;

-- Grant schema-level access
GRANT USAGE ON DATABASE ANALYTICS TO ROLE ANALYTICS_READ;
GRANT USAGE ON SCHEMA ANALYTICS.GOLD TO ROLE ANALYTICS_READ;
GRANT SELECT ON ALL TABLES IN SCHEMA ANALYTICS.GOLD TO ROLE ANALYTICS_READ;
GRANT SELECT ON FUTURE TABLES IN SCHEMA ANALYTICS.GOLD TO ROLE ANALYTICS_READ;

-- Column masking for PII (Snowflake Enterprise+)
CREATE OR REPLACE MASKING POLICY pii_mask AS (val STRING)
RETURNS STRING ->
    CASE
        WHEN CURRENT_ROLE() IN ('DATA_PLATFORM_ADMIN') THEN val
        ELSE '****'
    END;

ALTER TABLE dim_customers
    MODIFY COLUMN email SET MASKING POLICY pii_mask;`}</code>
            </pre>
            <p>
              The key design decision: grant access at the role level, not
              the user level. Adding a new analyst means assigning them the
              ANALYTICS_READ role -- one change, all the right permissions,
              no one-off grants that are forgotten and accumulate.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lineage: The Governance That Pays for Itself
            </h2>
            <p>
              Data lineage -- knowing what data came from where and what
              depends on it -- is the governance feature that pays for itself
              most directly. When a source system changes, lineage tells you
              exactly which downstream models are affected. When a table has
              a quality issue, lineage tells you which dashboards are
              consuming it.
            </p>
            <p>
              dbt generates lineage automatically from its <code>ref()</code>{" "}
              and <code>source()</code> calls. The output is a directed acyclic
              graph that can be queried:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Query dbt manifest for upstream dependencies of a model
import json
from pathlib import Path

def get_upstream_models(manifest_path: str, model_name: str) -> list[str]:
    """Returns all models that model_name depends on, recursively."""
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    target = f"model.myproject.{model_name}"
    visited = set()
    queue = [target]
    
    while queue:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)
        
        node = manifest.get("nodes", {}).get(current, {})
        parents = node.get("depends_on", {}).get("nodes", [])
        queue.extend(parents)
    
    visited.discard(target)
    return [n.split(".")[-1] for n in visited]

# Usage: find everything fct_monthly_revenue depends on
upstream = get_upstream_models("target/manifest.json", "fct_monthly_revenue")
print(f"fct_monthly_revenue depends on {len(upstream)} upstream models")`}</code>
            </pre>
            <p>
              Combine lineage with ownership metadata and you have a complete
              impact analysis tool: for any source system change, identify
              all affected models and automatically notify their owners.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              A Data Dictionary That Stays Current
            </h2>
            <p>
              The fastest path to a current data dictionary is to use the
              documentation already living in your dbt YAML files. dbt docs
              generates a static site from your model descriptions, column
              descriptions, and test definitions. It is automatically
              regenerated with every dbt run, which means it is never more
              than one pipeline run out of date.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Generate and serve docs locally
dbt docs generate
dbt docs serve --port 8080

# Deploy docs to a static host (in CI/CD)
dbt docs generate
aws s3 sync target/docs s3://company-data-docs/ --delete
# Or: upload to Netlify, Vercel, GitHub Pages

# The output includes:
# - Model descriptions with owners and SLAs
# - Column descriptions and data types
# - Test coverage per model
# - Interactive lineage graph
# - Source system documentation`}</code>
            </pre>
            <p>
              The enforcement mechanism: make adding a description mandatory
              in the dbt CI check before a model can be merged to main. A
              PR that adds a new production model without a description fails
              CI. This is governance that requires no human reviewer -- the
              tool enforces it automatically.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              PII and Data Classification
            </h2>
            <p>
              PII handling is the governance area where mistakes have the most
              serious consequences. The practical approach:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Classify at ingestion.</strong> Tag PII columns in
                the staging layer YAML before they enter the transformation
                pipeline. This makes PII status visible to every model that
                references the column.
              </li>
              <li>
                <strong>Never join PII into gold tables unnecessarily.</strong>
                A gold model that contains customer email addresses when it
                only needs customer segments has unnecessarily expanded the PII
                surface. Use customer IDs in gold and join to PII only at
                the serving layer, where access control is explicit.
              </li>
              <li>
                <strong>Audit PII access quarterly.</strong> Who has SELECT
                access to tables with PII? Are all those grants still
                necessary? This audit is simple to run and catches access
                grants that were provisioned for a project and never removed.
              </li>
            </ul>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`-- Quarterly PII access audit query
SELECT
    g.grantee_name,
    g.privilege,
    g.table_name,
    g.table_schema
FROM INFORMATION_SCHEMA.OBJECT_PRIVILEGES g
WHERE g.privilege = 'SELECT'
  AND g.table_name IN (
      -- Tables with PII columns
      SELECT table_name
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE comment ILIKE '%pii%'
         OR column_name IN ('email', 'phone', 'ssn', 'dob', 'address')
  )
ORDER BY g.grantee_name, g.table_name;`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Governance That Engineering Teams Will Actually Follow
            </h2>
            <p>
              The common thread in all of these practices: they produce
              governance artifacts as side effects of work that engineers
              are already doing, rather than requiring separate effort.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Writing a dbt model requires a YAML file -- put ownership there</li>
              <li>Merging a PR can require a description -- enforce it in CI</li>
              <li>dbt runs generate docs -- deploy them automatically</li>
              <li>
                Granting access requires a role -- make the role hierarchy
                explicit so every grant is deliberate
              </li>
            </ul>
            <p>
              The governance programs that fail are the ones that require
              engineers to do extra work with no immediate benefit to their
              pipelines. The ones that succeed are woven into the tools and
              processes that engineers already trust.
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
