const projects = [
  {
    title: "Cloud Infrastructure Platform",
    description:
      "Scalable cloud infrastructure serving millions of daily readers with high availability and fault tolerance.",
    tags: ["AWS", "Terraform", "Docker", "Kubernetes"],
    github: "#",
    live: "#",
  },
  {
    title: "Real-Time Data Pipeline",
    description:
      "ETL/ELT pipeline processing terabytes of content data daily with Apache Spark and Airflow orchestration.",
    tags: ["Python", "Spark", "Airflow", "BigQuery"],
    github: "#",
    live: "#",
  },
  {
    title: "ML Inference Service",
    description:
      "Production ML pipeline for content recommendation and classification, serving predictions at scale.",
    tags: ["Python", "FastAPI", "Docker", "Redis"],
    github: "#",
    live: "#",
  },
  {
    title: "API Gateway & Microservices",
    description:
      "Distributed microservices architecture handling high-throughput content delivery and integration.",
    tags: ["TypeScript", "Node.js", "GraphQL", "PostgreSQL"],
    github: "#",
    live: "#",
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
          From cloud infrastructure that scales to millions of users to data
          pipelines processing terabytes daily, here&apos;s how I solve complex
          technical challenges.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className="bg-charcoal border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <h3 className="font-mono text-lg font-semibold text-white mb-2 group-hover:text-electricBlue transition-colors">
                {p.title}
              </h3>
              <p className="text-mutedGray text-sm mb-4 leading-relaxed">
                {p.description}
              </p>
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
              <div className="flex gap-4 text-sm">
                <a
                  href={p.github}
                  className="text-electricBlue hover:underline"
                >
                  Source Code →
                </a>
                <a href={p.live} className="text-electricBlue hover:underline">
                  Live Demo →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
