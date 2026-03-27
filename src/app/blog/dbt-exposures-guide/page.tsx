import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "dbt Exposures: Documenting Downstream Dependencies",
  description:
    "A production guide to dbt exposures: what they are, how to model dashboards, notebooks, analyses, and applications, and why exposures are the missing layer for impact analysis before refactors.",
  openGraph: {
    title: "dbt Exposures: Documenting Downstream Dependencies",
    description:
      "A production guide to dbt exposures: what they are, how to model dashboards, notebooks, analyses, and applications, and why exposures are the missing layer for impact analysis before refactors.",
    type: "article",
    url: "https://ryankirsch.dev/blog/dbt-exposures-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "dbt Exposures: Documenting Downstream Dependencies",
    description:
      "A production guide to dbt exposures: what they are, how to model dashboards, notebooks, analyses, and applications, and why exposures are the missing layer for impact analysis before refactors.",
  },
  alternates: { canonical: "/blog/dbt-exposures-guide" },
};

export default function DbtExposuresGuidePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/dbt-exposures-guide"
  );
  const postTitle = encodeURIComponent(
    "dbt Exposures: Documenting Downstream Dependencies"
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
            dbt Exposures: Documenting Downstream Dependencies
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 27, 2026 ·{" "}
            <span className="text-cyberTeal">11 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most teams stop dbt documentation at models. They annotate staging and
            marts, generate docs, and call it done. The problem is that models are
            only half the contract. The real dependency is the dashboard, notebook,
            analysis, or application that consumes those models. Exposures exist to
            document that downstream edge. When you skip them, you fly blind on
            impact analysis and change management. In production, that is a mistake.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. What Exposures Are and Why Most Teams Skip Them
            </h2>
            <p>
              An exposure is dbt&apos;s way of declaring a downstream consumer of your
              models. It is not a model, not a test, and not a source. It is a metadata
              object that says, &ldquo;this dashboard depends on these models,&rdquo; or
              &ldquo;this application depends on these marts.&rdquo; When you compile docs, dbt
              stitches exposures into the lineage graph so you can see the last mile
              of dependency that actually matters to stakeholders.
            </p>
            <p>
              Think of it as the missing contract between analytics engineering and the
              business. Models explain how you build data. Exposures explain who relies
              on it and what will break if you change it. Without that final edge, you
              can claim you have lineage, but the real question remains unanswered:
              which dashboards and systems take a dependency on this model right now?
            </p>
            <p>
              Most teams skip exposures because they feel optional. They require more
              YAML, and they involve coordination with analytics or product teams who
              built the dashboards. They also do not fix a broken pipeline today. So
              in sprint planning, they slide to the bottom.
            </p>
            <p>
              There is also a subtle incentive problem. The person doing the refactor
              rarely owns the dashboard that breaks, so the risk is externalized. The
              team that benefits from the change isn&apos;t the team that feels the impact.
              Exposures are the lightweight mechanism that makes that risk visible and
              forces a conversation before the change ships.
            </p>
            <p>
              The cost of skipping exposures shows up later: you refactor a model and
              accidentally break a revenue dashboard, you deprecate a mart that still
              powers a notebook, or you cannot answer the simple question, &ldquo;what
              breaks if we change this?&rdquo; Exposures are the only dbt-native way to
              make that answer obvious.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. What Exposures Document in Practice
            </h2>
            <p>
              In a real data stack, the consumers are rarely limited to dashboards. You
              usually have a mix of BI tools, analysis notebooks, and production
              applications. Exposures let you document all of them in one place and tie
              them directly to dbt models. The most common categories are:
            </p>
            <ul>
              <li>
                Dashboards in Tableau, Looker, Mode, or Superset that stakeholders use
                daily.
              </li>
              <li>
                Notebooks for ad-hoc analysis or research workflows that still rely on
                production marts.
              </li>
              <li>
                Analytical queries or reports that are not dashboards but are still
                business-critical (board reporting, monthly finance close).
              </li>
              <li>
                Applications that query dbt models directly: internal tools, data APIs,
                reverse ETL jobs, or ML feature services.
              </li>
            </ul>
            <p>
              The value is not in listing everything. The value is in capturing the
              dependencies that carry business risk. If you cannot name the owner or
              the impact of breaking it, it is probably not exposure-worthy. If it will
              page someone when it breaks, it belongs in exposures.
            </p>
            <p>
              A useful rule of thumb is to start with Tier 0 consumers: the dashboards
              in executive reviews, the reports that drive finance close, and the
              applications that depend on dbt data to function. Once those are captured,
              you can expand coverage. Exposures are not meant to be exhaustive; they are
              meant to be operational.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. YAML Schema Basics (What Actually Matters)
            </h2>
            <p>
              Exposures live in your dbt project YAML files, usually in a dedicated
              <code>exposures.yml</code>. The schema is simple, but the fields that carry
              real operational value are worth being deliberate about:
            </p>
            <ul>
              <li>
                <strong>type</strong>: The exposure category (dashboard, notebook,
                analysis, application). This drives how you reason about the consumer.
              </li>
              <li>
                <strong>maturity</strong>: A lightweight signal for how stable the
                exposure is (low, medium, high). Use this to decide how much review a
                change needs.
              </li>
              <li>
                <strong>owner</strong>: The team or person responsible. This is the most
                important field for debugging and change management.
              </li>
              <li>
                <strong>depends_on</strong>: The dbt models or sources this exposure
                consumes. This is the spine of the lineage graph.
              </li>
              <li>
                <strong>url</strong>, <strong>description</strong>, and
                <strong>tags</strong>: Optional, but useful. If the link is broken or the
                description is empty, the exposure might as well not exist.
              </li>
            </ul>
            <p>
              dbt does not enforce strict semantics here. The quality of an exposure is
              purely the discipline of the team creating it. Treat it like you would a
              production config file, not a checklist item.
            </p>
            <p>
              Two fields that are often overlooked are <strong>name</strong> and
              <strong>label</strong>. The name becomes the stable identifier in
              lineage, so choose something predictable and slug-like. The label is what
              business users will read in docs, so make it human and recognizable. If
              the label is &ldquo;Executive Revenue Dashboard&rdquo; and the URL actually
              opens the right Tableau view, you just turned a metadata object into a
              usable artifact.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Exposure Types: When to Use Each One
            </h2>
            <p>
              dbt defines four exposure types, and each carries an implied operational
              profile:
            </p>
            <ul>
              <li>
                <strong>dashboard</strong>: A BI artifact consumed by non-technical
                stakeholders. Changes here are immediately visible and politically
                sensitive. Use this for anything that shows up in a weekly meeting.
              </li>
              <li>
                <strong>notebook</strong>: A research or analysis workflow. These are
                often owned by analysts or data scientists and can be more volatile, but
                they still deserve lineage if they influence decisions.
              </li>
              <li>
                <strong>analysis</strong>: A scheduled or recurring query that is not a
                dashboard. Think monthly finance close reports or regulatory exports.
              </li>
              <li>
                <strong>application</strong>: A service, API, or data product that reads
                from dbt models. These usually have strict SLAs and are the most costly
                to break.
              </li>
            </ul>
            <p>
              The real trick is consistency. If you mark a customer-facing revenue
              dashboard as a notebook because it was built in a notebook tool, you are
              hiding the impact. Use the type that reflects risk and audience, not the
              tool used to build it.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Why Exposures Matter Before You Refactor
            </h2>
            <p>
              The most common refactor mistake is to change a model that has silent
              downstream dependencies. A rename, a filtering tweak, or a join rewrite can
              pass tests but still break a dashboard because the dashboard expected a
              specific column shape or a particular grain.
            </p>
            <p>
              With exposures, you can do a real impact analysis. If you plan to refactor
              <code>fct_revenue</code>, you immediately see the dashboards and
              applications that consume it. That tells you who to alert, what to test,
              and where to compare results. It also changes the review conversation:
              you are no longer guessing about impact. You can explicitly say, &ldquo;this
              change affects the QBR revenue dashboard and the finance month-end report,&rdquo;
              and bring those owners into the review.
            </p>
            <p>
              This is the difference between &ldquo;hope it doesn&apos;t break&rdquo; and
              &ldquo;we know exactly what could break.&rdquo; dbt gives you the graph; exposures
              make the graph operationally useful.
            </p>
            <p>
              The practical workflow is simple: before you change a model, check the
              exposures that depend on it. If a high-maturity exposure is listed, treat
              the change like a breaking change. Coordinate with the owner, validate
              output parity, and compare metrics in a staging environment. The hours you
              spend here are the hours you don&apos;t spend in a war room after the change
              ships.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              6. Exposures Complement Lineage and Catalog Tools
            </h2>
            <p>
              Exposures are not a replacement for data catalogs or lineage platforms.
              They are the downstream edge that those tools often miss. A catalog like
              DataHub or OpenMetadata can ingest dbt docs and show lineage across
              systems. But that lineage is only as good as the metadata you provide. If
              you do not declare exposures, your catalog will still show models as the
              terminal nodes, which is not how the business consumes data.
            </p>
            <p>
              Think of exposures as the ground truth for the final mile. They establish
              the dependency between the warehouse and the BI layer or application. Your
              catalog can ingest that and display a complete graph, but it cannot infer
              it automatically with high accuracy. Exposures are the explicit contract
              that makes the rest of the metadata stack trustworthy.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              7. Integrating Exposures with Metadata Tooling
            </h2>
            <p>
              The cleanest integration pattern is simple: dbt owns the dependency
              declaration, and the catalog owns the discovery experience. That usually
              looks like this:
            </p>
            <ul>
              <li>
                Analysts and engineers maintain exposures alongside dbt models in git.
              </li>
              <li>
                dbt builds generate artifacts (manifest and catalog) that include
                exposures.
              </li>
              <li>
                A metadata tool ingests those artifacts on every run and surfaces the
                exposure graph in its UI.
              </li>
              <li>
                Ownership and tags from exposures become searchable metadata in the
                catalog.
              </li>
            </ul>
            <p>
              This keeps source-of-truth in one place. If you let the catalog become the
              place where exposures are edited, you split ownership and guarantee drift.
              Use the catalog to visualize and discover, not to author. dbt remains the
              config layer.
            </p>
            <p>
              Practically, this means your dbt artifacts are the integration surface.
              Most tooling ingests <code>manifest.json</code> on every run. Exposures live
              there alongside models, sources, and tests, which makes them first-class in
              lineage. If your catalog supports ownership or tiering, map dbt exposure
              fields directly instead of re-keying them manually.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              8. Full Example: Tableau Dashboard Exposure
            </h2>
            <p>
              Below is a realistic exposure for a Tableau executive dashboard. It
              includes a clear owner, a URL for quick access, and a dependency list that
              captures both fact and dimension models. This is the kind of definition
              that supports production impact analysis.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`version: 2

exposures:
  - name: exec_revenue_dashboard
    type: dashboard
    maturity: high
    label: Executive Revenue Dashboard
    url: https://tableau.company.com/#/views/exec/Revenue
    description: >
      Executive-facing revenue dashboard used in weekly leadership review.
      Primary metrics: ARR, net revenue retention, churn, and expansion.
      Source of truth for revenue visibility outside Finance.
    owner:
      name: Finance Analytics
      email: finance-analytics@company.com
    tags: [tableau, exec, revenue, finance, weekly]
    depends_on:
      - ref('fct_revenue_monthly')
      - ref('fct_customer_churn')
      - ref('dim_customer')
      - ref('dim_date')
    meta:
      tableau:
        workbook: exec-revenue
        project: leadership
        refresh_schedule: "Every 4 hours"
        certified: true`}</code>
            </pre>
            <p>
              Note the difference between a useful exposure and a useless one. The owner
              is explicit, the description explains the business context, and the
              dependencies are precise. This is enough for a senior engineer to decide
              how risky a refactor is and who to coordinate with.
            </p>
            <p>
              The meta block is also deliberate. You do not need it for dbt, but it is
              valuable for internal tooling. If you pull exposures into a catalog, you
              can surface the Tableau project and refresh schedule without scraping the
              BI tool. The metadata belongs next to the exposure because the exposure is
              the contract.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              9. Full Example: Airflow Application Exposure
            </h2>
            <p>
              Application exposures are where most teams feel uneasy, but they are
              critical. If your product or internal services depend on a dbt model, you
              need that dependency recorded. Below is an example for an Airflow DAG that
              publishes daily customer scores into an internal API.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`version: 2

exposures:
  - name: customer_health_scoring_service
    type: application
    maturity: medium
    label: Customer Health Scoring API
    url: https://airflow.company.com/dags/customer_health_scoring
    description: >
      Airflow DAG that publishes daily customer health scores to the internal
      Customer Success API. Used by CSMs in the product UI to prioritize outreach.
    owner:
      name: Data Platform
      email: data-platform@company.com
    tags: [airflow, application, customer-success, scores]
    depends_on:
      - ref('fct_customer_health_daily')
      - ref('dim_customer')
      - ref('int_feature_usage_rollup')
    meta:
      orchestrator: airflow
      dag_id: customer_health_scoring
      schedule: "0 6 * * *"
      sla: "daily by 7am UTC"`}</code>
            </pre>
            <p>
              This is the kind of exposure that prevents a silent outage. If you change
              <code>fct_customer_health_daily</code> and break the scoring logic, you now
              have a named owner and a documented SLA that tells you this is a production
              dependency, not a casual analysis.
            </p>
            <p>
              Application exposures also clarify operational expectations. If a DAG is
              supposed to run at 6 AM UTC and the downstream API assumes fresh data by 7
              AM UTC, that timing belongs in the metadata. It gives you a concrete SLA
              to defend during refactors and incident reviews, and it tells on-call
              engineers which dependencies are time-sensitive.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              10. Practical Rollout Checklist
            </h2>
            <p>
              Exposures only work if you roll them out with intention. This checklist is
              the version that sticks on real teams:
            </p>
            <ul>
              <li>
                Start with the top 5 business-critical dashboards and applications,
                not the full catalog.
              </li>
              <li>
                Require an owner and a URL for every exposure. No owner, no exposure.
              </li>
              <li>
                Define maturity levels (low, medium, high) and agree on what they mean.
              </li>
              <li>
                Validate dependencies by running <code>dbt ls --select +model</code> and
                confirming the downstream models match the exposure.
              </li>
              <li>
                Review exposures in the same PRs as model changes that affect them.
              </li>
              <li>
                Automate doc generation and surface exposures in your data catalog.
              </li>
              <li>
                Add a quarterly review to prune exposures that no longer matter.
              </li>
            </ul>
            <p>
              Exposures are lightweight, but the discipline to keep them accurate is not.
              Treat them as part of your production metadata, and they will save you from
              surprise breakage and reputational damage when models change.
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
                Senior Data Engineer with experience building production pipelines at
                scale. Works with dbt, Snowflake, and Dagster, and writes about data
                engineering patterns from production experience.{" "}
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
