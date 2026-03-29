import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each | Ryan Kirsch",
  description:
    "A practical guide to data modeling patterns for data engineers: dimensional modeling, one big table, data vault, entity-centric models, and how to choose the right approach for your use case.",
  openGraph: {
    title:
      "Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each",
    description:
      "A practical guide to data modeling patterns for data engineers: dimensional modeling, one big table, data vault, entity-centric models, and how to choose the right approach for your use case.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-modeling-for-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each",
    description:
      "A practical guide to data modeling patterns for data engineers: dimensional modeling, one big table, data vault, entity-centric models, and how to choose the right approach for your use case.",
  },
  alternates: { canonical: "/blog/data-modeling-for-data-engineers" },
};

export default function DataModelingPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-modeling-for-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each"
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
            <span className="text-sm text-gray-500">January 9, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The modeling debate is not about which pattern is correct. It is about which pattern fits your query patterns, team, and tooling. Here is how to actually choose.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data modeling is one of those skills that data engineers often absorb informally, through osmosis and legacy schemas, rather than studying deliberately. You inherit a star schema or a flat wide table, learn its conventions, and ship on top of it. The problem surfaces when you need to build from scratch or make a deliberate architectural decision, and you realize you have opinions but not frameworks.
          </p>
          <p>
            This post covers the main modeling patterns you will encounter as a senior data engineer: dimensional modeling, the one big table approach, data vault, and entity-centric models. More importantly, it covers how to choose between them when the choice is yours to make.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Dimensional Modeling: The Classic
          </h2>
          <p>
            Dimensional modeling, introduced by Ralph Kimball in the 1990s, remains the dominant pattern for analytical data warehouses. The core structure is the star schema: a central fact table surrounded by dimension tables.
          </p>
          <p>
            Fact tables contain the measurements you care about, things like revenue, page views, or order quantities, along with foreign keys to dimensions. Dimension tables contain the context: who, what, where, when. A simple example:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Fact table
CREATE TABLE fct_orders (
  order_id STRING,
  customer_id STRING,  -- FK to dim_customers
  product_id STRING,   -- FK to dim_products
  date_id STRING,      -- FK to dim_date
  revenue NUMERIC,
  quantity INTEGER,
  discount_amount NUMERIC
);

-- Dimension table
CREATE TABLE dim_customers (
  customer_id STRING,
  customer_name STRING,
  email STRING,
  segment STRING,
  country STRING,
  city STRING,
  acquisition_channel STRING
);`}
          </pre>
          <p>
            The star schema optimizes for analytical queries. Joins are simple (fact to dimension, never dimension to dimension in a star schema), query plans are predictable, and business users can navigate the model intuitively because it mirrors how they think about their business.
          </p>
          <p>
            The snowflake schema normalizes dimensions further, splitting them into sub-dimensions. A dim_customers table might reference a dim_segments table rather than storing segment names inline. This reduces storage and avoids update anomalies, but it adds join complexity and is generally the wrong tradeoff in a cloud data warehouse where storage is cheap and join performance is high.
          </p>
          <p>
            Dimensional modeling works well when: your queries are primarily analytical aggregations, your team includes analysts who will write SQL directly against the model, your fact grain is well-defined (one row per order, one row per event), and your dimensions are relatively stable.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Slowly Changing Dimensions
          </h2>
          <p>
            One of the most important concepts in dimensional modeling is the slowly changing dimension (SCD), which describes how to handle records in dimension tables that change over time.
          </p>
          <p>
            SCD Type 1 overwrites the old value. If a customer moves from New York to Chicago, you update the row. No history. This is appropriate when historical accuracy is not needed or when the change was an error.
          </p>
          <p>
            SCD Type 2 tracks history by creating a new row for each change, with effective date ranges and an active flag. The customer gets two rows: one for the New York period and one for the Chicago period.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`CREATE TABLE dim_customers (
  customer_sk INTEGER,        -- surrogate key
  customer_id STRING,         -- natural key
  customer_name STRING,
  city STRING,
  effective_from DATE,
  effective_to DATE,          -- NULL if current
  is_current BOOLEAN
);`}
          </pre>
          <p>
            SCD Type 2 is the most common approach for dimensions that matter historically. It is also the most complex to maintain. In dbt, the snapshots feature handles SCD Type 2 automatically using the check or timestamp strategy.
          </p>
          <p>
            SCD Type 3 adds a new column for the previous value. This trades flexibility for simplicity: you get one version of history, not full history. Use it when you only need to track a single previous state and do not need arbitrary point-in-time lookups.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            One Big Table: When Denormalization Wins
          </h2>
          <p>
            The one big table (OBT) pattern is exactly what it sounds like: a wide, heavily denormalized table that pre-joins everything into a single flat structure. Instead of a fact table referencing dimension tables, you materialize all the relevant context directly into the fact rows.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- OBT: everything in one row
SELECT
  o.order_id,
  o.revenue,
  o.order_date,
  c.customer_name,
  c.segment,
  c.country,
  p.product_name,
  p.category,
  p.brand
FROM fct_orders o
JOIN dim_customers c USING (customer_id)
JOIN dim_products p USING (product_id)`}
          </pre>
          <p>
            OBT works well for machine learning feature tables, where models need wide flat input rather than normalized references. It is also appropriate for BI tools that cannot easily perform multi-table joins, or for teams where the primary consumers are analysts who do not write SQL and rely on drag-and-drop dashboards.
          </p>
          <p>
            The downsides of OBT are real. Storage increases because dimension values are repeated across every row. Updates become expensive because changing a dimension value requires updating every row that references it, not just the dimension table. Query flexibility decreases because the table is pre-joined to specific dimensions, and ad-hoc questions that need different context require a different table or a rewrite.
          </p>
          <p>
            In practice, OBT and dimensional models coexist. The gold layer in a medallion architecture often contains both: star schema tables for exploratory analysis and OBT tables optimized for specific BI dashboards or ML pipelines.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Data Vault: For Auditability and Flexibility
          </h2>
          <p>
            Data vault is a modeling methodology designed for enterprise data warehouses where auditability, source tracking, and schema flexibility matter more than query performance. The three building blocks are hubs, links, and satellites.
          </p>
          <p>
            Hubs contain unique business keys with no other attributes. A hub_customer contains only customer IDs plus load metadata. Links represent relationships between hubs. A link_order_customer connects orders to customers. Satellites contain the descriptive attributes for hubs or links, with full history and load timestamps.
          </p>
          <p>
            Data vault is rarely the right choice for a startup or a team building their first data warehouse. It adds significant structural complexity in exchange for benefits that matter in regulated industries (finance, healthcare, government) where you need to prove exactly which source system provided which data at which point in time.
          </p>
          <p>
            If you are inheriting or working in a data vault environment, the key skill is understanding the business vault layer, which typically contains pre-joined business-friendly views built on top of the raw vault. Most analysts and data consumers never touch the raw vault directly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Entity-Centric Models
          </h2>
          <p>
            Entity-centric modeling organizes data around core business entities (customers, products, users, accounts) rather than around events or facts. Each entity gets a single table that aggregates everything known about it.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Entity-centric customer table
CREATE TABLE entity_customers AS
SELECT
  customer_id,
  -- Identity
  email,
  name,
  -- Acquisition
  first_order_date,
  acquisition_channel,
  -- Behavior (aggregated)
  total_orders,
  lifetime_revenue,
  avg_order_value,
  days_since_last_order,
  -- Segments
  rfm_segment,
  churn_risk_score,
  -- Meta
  last_updated_at
FROM (computed from various source tables);`}
          </pre>
          <p>
            Entity-centric models work exceptionally well for operational analytics use cases where the question is always &quot;what do we know about this entity right now.&quot; They are common in marketing analytics, customer success tooling, and product analytics. They are less useful for time-series analysis or when you need to examine the events that led to the current state.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The dbt Layer Architecture
          </h2>
          <p>
            In modern data stacks, modeling patterns are not mutually exclusive. They map to layers in the transformation pipeline:
          </p>
          <p>
            <strong>Staging layer</strong>: source-aligned models, one per source table, minimal transformation. Rename columns, cast types, standardize nulls. No joins across sources.
          </p>
          <p>
            <strong>Intermediate layer</strong>: business logic, joins within a domain. This is where SCD logic, sessionization, or complex event processing happens.
          </p>
          <p>
            <strong>Marts layer</strong>: consumer-ready. This is where you choose your modeling pattern based on the consumer. Star schema for general analytics, OBT for specific dashboards, entity tables for operational use cases.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`models/
  staging/
    stg_orders.sql
    stg_customers.sql
    stg_products.sql
  intermediate/
    int_orders_with_refunds.sql
    int_customer_sessions.sql
  marts/
    core/
      fct_orders.sql         # fact table
      dim_customers.sql      # SCD type 2
      dim_products.sql
    analytics/
      obt_orders_enriched.sql  # OBT for BI tool
    product/
      entity_customers.sql   # entity-centric`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Grain: The Most Important Decision You Make
          </h2>
          <p>
            Before choosing a modeling pattern, define your grain. The grain is the precise definition of what one row in your fact or entity table represents.
          </p>
          <p>
            Getting grain wrong is one of the most expensive modeling mistakes you can make. If you mix grains in a single table (some rows represent orders, some represent order line items), your aggregations will be wrong in ways that are hard to detect until a stakeholder finds a discrepancy that embarrasses everyone.
          </p>
          <p>
            Always write down the grain in your model description before writing any SQL. For a fact table: &quot;One row per order line item, defined as a unique combination of order_id and product_id.&quot; For an entity table: &quot;One row per customer, representing the current state as of the last refresh.&quot;
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            How to Choose
          </h2>
          <p>
            The practical decision matrix:
          </p>
          <p>
            Use dimensional modeling (star schema) when your primary consumers are analysts writing SQL, when you need point-in-time historical accuracy via SCD, and when the fact table grain is clean and well-defined.
          </p>
          <p>
            Use OBT when your consumers are BI tools with limited join capabilities, when you are building ML feature tables, or when a specific high-traffic dashboard would benefit from a pre-joined structure.
          </p>
          <p>
            Use data vault when you are in a regulated environment with strict audit requirements, when you have multiple source systems with conflicting natural keys, or when schema evolution is frequent and you cannot afford to break downstream consumers.
          </p>
          <p>
            Use entity-centric when your primary question is about current entity state, when the consumers are operational tools rather than analytical dashboards, or when you are building a customer 360 or product analytics foundation.
          </p>
          <p>
            In practice, most mature data platforms use all four. The staging and intermediate layers do the heavy lifting, and the marts layer serves different modeling patterns to different consumers. The skill is in knowing which pattern serves which consumer, and resisting the urge to pick one pattern and apply it universally.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Conversation You Need to Have First
          </h2>
          <p>
            Before you design a schema, answer these questions with your stakeholders: How will this data be queried? By whom? With what tool? How often does the data change? Do we need historical accuracy or just current state? What are the most common aggregate patterns? What does a &quot;wrong answer&quot; look like and how would we catch it?
          </p>
          <p>
            Modeling decisions made without answers to these questions tend to get revisited in six months when the business evolves and the schema no longer fits. The conversations are annoying to have upfront and far more expensive to skip.
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
