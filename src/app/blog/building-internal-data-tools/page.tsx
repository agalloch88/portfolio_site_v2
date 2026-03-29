import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building Internal Data Tools: When to Build, When to Buy, and How to Ship | Ryan Kirsch",
  description:
    "A practical guide to building internal data tools: choosing between off-the-shelf and custom, when internal builds create leverage, tech stack choices, iteration patterns, and how to avoid the abandoned dashboard graveyard.",
  openGraph: {
    title: "Building Internal Data Tools: When to Build, When to Buy, and How to Ship",
    description:
      "A practical guide to building internal data tools: choosing between off-the-shelf and custom, when internal builds create leverage, tech stack choices, iteration patterns, and how to avoid the abandoned dashboard graveyard.",
    type: "article",
    url: "https://ryankirsch.dev/blog/building-internal-data-tools",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Building Internal Data Tools: When to Build, When to Buy, and How to Ship",
    description:
      "A practical guide to building internal data tools: choosing between off-the-shelf and custom, when internal builds create leverage, tech stack choices, iteration patterns, and how to avoid the abandoned dashboard graveyard.",
  },
  alternates: { canonical: "/blog/building-internal-data-tools" },
};

export default function BuildingInternalDataToolsPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/building-internal-data-tools");
  const postTitle = encodeURIComponent("Building Internal Data Tools: When to Build, When to Buy, and How to Ship");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Engineering</span>
            <span className="text-sm text-gray-500">March 13, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Building Internal Data Tools: When to Build, When to Buy, and How to Ship
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Internal data tools can create compounding leverage or become the abandoned dashboards nobody opens. The difference is usually in how the decision to build was made in the first place.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Every data team eventually faces the internal tool question. The existing BI tool does not quite do what the operations team needs. The data warehouse is hard to query for non-SQL users. A specific workflow needs data surfaced in a way no commercial product handles well. The answer is often to build something, but building internal tools is one of the higher-leverage and higher-risk investments a small team can make.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When Building Makes Sense</h2>
          <p>
            Internal tools earn their maintenance cost when they eliminate a recurring friction that no existing product addresses at the right price or in the right way. Good candidates share a few properties:
          </p>
          <ul>
            <li>The workflow is repetitive and currently painful</li>
            <li>The domain knowledge required to build it already exists in-house</li>
            <li>No commercial option does exactly what is needed without significant workaround</li>
            <li>The audience is defined and stable, not everyone-potentially</li>
            <li>The value compounds with use rather than decaying as interest wanes</li>
          </ul>
          <p>
            Poor candidates are tools built to solve a one-time analysis need, tools that duplicate existing BI capabilities with a nicer skin, and tools whose primary purpose is demonstrating that the data team can write code.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Maintenance Reality Check</h2>
          <p>
            Every internal tool you build becomes permanent infrastructure the moment someone depends on it. That means ongoing maintenance, bug fixes, upstream data schema changes that break the tool, user support, and eventually migration or decommission costs.
          </p>
          <p>
            A rough rule: internal tools should only be built if the team can commit to maintaining them at roughly 20% of the initial build cost annually. If a tool takes two weeks to build, it will need roughly two days of maintenance per year at minimum. If the team cannot absorb that, the tool will become the abandoned dashboard graveyard, which damages data team credibility more than not having built it at all.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Buy First, Build When Buying Fails</h2>
          <p>
            The right default is to buy. Commercial products exist for most common data tool needs: BI and dashboards, data cataloging, reverse ETL, data quality monitoring, orchestration, ingestion. The maturity gap between a commercial product and a hastily built internal tool is significant, and the build-vs-buy decision often underestimates the ongoing cost of maintaining the internal version.
          </p>
          <p>
            The build case strengthens when:
          </p>
          <ul>
            <li>commercial options require significant customization to meet the core need</li>
            <li>the workflow is so specific to your company that no generic product will ever fit</li>
            <li>the commercial option is cost-prohibitive relative to the value delivered</li>
            <li>the internal build can be simpler and more maintainable than a configured external product</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Technology Choices for Internal Tools</h2>
          <p>
            The right stack for an internal data tool prioritizes maintenance simplicity over technical impressiveness. The people who will maintain the tool six months from now need to understand it. Common patterns that hold up well:
          </p>
          <p>
            <strong>Python + Streamlit or Gradio</strong> for rapid analytics apps. Low overhead, deployable in minutes, easy to maintain for a data-adjacent team. Best for internal tools with moderate complexity and primarily analytical workflows.
          </p>
          <p>
            <strong>FastAPI + simple frontend</strong> for tools that need a proper API boundary. Appropriate when the tool will be consumed by other systems or needs clear separation between data layer and presentation.
          </p>
          <p>
            <strong>dbt + BI tool</strong> for dashboards. Resist the urge to build a custom dashboard when a well-modeled mart and a Looker or Metabase dashboard will do the same job with less maintenance burden.
          </p>
          <p>
            <strong>Observable or Jupyter converted to app</strong> for exploratory tools that need to be shared. Lower investment than a full app, appropriate for internal use cases that do not need production reliability.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`# Example Streamlit app structure for an internal data tool
import streamlit as st
import pandas as pd
from datetime import date, timedelta
from sqlalchemy import create_engine

st.set_page_config(page_title="Revenue Monitor", layout="wide")
st.title("Daily Revenue Monitor")

@st.cache_data(ttl=3600)
def load_daily_revenue(start_date: date, end_date: date):
    engine = create_engine("snowflake://...")
    query = """
        SELECT order_date, SUM(net_revenue) as revenue
        FROM mart_daily_revenue
        WHERE order_date BETWEEN :start AND :end
        GROUP BY order_date ORDER BY order_date
    """
    return pd.read_sql(query, engine, params={
        "start": start_date, "end": end_date
    })

col1, col2 = st.columns(2)
start = col1.date_input("Start", date.today() - timedelta(days=30))
end = col2.date_input("End", date.today())

df = load_daily_revenue(start, end)
st.line_chart(df.set_index("order_date")["revenue"])`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How to Ship Without Getting Stuck</h2>
          <p>
            Internal tools are most likely to succeed when they are shipped early and iterated based on real use. The failure mode is spending three months building a comprehensive tool that turns out to miss what users actually needed because nobody asked until it was done.
          </p>
          <p>
            A practical approach: define the simplest version that creates real value for the identified users. Build that in one to two weeks. Put it in front of users immediately. Watch how they use it. Build the next layer based on observed behavior, not hypothesized requirements.
          </p>
          <p>
            Internal tools have a significant advantage over external product development: you have direct access to the users. Exploit that. Sit next to someone using the tool for an hour. The friction points that matter will become obvious faster than any ticket-based feedback process.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Avoiding the Abandoned Dashboard Problem</h2>
          <p>
            Most internal data tools die from one of four causes: the underlying data model changes and breaks the tool, ownership becomes unclear when the original builder moves on, usage is lower than expected and the tool never gets the iteration it needed to become genuinely useful, or the tool becomes too expensive to maintain relative to the value it delivers.
          </p>
          <p>
            Mitigations for each:
          </p>
          <ul>
            <li>Design tools against stable mart tables, not raw or staging models</li>
            <li>Document ownership explicitly before launch, not after</li>
            <li>Set a 90-day usage review: if adoption is not there, retire or redesign rather than maintain a ghost tool</li>
            <li>Keep scope minimal and resist feature creep during initial build</li>
          </ul>
          <p>
            The best internal tools are boring. They do one thing well, are easy to understand, and do not require heroics to maintain. Impressive tools that nobody uses are an expensive form of technical debt.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Leverage Multiplier</h2>
          <p>
            When internal tools work, they create compounding value. A well-designed tool that saves an operations team two hours per week creates 100 hours per year of leverage. A tool that surfaces the right data at the right moment changes decisions that would otherwise be made on intuition. A tool that surfaces anomalies before stakeholders see them changes the data team from reactive to proactive.
          </p>
          <p>
            That leverage is why it is worth building internal tools when the conditions are right. The conditions being: a specific user with a specific problem, a stable data foundation to build on, and a team that can commit to maintaining what they ship.
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
