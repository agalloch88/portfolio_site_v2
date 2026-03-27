import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Data Lineage and Catalog Tools: The Practical Comparison for 2026 | Ryan Kirsch",
  description:
    "A practical comparison of data lineage and catalog tools in 2026: DataHub, OpenMetadata, Atlan, and dbt's built-in catalog. What each does well, where they struggle, and how to choose without overbuilding.",
  openGraph: {
    title:
      "Data Lineage and Catalog Tools: The Practical Comparison for 2026",
    description:
      "DataHub, OpenMetadata, Atlan, and dbt's built-in catalog compared. What each does well and how to choose without overbuilding.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-lineage-catalog-tools",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Lineage and Catalog Tools: The Practical Comparison for 2026",
    description:
      "DataHub, OpenMetadata, Atlan, and dbt's built-in catalog compared.",
  },
  alternates: { canonical: "/blog/data-lineage-catalog-tools" },
};

export default function DataLineageCatalogPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-lineage-catalog-tools"
  );
  const postTitle = encodeURIComponent(
    "Data Lineage and Catalog Tools: The Practical Comparison for 2026"
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
            Data Lineage and Catalog Tools: The Practical Comparison for 2026
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">8 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Every data team eventually wants a data catalog. The question is
            which one, and whether you actually need more than what dbt
            already provides. This is a practical comparison based on what
            these tools actually do well rather than what their marketing says.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What a Data Catalog Actually Does
            </h2>
            <p>
              A data catalog is a system that makes data assets discoverable,
              understandable, and trustworthy. The core capabilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Asset discovery</strong> -- search for tables, columns,
                dashboards, and pipelines across your organization
              </li>
              <li>
                <strong>Lineage</strong> -- trace where data came from and
                what depends on it
              </li>
              <li>
                <strong>Documentation</strong> -- descriptions, owners, SLAs,
                and business context for data assets
              </li>
              <li>
                <strong>Quality indicators</strong> -- freshness, test coverage,
                issue history
              </li>
              <li>
                <strong>Access management</strong> -- who can see what, and
                who to ask for access
              </li>
            </ul>
            <p>
              The important question before evaluating tools: which of these
              capabilities does your team actually need? A team of 5 data
              engineers with a well-maintained dbt project probably needs
              dbt docs. A team of 20 with multiple source systems, five
              different tools, and 200 active tables needs something more.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              dbt docs: The Catalog You Already Have
            </h2>
            <p>
              If your transformation layer is dbt, you have a functional
              data catalog already. <code>dbt docs generate</code> produces
              a static site with model descriptions, column documentation,
              test coverage, owners, and an interactive lineage graph.
            </p>
            <p>
              <strong>What dbt docs does well:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Lineage within the dbt project (complete and automatic)</li>
              <li>Column-level documentation when maintained</li>
              <li>Test coverage visibility per model</li>
              <li>Source system documentation</li>
              <li>Zero additional infrastructure</li>
            </ul>
            <p>
              <strong>Where dbt docs falls short:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>No lineage beyond dbt (dashboards, ML models, pipelines)</li>
              <li>No search across multiple dbt projects</li>
              <li>Static -- requires manual regeneration</li>
              <li>No usage analytics (who queries what)</li>
              <li>No access management integration</li>
            </ul>
            <p>
              For teams with a single dbt project and no requirement to trace
              lineage into BI tools or ML, start here. The overhead of a
              full catalog tool is not justified.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              DataHub: The Open-Source Enterprise Option
            </h2>
            <p>
              DataHub (from LinkedIn, open-source) is the most widely deployed
              open-source data catalog. It ingests metadata from dozens of
              sources (Snowflake, BigQuery, Airflow, dbt, Spark, Looker) and
              builds a unified lineage graph across all of them.
            </p>
            <p>
              <strong>What DataHub does well:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cross-system lineage (warehouse to BI to ML)</li>
              <li>Large ecosystem of ingestion connectors</li>
              <li>Active open-source community</li>
              <li>GraphQL API for programmatic access</li>
              <li>Supports fine-grained data classification</li>
            </ul>
            <p>
              <strong>Where DataHub struggles:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Significant operational overhead (Kafka, Elasticsearch, MySQL)</li>
              <li>Complex configuration for non-standard sources</li>
              <li>UI can feel heavy for smaller teams</li>
              <li>Managed cloud offering (Acryl) adds cost</li>
            </ul>
            <p>
              DataHub is the right choice when: you need cross-system lineage
              across many tools, you have engineering capacity to operate it,
              and you want to avoid vendor lock-in with a commercial catalog.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              OpenMetadata: The Alternative Open-Source Option
            </h2>
            <p>
              OpenMetadata is a newer open-source catalog with a simpler
              deployment model than DataHub (single service, no Kafka
              dependency) and a more polished UI.
            </p>
            <p>
              <strong>What OpenMetadata does well:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Easier deployment and lower operational overhead</li>
              <li>Strong data quality integration (tests, freshness)</li>
              <li>Good collaboration features (conversations, tasks)</li>
              <li>Built-in data classification and PII tagging</li>
            </ul>
            <p>
              <strong>Where OpenMetadata struggles:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Smaller ecosystem than DataHub</li>
              <li>Less mature for enterprise-scale deployments</li>
              <li>Cross-system lineage less comprehensive</li>
            </ul>
            <p>
              OpenMetadata is worth evaluating for teams that want open-source
              but found DataHub operationally overwhelming. The simpler
              deployment model makes it accessible for mid-size teams.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Atlan: The Commercial All-in-One
            </h2>
            <p>
              Atlan is a commercial catalog positioned as a collaborative
              workspace for data teams. It connects to warehouses, dbt, BI
              tools, and orchestration systems, and is designed for
              non-engineering personas (analysts, product managers) as much
              as data engineers.
            </p>
            <p>
              <strong>What Atlan does well:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fastest time-to-value -- managed, no infrastructure</li>
              <li>Strong usability for non-technical users</li>
              <li>Integrated Slack and Jira for data requests</li>
              <li>AI-assisted search and discovery</li>
              <li>Strong compliance and governance workflows</li>
            </ul>
            <p>
              <strong>Where Atlan struggles:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cost -- significantly more expensive than open-source</li>
              <li>Vendor lock-in on metadata</li>
              <li>Less customizable than open-source alternatives</li>
            </ul>
            <p>
              Atlan makes sense for teams where the catalog needs to serve
              a broad audience beyond data engineering, and where the
              organization is willing to pay for managed infrastructure and
              faster setup.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Decision Framework
            </h2>
            <p>
              The right choice depends on your current situation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Team under 10 engineers, single dbt project:</strong>{" "}
                Use dbt docs. Deploy it to a static host, maintain
                descriptions and owners in YAML. Free, zero ops overhead,
                covers the lineage within your transformation layer.
              </li>
              <li>
                <strong>Team of 10-30, multiple tools, engineering capacity
                to operate infrastructure:</strong>{" "}
                DataHub or OpenMetadata. OpenMetadata for simpler deployment,
                DataHub for larger ecosystem of connectors.
              </li>
              <li>
                <strong>Team of 30+, non-technical users need catalog access,
                budget for commercial tools:</strong>{" "}
                Atlan or Monte Carlo (if combining with observability).
                The operational savings and user adoption features justify
                the cost at this scale.
              </li>
              <li>
                <strong>GCP-native team:</strong>{" "}
                Dataplex is worth evaluating. It integrates with BigQuery,
                Dataflow, and Google Cloud Storage natively and is free
                for metadata management within GCP.
              </li>
            </ul>
            <p>
              The most common mistake is buying a catalog tool and then
              not maintaining it. A catalog that is not kept current is worse
              than no catalog -- it gives people false confidence in stale
              information. Whatever tool you choose, build catalog maintenance
              into your engineering workflow, not as a separate compliance task.
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
