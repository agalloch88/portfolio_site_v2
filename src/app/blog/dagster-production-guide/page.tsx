import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Dagster in Production: Assets, Partitions, and Why Modern Data Teams Are Moving Beyond Airflow | Ryan Kirsch - Data Engineer",
  description:
    "Dagster's Software-Defined Assets changed how data engineers think about pipelines. Learn the core concepts, production patterns, and when to choose Dagster over Airflow in 2026.",
  openGraph: {
    title:
      "Dagster in Production: Assets, Partitions, and Why Modern Data Teams Are Moving Beyond Airflow | Ryan Kirsch - Data Engineer",
    description:
      "Dagster's Software-Defined Assets changed how data engineers think about pipelines. Learn the core concepts, production patterns, and when to choose Dagster over Airflow in 2026.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dagster-production-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dagster in Production: Assets, Partitions, and Why Modern Data Teams Are Moving Beyond Airflow | Ryan Kirsch - Data Engineer",
    description:
      "Dagster's Software-Defined Assets changed how data engineers think about pipelines. Learn the core concepts, production patterns, and when to choose Dagster over Airflow in 2026.",
  },
  alternates: { canonical: "/blog/dagster-production-guide" },
};

export default function DagsterProductionGuidePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dagster-production-guide"
  );
  const postTitle = encodeURIComponent(
    "Dagster in Production: Assets, Partitions, and Why Modern Data Teams Are Moving Beyond Airflow"
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
            {["Dagster", "Data Pipelines", "Orchestration", "dbt", "Software-Defined Assets"].map(
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
            Dagster in Production: Assets, Partitions, and Why Modern Data Teams
            Are Moving Beyond Airflow
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            November 3, 2025 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Every data platform needs an orchestrator, and for years Airflow was
            the only serious option. It defined the category. But Airflow was
            designed around a simple idea: define tasks, wire them into a DAG,
            and schedule the DAG. That model works until it does not. At scale,
            task-centric orchestration creates blind spots. You know what ran
            and when, but you do not always know what data you have, whether it
            is fresh, or how it connects to the rest of your platform.
          </p>
          <p>
            Dagster takes a different approach. Instead of defining tasks, you
            define the data assets your platform produces. The orchestrator then
            figures out what to run, when to run it, and whether the result is
            correct. This shift from &ldquo;what do I run&rdquo; to &ldquo;what
            do I have&rdquo; changes how teams build, test, and trust their data
            infrastructure.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Problem with Task-Centric Orchestration
          </h2>
          <p>
            Airflow models pipelines as directed acyclic graphs of tasks. Each
            task is a unit of work: run a query, call an API, move a file.
            Dependencies connect tasks so they execute in order. This is
            intuitive and flexible, but it has real limitations at scale.
          </p>
          <p>
            Testing is difficult because tasks are side effects. You cannot
            easily run a task in isolation without setting up the entire
            execution context. Backfills require re-running entire DAGs or
            writing custom logic to target specific date ranges. There is no
            native concept of data lineage, so understanding what a downstream
            dashboard actually depends on means reading code or maintaining
            external documentation.
          </p>
          <p>
            The deeper problem is that the DAG describes work, not data. When
            something breaks, you know which task failed. But answering &ldquo;is
            the revenue table fresh?&rdquo; or &ldquo;what would happen if I
            changed this source schema?&rdquo; requires stitching together
            information from multiple systems. Dagster was built to solve
            exactly this gap.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Enter Software-Defined Assets
          </h2>
          <p>
            The core concept in Dagster is the Software-Defined Asset (SDA). An
            asset is a persistent object in your data platform: a table, a file,
            a model, a metric. Instead of writing a task that produces data as a
            side effect, you declare the asset itself and define how to compute
            it.
          </p>
          <p>
            This is a fundamental shift. When you define an asset, Dagster knows
            what your platform produces, what each asset depends on, and when
            each asset was last computed. The asset graph replaces the task DAG
            as the primary abstraction, and it maps directly to the artifacts
            your stakeholders actually care about.
          </p>
          <p>Here is a simple asset definition:</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from dagster import asset

@asset
def daily_revenue(orders: pd.DataFrame) -> pd.DataFrame:
    """Compute daily revenue from the orders table.
    Groups by date and sums the order totals.
    """
    return (
        orders
        .groupby(orders["order_date"].dt.date)
        .agg(revenue=("order_total", "sum"))
        .reset_index()
    )`}
          </pre>
          <p>
            The @asset decorator tells Dagster this function produces a named
            data asset. The parameter &ldquo;orders&rdquo; declares a dependency
            on another asset. Dagster builds the dependency graph automatically,
            tracks materializations, and gives you a full picture of what data
            exists and when it was computed.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Partitions: Incremental Processing Done Right
          </h2>
          <p>
            Anyone who has wrestled with Airflow&apos;s execution_date knows the
            pain. Airflow ties execution to schedule intervals, and reasoning
            about which data a run processes requires understanding a model that
            confuses even experienced engineers.
          </p>
          <p>
            Dagster&apos;s partition system is explicit. You define partition
            keys (daily, monthly, or custom ranges), and each partition
            represents a slice of data that can be materialized independently.
            Backfills are a first-class operation: select a range of partitions
            in the UI, click run, and Dagster handles the rest.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from dagster import asset, DailyPartitionsDefinition

daily_partitions = DailyPartitionsDefinition(start_date="2024-01-01")

@asset(partitions_def=daily_partitions)
def daily_orders(context) -> pd.DataFrame:
    """Load orders for a single day partition."""
    partition_date = context.partition_key
    return load_orders_for_date(partition_date)`}
          </pre>
          <p>
            This makes incremental processing predictable. Each partition has
            its own materialization status, so you always know which slices are
            fresh and which need recomputation. No more guessing whether
            yesterday&apos;s backfill actually caught everything.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Asset Checks and Data Quality
          </h2>
          <p>
            Dagster builds data quality into the orchestration layer. Asset
            checks are assertions attached directly to assets. They run after
            materialization and validate that the data meets expectations: row
            counts, null percentages, value ranges, freshness thresholds.
          </p>
          <p>
            This is cleaner than running Great Expectations as a separate
            pipeline step. The checks live alongside the asset definition, they
            appear in the Dagster UI with pass or fail status, and failures can
            trigger alerts or block downstream materializations. Freshness
            checks are particularly useful. You can define how stale an asset is
            allowed to be, and Dagster will flag assets that have not been
            refreshed within the window.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Dagster + dbt: The Perfect Pairing
          </h2>
          <p>
            The dagster-dbt integration is one of the strongest arguments for
            adopting Dagster. Every dbt model becomes a Dagster asset
            automatically. You get a unified lineage graph that spans Python
            assets, dbt SQL models, and external sources, all in one place.
          </p>
          <p>
            This means your analytics engineering team gets full visibility into
            the upstream dependencies of their dbt models. When a Python
            ingestion asset fails, the dbt models that depend on it show as
            stale in the Dagster UI. Cross-language lineage is rare in the data
            tooling ecosystem, and it solves a real coordination problem between
            data engineers and analytics engineers.
          </p>
          <p>
            The integration also brings Dagster&apos;s partition system to dbt.
            You can partition dbt models by date, run incremental
            materializations through Dagster&apos;s scheduler, and backfill dbt
            models using the same UI you use for Python assets. For teams
            running dbt in production, this combination is quickly becoming the
            gold standard.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Dagster vs Airflow: When to Choose Each
          </h2>
          <p>
            Choose Dagster for greenfield projects where you can build around
            asset-centric thinking from day one. It excels on teams that are
            dbt-heavy, need built-in lineage and observability, or want a modern
            developer experience with type checking and testability.
          </p>
          <p>
            Choose Airflow when you have a large existing investment in Airflow
            DAGs that work and do not need refactoring. Airflow&apos;s plugin
            ecosystem is massive, and for ML pipeline workflows, tools like
            Airflow + MLflow have mature integrations. If your team already
            knows Airflow well and your orchestration needs are straightforward,
            switching has a real cost.
          </p>
          <p>
            The honest answer: most teams starting fresh in 2026 should evaluate
            Dagster first. The asset model is a better abstraction for data
            platforms, and the developer experience is significantly ahead.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Branch Deployments and Staging Environments
          </h2>
          <p>
            Dagster Cloud offers branch deployments, which give you isolated
            staging environments for every pull request. When you open a PR that
            changes an asset definition, Dagster spins up a deployment with your
            changes so you can test materializations before merging to
            production.
          </p>
          <p>
            This matters because data pipeline changes are notoriously hard to
            test. You cannot easily spin up a staging Airflow with realistic
            data. Branch deployments solve this by letting you validate pipeline
            logic, check asset dependencies, and catch breaking changes before
            they hit production. For teams that care about data quality, this
            feature alone can justify the migration.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">Closing</h2>
          <p>
            Dagster is not just another orchestrator. It represents a genuine
            shift in how data teams think about pipelines, from sequences of
            tasks to graphs of data assets. The combination of Software-Defined
            Assets, native partitioning, built-in data quality, and first-class
            dbt integration makes it the most compelling orchestration platform
            for data engineering teams in 2026.
          </p>
          <p>
            If you are building or evaluating your data platform&apos;s
            orchestration layer, invest the time to learn Dagster deeply. The
            asset model will change how you think about your entire stack. Check
            out my data pipeline project on GitHub for a working example of
            Dagster, dbt, and DuckDB running together.
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
