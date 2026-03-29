import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Airflow vs. Dagster: A Data Engineer's Practical Comparison | Ryan Kirsch",
  description:
    "A hands-on comparison of Apache Airflow and Dagster from someone who uses Dagster daily at work: DAG authoring, observability, testing support, asset-centric design, and when to pick each.",
  openGraph: {
    title: "Airflow vs. Dagster: A Data Engineer's Practical Comparison",
    description:
      "A hands-on comparison of Apache Airflow and Dagster from someone who uses Dagster daily at work: DAG authoring, observability, testing support, asset-centric design, and when to pick each.",
    type: "article",
    url: "https://ryankirsch.dev/blog/airflow-vs-dagster-comparison",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airflow vs. Dagster: A Data Engineer's Practical Comparison",
    description:
      "A hands-on comparison of Apache Airflow and Dagster from someone who uses Dagster daily at work: DAG authoring, observability, testing support, asset-centric design, and when to pick each.",
  },
  alternates: { canonical: "/blog/airflow-vs-dagster-comparison" },
};

export default function AirflowVsDagsterPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/airflow-vs-dagster-comparison"
  );
  const postTitle = encodeURIComponent(
    "Airflow vs. Dagster: A Data Engineer's Practical Comparison"
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Blog
        </Link>
      </div>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              Data Engineering
            </span>
            <span className="text-sm text-gray-500">March 29, 2026</span>
            <span className="text-sm text-gray-500">7 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Airflow vs. Dagster: A Data Engineer&apos;s Practical Comparison
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            I use Dagster at work. I have run Airflow in production at previous companies. Here is the honest comparison, without the vendor marketing.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            The Airflow vs. Dagster question comes up constantly in data engineering communities, and most comparisons either oversimplify or read like they were written by someone who only used one of the tools. I have run Airflow in production at a media company with 400-plus DAGs and I use Dagster daily at my current role for a mid-sized data platform with a few hundred software-defined assets. I have opinions based on actual experience with both.
          </p>
          <p>
            The short version: Airflow is more ubiquitous, has a larger community, and is well-understood by most data engineers. Dagster has a fundamentally better model for data work, is dramatically easier to test, and produces better operational outcomes once the team has internalized how to think about assets. The right choice depends on where you are in your platform journey and what your team can absorb.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Mental Model Difference
          </h2>
          <p>
            Airflow thinks in tasks and DAGs. You define a directed acyclic graph of tasks, connect them with dependencies, and schedule the graph to run. The fundamental unit is the task. Success means the task completed. The data that the task produced is not a first-class concept in Airflow. You can see that a task ran. You cannot easily see what data it produced, whether that data is fresh, or what downstream tasks are relying on it.
          </p>
          <p>
            Dagster thinks in assets. A software-defined asset is a declaration that a piece of data exists: a database table, a Parquet file, an ML model artifact. You write a function that produces that asset, declare what it depends on, and Dagster handles the orchestration. The fundamental unit is the data artifact, not the computation.
          </p>
          <p>
            This distinction sounds philosophical but it has enormous practical consequences. In Dagster, the lineage graph is a graph of your data assets. You can see which assets are stale, which are fresh, which have failing checks, and trace exactly how any downstream asset was produced. In Airflow, you can see which tasks ran. Reconstructing what that means for your data requires external tools or careful convention.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            DAG Authoring Experience
          </h2>
          <p>
            Airflow DAG authoring has improved significantly in recent years. The TaskFlow API (using Python decorators) is much cleaner than the legacy operator-based style. A modern Airflow DAG looks like this:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule="@daily", start_date=datetime(2026, 1, 1), catchup=False)
def my_pipeline():

    @task
    def extract() -> dict:
        return {"rows": fetch_from_api()}

    @task
    def transform(data: dict) -> dict:
        return {"processed": clean(data["rows"])}

    @task
    def load(data: dict) -> None:
        write_to_warehouse(data["processed"])

    load(transform(extract()))

my_pipeline()`}
          </pre>
          <p>
            This is clean. The problem I keep running into is that the XCom mechanism (how tasks pass data between each other) has real limits: it serializes to the Airflow metadata database, which means large datasets cannot pass through XCom cleanly. You end up writing intermediate data to external storage and passing references, which works but requires discipline.
          </p>
          <p>
            Dagster assets feel more natural for data work:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset, AssetExecutionContext
import pandas as pd

@asset
def raw_events(context: AssetExecutionContext) -> pd.DataFrame:
    df = fetch_from_api()
    context.log.info(f"Fetched {len(df)} rows")
    return df

@asset
def cleaned_events(raw_events: pd.DataFrame) -> pd.DataFrame:
    return raw_events.dropna().assign(
        event_date=pd.to_datetime(raw_events["occurred_at"]).dt.date
    )

@asset
def daily_event_counts(cleaned_events: pd.DataFrame) -> pd.DataFrame:
    return cleaned_events.groupby("event_date").size().reset_index(name="count")`}
          </pre>
          <p>
            The dependency declaration is just a function argument. The return value is the asset. No XCom, no intermediate storage plumbing. Dagster handles materialization storage through configurable IO managers, which you define once and apply everywhere.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Observability
          </h2>
          <p>
            This is where Dagster has a decisive advantage. The Dagster UI gives you a live asset graph showing the freshness status of every asset, when it was last materialized, any failing asset checks, and the full provenance of each materialization. When something breaks, you navigate to the affected asset, see its upstream dependencies, look at the logs for the failing materialization, and understand the blast radius immediately.
          </p>
          <p>
            The asset checks feature (introduced in Dagster 1.5) deserves specific mention. You can write checks that run after materialization and assert things about the data: row counts within expected ranges, no null values in required columns, referential integrity. These checks are first-class in the Dagster UI and their results are visible on the asset graph. The operational experience is comparable to having dbt tests integrated into your orchestration layer.
          </p>
          <p>
            Airflow observability is task-centric. The grid view shows task status over time. You can drill into logs. The information is there but it takes more work to connect a failed task to the business impact of the failure. Teams running large Airflow deployments typically complement it with external monitoring tools (Grafana, Datadog, or custom dashboards) to get the visibility they need.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Testing Support
          </h2>
          <p>
            Testing Airflow DAGs is possible but awkward. The standard approach is to import the DAG and assert it has the expected tasks and dependencies. Testing the actual logic of a task requires mocking the operator or writing the business logic in a separate Python function that you import into the operator. This is fine in practice but it means the test coverage gap is usually around the integration between task logic and Airflow-specific behavior.
          </p>
          <p>
            Testing Dagster assets is genuinely straightforward. Because assets are just Python functions that take inputs and return outputs, you can call them directly in tests with no Dagster machinery:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# test_assets.py
import pandas as pd
from my_project.assets import cleaned_events

def test_cleaned_events_drops_nulls():
    raw = pd.DataFrame({
        "occurred_at": ["2026-01-01", None, "2026-01-03"],
        "user_id": [1, 2, 3],
    })
    result = cleaned_events(raw)
    assert len(result) == 2
    assert result["user_id"].tolist() == [1, 3]

def test_cleaned_events_parses_date():
    raw = pd.DataFrame({
        "occurred_at": ["2026-01-15"],
        "user_id": [1],
    })
    result = cleaned_events(raw)
    assert result["event_date"].iloc[0].year == 2026`}
          </pre>
          <p>
            No mocking. No special test runners. Standard pytest. This is one of the biggest practical advantages of Dagster for teams that take pipeline testing seriously.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            When to Pick Each
          </h2>
          <p>
            <strong>Choose Airflow when:</strong> your team already has Airflow running and the operational knowledge is in place. Migrating to a different orchestrator has real costs. The existing Airflow deployment handles your current scale adequately. You need to hire data engineers and want a tool most candidates already know. Your use case is primarily workflow orchestration (running scripts, triggering jobs) rather than data asset management.
          </p>
          <p>
            <strong>Choose Dagster when:</strong> you are building a new platform from scratch. Your team cares about testing and wants clean unit test coverage of pipeline logic. You want operational visibility at the data asset level without building custom dashboards. You are using dbt and want native integration with dbt assets in the same asset graph as your Python-defined assets. Your data platform has enough complexity that understanding freshness and lineage across assets is genuinely difficult with a task-centric model.
          </p>
          <p>
            My honest take: Dagster is the better tool for data platform work in 2026. The asset model maps more naturally to how data teams think about their work, the testing story is far superior, and the observability out of the box is excellent. The caveat is that it requires a genuine shift in how the team models their pipelines. If you have a team of three who know Airflow well and a platform that works, migrating is probably not worth the disruption. If you are starting fresh or rebuilding, I would default to Dagster.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Managed Options
          </h2>
          <p>
            Neither tool requires self-hosting anymore. Astronomer runs managed Airflow with good tooling (the Astro CLI for local development is genuinely excellent). Dagster Cloud (now Dagster+) handles the deployment and orchestration layer. For most teams without a dedicated platform team, the managed option for whichever tool you choose reduces the operational overhead significantly.
          </p>
          <p>
            The one area where self-hosted Airflow still wins: if you have very strict data residency requirements or need compute in a private VPC without any data leaving your environment. Both tools support hybrid architectures where the control plane is managed but execution happens in your infrastructure. It is worth understanding those deployment models before committing to either option.
          </p>
        </div>

        {/* Share section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
