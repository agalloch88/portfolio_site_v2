import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Building a Data Platform from Scratch: Decisions, Trade-offs, and the Order That Matters | Ryan Kirsch",
  description:
    "A practical guide to building a modern data platform from zero. The decision sequence that matters -- storage, ingestion, transformation, orchestration, serving -- and the trade-offs at each layer that will define the platform for years.",
  openGraph: {
    title:
      "Building a Data Platform from Scratch: Decisions, Trade-offs, and the Order That Matters",
    description:
      "The decision sequence for building a modern data platform -- storage, ingestion, transformation, orchestration, serving -- and the trade-offs at each layer that will shape the platform for years.",
    type: "article",
    url: "https://ryankirsch.dev/blog/building-data-platform-from-scratch",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Building a Data Platform from Scratch: Decisions, Trade-offs, and the Order That Matters",
    description:
      "The decision sequence for building a modern data platform -- storage, ingestion, transformation, orchestration, serving -- and the trade-offs at each layer.",
  },
  alternates: { canonical: "/blog/building-data-platform-from-scratch" },
};

export default function BuildingDataPlatformPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/building-data-platform-from-scratch"
  );
  const postTitle = encodeURIComponent(
    "Building a Data Platform from Scratch: Decisions, Trade-offs, and the Order That Matters"
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
            Building a Data Platform from Scratch: Decisions, Trade-offs, and
            the Order That Matters
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">11 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            The most expensive decisions in data engineering are the ones made
            in the first 90 days. Storage architecture, ingestion patterns,
            and transformation conventions compound forward -- they are very
            hard to change once pipelines and analysts depend on them. This
            guide walks through the decision sequence in the order it actually
            matters.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Start With the Questions, Not the Stack
            </h2>
            <p>
              The most common mistake when building a data platform is
              starting with a technology preference rather than the business
              requirements. &ldquo;We should use Databricks&rdquo; or &ldquo;Let&apos;s go
              Snowflake&rdquo; before anyone has asked what latency the business
              needs, how much data will land per day, or who the primary
              consumers will be.
            </p>
            <p>
              The questions that should precede every architecture decision:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Who are the consumers?</strong> Analysts writing SQL,
                data scientists training models, engineers reverse-ETLing into
                operational systems, and BI tools all have different
                requirements from the same underlying data.
              </li>
              <li>
                <strong>What is the acceptable latency?</strong> Hours, minutes,
                or seconds? The answer determines whether batch, microbatch,
                or streaming is appropriate -- and that choice cascades into
                every other decision.
              </li>
              <li>
                <strong>What is the data volume and growth rate?</strong>
                A platform handling 10GB/day is architected differently from
                one handling 10TB/day, even if both start with the same tool
                choices.
              </li>
              <li>
                <strong>What is the team&apos;s existing expertise?</strong>
                The best architecture on paper is worth nothing if no one
                on the team can operate it. Build for the team you have,
                not the team you imagine hiring.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Layer 1: Storage -- The Foundation You Cannot Easily Change
            </h2>
            <p>
              The storage decision is the most consequential and the one
              most teams make without enough deliberation. The main
              options in 2026:
            </p>
            <p>
              <strong>Cloud data warehouse (Snowflake, BigQuery, Redshift):</strong>{" "}
              Managed storage with strong SQL support, automatic optimization,
              and tight ecosystem integration. The right choice for most teams
              under 50 engineers whose primary consumers are analysts. Higher
              per-query cost at extreme scale, but zero infrastructure
              management.
            </p>
            <p>
              <strong>Data lakehouse (S3/GCS + Delta Lake or Iceberg):</strong>{" "}
              Object storage with ACID transactions and open table formats.
              More infrastructure to manage, but lower storage costs at scale
              and better support for ML workloads and multi-engine access.
              Right for teams with Spark or Flink workloads alongside SQL
              analytics.
            </p>
            <p>
              <strong>Hybrid:</strong> Land raw data in object storage (cheap,
              durable, format-agnostic) and copy curated tables to a warehouse
              for analytics. This pattern separates long-term archival from
              analytical performance, which is often the right trade-off for
              large organizations.
            </p>
            <p>
              For most greenfield platforms in 2026: start with Snowflake or
              BigQuery. The operational overhead saved is worth more than the
              cost premium for teams under 20 engineers. Migrate to a
              lakehouse if and when volume economics demand it, not before.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Layer 2: Ingestion -- The Multiplier on Everything Downstream
            </h2>
            <p>
              Ingestion quality directly determines transformation complexity.
              Data that arrives clean, complete, and on schedule makes every
              downstream model simpler. Data that arrives late, duplicated,
              or with schema drift forces defensive logic into every
              transformation.
            </p>
            <p>
              The ingestion decision matrix:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`Source Type          | Recommended Tool
---------------------|----------------------------
SaaS APIs (Salesforce| Fivetran or Airbyte
  HubSpot, Stripe)   | (managed connectors)
---------------------|----------------------------
Operational databases| Debezium (CDC via Kafka)
  (Postgres, MySQL)  | or Airbyte CDC connectors
---------------------|----------------------------
Custom REST APIs     | Python scripts in Dagster
                     | assets
---------------------|----------------------------
Event streams        | Kafka / Redpanda
  (clickstream, IoT) | with Kafka Connect
---------------------|----------------------------
Files (CSV, Parquet, | COPY INTO (Snowflake)
  JSON from S3/GCS)  | or dbt seeds for small
---------------------|----------------------------`}</code>
            </pre>
            <p>
              The schema-on-write vs schema-on-read decision: raw data should
              be stored as-received (schema-on-read) so you can replay it if
              your parsing logic changes. Apply types and constraints at the
              silver layer, not at ingestion. This is the bronze-silver-gold
              pattern in practice.
            </p>
            <p>
              The most underestimated ingestion problem is late-arriving data.
              Source systems deliver events out of order. A webhook that fires
              at 11:58 PM for a transaction that occurred at 11:45 PM lands
              in the wrong daily batch. Plan your incremental load windows to
              accommodate late arrival from day one -- it is much harder to
              retrofit.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Layer 3: Transformation -- Where the Platform&apos;s Value Lives
            </h2>
            <p>
              Transformation is where raw data becomes business value.
              The decision is almost always dbt for SQL-based transformations
              in 2026, with PySpark or pandas for complex Python transformations
              that require procedural logic or ML feature engineering.
            </p>
            <p>
              The conventions that matter most in the first 90 days:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Naming conventions.</strong> Define <code>stg_</code>,
                <code>int_</code>, <code>fct_</code>, <code>dim_</code> prefixes
                before the first model is written. Retrofitting naming
                conventions onto a large project is painful.
              </li>
              <li>
                <strong>Grain documentation.</strong> Every fact table should
                have a documented grain (one row per what?). Undocumented grain
                is the source of most downstream confusion and incorrect joins.
              </li>
              <li>
                <strong>Test coverage policy.</strong> Decide what minimum
                tests are required for every model (not_null on all keys,
                unique on surrogate keys) before the codebase grows past
                the point where enforcement is practical.
              </li>
              <li>
                <strong>PR review process.</strong> Treat dbt models as code
                with real code review. Schema changes to widely-used models
                should require explicit sign-off from downstream consumers.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Layer 4: Orchestration -- The Nervous System
            </h2>
            <p>
              Orchestration ties all the layers together. The choice in 2026
              is primarily between Airflow (task-based, battle-tested, large
              ecosystem) and Dagster (asset-based, modern observability,
              better developer experience).
            </p>
            <p>
              The practical decision criteria:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If the team already knows Airflow and the primary use case is
                simple ETL scheduling, stay with Airflow. The switching cost
                is high and the operational benefit of Dagster is most visible
                at larger scale.
              </li>
              <li>
                If starting fresh and the team values observability, lineage,
                and the asset model, Dagster is the better long-term choice.
                The learning curve is real but the developer experience pays
                dividends.
              </li>
              <li>
                For dbt-primary teams, both integrate well. Dagster&apos;s
                native dbt integration (auto-generating assets from manifest)
                is a notable advantage for teams that want unified lineage.
              </li>
            </ul>
            <p>
              Regardless of tool choice: design for idempotency from day one.
              Every pipeline run should be safe to re-run. This means no
              append-only loads without deduplication, no non-idempotent
              operations in the critical path, and explicit handling of
              partial failures.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Layer 5: Serving -- Matching Data to Consumer Needs
            </h2>
            <p>
              The serving layer is often treated as an afterthought, but it
              determines whether the platform delivers business value or
              becomes a beautiful internal engineering project that no one
              uses.
            </p>
            <p>
              The main serving patterns and their right use cases:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>BI tools (Looker, Metabase, Tableau):</strong> Best
                for structured reporting, dashboards, and self-serve SQL for
                analysts. Connect directly to gold mart tables. Define a
                semantic layer to prevent metric inconsistency across reports.
              </li>
              <li>
                <strong>Reverse ETL (Census, Hightouch):</strong> Sync curated
                data from the warehouse back into operational systems
                (Salesforce, HubSpot, Zendesk). Closes the loop between
                analytics and action.
              </li>
              <li>
                <strong>ML feature store:</strong> If the platform serves ML
                use cases, a dedicated feature store (Feast, Tecton, or
                Databricks Feature Store) prevents duplicate feature engineering
                and ensures training-serving consistency.
              </li>
              <li>
                <strong>Data API:</strong> For product teams that need to
                embed analytics into user-facing features, a thin REST API
                over warehouse queries (or Materialize for real-time) is
                more appropriate than giving product engineers direct
                warehouse access.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The 90-Day Build Sequence
            </h2>
            <p>
              Given the above, here is the pragmatic build sequence that
              ships value quickly without creating technical debt:
            </p>
            <p>
              <strong>Days 1-14: Foundation.</strong> Choose and provision
              the warehouse. Set up source connections for the 3-5 most
              important source systems. Establish naming conventions and
              project structure in dbt. Get a basic staging layer running.
            </p>
            <p>
              <strong>Days 15-30: First value.</strong> Build silver models
              for the top 2-3 business entities (customers, orders, events).
              Connect a BI tool to the warehouse. Ship one dashboard that
              replaces an existing spreadsheet-based report.
            </p>
            <p>
              <strong>Days 31-60: Reliability.</strong> Add tests to all
              staging and silver models. Set up orchestration with scheduled
              runs and alerting. Add data freshness monitoring. Document
              the grain and ownership of every production model.
            </p>
            <p>
              <strong>Days 61-90: Scale.</strong> Add remaining source
              systems. Build gold mart tables for primary business domains.
              Establish data contracts for models that other teams depend on.
              Introduce lineage tracking and incident response runbooks.
            </p>
            <p>
              The sequence prioritizes delivering one working end-to-end slice
              (source to dashboard) before building out breadth. A platform
              with one fully reliable data product is more valuable than a
              platform with ten half-built pipelines.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Decisions That Are Hardest to Change
            </h2>
            <p>
              Build these right the first time, because retrofitting them is
              expensive:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Primary key strategy.</strong> Surrogate keys vs.
                natural keys vs. composite keys. Decide early and enforce
                consistently. Mixed key strategies across a warehouse are
                a maintenance problem that compounds with every new join.
              </li>
              <li>
                <strong>Date/time convention.</strong> UTC everywhere in
                storage, convert at the serving layer. Teams that mix
                timezones in the warehouse create subtle, hard-to-debug
                aggregation errors that show up in production at the worst
                moments.
              </li>
              <li>
                <strong>Null semantics.</strong> What does a null mean in
                your platform -- unknown, not applicable, or missing? Define
                this explicitly and encode it in your staging transforms.
                Ambiguous nulls become incorrect aggregations downstream.
              </li>
              <li>
                <strong>Access control model.</strong> Row-level security,
                column masking, and schema-level permissions are much easier
                to design in from the start than to add later. For platforms
                handling sensitive data, build the access model before
                the first external consumer gets credentials.
              </li>
            </ul>
            <p>
              Every platform has a moment where the team wishes they had made
              different foundational decisions. The teams that end up with
              maintainable platforms are the ones who spent the extra days
              in weeks 1-4 getting these foundations right, rather than
              racing to ship the first dashboard.
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
