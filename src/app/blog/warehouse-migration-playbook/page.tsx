import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Warehouse Migration Playbook: How to Move Without Breaking Everything | Ryan Kirsch",
  description:
    "A practical warehouse migration guide: dual-running, schema compatibility, cutover planning, stakeholder communication, validation queries, and how to move platforms without setting your analytics credibility on fire.",
  openGraph: {
    title: "Data Warehouse Migration Playbook: How to Move Without Breaking Everything",
    description:
      "A practical warehouse migration guide: dual-running, schema compatibility, cutover planning, stakeholder communication, validation queries, and how to move platforms without setting your analytics credibility on fire.",
    type: "article",
    url: "https://ryankirsch.dev/blog/warehouse-migration-playbook",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Warehouse Migration Playbook: How to Move Without Breaking Everything",
    description:
      "A practical warehouse migration guide: dual-running, schema compatibility, cutover planning, stakeholder communication, validation queries, and how to move platforms without setting your analytics credibility on fire.",
  },
  alternates: { canonical: "/blog/warehouse-migration-playbook" },
};

export default function WarehouseMigrationPlaybookPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/warehouse-migration-playbook");
  const postTitle = encodeURIComponent("Data Warehouse Migration Playbook: How to Move Without Breaking Everything");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Migration</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">10 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Warehouse Migration Playbook: How to Move Without Breaking Everything
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Warehouse migrations are never just about moving SQL from one engine to another. They are trust migrations, workflow migrations, cost migrations, and failure-mode migrations too.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            A warehouse migration starts as a technical decision. Maybe Snowflake costs have grown faster than expected. Maybe BigQuery fits the ecosystem better. Maybe Redshift is being retired. Maybe the team wants to consolidate around Databricks. The technical rationale is usually straightforward.
          </p>
          <p>
            The operational reality is less straightforward. Dozens of models, dashboards, extracts, notebooks, syncs, and undocumented stakeholder habits are attached to the current warehouse whether anyone planned for that or not. If you treat the migration like a pure infrastructure task, you will complete the cutover and still spend months cleaning up broken trust.
          </p>
          <p>
            A good warehouse migration plan treats the destination platform change as only one part of the work. The harder part is preserving correctness, continuity, and confidence while the move happens.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Know What You Are Actually Migrating</h2>
          <p>
            Before any code moves, inventory the real surface area of the platform. Not just tables and models. You need to know:
          </p>
          <ul>
            <li>ingestion pipelines and source connectors</li>
            <li>transformation code and orchestration jobs</li>
            <li>BI dashboards and semantic models</li>
            <li>notebooks and analyst workflows</li>
            <li>reverse ETL syncs and operational exports</li>
            <li>machine learning feature consumers</li>
            <li>service accounts, permissions, and network assumptions</li>
          </ul>
          <p>
            Most migration surprises come from hidden dependencies outside the core transformation DAG. A dashboard that points directly at a legacy schema, a finance spreadsheet connected through an old ODBC setup, or a nightly CSV export job nobody remembered can create just as much pain as a failed model build.
          </p>
          <p>
            Lineage and query history help here, but they rarely catch everything. Interviews with frequent users, BI admins, and RevOps or Finance owners are just as important as technical discovery.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Prefer Dual-Running Over Big Bang</h2>
          <p>
            The safest migration pattern is dual-running: the old warehouse and new warehouse operate in parallel for a period long enough to validate outputs and uncover edge cases.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`Phase 1: land raw data in both platforms
Phase 2: run core transformations in both
Phase 3: compare outputs and reconcile differences
Phase 4: switch downstream consumers gradually
Phase 5: keep old platform read-only for fallback window
Phase 6: retire after confidence period`}
          </pre>
          <p>
            Big-bang cutovers are attractive because they seem decisive and shorten the period of duplicated spend. They also concentrate risk into one date and eliminate your best fallback path. Unless the platform is tiny, dual-running is worth the temporary cost.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Schema Compatibility Matters More Than SQL Porting</h2>
          <p>
            Teams often focus on translating SQL syntax differences: date functions, merge semantics, clustering strategies, dialect quirks. That work matters, but downstream breakage often comes from schema drift during the migration rather than syntax itself.
          </p>
          <p>
            If a model in the new warehouse produces the same rows but different column names, changed nullability, altered timestamp precision, or different sort assumptions, the migration can still fail from the consumer perspective. Compatibility should be treated as a product requirement, not a nice-to-have.
          </p>
          <p>
            That means defining what “equivalent output” actually means for critical published models. In some places, exact schema parity is required. In others, you can version a model or coordinate a controlled downstream update. The key is to decide intentionally rather than discovering incompatibilities after cutover.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Validation Needs to Be Layered</h2>
          <p>
            Validation is not one row-count comparison at the end. A solid migration uses multiple layers:
          </p>
          <ul>
            <li>row counts and freshness checks on landed raw tables</li>
            <li>schema comparisons on transformed outputs</li>
            <li>aggregate metric comparisons on business-critical marts</li>
            <li>sample-level record diffing for representative keys</li>
            <li>dashboard parity review with stakeholders</li>
          </ul>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`-- Example aggregate parity check
select
  old.order_date,
  old.total_revenue as old_total_revenue,
  new.total_revenue as new_total_revenue,
  abs(old.total_revenue - new.total_revenue) as diff
from old_wh.mart_daily_revenue old
join new_wh.mart_daily_revenue new
  on old.order_date = new.order_date
where abs(old.total_revenue - new.total_revenue) > 0.01
order by old.order_date;`}
          </pre>
          <p>
            You want fast automated checks and a smaller set of human-reviewed outputs. Automation finds drift quickly. Human review catches semantic weirdness that metrics alone sometimes miss.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Cut Over Consumers in Tiers</h2>
          <p>
            Not all downstream consumers deserve the same cutover pattern. Tier them.
          </p>
          <p>
            <strong>Tier 1:</strong> executive dashboards, finance reporting, reverse ETL syncs, external customer-facing data. Move these last and with the most validation.
          </p>
          <p>
            <strong>Tier 2:</strong> internal analytics dashboards and regular stakeholder self-serve use cases. Migrate after core marts have proven stable.
          </p>
          <p>
            <strong>Tier 3:</strong> exploratory notebooks, low-frequency analyst queries, one-off extracts. These can often move earlier because the blast radius is lower.
          </p>
          <p>
            A staged cutover lets the team absorb problems in lower-risk areas before the most sensitive assets move. It also gives you time to improve documentation and user support between waves.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Communication Is Part of the Migration Plan</h2>
          <p>
            Users do not care that your warehouse migration is technically elegant if the dashboard they use every morning changes shape without warning. Good migration plans include explicit communication milestones: what is moving, when it is moving, what might change, how validation is being handled, and where to report issues.
          </p>
          <p>
            This does not need to be dramatic. A migration update note, a short FAQ, and a named support channel go a long way. People tolerate infrastructure change better when they understand the timing and the fallback plan.
          </p>
          <p>
            The most important communication is around the fallback window. If something goes wrong after cutover, stakeholders should know whether the team can revert, how long the old environment remains available, and what the expected recovery path looks like.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Cost and Performance Regressions Are Part of Validation Too</h2>
          <p>
            A migration can be “correct” and still fail economically. Query patterns that were cheap in one warehouse may become expensive in another. Partitioning or clustering strategies may need redesign. Concurrency behavior may feel better or worse for BI workloads even if the raw benchmark looks fine.
          </p>
          <p>
            Validate representative query costs and response times during dual-running. A migration should improve or at least preserve the platform&apos;s operating characteristics, not just reproduce the same tables at a higher bill.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Good Looks Like</h2>
          <p>
            A successful warehouse migration is boring to most stakeholders. Their dashboards still work. Their extracts still arrive. The numbers stay consistent. Maybe queries are faster. Maybe costs improve. But the main emotional outcome is the absence of drama.
          </p>
          <p>
            That boringness is earned through dual-running, layered validation, careful consumer cutover, and communication that treats trust as something the migration can damage if handled sloppily. Move the warehouse, yes, but move the confidence with it too.
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
