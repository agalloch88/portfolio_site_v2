import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Python for Data Engineers: pandas, PySpark, Polars, and the Modern Python Data Stack",
  description:
    "A practical guide to the Python data engineering toolbox, from pandas basics to PySpark scale and Polars speed. Learn how to choose the right engine, wire up the supporting libraries, and ship reliable pipelines.",
  openGraph: {
    title: "Python for Data Engineers: pandas, PySpark, Polars, and the Modern Python Data Stack",
    description:
      "A practical guide to the Python data engineering toolbox, from pandas basics to PySpark scale and Polars speed. Learn how to choose the right engine, wire up the supporting libraries, and ship reliable pipelines.",
    type: "article",
    url: "https://ryankirsch.dev/blog/python-data-engineering-stack",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python for Data Engineers: pandas, PySpark, Polars, and the Modern Python Data Stack",
    description:
      "A practical guide to the Python data engineering toolbox, from pandas basics to PySpark scale and Polars speed. Learn how to choose the right engine, wire up the supporting libraries, and ship reliable pipelines.",
  },
  alternates: { canonical: "/blog/python-data-engineering-stack" },
};

export default function PythonDataEngineeringStackPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/python-data-engineering-stack");
  const postTitle = encodeURIComponent(
    "Python for Data Engineers: pandas, PySpark, Polars, and the Modern Python Data Stack"
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
            {[
              "Python",
              "pandas",
              "PySpark",
              "Polars",
              "Data Engineering",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Python for Data Engineers: pandas, PySpark, Polars, and the Modern
            Python Data Stack
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            July 2025 · 10 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Python became the lingua franca of data engineering for one reason:
            ecosystem breadth. It won because every layer of the stack, from
            orchestration to storage to ML, exposed a Python interface that was
            easy to adopt. Speed did not make it the default, community momentum
            did. Spark, Airflow, dbt, Dagster, Prefect, and DuckDB all treat
            Python as a first class API, which means most teams can standardize
            on one language for data work and keep velocity high.
          </p>

          <p>
            That ecosystem is now mature enough that you can design a full data
            platform without leaving Python. A production pipeline might read
            Parquet with PyArrow, validate inputs with Pydantic, transform with
            Polars, orchestrate with Dagster, and publish metrics to a warehouse
            through SQLAlchemy. The question is not whether Python can do the
            job, it is which tools inside the Python ecosystem are the right fit
            for each stage of the job.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            pandas fundamentals and when it breaks down
          </h2>
          <p>
            pandas is the default DataFrame library for a reason. It has the
            cleanest ergonomics for exploratory work, and it is the best way to
            express row and column operations quickly. The API is intuitive for
            anyone who has written SQL or used spreadsheets. You should be able
            to read data, filter it, aggregate it, and join it without thinking.
          </p>

          <p className="font-medium text-white mt-4">Core DataFrame patterns</p>
          <p>
            These are the operations that show up constantly in production
            scripts and pipelines: reading Parquet and CSV, filtering, grouping,
            and merges. Keep them fluid:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import pandas as pd

# Read data
orders = pd.read_parquet("s3://warehouse/orders.parquet")
users = pd.read_csv("/data/users.csv")

# Filter and select
recent = orders.loc[orders["created_at"] >= "2025-01-01", ["order_id", "user_id", "total"]]

# Group and aggregate
daily = (
    recent.assign(day=recent["created_at"].str.slice(0, 10))
    .groupby("day", as_index=False)
    .agg(total_revenue=("total", "sum"), order_count=("order_id", "count"))
)

# Join
result = daily.merge(users[["user_id", "plan"]], on="user_id", how="left")`}
          </pre>

          <p className="font-medium text-white mt-4">Where pandas breaks</p>
          <p>
            pandas loads everything into memory. If your dataset is larger than
            RAM, you will hit an out of memory error or your machine will thrash
            itself into unusable swap. The rule of thumb is simple: you need 5
            to 10x the dataset size in RAM for comfortable pandas work. That
            buffer accounts for intermediate copies, groupby state, and join
            fan out. If you have a 10GB Parquet dataset, you often need 50GB to
            100GB of memory to manipulate it safely in pandas.
          </p>
          <p>
            That limitation does not make pandas bad, it just makes it the wrong
            tool for medium to large data. When data grows beyond memory, you
            need to either move to a more efficient engine on the same machine
            or go distributed.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            PySpark for distributed processing
          </h2>
          <p>
            PySpark exists for the point where a single machine is no longer
            enough. Spark is a distributed execution engine, and PySpark is the
            Python interface to it. The win is scale and fault tolerance. The
            cost is more complexity, more operational overhead, and a steeper
            learning curve. In practice, PySpark starts to make sense when your
            datasets are too big for local memory, or when you already operate a
            Spark cluster for other workloads.
          </p>
          <p>
            A practical breakpoint is around 50GB of raw data. You can sometimes
            stretch a single machine with Polars, DuckDB, or Arrow beyond that,
            but at some point the operational safety of distributed compute wins.
          </p>

          <p className="font-medium text-white mt-4">A minimal PySpark job</p>
          <p>
            The core loop is always the same: read, transform, aggregate, write.
            Keep the I/O and transformation separate so the job is testable and
            the execution plan stays clear.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("orders").getOrCreate()

orders = spark.read.parquet("s3://warehouse/orders/")

result = (
    orders.filter(F.col("status") == "completed")
    .groupBy("customer_id")
    .agg(
        F.count("order_id").alias("order_count"),
        F.sum("total").alias("lifetime_value"),
    )
)

result.write.mode("overwrite").parquet("s3://warehouse/analytics/customer_ltv/")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Polars: the modern alternative
          </h2>
          <p>
            Polars is the modern in memory DataFrame engine for Python. It is
            written in Rust, it uses lazy execution, and it is fast enough to
            make pandas feel outdated for many workloads. If you want a single
            machine tool that scales to tens of gigabytes, this is it. It also
            has a strong expression API that reduces the need for row wise
            Python logic, which is the primary source of slowness in pandas.
          </p>
          <p>
            For most teams, Polars is the sweet spot for 1GB to 50GB datasets on
            a developer laptop. It uses less memory, parallelizes operations,
            and can push predicate filters into file scans. That gives it a real
            performance advantage without the operational cost of Spark.
          </p>

          <p className="font-medium text-white mt-4">Polars vs pandas example</p>
          <p>
            The operations are nearly identical, but Polars encourages you to
            stay within its expression engine. That pays off when you chain
            multiple transforms:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import pandas as pd
import polars as pl

# pandas
p_df = pd.read_parquet("/data/orders.parquet")
summary_pd = (
    p_df[p_df["status"] == "completed"]
    .groupby("customer_id", as_index=False)
    .agg(order_count=("order_id", "count"), revenue=("total", "sum"))
)

# Polars
pl_df = pl.read_parquet("/data/orders.parquet")
summary_pl = (
    pl_df.lazy()
    .filter(pl.col("status") == "completed")
    .groupby("customer_id")
    .agg(
        pl.count("order_id").alias("order_count"),
        pl.sum("total").alias("revenue"),
    )
    .collect()
)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            When to use what: decision framework
          </h2>
          <p>
            There is no perfect tool, only the right tool for your data size and
            operational constraints. Use this decision framework to avoid
            over engineering.
          </p>

          <p className="font-medium text-white mt-4">Quick comparison</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`Tool     | Best for data size | Strengths                          | When it fails
pandas   | < 1GB              | Fast iteration, rich API             | Memory bound, slow on big joins
Polars   | 1GB to 50GB         | Fast, lazy execution, low memory     | Single machine limit
PySpark  | 50GB+               | Distributed compute, fault tolerant  | Operational overhead, slower dev loop`}
          </pre>

          <p className="font-medium text-white mt-4">Decision rules</p>
          <p>
            pandas is best when you are exploring data, writing quick scripts,
            or doing small batch transforms under 1GB. Polars is the upgrade
            when you need production grade local processing, larger files, or
            real performance. PySpark is for data above 50GB, existing Spark
            infrastructure, or workflows that already live in the Spark
            ecosystem. If you are on the fence between Polars and PySpark, start
            with Polars. It will get you 80 percent of the value with 20 percent
            of the complexity.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The supporting cast: key Python libraries
          </h2>
          <p>
            Data engineering is not just DataFrames. You need stable database
            connections, validation, and reliable I/O. These libraries show up
            everywhere in production stacks.
          </p>

          <p className="font-medium text-white mt-4">SQLAlchemy for databases</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from sqlalchemy import create_engine, text

engine = create_engine("postgresql+psycopg2://user:pass@host:5432/warehouse")

with engine.begin() as conn:
    conn.execute(text("""
        create table if not exists metrics.daily_revenue (
            day date primary key,
            revenue numeric
        )
    """))
    conn.execute(
        text("insert into metrics.daily_revenue (day, revenue) values (:day, :rev)"),
        [{"day": "2025-07-01", "rev": 12540.50}],
    )`}
          </pre>

          <p className="font-medium text-white mt-4">Pydantic for contracts</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from pydantic import BaseModel, Field
from datetime import datetime

class OrderEvent(BaseModel):
    order_id: str
    user_id: str
    total: float = Field(gt=0)
    created_at: datetime

payload = {"order_id": "o1", "user_id": "u1", "total": 42.5, "created_at": "2025-07-01T12:34:00"}
validated = OrderEvent.model_validate(payload)`}
          </pre>

          <p className="font-medium text-white mt-4">httpx for async APIs</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import httpx

async def fetch_rates():
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get("https://api.exchangerate.host/latest?base=USD")
        resp.raise_for_status()
        return resp.json()["rates"]

rates = asyncio.run(fetch_rates())`}
          </pre>

          <p className="font-medium text-white mt-4">Orchestration hooks</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`# Airflow
from airflow.decorators import task

@task
def build_daily_metrics():
    return "metrics-ready"

# Dagster
from dagster import asset

@asset
def daily_metrics():
    return "metrics-ready"

# Prefect
from prefect import task

@task
def daily_metrics_prefect():
    return "metrics-ready"`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Type hints and testing in DE workflows
          </h2>
          <p>
            Most data bugs are input shape bugs. Python type hints reduce the
            risk by making contracts explicit and verifiable. mypy or pyright
            can catch missing fields, wrong types, and illegal return values
            before the pipeline ever runs.
          </p>

          <p className="font-medium text-white mt-4">Type hints on pipeline code</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from typing import Iterable
import pandas as pd

class MetricRow(dict):
    pass

def build_metrics(rows: Iterable[MetricRow]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    return df[["day", "revenue", "orders"]]`}
          </pre>

          <p className="font-medium text-white mt-4">Testing with pytest</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import pandas as pd

def test_build_metrics():
    rows = [
        {"day": "2025-07-01", "revenue": 100.0, "orders": 2},
        {"day": "2025-07-02", "revenue": 200.0, "orders": 3},
    ]
    df = build_metrics(rows)
    assert list(df.columns) == ["day", "revenue", "orders"]
    assert df["revenue"].sum() == 300.0`}
          </pre>

          <p className="font-medium text-white mt-4">Data quality with Great Expectations</p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import great_expectations as ge

ge_df = ge.from_pandas(pd.DataFrame({"order_id": ["o1", "o2"], "total": [10.0, 0.0]}))

ge_df.expect_column_values_to_not_be_null("order_id")
ge_df.expect_column_values_to_be_between("total", min_value=0.01)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">Closing thoughts</h2>
          <p>
            Python is not getting weaker as a data engineering language, it is
            getting stronger. Polars and DuckDB are proof that the community is
            willing to solve its own performance problems. The best part is that
            you can adopt these tools incrementally without rewriting your stack.
          </p>
          <p>
            If you are building a modern data platform today, the winning move
            is to stay fluent in the ecosystem and choose the right execution
            engine for the job. pandas for speed of thought, Polars for fast
            local compute, PySpark for distributed scale. The stack is cohesive
            and it keeps improving.
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
