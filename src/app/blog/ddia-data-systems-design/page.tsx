import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Designing Data Systems That Don't Break: Lessons from DDIA | Ryan Kirsch",
  description:
    "A practical, interview-focused guide to DDIA for senior data engineers: reliability, scalability, maintainability, replication, partitioning, consistency, and Netflix-style system design prompts.",
  openGraph: {
    title: "Designing Data Systems That Don't Break: Lessons from DDIA",
    description:
      "A practical, interview-focused guide to DDIA for senior data engineers: reliability, scalability, maintainability, replication, partitioning, consistency, and Netflix-style system design prompts.",
    type: "article",
    url: "https://ryankirsch.dev/blog/ddia-data-systems-design",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Designing Data Systems That Don't Break: Lessons from DDIA",
    description:
      "A practical, interview-focused guide to DDIA for senior data engineers: reliability, scalability, maintainability, replication, partitioning, consistency, and Netflix-style system design prompts.",
  },
  alternates: { canonical: "/blog/ddia-data-systems-design" },
};

export default function DdiaDataSystemsDesignPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/ddia-data-systems-design");
  const postTitle = encodeURIComponent("Designing Data Systems That Don't Break: Lessons from DDIA");

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
              Architecture
            </span>
            <span className="text-sm text-gray-500">March 28, 2026</span>
            <span className="text-sm text-gray-500">11 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Designing Data Systems That Don&apos;t Break: Lessons from DDIA
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Martin Kleppmann&apos;s Designing Data-Intensive Applications (DDIA) is the book
            senior data engineers cite when interviews move past tools and into tradeoffs.
            This is the practical version: how to apply the core ideas to Kafka, Spark,
            Snowflake, and lakehouse platforms when you&apos;re aiming for L4/L5 system design.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            1. Why DDIA matters for data engineers (not just backend engineers)
          </h2>
          <p>
            Most data engineers already build distributed systems, we just call them
            pipelines. Kafka consumers, Spark jobs, Snowflake warehouses, Iceberg tables,
            and CDC feeds are all distributed data systems with failure modes. DDIA helps
            you reason about those failure modes with a clean vocabulary: replication
            lag, consistency, isolation, backpressure, partition tolerance, and the
            difference between correctness and availability.
          </p>
          <p>
            The interview angle: senior system design is not about showing off a tech
            stack. It is about showing you understand where systems break. If you can
            translate DDIA concepts into practical pipeline decisions, you separate
            yourself from candidates who only know the tools by name.
          </p>
          <p>
            For L4/L5 roles, the interviewer expects you to lead the discussion: define
            SLAs, ask about reprocessing windows, and call out the business impact of
            delays. DDIA gives you the language to do that cleanly. Instead of saying
            &quot;we will use Kafka,&quot; you explain how replication, ordering, and consumer
            independence protect reliability and speed up recovery.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            2. The 3 core problems: Reliability, Scalability, Maintainability
          </h2>
          <p>
            DDIA frames data systems around three problems. If you anchor your design
            around these, you sound senior immediately.
          </p>
          <p>
            <strong>Reliability:</strong> Will the system keep doing the right thing
            under failures? For data platforms, this means replay support, idempotent
            writes, schema evolution that does not silently corrupt downstream tables,
            and runbooks that are not tribal knowledge.
          </p>
          <p>
            <strong>Scalability:</strong> Can the system handle 10x more data or users
            without a redesign? In practice, this is about partitioning strategy, hot
            keys, shuffle size, and a plan for backfills that do not starve production.
          </p>
          <p>
            <strong>Maintainability:</strong> Can a new engineer change the system without
            fear? That is naming conventions, layered models, clear ownership, and
            avoiding bespoke one-off pipelines that cannot be reasoned about.
          </p>
          <p>
            These are not abstract values. If you have ever shipped a pipeline that
            only one person can fix, you have experienced a maintainability failure.
            If you have ever backfilled a year of data and missed the daily SLA, you
            have experienced a scalability failure. Interviews reward candidates who
            connect those failures to concrete design choices.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            3. Replication (leader-follower, multi-leader, leaderless) — how this applies to Kafka, Snowflake, Delta Lake, Iceberg
          </h2>
          <p>
            Replication is the hidden engine of every data stack. DDIA breaks it into
            three patterns. You should be able to map them directly to the systems you
            design.
          </p>
          <p>
            <strong>Leader-follower:</strong> Kafka brokers are the cleanest example.
            Each partition has a leader and followers. Writes go to the leader,
            followers replicate, and consumers read from the leader. In interviews,
            tie this to reliability: when a leader dies, the cluster elects a new one,
            but replication lag determines how much data might be lost if you run with
            `acks=1`.
          </p>
          <p>
            The practical extension: call out ISR and `min.insync.replicas` as the
            durability knob. For critical pipelines, you choose `acks=all` with a
            replication factor of 3 and accept the throughput hit. That is a reliability
            decision, not a Kafka trivia answer.
          </p>
          <p>
            <strong>Multi-leader:</strong> Snowflake doesn&apos;t expose this directly, but it
            behaves like it at the edge: multiple warehouses can read concurrently,
            and write workloads can be isolated to avoid contention. In lakehouses, a
            multi-writer pattern appears when multiple jobs write to the same table.
            This is why Delta Lake and Iceberg enforce optimistic concurrency control
            and transaction logs. You need coordination to avoid write conflicts.
          </p>
          <p>
            For Snowflake, the key is that compute clusters are isolated and storage
            is shared. You can scale reads without adding write contention, but you still
            need to reason about overlapping writes and schema changes. For Delta Lake
            and Iceberg, a failed commit does not mean lost data; it means the writer
            needs to retry against the latest snapshot. That is the interview-friendly
            explanation of optimistic concurrency.
          </p>
          <p>
            <strong>Leaderless:</strong> This is common in object storage and event
            ingestion systems. S3-like storage is effectively leaderless for writes,
            and the system accepts that reads may be eventually consistent. In data
            lakes, this shows up as data arriving in multiple locations and a
            metadata layer (Iceberg, Delta) reconciling what is committed. That&apos;s why
            retries and idempotent writes matter: duplicate files are easy to create
            when there is no central leader enforcing ordering.
          </p>
          <p>
            You should explicitly link this to CDC and replay. If your ingestion job
            is retried, you want the same file layout and deterministic keys so the
            metadata layer can collapse duplicates instead of multiplying them. That
            is leaderless consistency applied to real pipelines.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            4. Partitioning strategies — map Kafka partition keys and Spark partitioning to DDIA concepts
          </h2>
          <p>
            DDIA&apos;s partitioning chapter is the real system design interview chapter.
            It tells you why most data pipelines fail under scale: skew, hot keys,
            and the wrong partitioning strategy for query patterns.
          </p>
          <p>
            In Kafka, your partition key is your scalability ceiling. A bad key
            creates hot partitions and a single consumer becomes the throughput limit.
            If the requirement is per-user ordering, user_id is a reasonable key, but
            then you need to plan for the few users who generate 100x more traffic
            than the median. That is where you talk about key salting, separate topics
            for high-volume tenants, or moving to a different ordering guarantee.
          </p>
          <p>
            In Spark, partitioning decides whether a job finishes in minutes or hours.
            If your data is partitioned by event_date but your query groups by user_id,
            you will shuffle almost everything. For interview purposes: explain how you
            choose partition columns based on access patterns, and call out that
            over-partitioning hurts small files, while under-partitioning causes massive
            shuffle stages and executor OOMs.
          </p>
          <p>
            I usually add one sentence about how I test this in production: sample the
            largest day, inspect partition sizes, and watch for long tail tasks. Then
            fix it with targeted repartitioning, bucketing, or a change in partition
            keys. That is the level of operational detail interviewers want.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`Ingestion (CDC + Events)
    → Kafka topic (partition by account_id)
        → Stream processing (dedupe + enrich)
            → Bronze (raw) lake table
                → Silver (typed, partitioned by event_date, account_id)
                    → Gold (aggregates + SLAs)

Hot partition signals:
- One partition has 10x lag
- Skewed Spark stage, long tail tasks
- Backfill runs eat the SLA window
`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            5. Transactions and consistency models — eventual consistency in data lakes
          </h2>
          <p>
            Transactions are not just for OLTP. They are the reason your downstream
            tables are correct. In lakehouses, consistency is almost always eventual,
            which is fine if you design for it. Iceberg and Delta Lake simulate
            transactions with a log, but the storage layer is still object storage
            that does not guarantee read-after-write for every path.
          </p>
          <p>
            What this means in practice: if you run a Spark job that writes partitions
            and then immediately run a downstream job, you can observe missing files
            unless you read through the table metadata layer. Your interview answer
            should mention that you never read raw file paths in production; you read
            via the table format so you get a consistent snapshot.
          </p>
          <p>
            The consistency model you want is usually snapshot isolation for readers and
            optimistic concurrency for writers. That is why Iceberg and Delta Lake track
            table versions. You get a stable view for downstream consumers while writers
            coordinate via commit logs instead of a central lock.
          </p>
          <p>
            For CDC pipelines, consistency is often eventual by design. You accept
            that a delete might arrive before the corresponding insert, and you build
            idempotent upserts so replay and reordering do not corrupt the target table.
            If you mention replay + idempotency as a pair, it signals production experience.
          </p>
          <p>
            Another practical tell: exactly-once in data pipelines is usually a business
            requirement, not a technical guarantee. You achieve it with idempotent merge
            keys, dedupe windows, and checkpoints. Saying this explicitly shows you have
            shipped systems that actually reconcile late and duplicate data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            6. Batch vs Stream processing (DDIA Chapters 10-11) — how Lambda and Kappa architectures evolved from these ideas
          </h2>
          <p>
            DDIA makes a clean distinction: batch gives you correctness and simplicity;
            streaming gives you low latency. Lambda architecture tried to combine both
            by running batch and stream pipelines side by side. It worked, but it doubled
            the surface area, and most teams failed to keep the two paths aligned.
          </p>
          <p>
            Kappa architecture simplified this by treating everything as a stream and
            using replay for backfills. This is exactly how modern Kafka + Flink + lakehouse
            platforms work. You land immutable events, reprocess when logic changes, and
            keep batch as a fallback for the heavy backfill jobs.
          </p>
          <p>
            The nuance: in most real platforms, you end up with a hybrid. You keep a
            stream for freshness, and you run scheduled batch corrections to handle
            late-arriving data or historical reprocessing. That is a perfectly acceptable
            answer if you explain when each path is used and how you prevent double counting.
          </p>
          <p>
            Interview framing: choose batch when freshness is measured in hours and the
            SLA is cost-focused. Choose streaming when freshness is minutes and the data
            powers operational decisions. Then explain how you handle late data, backfills,
            and replay so the system does not drift.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            7. What Netflix specifically tests on in DDIA for L4/L5 DE interviews
          </h2>
          <p>
            Netflix is unusually consistent about DDIA-aligned system design questions.
            They want to see that you can reason about consistency and scale without
            hiding behind tool names. The prompts often sound open-ended, but the rubric
            is not.
          </p>
          <p>
            Expect questions that force you to choose between correctness and latency,
            or between simplicity and scale. The interviewers are less interested in
            whether you picked Kafka vs Kinesis and more interested in whether you can
            justify partitioning, durability, and replay strategies under pressure.
          </p>
          <ul className="list-disc pl-6">
            <li>
              Explain a replication or partitioning choice and name the failure mode it
              avoids (lag cliffs, hot partitions, or backfill starvation).
            </li>
            <li>
              Describe how you would make a pipeline replayable without double-counting
              (idempotent writes, deterministic keys, and immutable logs).
            </li>
            <li>
              Show you understand consistency tradeoffs in data lakes (snapshot reads,
              eventual consistency, and why you avoid file-based reads).
            </li>
            <li>
              Tie system design decisions back to SLAs (freshness vs cost vs reliability).
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            8. 4 practice system design prompts
          </h2>
          <p>
            If you can answer these with DDIA vocabulary and concrete data engineering
            tooling, you are prepared for senior interviews.
          </p>
          <p>
            The best practice is to lead with requirements, then draw the data flow,
            then call out failure modes and recovery. That sequence mirrors DDIA and
            keeps your answer crisp.
          </p>
          <ul className="list-disc pl-6">
            <li>
              Design a CDC-based ingestion pipeline that guarantees exactly-once semantics
              from Postgres into Iceberg, including backfills and schema evolution.
            </li>
            <li>
              Build a real-time feature store pipeline for ML training and serving with
              Kafka, Spark Structured Streaming, and a low-latency serving store.
            </li>
            <li>
              Design a lakehouse architecture for 100 TB/day of clickstream data with
              15-minute freshness SLAs and a daily backfill window.
            </li>
            <li>
              Create a multi-tenant analytics platform where one tenant can generate
              100x more data than others without breaking SLAs.
            </li>
          </ul>

          <p>
            DDIA is not a book you cite to sound smart. It is a mental model you use to
            make production systems boring. If you can say how replication affects Kafka
            durability, how partitioning affects Spark shuffle cost, and how eventual
            consistency affects lakehouse correctness, you are already in the top tier
            for L4/L5 data engineering interviews.
          </p>
        </div>

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

        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
