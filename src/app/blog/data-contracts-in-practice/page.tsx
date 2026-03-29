import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Contracts in Practice: How to Stop Breaking Downstream Teams | Ryan Kirsch",
  description:
    "A practical guide to data contracts: schema guarantees, ownership, freshness expectations, producer-consumer agreements, and how to implement contracts without turning the data team into process police.",
  openGraph: {
    title: "Data Contracts in Practice: How to Stop Breaking Downstream Teams",
    description:
      "A practical guide to data contracts: schema guarantees, ownership, freshness expectations, producer-consumer agreements, and how to implement contracts without turning the data team into process police.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-contracts-in-practice",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Contracts in Practice: How to Stop Breaking Downstream Teams",
    description:
      "A practical guide to data contracts: schema guarantees, ownership, freshness expectations, producer-consumer agreements, and how to implement contracts without turning the data team into process police.",
  },
  alternates: { canonical: "/blog/data-contracts-in-practice" },
};

export default function DataContractsInPracticePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/data-contracts-in-practice");
  const postTitle = encodeURIComponent("Data Contracts in Practice: How to Stop Breaking Downstream Teams");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Governance</span>
            <span className="text-sm text-gray-500">March 6, 2026</span>
            <span className="text-sm text-gray-500">9 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Data Contracts in Practice: How to Stop Breaking Downstream Teams
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Most data breakages are not mysterious. Someone upstream changed something without realizing who depended on it. Data contracts are the discipline of making those expectations explicit before the break happens.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data contracts are one of those ideas that sound more abstract than they really are. At their core, they are simply explicit agreements between data producers and consumers: what fields exist, what they mean, how often the data arrives, who owns it, and what kinds of changes are allowed without coordination.
          </p>
          <p>
            The reason they matter is painfully practical. A source team renames a field. A timestamp changes from UTC to local time. A nullable field quietly stops being nullable. A table that used to arrive by 7:00 AM now arrives at 10:00 AM because the producer reworked their job schedule. Downstream dashboards break, machine learning features drift, reverse ETL syncs send nonsense, and the data team becomes the one holding the bag even when the underlying change did not originate there.
          </p>
          <p>
            Data contracts are how you reduce that chaos without forcing every upstream team into bureaucratic paralysis.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What a Data Contract Actually Covers</h2>
          <p>
            A useful data contract usually includes five things:
          </p>
          <ul>
            <li><strong>Schema expectations:</strong> field names, types, nullability, and primary identifiers</li>
            <li><strong>Semantic definitions:</strong> what a field actually means in business terms</li>
            <li><strong>Freshness and delivery expectations:</strong> when the data should arrive and how often</li>
            <li><strong>Ownership:</strong> who maintains the producer side and who consumes it downstream</li>
            <li><strong>Change policy:</strong> what counts as a breaking change and how it must be communicated</li>
          </ul>
          <p>
            That is it. Not a giant policy binder. Not a 14-step approval workflow. Just the minimum clarity required so downstream teams are not forced to reverse engineer expectations from a table they do not own.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`Example contract

Dataset: app.events.signup_events
Owner: Growth Engineering
Consumers: Analytics Engineering, Lifecycle Marketing

Fields:
- user_id STRING, non-null
- signup_timestamp TIMESTAMP, UTC, non-null
- acquisition_channel STRING, nullable
- campaign_id STRING, nullable

SLO:
- Delivered to warehouse within 15 minutes of event creation, 99% of the time

Breaking changes:
- Renaming/removing any field
- Changing timestamp timezone semantics
- Delaying delivery by more than 30 minutes

Notification policy:
- Minimum 7 days notice in #data-changes`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contracts Are About Interfaces, Not Central Control</h2>
          <p>
            The biggest misconception about data contracts is that they are a governance mechanism for the data team to control everyone else. That framing is why some teams reject them on contact. Nobody wants a platform group turning into process police.
          </p>
          <p>
            The more useful framing is that contracts are interface definitions. They let producer teams move faster because consumers know what is stable and what is not. Good interfaces reduce coordination overhead. Bad or missing interfaces increase it because every change becomes a surprise integration test in production.
          </p>
          <p>
            If your company already understands API contracts, data contracts are the same concept adapted to datasets and event streams. Nobody thinks a service boundary should be undocumented and change arbitrarily. Data boundaries deserve the same respect.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Where Contracts Help Most</h2>
          <p>
            Contracts are most valuable at producer-consumer boundaries where the teams are distinct and the blast radius is significant. Common high-value places:
          </p>
          <ul>
            <li>application event streams consumed by the warehouse</li>
            <li>source-owned operational tables feeding analytics models</li>
            <li>published marts feeding reverse ETL or ML features</li>
            <li>external data feeds from vendors or partners</li>
          </ul>
          <p>
            They are less important for entirely internal transformations within a single analytics engineering team, where code review, tests, and lineage often provide enough protection. The farther a dependency crosses team boundaries, the more explicit the contract should become.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How to Implement Without Overdoing It</h2>
          <p>
            The lightweight path works best:
          </p>
          <ol>
            <li>Start with a small set of critical datasets.</li>
            <li>Document fields, ownership, and freshness expectations in version control.</li>
            <li>Add automated checks for schema drift and delivery lag.</li>
            <li>Define what requires notice and where the notice happens.</li>
            <li>Review after incidents and refine based on actual pain.</li>
          </ol>
          <p>
            This is intentionally boring. That is good. Contracts fail when they become lofty governance theater disconnected from real producer workflows. A markdown spec, a YAML schema file, dbt metadata, or protobuf/Avro schema registry entry is often enough if the change rules are clear and the checks are automated.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Automation Is What Makes the Contract Real</h2>
          <p>
            A contract that only exists in a wiki is not a contract. It is a wish. The producer or ingestion layer needs some form of enforcement or detection.
          </p>
          <p>
            That can mean schema validation on event streams, dbt source tests on landed tables, warehouse metadata checks for nullability drift, or CI warnings when a published model changes its exposed schema. The contract becomes operational only when deviations trigger something concrete.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`version: 2
sources:
  - name: growth_app
    tables:
      - name: signup_events
        columns:
          - name: user_id
            data_type: string
            tests:
              - not_null
          - name: signup_timestamp
            data_type: timestamp
            tests:
              - not_null
              - freshness:
                  warn_after: {count: 10, period: minute}
                  error_after: {count: 30, period: minute}`}
          </pre>
          <p>
            Enforcement does not have to block everything. Sometimes a warning is enough. Sometimes a producer can make a change as long as they communicate it. The important part is that the system recognizes the contract boundary and treats deviations as meaningful events instead of normal background noise.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Breaking Changes Need a Social Protocol</h2>
          <p>
            The hardest part of contracts is usually social, not technical. Teams need a shared understanding of what counts as breaking and how changes should be communicated. Schema changes are obvious. Semantic changes are trickier. If the field name stays the same but the business rule changes, that is often more dangerous than a rename because downstream systems keep running while becoming wrong.
          </p>
          <p>
            That is why good contract practice includes a communication path: a data changes channel, a changelog, versioned producer documentation, or change notices in pull requests that affect published assets. The goal is not ceremony. It is predictable coordination.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Real Payoff</h2>
          <p>
            The real benefit of data contracts is not perfect stability. It is fewer surprise failures, faster debugging when something does change, and cleaner ownership boundaries between teams. Consumers gain confidence. Producers gain clarity. The data team spends less time mediating damage from silent upstream changes.
          </p>
          <p>
            When contracts work, nobody talks about them much. Things simply stop breaking in stupid ways. That is about as good an outcome as you can ask for in data platform work.
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
