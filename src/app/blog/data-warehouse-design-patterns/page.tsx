import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Warehouse Design Patterns: Star Schema, Snowflake, and When to Use Each | Ryan Kirsch - Data Engineer",
  description:
    "A practical guide to data warehouse design patterns: star schema vs snowflake schema, Kimball vs Inmon methodology, dimensional modeling fundamentals, and how to choose the right approach for your stack.",
  openGraph: {
    title:
      "Data Warehouse Design Patterns: Star Schema, Snowflake, and When to Use Each | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to data warehouse design patterns: star schema vs snowflake schema, Kimball vs Inmon methodology, dimensional modeling fundamentals, and how to choose the right approach for your stack.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-warehouse-design-patterns",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Data Warehouse Design Patterns: Star Schema, Snowflake, and When to Use Each | Ryan Kirsch - Data Engineer",
    description:
      "A practical guide to data warehouse design patterns: star schema vs snowflake schema, Kimball vs Inmon methodology, dimensional modeling fundamentals, and how to choose the right approach for your stack.",
  },
  alternates: { canonical: "/blog/data-warehouse-design-patterns" },
};

export default function DataWarehouseDesignPatternsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-warehouse-design-patterns"
  );
  const postTitle = encodeURIComponent(
    "Data Warehouse Design Patterns: Star Schema, Snowflake, and When to Use Each"
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
            {["Data Warehouse", "Dimensional Modeling", "Star Schema", "Kimball", "dbt", "SQL"].map(
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
            Data Warehouse Design Patterns: Star Schema, Snowflake Schema, and When to Use Each
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Data warehouse modeling decisions made early in a project tend to outlast the teams that
            made them. A schema designed for the wrong workload, or for a query engine that has since
            been replaced, creates friction that compounds over years. Understanding the tradeoffs
            between star schema and snowflake schema, and between Kimball and Inmon methodology,
            is not academic. It directly affects query performance, analyst productivity, and
            maintenance cost.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Foundation: Dimensional Modeling
          </h2>
          <p>
            Both star and snowflake schemas are implementations of dimensional modeling, popularized
            by Ralph Kimball. The core idea is straightforward: separate the measurable facts about
            your business (sales amounts, event counts, durations) from the descriptive context
            (who, what, when, where) that gives those facts meaning.
          </p>
          <p>
            Facts live in fact tables. Context lives in dimension tables. Queries join facts to
            dimensions to answer business questions. This structure is optimized for analytical
            read patterns and is deliberately different from the normalized schemas used in
            transactional databases.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Fact table: one row per order line
CREATE TABLE fct_order_lines (
    order_line_key    BIGINT PRIMARY KEY,
    order_date_key    INT REFERENCES dim_date(date_key),
    customer_key      INT REFERENCES dim_customer(customer_key),
    product_key       INT REFERENCES dim_product(product_key),
    store_key         INT REFERENCES dim_store(store_key),
    quantity          INT,
    unit_price        DECIMAL(10,2),
    total_amount      DECIMAL(12,2),
    discount_amount   DECIMAL(10,2)
);`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Star Schema: Denormalized for Speed
          </h2>
          <p>
            In a star schema, dimension tables are fully denormalized. All attributes of a customer
            live in a single <code>dim_customer</code> table. All attributes of a product live in
            a single <code>dim_product</code> table. The fact table joins directly to each dimension
            in a single hop. The resulting ERD looks like a star, with the fact table at the center.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Star schema: fully denormalized dimension
CREATE TABLE dim_customer (
    customer_key      INT PRIMARY KEY,
    customer_id       VARCHAR(50),
    full_name         VARCHAR(200),
    email             VARCHAR(200),
    city              VARCHAR(100),
    state             VARCHAR(50),
    country           VARCHAR(50),
    region            VARCHAR(50),  -- denormalized from geography hierarchy
    segment           VARCHAR(50),
    signup_date       DATE
);

-- Query needs only one join to get all customer context
SELECT
    c.region,
    c.segment,
    SUM(f.total_amount) AS revenue
FROM fct_order_lines f
JOIN dim_customer c ON f.customer_key = c.customer_key
JOIN dim_date d ON f.order_date_key = d.date_key
WHERE d.year = 2025
GROUP BY c.region, c.segment;`}
          </pre>
          <p>
            The advantage is query simplicity and performance. Analysts write fewer joins.
            The query optimizer has less work to do. On modern columnar warehouses like Snowflake
            and BigQuery, wide dimension tables with many attributes are fast to scan because
            the engine only reads the columns requested.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Snowflake Schema: Normalized Dimensions
          </h2>
          <p>
            A snowflake schema normalizes dimension tables into multiple related tables. Instead of
            all customer attributes in one table, you might have <code>dim_customer</code>,
            <code>dim_city</code>, <code>dim_state</code>, and <code>dim_country</code> with foreign
            key relationships between them. The geography hierarchy is stored once and shared across
            all dimensions that reference location.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Snowflake schema: normalized geography
CREATE TABLE dim_country (
    country_key   INT PRIMARY KEY,
    country_code  CHAR(2),
    country_name  VARCHAR(100),
    region        VARCHAR(50)
);

CREATE TABLE dim_state (
    state_key    INT PRIMARY KEY,
    state_code   CHAR(2),
    state_name   VARCHAR(100),
    country_key  INT REFERENCES dim_country(country_key)
);

CREATE TABLE dim_customer (
    customer_key  INT PRIMARY KEY,
    customer_id   VARCHAR(50),
    full_name     VARCHAR(200),
    city_key      INT REFERENCES dim_city(city_key)
    -- geography accessed via joins
);

-- Query now requires multiple joins
SELECT
    co.region,
    SUM(f.total_amount) AS revenue
FROM fct_order_lines f
JOIN dim_customer cu ON f.customer_key = cu.customer_key
JOIN dim_city ci ON cu.city_key = ci.city_key
JOIN dim_state st ON ci.state_key = st.state_key
JOIN dim_country co ON st.country_key = co.country_key
GROUP BY co.region;`}
          </pre>
          <p>
            The tradeoff is storage efficiency and consistency at the cost of query complexity.
            Updating a country name in a snowflake schema is a single-row change. In a star schema,
            the same change might touch millions of rows in a denormalized dimension. Snowflake
            schemas also reduce dimension table sizes, which mattered more when storage was expensive.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Kimball vs. Inmon: The Methodology Debate
          </h2>
          <p>
            Ralph Kimball and Bill Inmon represent two schools of thought on warehouse architecture,
            not just schema design.
          </p>
          <p>
            The Kimball approach is bottom-up: build subject-area data marts that business teams
            can use immediately, then integrate them over time using conformed dimensions.
            Conformed dimensions are shared across fact tables, so a <code>dim_date</code> used
            in the sales mart is the same table used in the support mart. This creates a
            &quot;Bus Architecture&quot; where marts join on shared keys.
          </p>
          <p>
            The Inmon approach is top-down: build a normalized enterprise data warehouse (EDW) first,
            then build downstream data marts as denormalized views for specific audiences. The EDW
            is the single source of truth. Data marts are derived from it. This approach produces
            more consistent data but requires more upfront investment before any business team
            sees value.
          </p>
          <p>
            In practice, most modern data teams land closer to Kimball: dimensional fact tables,
            conformed dimensions, and incremental mart development. The Inmon EDW layer is
            sometimes approximated by a staging or raw layer in dbt, with marts built on top.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Slowly Changing Dimensions: Types 1, 2, and 3
          </h2>
          <p>
            Dimension attributes change over time. A customer moves cities. A product changes
            categories. How you handle those changes determines whether historical analysis is
            accurate or misleading.
          </p>
          <p>
            Type 1 overwrites the old value. No history is preserved. Use this for corrections,
            not for tracking change. Type 2 inserts a new row with a new surrogate key and
            effective/expiry dates. Historical fact rows retain their old dimension key, preserving
            the state at the time of the transaction. Type 3 adds a &quot;previous value&quot;
            column alongside the current value. Use this only for single-step changes where both
            old and new values matter simultaneously.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`-- Type 2 SCD: track customer segment changes over time
CREATE TABLE dim_customer (
    customer_key        INT PRIMARY KEY,       -- surrogate key
    customer_id         VARCHAR(50),           -- natural key
    full_name           VARCHAR(200),
    segment             VARCHAR(50),
    effective_date      DATE NOT NULL,
    expiry_date         DATE,                  -- NULL = current record
    is_current          BOOLEAN DEFAULT TRUE
);

-- In dbt: use the built-in snapshot feature
-- snapshots/customer_snapshot.sql
{% snapshot customer_snapshot %}
{{
    config(
        target_schema='snapshots',
        unique_key='customer_id',
        strategy='check',
        check_cols=['segment', 'city', 'tier']
    )
}}
SELECT * FROM {{ source('crm', 'customers') }}
{% endsnapshot %}`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            When to Use Star vs. Snowflake in Practice
          </h2>
          <p>
            For most modern cloud warehouse deployments, choose the star schema. Columnar storage
            engines like Snowflake, BigQuery, and Redshift are optimized for wide table scans.
            Storage cost is low. Query simplicity matters more to analyst teams than storage
            efficiency. Denormalization is not a liability when updates to dimension values are
            handled through proper SCD patterns rather than in-place updates.
          </p>
          <p>
            Choose a snowflake schema when dimension hierarchies are large, deeply nested, and
            shared across many dimensions. A geography hierarchy used by customer, store, supplier,
            and employee dimensions is a legitimate candidate for normalization. It reduces
            duplication without meaningfully harming query performance on a modern engine,
            provided the join keys are indexed or the tables are small enough to broadcast.
          </p>
          <p>
            The hybrid approach is common and reasonable: star schema for most dimensions, with
            normalized sub-tables for specific shared hierarchies. This is the pattern most dbt
            codebases converge on naturally.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The One Thing That Matters Most
          </h2>
          <p>
            Schema design decisions are hard to reverse once fact tables are loaded and analytics
            are built on top. The most important investment is conformed dimensions. Define
            <code>dim_date</code>, <code>dim_customer</code>, and <code>dim_product</code> once,
            share them across all subject areas, and enforce consistency at the transformation layer.
            The schema pattern (star or snowflake) matters less than whether your dimensions are
            consistent, well-documented, and actually reused rather than duplicated with subtle
            differences in every mart.
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
