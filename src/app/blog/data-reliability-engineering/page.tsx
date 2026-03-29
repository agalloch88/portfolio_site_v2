import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust | Ryan Kirsch",
  description:
    "A practical guide to data reliability engineering: SLAs, freshness, incident response, error budgets, observability, and the habits that keep stakeholders from losing trust in your data platform.",
  openGraph: {
    title: "Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust",
    description:
      "A practical guide to data reliability engineering: SLAs, freshness, incident response, error budgets, observability, and the habits that keep stakeholders from losing trust in your data platform.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-reliability-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust",
    description:
      "A practical guide to data reliability engineering: SLAs, freshness, incident response, error budgets, observability, and the habits that keep stakeholders from losing trust in your data platform.",
  },
  alternates: { canonical: "/blog/data-reliability-engineering" },
};

export default function DataReliabilityEngineeringPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-reliability-engineering");
  const postTitle = encodeURIComponent("Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Reliability</span>
            <span className="text-sm text-gray-500">March 2, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Most data teams think they have a pipeline problem when what they really have is a trust problem. Data reliability engineering is the discipline that sits in the middle.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data teams often frame their failures in technical terms: a DAG failed, a source connector lagged, a model produced duplicates, a dashboard refreshed late. Stakeholders experience the same failures differently. To them, the issue is simpler: “Can I trust this number or not?”
          </p>
          <p>
            That is why data reliability engineering matters. It is not just a cluster of monitoring tools. It is an operating model for keeping data trustworthy enough that the rest of the business can move with confidence. It borrows heavily from site reliability engineering, but the unit of reliability is not request latency or uptime. It is freshness, completeness, correctness, and clarity about failure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">From Data Platform to Data Product Reliability</h2>
          <p>
            A data platform can be technically healthy while the business still has low trust in the outputs. Jobs may run, warehouses may respond quickly, and orchestration may be green across the board. But if key tables arrive late twice a week, if revenue numbers change after the executive meeting, or if nobody knows whether a dimension table is actually complete, trust erodes quickly.
          </p>
          <p>
            Reliability has to be defined from the consumer perspective. A mart that powers an internal dashboard needs a different reliability posture than a reverse ETL sync writing account scores into Salesforce. A weekly board deck metric needs higher correctness guarantees than an exploratory notebook used by one analyst.
          </p>
          <p>
            That means the core unit of thinking should be the data product, not the generic pipeline. Reliability engineering starts when you ask: what does good look like for this dataset, for this consumer, at this cadence?
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Four Reliability Dimensions</h2>
          <p>
            In practice, most data incidents fall into four categories:
          </p>
          <ul>
            <li><strong>Freshness:</strong> Did the data arrive on time?</li>
            <li><strong>Completeness:</strong> Is the expected data all there?</li>
            <li><strong>Correctness:</strong> Does the data reflect reality and the intended logic?</li>
            <li><strong>Consistency:</strong> Does the same concept match across places where it appears?</li>
          </ul>
          <p>
            Freshness incidents are the easiest to detect. A table was supposed to load by 8:00 AM and it did not. Completeness is slightly harder: the table loaded, but it only contains 60% of expected records because the upstream API silently truncated. Correctness is harder still: the rows are there, but a business rule changed and the metric is now wrong. Consistency problems appear when different teams compute the same KPI differently and both numbers survive long enough to confuse leadership.
          </p>
          <p>
            A mature reliability posture observes all four dimensions instead of pretending row count and runtime alone are enough.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLAs, SLOs, and Error Budgets for Data</h2>
          <p>
            Data teams should steal more directly from SRE. Service level objectives are useful for data when they are concrete and tied to a consumer need.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`Example data SLOs

fct_orders_daily:
- Freshness: available by 7:30 AM ET on business days, 99% of the time
- Completeness: daily row count within 2% of expected baseline, 99.5% of runs
- Correctness: critical metric tests pass 100% of production runs

account_health_sync:
- Freshness: Salesforce sync completed within 30 minutes of warehouse publish, 99% of runs
- Consistency: score distribution within expected band relative to previous 7-day window`}
          </pre>
          <p>
            Once you define the objective, you can define an error budget. If a daily executive table has a 99% monthly freshness target, it effectively has very little room for delay. If a lower-tier exploratory mart has a 95% target, the team can tolerate more instability without treating every miss as a major incident.
          </p>
          <p>
            Error budgets matter because they create prioritization. Without them, every stakeholder issue feels urgent and every alert gets the same emotional treatment. With them, the team can distinguish between noise, budget burn, and genuine systemic degradation.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Observability Is Necessary, Not Sufficient</h2>
          <p>
            Data observability tooling is useful, but it is not the discipline itself. Tools can detect freshness lag, schema drift, volume anomalies, distribution shifts, and lineage impact. They cannot decide which assets deserve tighter guarantees, how incidents get communicated, or when a repeated failure mode should block new feature work.
          </p>
          <p>
            Observability tells you what happened. Reliability engineering decides what the team should do about it.
          </p>
          <p>
            For many teams, a minimal but solid observability stack looks like this: orchestrator health from Airflow or Dagster, test results from dbt or Great Expectations, warehouse query and table metadata, and targeted anomaly detection on the handful of datasets whose failures actually hurt the business. That already gets you surprisingly far if the team uses it consistently.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Incident Response for Data Teams</h2>
          <p>
            Data incidents are often handled too quietly. A model breaks, a data engineer fixes it, and stakeholders are informed only after the fact, if at all. That approach reduces short-term embarrassment and creates long-term distrust.
          </p>
          <p>
            A better pattern mirrors infrastructure incident response:
          </p>
          <ol>
            <li>Acknowledge the issue quickly.</li>
            <li>Scope the blast radius using lineage and consumer knowledge.</li>
            <li>Provide a first estimate for recovery or workaround timing.</li>
            <li>Update proactively until resolved.</li>
            <li>Write a postmortem with concrete follow-up actions.</li>
          </ol>
          <p>
            Data incidents often have social blast radius beyond the technical one. If a sales team acted on bad account scores for four hours, the issue is not just a failed sync. It is a coordination problem that affected real decisions. Communication quality matters as much as root cause analysis.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Reliability Work Has to Win Against Feature Pressure</h2>
          <p>
            The hardest part of reliability engineering is not technical. It is organizational. New dashboards, new pipelines, and new stakeholder requests always feel more visible than preventing future failures. Reliability work gets deferred because the failure it prevents has not happened yet, or happened last quarter and has already faded from memory.
          </p>
          <p>
            That is where error budgets and incident metrics become useful politically. If a critical dataset missed its freshness target five times this month, the team has evidence that the platform is overspending its reliability budget. That creates a stronger case for fixing root causes instead of continuing to ship features on top of unstable foundations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Good Looks Like</h2>
          <p>
            A reliable data team does not mean a team with zero incidents. It means a team where important datasets have explicit expectations, failures are detected quickly, communication is calm and fast, and repeated incidents produce structural fixes rather than folklore.
          </p>
          <p>
            Stakeholders know which assets are safe to rely on and when they will arrive. Engineers know which datasets are tier-1 and which are allowed to be less polished. Postmortems produce better tests, clearer ownership, or architecture changes. Trust becomes something the team can intentionally build instead of something they hope to retain.
          </p>
          <p>
            That is what data reliability engineering really is: operationalizing trust so the business does not need to guess whether the data team is having a good day.
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
