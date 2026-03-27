import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Lineage in Practice: How to Know What Breaks When You Change a Model | Ryan Kirsch",
  description:
    "A practical guide to data lineage for data engineers: column-level vs table-level lineage, dbt lineage graphs, warehouse metadata, impact analysis, and how lineage changes code review and incident response.",
  openGraph: {
    title: "Data Lineage in Practice: How to Know What Breaks When You Change a Model",
    description:
      "A practical guide to data lineage for data engineers: column-level vs table-level lineage, dbt lineage graphs, warehouse metadata, impact analysis, and how lineage changes code review and incident response.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-lineage-in-practice",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Lineage in Practice: How to Know What Breaks When You Change a Model",
    description:
      "A practical guide to data lineage for data engineers: column-level vs table-level lineage, dbt lineage graphs, warehouse metadata, impact analysis, and how lineage changes code review and incident response.",
  },
  alternates: { canonical: "/blog/data-lineage-in-practice" },
};

export default function DataLineageInPracticePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-lineage-in-practice");
  const postTitle = encodeURIComponent("Data Lineage in Practice: How to Know What Breaks When You Change a Model");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Governance</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Lineage in Practice: How to Know What Breaks When You Change a Model
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Data lineage sounds like governance theater until the day a simple model change breaks six dashboards, two reverse ETL syncs, and an executive KPI. Then it becomes the thing you wish you had invested in sooner.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Most data teams first encounter lineage as a static graph in dbt docs or a metadata tool demo. It looks useful, but not urgent. The graph becomes urgent when a column rename silently breaks a downstream Looker explore, or when an incident starts with “numbers look wrong” and nobody knows which upstream transform changed.
          </p>
          <p>
            Lineage is not a deliverable for auditors. It is an operational tool for impact analysis, incident response, code review, onboarding, and stakeholder trust. When implemented well, it changes how a data team ships work.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Lineage Actually Means</h2>
          <p>
            At the simplest level, lineage answers two questions:
          </p>
          <ul>
            <li>Where did this table or column come from?</li>
            <li>What depends on it downstream?</li>
          </ul>
          <p>
            There are two main levels of lineage that matter in practice.
          </p>
          <p>
            <strong>Table-level lineage</strong> shows that model A feeds model B, which feeds dashboard C. This is enough for broad impact analysis and understanding the shape of the transformation graph.
          </p>
          <p>
            <strong>Column-level lineage</strong> shows that <code>customer_lifetime_value</code> on the final mart depends on <code>order_amount</code>, <code>refund_amount</code>, and <code>account_created_at</code> upstream. This is what you need when individual fields change or when metric trust becomes political.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`raw.stripe_charges.amount
  → stg_stripe__charges.charge_amount
  → int_orders__net_revenue.net_amount
  → fct_orders.revenue
  → mart_customer_ltv.customer_lifetime_value
  → dashboard.executive_revenue_overview.total_ltv

# Table-level tells you the path.
# Column-level tells you the specific field logic involved.`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why dbt Lineage Matters So Much</h2>
          <p>
            dbt made lineage dramatically more accessible because the dependency graph is implicit in the model code. If a model references another model via <code>ref()</code>, dbt can construct the DAG automatically.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- models/marts/fct_orders.sql
with orders as (
    select * from {{ ref('int_orders__clean') }}
),
customers as (
    select * from {{ ref('dim_customers') }}
)

select
    o.order_id,
    o.customer_id,
    c.segment,
    o.net_revenue,
    o.order_date
from orders o
left join customers c
  on o.customer_id = c.customer_id`}
          </pre>
          <p>
            That means every code change in dbt has built-in structural lineage. The catch is that teams often stop there. dbt lineage is powerful, but it only covers the dbt layer. The moment data flows into BI tools, reverse ETL tools, ML feature stores, or external APIs, you need more than the dbt graph to understand the full blast radius of a change.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Where Lineage Comes From</h2>
          <p>
            Useful lineage usually comes from combining several sources:
          </p>
          <ul>
            <li><strong>Transformation code</strong>: dbt refs, Spark job configs, SQL files in version control</li>
            <li><strong>Warehouse metadata</strong>: query history, table dependencies, view definitions</li>
            <li><strong>BI metadata</strong>: dashboard queries, semantic model fields, metric definitions</li>
            <li><strong>Ingestion metadata</strong>: connector mappings, CDC streams, load jobs</li>
          </ul>
          <p>
            Tools like DataHub, OpenMetadata, Atlan, and Monte Carlo aggregate these sources to build a more complete lineage graph. Warehouse-native features can help too. Snowflake query history, BigQuery INFORMATION_SCHEMA views, and Databricks Unity Catalog all expose useful metadata that can be harvested for dependency analysis.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Impact Analysis Before You Merge</h2>
          <p>
            The most valuable use of lineage is not post-hoc documentation. It is pre-merge impact analysis.
          </p>
          <p>
            Before changing a model, ask:
          </p>
          <ul>
            <li>Which downstream tables depend on this model?</li>
            <li>Which dashboards read those tables?</li>
            <li>Are any reverse ETL jobs or ML features sourced from these fields?</li>
            <li>Is this a table-level change, a column-level change, or a semantic change with the same schema?</li>
          </ul>
          <p>
            The schema-preserving semantic change is the dangerous one. Renaming a column usually throws a failure. Changing the logic of a familiar metric without changing the column name produces silent inconsistency. Good lineage paired with metric ownership makes that kind of change visible before it hits production.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Example review checklist
Changed model: mart_customer_ltv

Downstream dependents:
- dashboard.executive_revenue_overview
- reverse_etl.salesforce_account_health_sync
- notebook.finance_forecast_q2

Columns changed semantically:
- customer_lifetime_value
- average_order_value

Required reviewers:
- Finance analytics owner
- RevOps owner
- Data platform reviewer`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Lineage During Incidents</h2>
          <p>
            Incident response gets much faster when lineage is available. Without it, the investigation pattern is guesswork: inspect the dashboard, find the source table, inspect that table, guess which upstream transform might be wrong, repeat. With lineage, the search space narrows immediately.
          </p>
          <p>
            A practical incident workflow looks like this:
          </p>
          <ol>
            <li>Start with the broken metric or dashboard.</li>
            <li>Traverse upstream to identify the immediate source model.</li>
            <li>Check recent code changes on that model and its parents.</li>
            <li>Compare row counts, freshness, and distribution shifts at each hop.</li>
            <li>If needed, traverse downstream from the root issue to identify all impacted assets for communication.</li>
          </ol>
          <p>
            That last step matters. Good lineage is not just about finding the root cause. It is about knowing who to notify and what else may already be wrong.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Column-Level Lineage Is Hard, But Worth It</h2>
          <p>
            Column-level lineage is more expensive because SQL transformations are not always simple projections. A derived metric may be built from nested CTEs, window functions, macros, and UDFs. Parsing that reliably across dialects is not trivial.
          </p>
          <p>
            That said, even partial column-level lineage is valuable. If your tools can identify direct field mappings and common transformations, you already gain much of the impact analysis benefit for common changes. Perfect lineage is not required for lineage to be useful.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Cultural Shift</h2>
          <p>
            The most mature use of lineage is cultural, not technical. Teams start using it automatically in code reviews, onboarding, planning, and postmortems.
          </p>
          <p>
            New engineers use lineage to understand the platform faster. Reviewers use it to ask sharper questions. Product and analytics stakeholders trust the data team more because changes are communicated with confidence instead of guesses.
          </p>
          <p>
            The real payoff is not the graph itself. It is the operational habit it enables: nobody changes a model blindly, and nobody investigates a data incident from scratch.
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
