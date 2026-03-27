import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026",
  description:
    "A hands-on, production-focused guide to Apache Iceberg for data engineers who run large analytic datasets.",
  openGraph: {
    title: "Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026",
    description:
      "A hands-on, production-focused guide to Apache Iceberg for data engineers who run large analytic datasets.",
    type: "article",
    url: "https://ryankirsch.dev/blog/apache-iceberg-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026",
    description:
      "A hands-on, production-focused guide to Apache Iceberg for data engineers who run large analytic datasets.",
  },
  alternates: { canonical: "/blog/apache-iceberg-data-engineers" },
};

export default function ApacheIcebergDataEngineersPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/apache-iceberg-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026"
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
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">Blog</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 · <span className="text-cyberTeal">12 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            I build systems that have to survive years of schema changes, engine swaps,
            and backfills that touch petabytes. Apache Iceberg is the table format that
            made those systems feel stable. This guide is the hands on version of how I
            use Iceberg in production, with code, migration patterns, and the tradeoffs
            that actually matter when you are on call.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What Apache Iceberg Is and Why It Matters</h2>
            <p className="leading-relaxed">
              Apache Iceberg is an open table format designed for massive analytic
              datasets. It sits between your compute engines and your object storage
              and gives you ACID transactions, versioned metadata, and a consistent
              table contract across Spark, Flink, Trino, and more. I treat it like a
              database layer for the data lake. It keeps raw files simple while making
              table operations safe, repeatable, and auditable.
            </p>
            <p className="leading-relaxed">
              The reason it matters is operational. Without a table format, Parquet on
              object storage is just files with no shared transaction log. Iceberg
              adds that log and enforces snapshots, so readers get a consistent view
              even when multiple writers are active. That changes how confidently you
              can iterate on models, add partitions, or run backfills.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Core Problems Iceberg Solves</h2>
            <p className="leading-relaxed">
              I use Iceberg for four reasons that show up daily in production.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                ACID transactions on the data lake. Writers commit atomically, and
                readers see consistent snapshots instead of partial updates.
              </li>
              <li>
                Schema evolution without downtime. You can add, rename, or reorder
                columns and keep historical snapshots readable.
              </li>
              <li>
                Time travel for debugging and audits. Snapshots let you query what a
                report used at a specific timestamp or snapshot ID.
              </li>
              <li>
                Partition evolution without rewriting data. You can change partitioning
                strategy over time and keep old files valid.
              </li>
            </ul>
            <p className="leading-relaxed">
              These are not abstract features. They are the difference between a calm
              on call rotation and a midnight fire drill when a backfill lands.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Iceberg vs Delta Lake vs Hudi</h2>
            <p className="leading-relaxed">
              All three formats solve similar problems, but the tradeoffs are real. I
              use this comparison when I am helping teams pick a standard.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Iceberg</th>
                  <th>Delta Lake</th>
                  <th>Hudi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Governance model</td>
                  <td>Open, vendor neutral</td>
                  <td>Open core with strong Databricks gravity</td>
                  <td>Open, driven by streaming use cases</td>
                </tr>
                <tr>
                  <td>Engine support</td>
                  <td>Broad across Spark, Flink, Trino, Athena</td>
                  <td>Best in Spark and Databricks</td>
                  <td>Strong in Spark, improving elsewhere</td>
                </tr>
                <tr>
                  <td>Schema evolution</td>
                  <td>Full evolution with rename and type changes</td>
                  <td>Good, especially in Spark</td>
                  <td>Available, but less consistent across engines</td>
                </tr>
                <tr>
                  <td>Time travel</td>
                  <td>Snapshot based</td>
                  <td>Version based</td>
                  <td>Commit based</td>
                </tr>
                <tr>
                  <td>Community momentum</td>
                  <td>Strong, cross vendor and foundation led</td>
                  <td>Strong, centered on Databricks ecosystem</td>
                  <td>Strong, led by streaming and CDC teams</td>
                </tr>
              </tbody>
            </table>
            <p className="leading-relaxed">
              If you are deep in Databricks, Delta Lake is the smoothest operational
              choice. If your system revolves around streaming upserts, Hudi has
              advantages. If you want an open format with broad engine support and
              clean separation between compute and storage, Iceberg is the default I
              reach for.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Hands On With PySpark</h2>
            <p className="leading-relaxed">
              These are the exact patterns I use for day to day Iceberg work. The
              examples assume Spark configured with an Iceberg catalog.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="language-python">{`# Create a database and an Iceberg table
spark.sql("CREATE DATABASE IF NOT EXISTS lakehouse")

spark.sql("""
CREATE TABLE IF NOT EXISTS lakehouse.events (
  event_id STRING,
  user_id STRING,
  event_name STRING,
  event_ts TIMESTAMP,
  ingest_date DATE
)
USING iceberg
PARTITIONED BY (days(ingest_date))
""")`}</code>
            </pre>
            <p className="leading-relaxed">
              Schema evolution is one of the reasons I move off raw Parquet. Add a new
              column without breaking old readers.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="language-python">{`# Add a column and backfill it later
spark.sql("ALTER TABLE lakehouse.events ADD COLUMN source STRING")

# Rename a column safely
spark.sql("ALTER TABLE lakehouse.events RENAME COLUMN event_name TO event_type")`}</code>
            </pre>
            <p className="leading-relaxed">
              Time travel is how I debug reports. I query the snapshot that existed
              when a dashboard ran and compare it to the current view.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="language-sql">{`-- Query a snapshot by timestamp
SELECT *
FROM lakehouse.events
FOR SYSTEM_TIME AS OF TIMESTAMP '2026-03-10 08:00:00';

-- Query by snapshot ID
SELECT *
FROM lakehouse.events
FOR SYSTEM_VERSION AS OF 952310148750533;`}</code>
            </pre>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Integration Patterns That Work</h2>
            <p className="leading-relaxed">
              I keep the table format consistent and let each engine do what it is
              best at. These are the patterns I see succeed.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                dbt for transformations. Use a Spark, Trino, or Athena adapter that
                writes Iceberg tables directly and keep models versioned in git.
              </li>
              <li>
                Spark for batch ingestion and heavy transforms. It is still the most
                flexible engine for large rewrite jobs and compaction.
              </li>
              <li>
                Flink for streaming upserts and near real time pipelines. Iceberg
                handles the snapshot commits while Flink manages the state.
              </li>
              <li>
                Trino for interactive analytics and federated queries. It lets you
                join Iceberg with other sources without copying data.
              </li>
            </ul>
            <p className="leading-relaxed">
              The key is to standardize on one catalog, then enforce a single table
              contract across engines. That keeps lineage clean and avoids data drift.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Real World Migration From Parquet</h2>
            <p className="leading-relaxed">
              I recently migrated a multi petabyte Parquet lake to Iceberg. The core
              idea was to avoid a single big bang. We introduced an Iceberg catalog,
              then converted the highest value tables first. New writes went to
              Iceberg, and we used copy on write to materialize the same data while
              keeping legacy jobs alive.
            </p>
            <p className="leading-relaxed">
              The migration workflow was consistent. Create the Iceberg table with the
              current schema, backfill partitions in parallel, then flip readers to
              the new table snapshot by snapshot. We validated row counts and sample
              hashes during the cutover. The biggest win was removing the custom
              manifest code we had built to track files. Iceberg replaced that logic
              with a metadata layer that every engine could read.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Decision Framework: Iceberg vs Delta Lake</h2>
            <p className="leading-relaxed">
              I use a simple framework when teams ask which format to standardize on.
              If you are already all in on Databricks and Spark, Delta Lake is often
              the fastest path to stability. If you need open governance, a portable
              catalog, and multiple engines, Iceberg is the safer long term bet.
            </p>
            <p className="leading-relaxed">
              The tipping points are practical. Choose Iceberg when you plan to use
              Trino or Flink at scale, when you need time travel across engines, or
              when you want to avoid vendor lock in. Choose Delta Lake when the team
              is Spark first, the platform is Databricks centered, and you want the
              smoothest managed experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Production Tips I Actually Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Enforce a single catalog. Multiple catalogs for the same table format
                create drift and break lineage.
              </li>
              <li>
                Schedule compaction. Small files kill performance, and compaction is
                the lowest effort optimization you can automate.
              </li>
              <li>
                Track snapshot retention policies. Keep enough history for debugging,
                but expire old snapshots to control metadata growth.
              </li>
              <li>
                Treat partition evolution as a planned change. Update partition specs
                intentionally, then validate the query plan across engines.
              </li>
              <li>
                Test time travel. Run a weekly check that queries a prior snapshot and
                validates counts so audits do not fail when you need them most.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Bottom Line</h2>
            <p className="leading-relaxed">
              Iceberg is the table format I trust for large scale analytics. It gives
              me a stable contract across engines, safe schema evolution, and a clear
              history of every write. If you are building a data lake that has to
              survive years of change, Iceberg is not a nice to have, it is the
              foundation.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-steel/30 flex items-center gap-4">
          <span className="text-sm text-mutedGray font-mono">Share:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter/X
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-steel/30 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-electricBlue/20 border border-electricBlue/30 flex items-center justify-center text-electricBlue font-bold flex-shrink-0 text-sm">
            RK
          </div>
          <div>
            <p className="font-semibold text-white">Ryan Kirsch</p>
            <p className="text-sm text-mutedGray mt-1">
              Data Engineer at the Philadelphia Inquirer. Writing about practical data engineering,
              local-first stacks, and systems that scale without a cloud bill.
            </p>
            <Link
              href="/"
              className="text-sm text-electricBlue hover:text-white transition-colors mt-2 inline-block"
            >
              View portfolio →
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-electricBlue">
          <Link href="/" className="hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="text-steel"> / </span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
