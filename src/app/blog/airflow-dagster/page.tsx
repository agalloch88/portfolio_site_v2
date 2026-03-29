import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Airflow vs. Dagster: Lessons From Running Both in Production",
  description:
    "A practical comparison from someone who has run both tools in a production data platform.",
  openGraph: {
    title: "Airflow vs. Dagster: Lessons From Running Both in Production",
    description:
      "A practical comparison from someone who has run both tools in a production data platform.",
    type: "article",
    url: "https://ryankirsch.dev/blog/airflow-dagster",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airflow vs. Dagster: Lessons From Running Both in Production",
    description:
      "A practical comparison from someone who has run both tools in a production data platform.",
  },
  alternates: { canonical: "/blog/airflow-dagster" },
};

export default function AirflowDagsterPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/airflow-dagster");
  const postTitle = encodeURIComponent(
    "Airflow vs. Dagster: Lessons From Running Both in Production"
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
            Airflow vs. Dagster: Lessons From Running Both in Production
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · October 20, 2025 · <span className="text-cyberTeal">7 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            I started with Airflow, like most teams do. It was the default choice when
            I inherited our data platform, and for a while it worked. As the stack
            matured and our pipelines got more complex, I moved a meaningful chunk of
            our workload to Dagster. That migration was not a clean break, and it did
            not need to be. It taught me what Airflow is great at, where it struggles,
            and why Dagster feels like a better fit for asset driven systems.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What Airflow Gets Right</h2>
            <p className="leading-relaxed">
              Airflow is battle tested. That matters when you are on call and the
              scheduler is the only thing standing between you and a broken report in
              the morning. The core scheduling model is simple, the UI is familiar, and
              nearly every data engineer has already run or debugged an Airflow DAG in
              production. That shared mental model is real leverage when you are
              hiring or rotating ownership across teams.
            </p>
            <p className="leading-relaxed">
              The ecosystem is huge. There is an operator for almost everything. If you
              need to hit an API, move files, trigger a Spark job, or kick off a dbt run,
              there is a plugin or operator that gets you ninety percent of the way
              there. Most cloud vendors now offer managed Airflow, which means you can
              avoid running the scheduler and webserver yourself. That is a big deal
              for small teams that want to focus on data, not infrastructure.
            </p>
            <p className="leading-relaxed">
              The DAG based model is also a good fit for scheduled batch jobs. When the
              problem is straightforward, run these tasks at 2 AM, Airflow is clean and
              reliable. It excels at orchestrating pipelines where the tasks are the
              primary unit of work and you are mostly concerned with timing. I still
              use it for simple cron style workloads because it is proven and boring,
              and boring is a feature in production.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Where Airflow Shows Its Age</h2>
            <p className="leading-relaxed">
              Airflow is task centric, not data centric. That is not just a semantic
              critique, it changes how you think about pipelines. The system asks you
              to model tasks and dependencies, but it does not make datasets first class
              objects. If you want lineage, freshness, or asset awareness, you bolt it
              on with plugins or external tooling. That works, but it is always an
              extra layer rather than the default.
            </p>
            <p className="leading-relaxed">
              The testing story is also painful. You can unit test operators, and you
              can run DAGs in a test environment, but neither feels natural. Most teams
              end up with a mix of brittle integration tests and manual validation in
              the UI. It is possible to do well, but Airflow does not guide you there.
              For pipelines that are essentially software projects, that gap starts to
              hurt.
            </p>
            <p className="leading-relaxed">
              The asset vs task mental model mismatch is the root of many rough edges.
              When your real concern is whether a dataset is fresh, Airflow makes you
              infer that from task runs. When you want to reason about data contracts
              between layers, you end up documenting it in Confluence instead of in the
              tool itself. Observability is solid once you invest in logs, metrics, and
              plugins, but you are building that stack yourself. Airflow is powerful,
              but it shows its age in the way it treats data as a side effect rather
              than a product.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Dagster Mental Shift</h2>
            <p className="leading-relaxed">
              Dagster&apos;s key insight is software defined assets. Instead of describing a
              set of tasks that run, you define the assets that get materialized. Each
              asset knows its upstream dependencies. That means lineage is built in, not
              layered on later. The UI shows you the graph of data products, not just a
              list of scheduled jobs. When you think in assets, the system reflects how
              stakeholders actually consume data.
            </p>
            <p className="leading-relaxed">
              IOManagers push you to formalize data contracts. You decide how assets are
              persisted, how partitions are structured, and how data is versioned. The
              system makes those choices explicit instead of burying them in an operator
              or a random script. Partitioned assets are also first class. You can
              declare daily partitions, backfill a range, and see the state of each
              partition in the UI. That clarity is rare in task based orchestrators.
            </p>
            <p className="leading-relaxed">
              The difference is easiest to see in code. In Airflow, you describe a task
              that produces data. In Dagster, you declare the data itself. Here is a
              short comparison from a pipeline that builds a curated users table.
            </p>
            <pre className="rounded-lg bg-charcoal/60 p-4 overflow-x-auto text-sm text-lightGray">
              <code className="font-mono">{`# Airflow task
@dag.task
def build_users():
    df = extract_users()
    df = transform_users(df)
    load_users(df)

# Dagster asset
@asset
def users():
    df = extract_users()
    df = transform_users(df)
    return df`}</code>
            </pre>
            <p className="leading-relaxed">
              The Dagster version tells the system what asset exists and lets the
              IOManager decide how it is persisted. That unlocks lineage, backfills,
              and data catalog features with almost no extra work. It is a different
              mindset, and once it clicks, it is hard to unsee.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Real World Migration Lessons</h2>
            <p className="leading-relaxed">
              The biggest surprise during migration was how much logic was not actually
              tied to Airflow. A lot of our operators just called Python functions. When
              I reframed those functions as assets, the move was less painful than I
              expected. The hard part was not rewriting code, it was deciding which
              pieces should be assets and which should remain tasks. Anything that
              produced a durable dataset became an asset. Anything that was purely
              operational, like sending notifications or triggering downstream systems,
              stayed as a task or a sensor.
            </p>
            <p className="leading-relaxed">
              Testing improved quickly. With Dagster, I could run assets in isolation
              and use plain pytest to validate their outputs. I wrote tests that
              materialized assets against a small local dataset, then asserted schema
              and row level expectations. The key shift was treating assets like
              functions with return values instead of tasks with side effects. It
              aligned naturally with pytest fixtures and made our tests faster and less
              flaky. We still kept some integration tests for end to end runs, but the
              unit tests gave us confidence without spinning up the scheduler.
            </p>
            <p className="leading-relaxed">
              Observability also improved, but only after we adjusted our habits. In
              Airflow, we were used to task logs and retries as the primary signal. In
              Dagster, we leaned into asset checks and explicit metadata on materialize
              events. That meant adding lightweight quality checks and structured
              metrics, like row counts and min or max timestamps, directly in the asset
              code. Those signals became part of the asset history, which made it
              easier to understand when a dataset drifted or when a backfill produced
              unexpected shape changes.
            </p>
            <p className="leading-relaxed">
              What was easier than expected was the developer experience. Dagster&apos;s
              local UI and reload flow reduced friction. New engineers could run a
              subset of assets, see the lineage, and understand the pipeline without
              reading an entire DAG file. What was harder was retraining how we think
              about ownership. Airflow trained the team to think in terms of jobs. With
              Dagster, you are responsible for data products, and that changes how you
              document, test, and monitor.
            </p>
            <p className="leading-relaxed">
              We also underestimated the migration effort around backfills and
              partitions. Airflow backfills are well understood, and our operators had
              custom logic built around execution dates. Dagster handles partitions
              cleanly, but you need to be explicit about partition definitions and how
              your IOManagers store them. Once we did that, backfills became cleaner,
              but there was a learning curve. The best lesson was to migrate in slices,
              keep Airflow running for legacy DAGs, and move critical assets first.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">When to Stick With Airflow</h2>
            <p className="leading-relaxed">
              If you have a mature Airflow codebase with years of operational knowledge,
              you do not need to rip it out. Airflow is stable, it scales, and your team
              already knows how to keep it healthy. For simple scheduled jobs and
              cron style pipelines, it is still a strong choice. The overhead of a
              migration might outweigh any benefit, especially if the DAGs are small
              and the data products are not complex.
            </p>
            <p className="leading-relaxed">
              Managed Airflow investment is another reason to stay. If your platform is
              built around a cloud managed Airflow service with tight IAM integration,
              logging, and monitoring, you would need a compelling reason to move. I
              still use Airflow in environments where the managed service is a core
              part of our reliability story. It is not outdated in that context. It is
              a proven scheduler with a large support surface area.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Bottom Line</h2>
            <p className="leading-relaxed">
              Dagster is my preference for greenfield platforms where I want assets to
              be first class, lineage to be visible, and tests to feel like real
              software engineering. Airflow remains the right call when you have deep
              investment, a large library of existing DAGs, and a team that already
              knows how to operate it confidently. Neither tool is wrong. The right
              choice depends on how much you value asset centric design versus stability
              and familiarity.
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
