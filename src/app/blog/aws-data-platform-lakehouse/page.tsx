import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Building a Modern Data Platform on AWS: S3, Glue, Athena, and the Lakehouse Pattern | Ryan Kirsch - Data Engineer",
  description:
    "A practitioner view of building a modern AWS lakehouse with S3, Glue, Athena, and Apache Iceberg. Lessons learned, cost tradeoffs, and dbt patterns from production builds.",
  openGraph: {
    title:
      "Building a Modern Data Platform on AWS: S3, Glue, Athena, and the Lakehouse Pattern | Ryan Kirsch - Data Engineer",
    description:
      "A practitioner view of building a modern AWS lakehouse with S3, Glue, Athena, and Apache Iceberg. Lessons learned, cost tradeoffs, and dbt patterns from production builds.",
    type: "article",
    url: "https://ryankirsch.dev/blog/aws-data-platform-lakehouse",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Building a Modern Data Platform on AWS: S3, Glue, Athena, and the Lakehouse Pattern | Ryan Kirsch - Data Engineer",
    description:
      "A practitioner view of building a modern AWS lakehouse with S3, Glue, Athena, and Apache Iceberg. Lessons learned, cost tradeoffs, and dbt patterns from production builds.",
  },
  alternates: { canonical: "/blog/aws-data-platform-lakehouse" },
};

export default function AwsDataPlatformLakehousePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/aws-data-platform-lakehouse"
  );
  const postTitle = encodeURIComponent(
    "Building a Modern Data Platform on AWS: S3, Glue, Athena, and the Lakehouse Pattern"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">&larr;</span>
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
              "AWS",
              "S3",
              "Glue",
              "Athena",
              "Lakehouse",
              "Apache Iceberg",
              "dbt",
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
            Building a Modern Data Platform on AWS: S3, Glue, Athena, and the
            Lakehouse Pattern
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            November 5, 2025 &middot; 8 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            I have built data platforms on every major cloud, and I still keep
            coming back to AWS for lakehouse style workloads. It is not because
            the tooling is the prettiest. It is because S3 is the most reliable,
            lowest friction storage layer in the market, and AWS has the widest
            ecosystem of engines, catalogs, and governance tools that can sit on
            top of it. The winning pattern I have seen is consistent: keep data
            in open formats on S3, use Glue as the catalog, query with Athena or
            whatever engine you need, and make Iceberg the transaction layer.
          </p>
          <p>
            This post is not a tutorial. It is the lessons I wish I had when I
            was wiring up production stacks. The good parts are real. The sharp
            edges are real too. If you are building or migrating to AWS, this is
            the set of tradeoffs that actually matter.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Why AWS Still Dominates Data Platform Builds
          </h2>
          <p>
            The first reason is cost. S3 is absurdly cheap for what it gives you,
            and it is the de facto standard for object storage across the
            industry. You do not have to fight it. Every engine can read it, and
            every vendor integrates with it. I have never lost sleep about S3
            durability, and that is not something I can say about many services.
          </p>
          <p>
            The second reason is ecosystem breadth. On AWS you can run Athena,
            Redshift, EMR, Glue, Lake Formation, and every open source engine you
            want with minimal friction. You can bring your own Trino cluster or
            use a managed service. You can use Snowflake on AWS and still keep
            the raw data in S3. It is the closest thing to neutral ground in the
            data stack.
          </p>
          <p>
            The third reason is that S3 has become a universal storage layer. I
            see teams treat S3 as the permanent system of record and warehouses
            as a temporary compute layer. That mindset makes architectural
            decisions easier. When the compute changes, the storage stays. That
            is the lakehouse promise, and on AWS it is actually feasible to run
            in production without heroics.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Lakehouse Pattern on AWS: S3, Athena, Glue
          </h2>
          <p>
            The lakehouse pattern is simple on paper: store data in object
            storage, use a catalog for metadata, and attach compute engines that
            read and write the same tables. On AWS, S3 is the storage layer,
            Glue is the catalog, and Athena is the default SQL engine. The magic
            is that this works without a warehouse when your use case is
            analytics and the data shape is predictable.
          </p>
          <p>
            Here is how I explain it to teams. S3 is the source of truth and the
            place where data lives forever. Glue is the index that makes those
            files discoverable, and Athena is the query engine you use for
            analysis and transformations. This pattern gives you separation of
            storage and compute, which means you are not paying for idle compute
            or locking your data into a proprietary format.
          </p>
          <p>
            It is not always elegant. Athena has query limits. Glue has quirks.
            S3 has eventual consistency edge cases in extreme write patterns.
            But for most data platforms, especially those with batch workloads,
            the tradeoffs are favorable. I would rather manage a few rough edges
            than pay for a warehouse that runs 24/7 at full price.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Apache Iceberg on S3
          </h2>
          <p>
            The missing piece for years was a transaction layer. If you store
            raw Parquet files in S3 without a table format, your lakehouse will
            eventually break. You need schema evolution, snapshot isolation, and
            a reliable way to delete and update data. Apache Iceberg solves that
            and has become the default for teams that want open storage without
            sacrificing correctness.
          </p>
          <p>
            Iceberg gives you the &ldquo;database feel&rdquo; on top of S3. Every
            write creates a new snapshot, and readers see a consistent view of
            the table. It handles column adds, renames, and type changes with
            explicit rules, which is how you survive real production schema
            drift. If you are new to Iceberg, my deeper dive is here:{" "}
            <Link
              href="/blog/apache-iceberg-open-lakehouse"
              className="text-electricBlue hover:text-white transition-colors"
            >
              Apache Iceberg and the Open Lakehouse
            </Link>
            .
          </p>
          <p>
            In practice, Iceberg makes Athena and Glue far more usable. Glue can
            store the Iceberg metadata, and Athena can query Iceberg tables with
            sane semantics. That combination turns S3 into something that
            behaves like a managed warehouse without the bill.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`CREATE TABLE analytics.orders_iceberg
WITH (
  table_type = 'ICEBERG',
  format = 'PARQUET',
  location = 's3://my-data-lake/analytics/orders_iceberg/',
  partitioning = ARRAY['day(order_ts)']
) AS
SELECT
  order_id,
  customer_id,
  order_total,
  order_ts
FROM staging.orders_raw
WHERE order_ts >= DATE '2026-01-01';`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            How dbt and Athena Work Together
          </h2>
          <p>
            dbt is where the lakehouse becomes a real platform. Athena is good
            at ad hoc SQL, but dbt gives you structure, tests, documentation,
            and repeatable deployments. When I see teams struggling with Athena,
            it is usually because they are treating it like a notebook engine
            instead of a production SQL layer.
          </p>
          <p>
            The dbt Athena adapter has matured enough that you can run a serious
            transformation layer on it. The key is to use Iceberg backed tables
            for your models, partition aggressively, and keep your staging layer
            lean. I treat dbt as the contract between raw S3 data and curated
            Iceberg tables. If you want the patterns I use for dbt structure and
            CI, I wrote those up here:{" "}
            <Link
              href="/blog/dbt-in-production"
              className="text-electricBlue hover:text-white transition-colors"
            >
              dbt in Production
            </Link>
            .
          </p>
          <p>
            Here is a model level config that has served me well for Athena plus
            Iceberg. It creates a table that is append friendly, partitioned for
            scan efficiency, and stored in Parquet for compression:
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`{{
  config(
    materialized = 'table',
    table_type = 'iceberg',
    format = 'parquet',
    partitioned_by = ['day(order_ts)'],
    s3_data_dir = 's3://my-data-lake/analytics/dbt/orders/'
  )
}}

select
  order_id,
  customer_id,
  order_total,
  order_ts
from {{ ref('stg_orders') }}`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Cost Optimization: When Athena Beats Redshift
          </h2>
          <p>
            The biggest reason teams pick Athena is cost. It is pay per query
            and scales to zero. Redshift is provisioned, so you pay to keep
            nodes warm even when you are not querying. For spiky analytics
            workloads, that difference is massive. I have seen monthly costs
            drop by an order of magnitude just by moving low concurrency BI
            workloads from Redshift to Athena.
          </p>
          <p>
            The tradeoff is that Athena charges by data scanned. If your queries
            are sloppy, you pay for every byte read. The fix is discipline:
            partition on the columns you filter, store in columnar formats like
            Parquet, and never select star from a wide table unless you need it.
            I treat scan efficiency as a product requirement. It is cheaper to
            design well than to pay for waste every day.
          </p>
          <p>
            Redshift still wins when you need high concurrency, complex joins at
            scale, or consistent low latency for BI dashboards. But for many
            teams, Athena is good enough and far cheaper. I like to start with
            Athena, measure actual query patterns, and only move to Redshift if
            the workload proves it is necessary. That ordering keeps cost honest.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Practical Schema Evolution Gotchas
          </h2>
          <p>
            Schema evolution is where the lakehouse either shines or collapses.
            Glue is a catalog, not a database. It stores table metadata, but it
            does not enforce correctness. If you let every pipeline write its
            own schema changes, you will eventually end up with conflicting
            definitions and painful downstream failures.
          </p>
          <p>
            Iceberg helps because schema changes are explicit. You can add
            columns, rename them, and change types with rules that keep old
            snapshots readable. But Glue does not version schemas the way a
            database does, and you can accidentally register a new schema that
            does not match the data you already have in S3. The fix is to treat
            schema changes as code. Manage them in dbt or a migration process,
            and keep the Glue catalog in lock step.
          </p>
          <p>
            The biggest gotcha I see is Hive style schemas that encode partition
            values in path names. That approach breaks when you evolve
            partitions. Iceberg avoids that by storing partition values in
            metadata instead of file paths. If you are moving from Hive tables
            to Iceberg, plan the migration carefully and avoid mixing the two
            patterns in the same dataset.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`aws glue create-database \
  --database-input '{"Name":"analytics"}'

aws glue create-table \
  --database-name analytics \
  --table-input file://glue/iceberg-orders.json`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Production Tips and Lessons Learned
          </h2>
          <p>
            Treat S3 layout like an API. If you change prefixes or directory
            structures, you are breaking consumers. I keep raw, staging, and
            curated prefixes separate and version them if needed. Naming and
            structure matter more than most teams expect.
          </p>
          <p>
            Monitor your Iceberg metadata. Snapshot counts, manifest sizes, and
            file counts grow faster than you think. You need compaction and
            snapshot expiration jobs on a schedule. I treat those as core
            platform tasks, not optional housekeeping.
          </p>
          <p>
            Make Glue the single source of truth for metadata, but do not let it
            become a dumping ground. Curate the catalog. Enforce naming
            conventions. Delete stale tables. Glue is only as good as the data
            contracts you enforce on top of it.
          </p>
          <p>
            Finally, resist the urge to chase a single perfect engine. Athena is
            great for many workloads, but it is not everything. Use it for
            ad hoc analysis, dbt transformations, and lightweight BI. Use a
            warehouse if you need hard performance guarantees. The lakehouse is
            about flexibility, not ideology.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">Closing</h2>
          <p>
            The modern AWS data platform is not about finding a single managed
            service to do everything. It is about composing simple primitives
            into a system that is cheap, reliable, and adaptable. S3 plus Glue
            plus Athena plus Iceberg is the most effective stack I have seen for
            that goal.
          </p>
          <p>
            If you are building on AWS, start with the lakehouse pattern and
            keep your options open. The moment you lock into a closed system,
            you lose the leverage that makes S3 so valuable. The good news is
            that this architecture is now mature enough to run real production
            workloads without heroics. I have done it, and I would do it again.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <h2 className="text-xl font-semibold text-white">Keep Reading</h2>
            <p className="text-sm text-mutedGray leading-relaxed">
              If you want to go deeper on the open lakehouse and dbt patterns,
              these two posts pair well with this one.
            </p>
            <div className="flex gap-3">
              <Link
                href="/blog/apache-iceberg-open-lakehouse"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Apache Iceberg and the Open Lakehouse
              </Link>
              <Link
                href="/blog/dbt-in-production"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                dbt in Production
              </Link>
            </div>
          </div>

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
