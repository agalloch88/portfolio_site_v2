const projects = [
  {
    title: "Email Service Provider Migration",
    description:
      "Migrated the Philadelphia Inquirer's ESP from Salesforce Marketing Cloud to Marigold SailThru. Architected data pipelines integrating Salesforce Service Cloud for seamless subscriber management.",
    metrics: "$100K+ annual savings • Zero subscriber data loss",
    tags: ["Python", "Salesforce", "AWS", "Data Pipelines"],
  },
  {
    title: "Serverless ETL Platform",
    description:
      "Built serverless ETL on AWS using Serverless Framework with S3, Lambda, EventBridge, SQS, and DynamoDB, replacing legacy billing systems with scalable, event-driven architecture.",
    metrics: "75% cost reduction • 50% less manual workload",
    tags: ["AWS Lambda", "EventBridge", "SQS", "DynamoDB", "Serverless Framework"],
  },
  {
    title: "AI/RAG Historical Archive",
    description:
      "Built a privately-hosted AI/RAG application over the Philadelphia Inquirer's proprietary historical archive (1977-present), enabling intelligent search and content discovery across decades of journalism.",
    metrics: "45+ years of searchable archive • Private hosting",
    tags: ["Python", "OpenAI", "RAG", "Vector DB", "AWS"],
  },
  {
    title: "ETL Pipeline Reengineering",
    description:
      "Reengineered legacy Informatica ETL pipelines in Python/PySpark, achieving 50% greater resilience and eliminating expensive proprietary tooling.",
    metrics: "$120K/year savings • 50% more resilient",
    tags: ["Python", "PySpark", "ETL", "Data Engineering"],
  },
  {
    title: "Internal HR Chatbot",
    description:
      "Built a Slack-based RAG chatbot using OpenAI API for internal HR queries: employee handbook, PTO policies, org charts, reducing HR ticket volume.",
    metrics: "Slack-native • Real-time RAG responses",
    tags: ["OpenAI API", "Slack", "Python", "RAG"],
  },
  {
    title: "Full Stack GRC Platform",
    description:
      "Designed and built a governance, risk, and compliance platform at Longevity Consulting using React, Django, FastAPI, GraphQL, and AWS FarGate.",
    metrics: "Full stack • Enterprise GRC",
    tags: ["React", "Django", "FastAPI", "GraphQL", "AWS FarGate"],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          What I&apos;ve Built
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-4 rounded-full" />
        <p className="text-mutedGray mb-12 max-w-2xl text-base sm:text-lg">
          Production systems powering digital media at scale — from serverless
          data pipelines to AI-powered applications over decades of content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, index) => (
            <div
              key={p.title}
              className={`bg-charcoal border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 hover:-translate-y-0.5 transition-all duration-300 group ${
                index < 2 ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              <h3 className="font-mono text-lg font-semibold text-white mb-2 group-hover:text-electricBlue transition-colors">
                {p.title}
              </h3>
              <p className="text-mutedGray text-sm mb-3 leading-relaxed">
                {p.description}
              </p>
              <p className="text-xs text-steel mb-4">{p.metrics}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-mono bg-navy border border-steel/30 text-cyberTeal rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-steel italic">
                Enterprise production system
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
