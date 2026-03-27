import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Kafka vs Kinesis: A Data Engineer's Guide to Real-Time Streaming in 2026 | Ryan Kirsch - Data Engineer",
  description:
    "A senior engineer's comparison of Apache Kafka and Amazon Kinesis for real-time streaming, with production code, cost analysis, and architecture recommendations.",
  openGraph: {
    title:
      "Kafka vs Kinesis: A Data Engineer's Guide to Real-Time Streaming in 2026 | Ryan Kirsch - Data Engineer",
    description:
      "A senior engineer's comparison of Apache Kafka and Amazon Kinesis for real-time streaming, with production code, cost analysis, and architecture recommendations.",
    type: "article",
    url: "https://ryankirsch.dev/blog/kafka-vs-kinesis-guide",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Kafka vs Kinesis: A Data Engineer's Guide to Real-Time Streaming in 2026 | Ryan Kirsch - Data Engineer",
    description:
      "A senior engineer's comparison of Apache Kafka and Amazon Kinesis for real-time streaming, with production code, cost analysis, and architecture recommendations.",
  },
  alternates: { canonical: "/blog/kafka-vs-kinesis-guide" },
};

export default function KafkaVsKinesisGuidePost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/kafka-vs-kinesis-guide"
  );
  const postTitle = encodeURIComponent(
    "Kafka vs Kinesis: A Data Engineer's Guide to Real-Time Streaming in 2026"
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
            {["Kafka", "Kinesis", "Streaming", "Real-Time", "Data Engineering", "AWS"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Kafka vs Kinesis: A Data Engineer&apos;s Guide to Real-Time
            Streaming in 2026
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 26, 2026 &middot; 9 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            I&apos;ve built production pipelines on both. I&apos;ve been paged
            at 2 AM because of both. I&apos;ve watched teams choose the wrong
            one and spend six months undoing that decision. This post is the
            guide I wish existed when I was making those calls.
          </p>
          <p>
            The short answer: Kafka is more powerful and more complicated.
            Kinesis is easier to start with and harder to scale cheaply. The
            right choice depends almost entirely on your team, your AWS
            footprint, and how much operational complexity you&apos;re willing
            to carry long-term.
          </p>
          <p>Let me give you the full picture.</p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Architecture That Actually Matters
          </h2>
          <p>
            Kafka and Kinesis both implement a distributed, partitioned,
            append-only log. Messages go in, they stay for a configurable
            retention window, consumers read them at their own pace. That&apos;s
            where the surface-level similarity ends.
          </p>
          <p>
            <strong className="text-white">Kafka</strong> is an open-source
            distributed system. It&apos;s built around brokers, topics, and
            partitions. You control the number of partitions per topic,
            replication factor, retention period (time or size-based), and
            compression. The Kafka protocol is its own beast, and clients
            communicate directly with brokers. Consumer groups are first-class
            citizens: each group maintains its own committed offsets, and Kafka
            handles rebalancing when consumers join or leave. You can have as
            many consumer groups reading the same topic as you want, and each
            gets an independent read position.
          </p>
          <p>
            <strong className="text-white">Kinesis Data Streams</strong> is a
            managed AWS service. It uses shards instead of partitions. Each
            shard handles 1 MB/s write throughput and 2 MB/s read throughput.
            You provision shards explicitly (or use on-demand mode), and the max
            retention is 7 days on standard, 365 days with Extended Data
            Retention at extra cost. The enhanced fan-out feature gives each
            consumer its own dedicated 2 MB/s read pipe, which solves the shared
            throughput problem but adds cost.
          </p>
          <p>
            The philosophical difference: Kafka gives you control over
            everything. Kinesis gives you guardrails and bills you for the
            privilege.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Producer and Consumer Models
          </h2>
          <p>
            Here&apos;s what the code actually looks like in practice.
          </p>
          <p>
            <strong className="text-white">
              Producing to Kafka with the Confluent Python client:
            </strong>
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`from confluent_kafka import Producer
import json

conf = {
    'bootstrap.servers': 'broker1:9092,broker2:9092',
    'acks': 'all',
    'enable.idempotence': True,
    'compression.type': 'snappy',
    'batch.size': 65536,
    'linger.ms': 5,
}

producer = Producer(conf)

def delivery_report(err, msg):
    if err:
        print(f'Delivery failed for record {msg.key()}: {err}')
    else:
        print(f'Record delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}')

for event in events:
    producer.produce(
        topic='user-events',
        key=str(event['user_id']).encode('utf-8'),
        value=json.dumps(event).encode('utf-8'),
        callback=delivery_report
    )
    producer.poll(0)

producer.flush()`}
          </pre>
          <p>
            <strong className="text-white">Producing to Kinesis with boto3:</strong>
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import boto3
import json

client = boto3.client('kinesis', region_name='us-east-1')

for event in events:
    response = client.put_record(
        StreamName='user-events',
        Data=json.dumps(event).encode('utf-8'),
        PartitionKey=str(event['user_id'])
    )
    print(f"Shard: {response['ShardId']}, Seq: {response['SequenceNumber']}")`}
          </pre>
          <p>
            The Kinesis code is simpler to get running. You don&apos;t need to
            think about brokers, replication, or acks. But notice you&apos;re
            doing <code>put_record</code> one at a time. At scale, you want{" "}
            <code>put_records</code> (batch up to 500 records), and you have to
            handle partial failures yourself because the batch API returns
            per-record success/failure codes. Kafka handles batching internally.
          </p>
          <p>
            <strong className="text-white">Consumer group semantics</strong> are
            where the difference really bites. In Kafka, you create a consumer
            group, set a <code>group.id</code>, and Kafka does partition
            assignment and offset tracking. Multiple groups read the same topic
            independently. In Kinesis, you manage state yourself (DynamoDB via
            KCL, or EventBridge Pipes, or Lambda with manual checkpoint logic).
            Enhanced fan-out helps with throughput isolation but doesn&apos;t
            give you consumer group semantics out of the box.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Throughput, Latency, and Retention: Real Numbers
          </h2>
          <p>
            <strong className="text-white">Throughput:</strong> Kafka is
            theoretically unlimited. Add partitions, add brokers. Confluent has
            documented single-cluster throughput above 1 TB/s. In practice, MSK
            clusters handle hundreds of MB/s without drama. Kinesis: 1 MB/s or
            1,000 records/s per shard for writes. 2 MB/s per shard for reads
            (shared across consumers unless you use enhanced fan-out). If you
            need 100 MB/s write throughput, you&apos;re provisioning 100 shards.
          </p>
          <p>
            <strong className="text-white">Latency:</strong> Kafka median
            end-to-end latency of 2-5ms at p50. You can tune it lower by
            reducing <code>linger.ms</code> and <code>batch.size</code>, but you
            trade throughput for it. Kinesis typically 70-200ms end-to-end. AWS
            states under 1 second at p99 but you&apos;ll see 200-300ms under
            normal load. Fine for most real-time use cases. Not fine for
            sub-100ms requirements.
          </p>
          <p>
            <strong className="text-white">Retention:</strong> Kafka is
            configurable per topic. 7 days is common. A week, a month, forever
            if storage allows. This is a genuine architectural advantage. You can
            replay any partition from the beginning. Kinesis standard: 24 hours
            default, up to 7 days. Extended retention bumps it to 365 days but
            adds real cost. For long replay windows, Kafka wins cleanly.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Operational Reality: Managed vs. Self-Hosted vs. Kinesis
          </h2>
          <p>
            Here&apos;s where most engineers underestimate the decision.
          </p>
          <p>
            <strong className="text-white">Self-hosted Kafka</strong> is
            powerful and exhausting. You own broker upgrades, disk management,
            replication tuning, consumer lag monitoring, and ZooKeeper (or
            KRaft, which you should be using now). You will debug obscure
            partition leadership issues. You will fight with Java heap settings
            at some point. If you have a dedicated platform team, this can work
            well. If you&apos;re a two-person data team, it will own you.
          </p>
          <p>
            <strong className="text-white">Amazon MSK</strong> is self-hosted
            Kafka without the hardware. AWS manages the brokers, handles
            multi-AZ replication, and does the Kafka upgrades with your
            approval. You still manage topic configuration, consumer groups, and
            everything at the application layer. A 3-broker MSK cluster running
            24/7 is about $150/month before storage. That&apos;s cheap for
            production infrastructure.
          </p>
          <p>
            <strong className="text-white">Confluent Cloud</strong> is the best
            fully-managed Kafka experience. Schema Registry, ksqlDB, Kafka
            Streams, Connectors, role-based access control, Terraform provider,
            the whole ecosystem. A moderately busy cluster runs $400-800/month.
            Worth it if you want Kafka capabilities without any operational
            burden.
          </p>
          <p>
            <strong className="text-white">Kinesis Data Streams</strong> is
            serverless in spirit. Provision shards (or use on-demand mode),
            point your producers at it, and you&apos;re done. No cluster to
            manage, no broker to upgrade. At low volume, Kinesis is very cheap.
            At high volume, shard costs compound fast.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Ecosystem Comparison
          </h2>
          <p>
            This is where Kafka pulls ahead for engineering teams that want to
            do serious work.
          </p>
          <p>
            <strong className="text-white">Kafka ecosystem:</strong> Kafka
            Streams for stateful stream processing embedded in your app. ksqlDB
            for SQL over Kafka. Flink on Kafka as the gold standard for complex
            CEP and ML feature pipelines. Kafka Connect with 200+ connectors for
            CDC, databases, object stores, and SaaS tools. Debezium on Kafka is
            still the best CDC story in the industry.
          </p>
          <p>
            <strong className="text-white">Kinesis ecosystem:</strong> Kinesis
            Data Firehose for zero-code delivery to S3, Redshift, OpenSearch,
            and Splunk. Managed Service for Apache Flink (formerly Kinesis Data
            Analytics). Lambda triggers for native event-driven patterns.
            EventBridge Pipes for Kinesis-to-target routing with filtering.
          </p>
          <p>
            The honest assessment: if you want Kafka Streams or ksqlDB,
            you&apos;re using Kafka. If you want to dump events to S3 with no
            operational overhead, Kinesis Firehose is genuinely unbeatable.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Cost at Scale: Some Real Math
          </h2>
          <p>
            Let&apos;s compare a 10 MB/s sustained write throughput scenario.
          </p>
          <p>
            <strong className="text-white">Kinesis provisioned:</strong> You
            need 10 shards. At $0.015/shard-hour: roughly $109.50/month for
            shards. Add PUT costs at $0.014 per million payload units. At 10
            MB/s you&apos;re ingesting roughly 26 billion units/month. That&apos;s
            $364 in PUT costs. Total: roughly $475/month before enhanced fan-out
            or extended retention.
          </p>
          <p>
            <strong className="text-white">MSK kafka.m5.2xlarge, 3 brokers:</strong>{" "}
            Approximately $885/month plus storage. At 10 MB/s sustained with
            7-day retention, storage runs about $580/month. Total: roughly
            $1,465/month.
          </p>
          <p>
            <strong className="text-white">Confluent Cloud at 10 MB/s:</strong>{" "}
            At roughly $0.14/GB ingress, about $3,465/month in ingress alone.
          </p>
          <p>
            At 10 MB/s, Kinesis is actually cheapest in raw infrastructure. The
            math flips at higher throughput where shard costs dominate, and it
            flips if you need long retention. For most teams under 5 MB/s with
            simple delivery requirements: Kinesis wins on cost. For teams above
            20 MB/s or with complex processing requirements: Kafka (MSK
            especially) becomes more cost-effective.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Recommended Architectures by Team Size
          </h2>
          <p>
            <strong className="text-white">
              Small team (1-3 data engineers), AWS-native shop:
            </strong>{" "}
            Use Kinesis Data Streams with Lambda consumers and Firehose to S3.
            Stand up a Glue catalog, query with Athena. Total managed surface
            area is minimal. You will not be paged about broker leadership. If
            you outgrow it, migrate to MSK later.
          </p>
          <p>
            <strong className="text-white">
              Mid-size team (4-10 engineers), polyglot infrastructure:
            </strong>{" "}
            MSK with a Schema Registry (Glue Schema Registry or
            Confluent-compatible). Add Flink for stateful processing if you need
            it. MSK gives you Kafka semantics without self-hosted pain. Budget
            $500-1,500/month depending on cluster size.
          </p>
          <p>
            <strong className="text-white">
              Large platform team (10+ engineers), serious scale:
            </strong>{" "}
            Confluent Cloud or self-hosted Kafka on EC2 with dedicated ops
            ownership. You want full Kafka Connect, ksqlDB, and Streams. The
            Confluent ecosystem is worth the premium if your team will actually
            use it.
          </p>
          <p>
            <strong className="text-white">
              Greenfield AWS project, simple event streaming:
            </strong>{" "}
            EventBridge. Not Kinesis, not Kafka. EventBridge handles event
            routing, replay (24 hours), and fan-out without writing a single
            producer. For service-to-service events in a microservices
            architecture, EventBridge is often the right answer and people reach
            for Kinesis out of habit.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            My Take: Pick One, Don&apos;t Agonize
          </h2>
          <p>
            I use Kafka in my current stack. I&apos;ve used Kinesis in previous
            roles. Here&apos;s where I actually land after building both.
          </p>
          <p>
            <strong className="text-white">Pick Kinesis if:</strong> Your entire
            infrastructure is AWS-native, your team is small, your throughput is
            under 5 MB/s, and you genuinely don&apos;t have operational capacity
            to run a cluster. Kinesis Data Streams plus Firehose handles a
            surprising number of real production use cases. Don&apos;t let
            anyone tell you it&apos;s a toy.
          </p>
          <p>
            <strong className="text-white">Pick Kafka if:</strong> You need long
            retention for replay, you have multiple independent consumer groups
            with different processing speeds, you want Flink or Kafka Streams
            for stateful processing, or you&apos;re not exclusively AWS. Kafka
            gives you more control and more ecosystem, and with MSK that control
            doesn&apos;t require running servers manually.
          </p>
          <p>
            <strong className="text-white">Pick neither if:</strong> You&apos;re
            doing low-volume service-to-service events in AWS. That&apos;s
            EventBridge. Stop over-engineering it.
          </p>
          <p>
            The mistake I see most often is teams picking Kafka because it
            sounds impressive, then spending their first quarter just keeping
            the cluster alive. Kafka is a serious piece of infrastructure. It
            rewards teams that invest in understanding it. It punishes teams
            that treat it as a magic queue.
          </p>
          <p>
            If you&apos;re unsure, start with Kinesis, prove your pipeline, and
            migrate to MSK when you hit the limits. That path is less painful
            than it sounds. The partition model maps cleanly between the two.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Getting Started
          </h2>
          <p>
            For Kafka: Install the Confluent CLI, spin up a free Confluent Cloud
            cluster, and use the Python client above. Confluent&apos;s free tier
            gives you enough to build a real prototype.
          </p>
          <p>
            For Kinesis: Create a stream in the AWS console, enable enhanced
            fan-out if you have multiple consumers, and use boto3 with{" "}
            <code>put_records</code> batching from day one.
          </p>
          <p>
            Whichever you pick, build your observability first. Consumer lag,
            producer error rates, and partition hot-spotting will tell you more
            about the health of your pipeline than anything else.
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
