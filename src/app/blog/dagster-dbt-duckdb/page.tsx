import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB",
  description:
    "I had three APIs, a laptop, and a genuine question: can you build a production-quality data pipeline without a cloud bill?",
  openGraph: {
    title: "The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB",
  },
  alternates: { canonical: "/blog/dagster-dbt-duckdb" },
};

export default function DagsterDbtDuckDbPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/dagster-dbt-duckdb");
  const postTitle = encodeURIComponent(
    "The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB"
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
            The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · February 2026 · <span className="text-cyberTeal">8 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            I had three APIs, a laptop, and a genuine question: can you build a
            production-quality data pipeline without a cloud bill? Not a toy. Not a
            tutorial. Something with real orchestration, tested transformations, and a
            proper medallion architecture, running entirely on local infrastructure.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <p className="leading-relaxed">
              Turns out you can. Here is what I built, why I made each architectural
              decision, and what surprised me along the way.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Challenge</h2>
            <p className="leading-relaxed">
              The project started as a portfolio piece but quickly became something I
              actually cared about: pulling health data from my Oura Ring, development
              activity from GitHub, and weather data from OpenWeatherMap, then
              correlating them to answer questions like &quot;do I write more code on days
              with good sleep scores?&quot; That required a real pipeline, not a cron job
              duct-taped to a CSV.
            </p>
            <p className="leading-relaxed">
              The constraints were real too. No cloud budget, no managed warehouse, and
              no Kubernetes cluster to hide behind. Whatever I built had to run on a
              MacBook, be reproducible, and look like the kind of architecture a senior
              engineer would ship at work, not just in a weekend hackathon. That ruled
              out stitching together raw Python scripts and calling it a day. I needed
              orchestration, tested SQL transformations, and a storage layer fast enough
              to query on the fly.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">The Architecture</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Dagster over Airflow: the asset-centric model wins
              </h3>
              <p className="leading-relaxed">
                The first decision was orchestration. Airflow is the obvious default,
                and I have used it professionally. But Airflow is task-centric: it
                models your pipeline as a graph of operations. Dagster models it as a
                graph of <em>assets</em>. That distinction matters more than it sounds.
              </p>
              <p className="leading-relaxed">
                With Dagster&apos;s software-defined assets (SDAs), each dataset is a
                first-class object. You declare what each asset produces, what it
                depends on, and Dagster handles the rest, including freshness policies,
                lineage tracking, and a built-in data catalog in the UI. When I ingest
                raw Oura Ring data into my bronze layer, Dagster knows that asset
                exists, when it was last materialized, and what downstream silver-layer
                assets depend on it. Airflow&apos;s task graph doesn&apos;t give you that
                natively.
              </p>
              <p className="leading-relaxed">
                The local development experience also edges out Airflow significantly.
                Running <code className="font-mono text-sm text-cyberTeal">dagster dev</code> spins up the
                full UI at localhost with hot reload. No Docker Compose, no separate
                scheduler process, no fighting with environment variables. For a
                local-first project, that frictionlessness compounded fast.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                dbt Core over raw SQL: tests and structure as first-class concerns
              </h3>
              <p className="leading-relaxed">
                Once data lands in the bronze layer, it needs to be transformed. I
                could have written raw Python with SQL strings. I chose dbt Core
                instead, and it was the right call.
              </p>
              <p className="leading-relaxed">
                The staging/marts pattern dbt enforces pushed me to think about data in
                layers: <code className="font-mono text-sm text-cyberTeal">stg_oura__sleep</code> cleans and
                standardizes the raw API response; <code className="font-mono text-sm text-cyberTeal">mart_health_activity_correlations</code>
                joins across sources and exposes the final analytical view. That
                separation is boring on a small project and invaluable on a large one.
                More concretely: dbt&apos;s built-in testing framework let me define 17
                data quality tests across my models, covering not-null constraints,
                uniqueness on primary keys, and accepted-value validations on
                categorical fields. Those tests run automatically after each
                transformation. I know immediately when an API response has changed
                shape.
              </p>
              <p className="leading-relaxed">
                Jinja templating and the <code className="font-mono text-sm text-cyberTeal">ref()</code>
                function also give you dependency management for free. When I refactor
                <code className="font-mono text-sm text-cyberTeal">stg_oura__sleep</code>, dbt knows every downstream
                model that needs to rerun. That kind of lineage is something you&apos;d
                otherwise spend weeks wiring up manually.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                DuckDB over Postgres or Snowflake: the right tool for laptop-scale analytics
              </h3>
              <p className="leading-relaxed">
                The storage choice was DuckDB, and this is where I had to push back on
                my own instincts. Postgres is familiar. Snowflake is what the job
                descriptions mention. But neither is the right fit here.
              </p>
              <p className="leading-relaxed">
                DuckDB is an in-process OLAP database. It runs inside your Python
                process, reads directly from Parquet files, and executes columnar
                queries over millions of rows in milliseconds on a laptop. There is no
                server to manage, no connection pooling to configure, and no per-query
                billing to worry about. For analytical workloads at this scale, it is
                genuinely faster than a hosted warehouse on queries against local
                data, because you eliminate the network entirely.
              </p>
              <p className="leading-relaxed">
                The practical detail that sealed it: dbt Core has a first-party DuckDB
                adapter (<code className="font-mono text-sm text-cyberTeal">dbt-duckdb</code>). My entire
                transformation layer runs locally with zero configuration changes. And
                if I eventually want to move this to the cloud, MotherDuck provides
                managed DuckDB hosting with near-zero migration cost. The exit ramp
                exists. I just don&apos;t need it yet.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What I Learned</h2>
            <p className="leading-relaxed">
              Dagster&apos;s asset model required a mental shift early on. I kept wanting
              to think in tasks (&quot;run the ingestion job&quot;) instead of assets
              (&quot;materialize the bronze Oura dataset&quot;). Once that clicked, the rest of
              the design followed naturally. Freshness policies in particular are
              underrated: I configured the bronze assets to flag as stale after 24
              hours, which gives me a dashboard-level health check without writing any
              custom monitoring logic.
            </p>
            <p className="leading-relaxed">
              The surprise was how well dbt and Dagster compose. Dagster&apos;s native dbt
              integration (<code className="font-mono text-sm text-cyberTeal">dagster-dbt</code>) introspects your dbt
              project and surfaces each dbt model as a Dagster asset automatically.
              That means my full lineage graph, from raw API call to Streamlit
              dashboard, lives in one place. I expected to glue these tools together.
              I did not expect the glue to already exist and actually work.
            </p>
            <p className="leading-relaxed">
              If I were starting over, I would define the DuckDB schema more formally
              up front. I evolved it organically and paid for that with a couple of
              messy migration scripts mid-project.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Results</h2>
            <p className="leading-relaxed">
              The pipeline ingests from three APIs, processes data through bronze,
              silver, and gold medallion layers, passes 17 automated dbt data quality
              tests, and surfaces findings in a Streamlit dashboard. The most
              interesting finding: sleep score and commit volume have a moderate
              positive correlation on weekdays, but weather is essentially noise for
              my coding output. The infrastructure to find that out cost nothing
              beyond my laptop and a few evenings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Takeaway</h2>
            <p className="leading-relaxed">
              This stack (Dagster + dbt Core + DuckDB) is genuinely good for local-first
              analytics projects and probably right for small-to-medium team projects
              that do not need a managed cloud warehouse yet. It is not the right call
              if you need multi-user concurrency, petabyte-scale storage, or
              enterprise IAM out of the box. But for building something rigorous,
              testable, and portfolio-worthy without a cloud bill, it is hard to beat.
            </p>
            <p className="leading-relaxed">
              The full repo is at{" "}
              <a
                href="https://github.com/agalloch88/data-pipeline"
                className="text-electricBlue hover:text-white transition-colors"
              >
                github.com/agalloch88/data-pipeline
              </a>
              . If you are building something similar or have opinions on where this
              stack breaks down at scale, I want to hear it.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-steel/30 flex items-center gap-4">
          <span className="text-sm text-mutedGray">Share:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            Twitter/X
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-xl border border-steel/30 bg-charcoal/40 p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-steel/30 text-sm font-mono text-white">
            RK
          </div>
          <div>
            <p className="text-sm text-mutedGray">
              Ryan Kirsch is a backend engineer and data engineer focused on local-first
              systems, resilient data pipelines, and pragmatic tooling.
            </p>
            <Link
              href="/#projects"
              className="mt-3 inline-flex text-sm text-electricBlue hover:text-white transition-colors"
            >
              View portfolio
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-electricBlue hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
