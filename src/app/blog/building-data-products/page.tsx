import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building Data Products: From Pipeline to Product Thinking | Ryan Kirsch",
  description:
    "The shift from pipeline builder to data product owner: what data products are, how to think about SLAs, versioning, and discoverability, and the engineering practices that make data products trustworthy for consumers.",
  openGraph: {
    title: "Building Data Products: From Pipeline to Product Thinking",
    description:
      "The shift from pipeline builder to data product owner: what data products are, how to think about SLAs, versioning, and discoverability, and the engineering practices that make data products trustworthy for consumers.",
    type: "article",
    url: "https://ryankirsch.dev/blog/building-data-products",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Building Data Products: From Pipeline to Product Thinking",
    description:
      "The shift from pipeline builder to data product owner: what data products are, how to think about SLAs, versioning, and discoverability, and the engineering practices that make data products trustworthy for consumers.",
  },
  alternates: { canonical: "/blog/building-data-products" },
};

export default function DataProductsPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/building-data-products");
  const postTitle = encodeURIComponent("Building Data Products: From Pipeline to Product Thinking");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Data Engineering</span>
            <span className="text-sm text-gray-500">February 6, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Building Data Products: From Pipeline to Product Thinking
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A pipeline delivers data. A data product makes data reliably useful for the people who depend on it. The difference is an engineering and organizational shift, not just a naming convention.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The term &quot;data product&quot; gets overused and underdefined. At its core, a data product is a data asset treated with the same engineering discipline as a software product: it has defined consumers, SLAs, versioning, documentation, and an owner who is responsible for its quality over time. The contrast is a pipeline that produces output and calls it done, without ownership, documentation, or any commitment to the consumers who depend on it.
          </p>
          <p>
            The shift from pipeline thinking to data product thinking is one of the more impactful changes a data team can make. It changes how decisions are made, who feels responsible when things break, and whether the data organization builds trust with its stakeholders over time.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Makes Something a Data Product</h2>
          <p>
            A data product has four properties that distinguish it from a pipeline:
          </p>
          <p>
            <strong>Defined consumers and use cases.</strong> A data product knows who uses it and what for. This sounds obvious but it is frequently missing: data assets get built to satisfy an immediate request and then accumulate consumers who were never considered in the original design. A data product starts with consumer analysis before the first line of SQL is written.
          </p>
          <p>
            <strong>Explicit SLAs.</strong> Freshness (how recently was this data updated), accuracy (what is the known error rate or quality threshold), and availability (what is the uptime commitment). These do not need to be formal contracts, but they need to be written down and communicated. A consumer who discovers that a table they depend on has a six-hour freshness SLA they did not know about is a consumer who stops trusting the data team.
          </p>
          <p>
            <strong>Clear ownership.</strong> One person or team is responsible for this data product. They are the escalation point when something breaks, the approval required when schema changes are proposed, and the author of the documentation that explains what the product is and is not.
          </p>
          <p>
            <strong>Discoverability and documentation.</strong> Consumers should be able to find the data product, understand what it contains, and know how to use it without asking the owner a basic question. This means documentation that lives close to the data: in dbt YAML files, in a data catalog, or in a README in the repository.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Defining and Communicating SLAs</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# dbt model with explicit SLA documentation
# models/marts/fct_orders.yml

version: 2

models:
  - name: fct_orders
    description: |
      One row per order line item. Source of truth for revenue reporting.
      
      ## SLAs
      - Freshness: Updated daily by 7:00 AM ET. Intraday updates not guaranteed.
      - Accuracy: Revenue figures reconciled to Stripe weekly. Known variance < 0.1%.
      - Availability: 99.5% uptime target. Planned maintenance windows communicated 48h ahead.
      
      ## Owner
      Data Platform team. Escalations: #data-platform Slack channel.
      
      ## Known Limitations
      - Refunds processed after 30 days may not be reflected in this model.
      - International orders have currency conversion based on daily FX rate, not transaction rate.
      
    meta:
      owner: data-platform
      sla_freshness_hours: 7
      sla_availability_pct: 99.5
      tier: "gold"
      consumers:
        - "Revenue Dashboard (Looker)"
        - "Finance Monthly Close Process"
        - "Marketing Attribution Pipeline"`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Versioning Data Products</h2>
          <p>
            Schema changes are the most common way data products break their consumers. A column rename, a type change, or a grain shift can silently break downstream dashboards and pipelines. Version management for data products addresses this problem.
          </p>
          <p>
            The lightweight version of versioning: use a <code>_v2</code> suffix for breaking changes and maintain both versions until consumers migrate. Communicate the migration timeline. Deprecate explicitly with a date.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- v1: grain is order, customer_id is a foreign key
SELECT order_id, customer_id, revenue FROM fct_orders_v1

-- v2 (breaking change): grain changed to order line item, customer_name denormalized
SELECT order_id, order_line_id, customer_name, revenue FROM fct_orders_v2

-- Migration timeline communicated to consumers:
-- v1 deprecated: 2026-04-01
-- v1 removed: 2026-05-01`}
          </pre>
          <p>
            For more formal environments, schema registries (Confluent Schema Registry, AWS Glue Schema Registry) enforce compatibility rules automatically. An attempt to make a breaking change to a schema registered as backward-compatible will fail at the CI level before it reaches production.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Data Contracts</h2>
          <p>
            A data contract is a formal agreement between data producers and consumers about the structure, semantics, and quality of a data product. It is the evolution of schema documentation: instead of describing what the data looks like today, a contract defines what it is committed to look like going forward.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# data_contract_fct_orders.yaml
apiVersion: "0.9.0"
kind: DataContract
id: "fct-orders-v2"
version: "2.0.0"
name: "Orders Fact Table"

info:
  owner: data-platform@company.com
  description: "One row per order line item, grain stable through v3"

schema:
  - name: order_id
    type: string
    required: true
    unique: false
    description: "Unique identifier for the order"
  - name: customer_id
    type: string
    required: true
  - name: amount_usd
    type: decimal
    required: true
    minimum: 0
    description: "Order amount in USD at transaction time"
  - name: order_date
    type: date
    required: true

quality:
  - rule: no_nulls
    columns: [order_id, customer_id, amount_usd, order_date]
  - rule: freshness
    column: order_date
    warn_after_hours: 25
    error_after_hours: 49

sla:
  freshness: "Updated by 7:00 AM ET daily"
  availability: "99.5%"
  
owners:
  - id: data-platform
    type: team`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Discoverability: Making Data Findable</h2>
          <p>
            A data product that cannot be found is not serving its consumers. Discoverability requires both a catalog (a system where data assets are registered and searchable) and documentation that makes each asset understandable to someone who did not build it.
          </p>
          <p>
            The minimal discoverability stack for a team using dbt:
          </p>
          <p>
            <strong>dbt docs</strong> generates a browsable documentation site from your dbt YAML files. Every model, column, and test gets a documentation page. Run <code>dbt docs generate &amp;&amp; dbt docs serve</code> to see it. This is the lowest-effort path to a functioning data catalog.
          </p>
          <p>
            <strong>dbt exposures</strong> document the downstream consumers of each model: which dashboards, applications, and pipelines depend on each data product. This makes impact analysis before schema changes practical.
          </p>
          <p>
            For teams that outgrow dbt docs, tools like DataHub, OpenMetadata, and Atlan provide richer catalog functionality: lineage visualization, business glossaries, usage statistics, and integration with multiple data sources beyond dbt.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Organizational Side</h2>
          <p>
            Data products require ownership, and ownership requires accountability. This is the part that technical patterns cannot fully solve. A team that produces data products but has no mechanism for holding owners accountable when SLAs are missed will gradually revert to the pipeline-and-forget pattern.
          </p>
          <p>
            The organizational prerequisites for data products to work: owners have enough capacity to actually maintain what they own (not just code it up and move on), there is a process for consumers to raise issues and get responses, and SLA violations have consequences that prompt remediation rather than being silently ignored.
          </p>
          <p>
            The data product model works when it is treated as a genuine product discipline, with the same attention to consumer needs, quality standards, and ownership accountability that software products receive. Teams that apply the technical patterns without the organizational change tend to end up with well-documented pipelines that are still unreliable. The patterns are necessary but not sufficient on their own.
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
