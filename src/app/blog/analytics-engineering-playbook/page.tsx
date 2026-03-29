import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analytics Engineering Playbook: Modeling, Testing, and Earning Trust | Ryan Kirsch",
  description:
    "A practical analytics engineering playbook: staging, marts, semantic clarity, dbt tests, stakeholder alignment, and the habits that turn dashboards from decoration into decision tools.",
  openGraph: {
    title: "Analytics Engineering Playbook: Modeling, Testing, and Earning Trust",
    description:
      "A practical analytics engineering playbook: staging, marts, semantic clarity, dbt tests, stakeholder alignment, and the habits that turn dashboards from decoration into decision tools.",
    type: "article",
    url: "https://ryankirsch.dev/blog/analytics-engineering-playbook",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics Engineering Playbook: Modeling, Testing, and Earning Trust",
    description:
      "A practical analytics engineering playbook: staging, marts, semantic clarity, dbt tests, stakeholder alignment, and the habits that turn dashboards from decoration into decision tools.",
  },
  alternates: { canonical: "/blog/analytics-engineering-playbook" },
};

export default function AnalyticsEngineeringPlaybookPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/analytics-engineering-playbook");
  const postTitle = encodeURIComponent("Analytics Engineering Playbook: Modeling, Testing, and Earning Trust");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Analytics Engineering</span>
            <span className="text-sm text-gray-500">March 11, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Analytics Engineering Playbook: Modeling, Testing, and Earning Trust
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Analytics engineering is what happens when SQL stops being a reporting shortcut and becomes a software discipline. The goal is not prettier dashboards. It is trustworthy decision-making.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            A lot of teams think they need better dashboards when what they actually need is better modeling. The dashboards are just the visible layer. If the transformations underneath are inconsistent, undocumented, or too tangled to change safely, no amount of BI polish will rescue trust.
          </p>
          <p>
            That is where analytics engineering matters. It sits between raw data and business decision-making, treating transformations as maintained software rather than disposable SQL. The work is technical, but the outcome is social: the business learns which metrics can be trusted and why.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Core Job of Analytics Engineering</h2>
          <p>
            Analytics engineering exists to turn messy operational data into clean, reusable, business-aligned datasets. That sounds simple. In practice it means translating source-system weirdness into semantic clarity.
          </p>
          <p>
            Source tables are shaped by application needs, not analytical ones. They reflect product decisions, legacy constraints, third-party tool assumptions, and migration scars. Business users do not want to think in those terms. They want reliable definitions for orders, customers, active users, conversion, retention, and revenue.
          </p>
          <p>
            Analytics engineering is the discipline of building that translation layer in a way that can be tested, reviewed, and evolved without quietly breaking everything downstream.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">A Practical Model Structure</h2>
          <p>
            The most durable structure is still a layered one: staging, intermediate, and marts.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`models/
  staging/
    stg_stripe__charges.sql
    stg_salesforce__accounts.sql
  intermediate/
    int_orders__net_revenue.sql
    int_accounts__active_status.sql
  marts/
    finance/
      fct_orders.sql
    growth/
      mart_signup_conversion.sql
    customer/
      dim_customers.sql`}
          </pre>
          <p>
            <strong>Staging</strong> should stay close to the source. Rename ugly columns, standardize types, clean obvious source quirks, and little else.
          </p>
          <p>
            <strong>Intermediate</strong> is where you compose logic that is too specific for staging but not yet a business-facing product. This is where joins, reusable transformations, and metric components often belong.
          </p>
          <p>
            <strong>Marts</strong> are for business consumption. They should answer stable questions clearly and with minimal surprise. If a stakeholder or downstream tool is using a table directly, it should probably be a mart, not a staging or intermediate model.
          </p>
          <p>
            This layering matters because it makes change safer. You know where source cleanup ends and business semantics begin.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Tests Are Not Optional Decorations</h2>
          <p>
            Analytics engineering without tests is just more organized fragility. The good news is that the testing surface is usually smaller than teams fear. You do not need to test every imaginable thing. You need to test the assumptions that would make downstream usage dangerous if they failed.
          </p>
          <ul>
            <li>unique and not_null on keys that must behave like identifiers</li>
            <li>accepted values on constrained enums and statuses</li>
            <li>relationships on critical foreign-key-like joins</li>
            <li>custom tests on business invariants that actually matter</li>
          </ul>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`version: 2
models:
  - name: fct_orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id
      - name: order_status
        tests:
          - accepted_values:
              values: ['pending', 'paid', 'refunded', 'failed']`}
          </pre>
          <p>
            The point of testing is not purity. It is faster detection and more confident change. If a contract the business depends on is broken, the team should know before a stakeholder Slack message tells them.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Naming and Semantic Clarity Win More Than Clever SQL</h2>
          <p>
            Most analytical confusion is semantic, not computational. The SQL can be technically correct while still producing a table nobody uses confidently because the naming is vague or the metric logic is implicit.
          </p>
          <p>
            Good analytics engineering names things like they are intended to be read by someone other than the author. If a metric has exclusions, call them out. If a table is point-in-time, say so. If a dimension is slowly changing or current-state only, make that legible.
          </p>
          <p>
            This is why exposures, documentation, and metric descriptions matter. They are not nice extras. They are part of the interface.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Stakeholder Alignment Is Part of the Job</h2>
          <p>
            Analytics engineers are often treated like quiet SQL builders when the role actually benefits from stronger stakeholder fluency than many data engineering roles. Someone needs to pin down what “active” means, whether a refund should be netted from revenue on the same day or by event date, and whether marketing-qualified lead logic should be stable or intentionally evolving.
          </p>
          <p>
            Those are not purely technical questions. They are business-definition questions with technical consequences. A strong analytics engineer does not just implement the first answer they hear. They surface ambiguity, document decisions, and make sure the model reflects the chosen meaning rather than an accidental default.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Dashboards Should Depend on Stable Products</h2>
          <p>
            One of the fastest ways to create BI chaos is letting dashboards depend directly on raw or semi-modeled datasets. Dashboard authors will work around missing fields by adding logic in the BI layer, and soon the metric logic exists in four places and agrees nowhere.
          </p>
          <p>
            Dashboards should sit on stable marts or semantic models whose logic is version-controlled and reviewed. If the logic belongs in the warehouse, put it there. Let the BI layer focus on presentation, slicing, and access patterns.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Good Looks Like</h2>
          <p>
            A good analytics engineering function produces models that are easy to reason about, tests that catch meaningful failures, naming that reduces ambiguity, and documentation that stakeholders actually use. More importantly, it creates a world where dashboard debates are about business decisions, not whether the numbers are nonsense.
          </p>
          <p>
            The strongest signal that analytics engineering is working is boring trust. People stop asking if the metric is right and start asking what to do about it. That is the transition from reporting to real analytical leverage.
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
