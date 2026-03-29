import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kafka in Production: Lessons from Running Real-Time Pipelines at Scale",
  description:
    "Three years of running Kafka at a major news publisher. What I learned about topic design, consumer lag, exactly-once semantics, and when not to use it.",
  openGraph: {
    title: "Kafka in Production: Lessons from Running Real-Time Pipelines at Scale",
    description:
      "Three years of running Kafka at a major news publisher. What I learned about topic design, consumer lag, exactly-once semantics, and when not to use it.",
    type: "article",
    url: "https://ryankirsch.dev/blog/kafka-production-lessons",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kafka in Production: Lessons from Running Real-Time Pipelines at Scale",
    description:
      "Three years of running Kafka at a major news publisher. What I learned about topic design, consumer lag, exactly-once semantics, and when not to use it.",
  },
  alternates: { canonical: "/blog/kafka-production-lessons" },
};

export default function KafkaProductionLessonsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/kafka-production-lessons"
  );
  const postTitle = encodeURIComponent(
    "Kafka in Production: Lessons from Running Real-Time Pipelines at Scale"
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
            Kafka in Production: Lessons from Running Real-Time Pipelines at Scale
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · October 15, 2025 · <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            After three years running Kafka at a major news publisher — millions of
            pageviews, real-time editorial analytics, and CDC pipelines feeding a
            Snowflake warehouse — here is what I wish someone had told me before I
            started.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">

          <section className="space-y-4">
            <p className="leading-relaxed">
              Kafka is one of those tools that looks simple until you run it in
              production. The concept is elegant: a distributed, append-only log. Events
              go in, consumers read them, everything is durable and replayable. The
              tutorials make it look like twenty lines of Python. Then you push your
              first million-message day and realize how many design decisions you made
              quietly, without noticing they were decisions at all.
            </p>
            <p className="leading-relaxed">
              What follows is not a Kafka introduction. It is a collection of hard-won
              lessons from running real-time streaming pipelines at a publication that
              cannot afford downtime during breaking news. Some of these cost us
              incidents. All of them made us better.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lesson 1: Topic Design Is Schema Design. Treat It That Way.
            </h2>
            <p className="leading-relaxed">
              The biggest architectural mistake I see with Kafka is treating topics as
              throw-away queues. You create a topic, start publishing, and figure out the
              structure later. This works fine for a while. Then you have six consumers
              downstream and a schema change, and you spend a week untangling
              compatibility.
            </p>
            <p className="leading-relaxed">
              Topics are contracts. Every producer is making a promise to every current
              and future consumer about what data looks like. Violating that promise
              silently is how you end up with broken dashboards at 9 AM on a Monday.
            </p>
            <p className="leading-relaxed">
              What actually works: enforce schemas via a Schema Registry from day one.
              We use Confluent Schema Registry with Avro. It adds a small operational
              overhead to set up, but it catches breaking changes at publish time, before
              they reach consumers. The rule is simple: if you can&apos;t describe your
              message contract in an Avro schema, you do not have a message contract yet.
              Go define one.
            </p>
            <p className="leading-relaxed">
              Partition key design is the other piece of topic architecture people
              underinvest in. The key determines ordering guarantees and load
              distribution. For our pageview events, we partition by content ID. That
              means all events for a given article arrive in order to the same partition,
              which matters when we are computing session-level engagement in real time.
              If we had partitioned by user ID or randomized, we would have lost that
              ordering guarantee entirely.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lesson 2: Consumer Lag Is Your Most Important Metric
            </h2>
            <p className="leading-relaxed">
              You will get paged about many things with Kafka. The one you want to
              watch constantly, before it becomes a page, is consumer group lag. Lag is
              the distance between where a consumer is and where the topic head is. Low
              lag means your consumers are keeping up. Rising lag means something is
              wrong: a slow consumer, a spike in event volume, a downstream dependency
              timing out.
            </p>
            <p className="leading-relaxed">
              We expose consumer lag as a Prometheus metric and alert at two thresholds.
              A warning fires at 10,000 messages behind. An incident-level alert fires
              at 100,000. The warning gives us time to investigate before real impact.
              The incident-level alert means the real-time dashboard is already showing
              stale data, and we are in active remediation.
            </p>
            <p className="leading-relaxed">
              The most common cause of lag in our environment: a consumer that is doing
              too much work per message. The pattern that kills throughput is when a
              consumer processes one event, makes a database call, waits for a response,
              processes the next event. Each round-trip to the DB adds latency. At low
              volume, this is invisible. At ten thousand events per second, it builds a
              backlog within minutes.
            </p>
            <p className="leading-relaxed">
              The fix is batching. Kafka consumers pull messages in batches by default.
              Work with that, not against it. Read a batch, buffer your DB operations,
              flush them in a single query. Your throughput will jump by an order of
              magnitude.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lesson 3: Exactly-Once Is a Lie (Unless You Design for It)
            </h2>
            <p className="leading-relaxed">
              Kafka&apos;s exactly-once semantics (EOS) get a lot of attention in the
              documentation, and the concept is real. You can configure producers and
              consumers such that, within the Kafka system, each message is processed
              exactly once. But Kafka is rarely the entire system. Once a message leaves
              Kafka and touches an external database, API, or file system, you are back
              in at-least-once territory.
            </p>
            <p className="leading-relaxed">
              The practical lesson: build your consumers to be idempotent, regardless of
              what delivery semantics you configure at the Kafka level. Assume every
              message might arrive twice. Design your writes so that processing the same
              message twice produces the same state as processing it once.
            </p>
            <p className="leading-relaxed">
              For our CDC pipeline feeding into Snowflake, we implemented this with a
              deduplication step in dbt. Every source table has a{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                kafka_offset
              </code>{" "}
              field. The dbt model that reads from the staging layer picks{" "}
              <code className="text-cyberTeal bg-black/30 px-1 rounded">
                MAX(kafka_offset)
              </code>{" "}
              per primary key before writing to the presentation layer. Duplicate
              messages from Kafka become invisible downstream.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lesson 4: Dead Letter Queues Are Not Optional
            </h2>
            <p className="leading-relaxed">
              Bad messages happen. A producer sends a malformed event. A schema change
              lands before all producers are updated. A downstream service returns an
              unexpected error. If your consumer does not know what to do with a bad
              message, it has two choices: crash, or skip. Both are bad.
            </p>
            <p className="leading-relaxed">
              Crashing stops processing for all messages, not just the bad one. Skipping
              means you silently lose data and will never know exactly how much.
            </p>
            <p className="leading-relaxed">
              Dead letter queues are the third option. When a message fails processing
              after N retries, publish it to a separate DLQ topic with enough metadata
              to understand what went wrong: the original message, the exception, a
              timestamp, the consumer group, the original topic and offset. Then build a
              process to review DLQ messages and decide whether they can be replayed
              once the root cause is fixed.
            </p>
            <p className="leading-relaxed">
              In practice, DLQs catch two categories of problems: transient errors (a
              downstream service was briefly unavailable) and permanent errors (a
              malformed message that will never parse). For transient errors, replay
              from the DLQ once the service recovers. For permanent errors, the DLQ
              gives you a clear audit trail and time to investigate without blocking the
              main consumer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Lesson 5: Kafka + Kafka Connect Changes What Is Possible
            </h2>
            <p className="leading-relaxed">
              The most impactful thing we did with our Kafka setup was not the streaming
              analytics. It was using Kafka Connect with Debezium to capture
              change-data-capture (CDC) events from our production Postgres databases.
            </p>
            <p className="leading-relaxed">
              Every insert, update, and delete in production flows into a Kafka topic as
              a structured event within milliseconds. Those events feed our Snowflake
              warehouse via a Confluent S3 sink connector, landing in staging tables
              that get transformed by dbt into clean analytical models. The result is a
              warehouse that reflects the operational database state with a typical
              latency of under five minutes.
            </p>
            <p className="leading-relaxed">
              Before this, we ran nightly ETL jobs that lagged by up to 24 hours. Now
              our editorial team can query what happened this morning in the analytics
              dashboard and get real answers. That is the kind of improvement that
              changes how people trust and use data.
            </p>
            <p className="leading-relaxed">
              Kafka Connect connectors are not magic, but they eliminate a lot of
              bespoke pipeline code. Each connector is a well-tested unit with known
              failure modes. When something breaks, you are debugging configuration, not
              custom Python. That is a meaningful operational advantage at scale.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              When Not to Use Kafka
            </h2>
            <p className="leading-relaxed">
              Kafka is a powerful tool. It is also a complex one. Running a Kafka cluster
              adds operational burden: topic management, retention policy, consumer group
              monitoring, Schema Registry, connector uptime. For a team without dedicated
              infrastructure engineering capacity, that overhead is real.
            </p>
            <p className="leading-relaxed">
              If your use case is a job that runs once an hour and processes a thousand
              rows, Kafka is probably overkill. A scheduled Airflow/Dagster job hitting a
              database directly will be simpler to build, simpler to debug, and simpler
              to hand to a new engineer. Complexity should be proportional to the problem
              it is solving.
            </p>
            <p className="leading-relaxed">
              Kafka earns its keep when you have high-volume event streams where ordering
              matters, when you need multiple independent consumers reading the same data
              at different rates, or when you need durable replayability across a complex
              system. If those criteria do not apply to your problem, reach for something
              simpler first.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Actual Value</h2>
            <p className="leading-relaxed">
              The real value of Kafka in our stack was not the technology. It was the
              organizational shift it enabled. When events are durable and replayable,
              you can add a new consumer without coordinating with every existing team.
              You can replay six months of events to backfill a new data model. You can
              debug production issues by replaying the exact sequence of events that
              caused them.
            </p>
            <p className="leading-relaxed">
              Kafka decoupled our producers from our consumers. Teams that produce data
              do not need to know who is consuming it or when. That decoupling reduced
              coordination overhead and let us build faster. That is the actual benefit.
              The streaming throughput is a nice property. The architectural decoupling
              is the thing that changed how we work.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-steel/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-mutedGray">
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
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Airflow,
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
