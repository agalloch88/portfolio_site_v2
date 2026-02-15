const categories = [
  {
    title: "Backend & APIs",
    description: "Languages & Frameworks",
    items: ["Python", "TypeScript", "Node.js", "GraphQL", "REST APIs"],
  },
  {
    title: "Cloud & Infrastructure",
    description: "Platforms & Tools",
    items: ["AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform"],
  },
  {
    title: "Data Engineering & Analytics",
    description: "Pipeline Tools & Databases",
    items: [
      "Apache Spark",
      "Apache Airflow",
      "Apache Kafka",
      "PostgreSQL",
      "Redis",
      "BigQuery",
      "Elasticsearch",
      "DynamoDB",
      "dbt",
    ],
  },
  {
    title: "Enterprise & Integration",
    description: "CRM & Automation",
    items: ["Salesforce", "API Design", "System Integration", "Data Flow Optimization"],
  },
];

export default function TechStack() {
  return (
    <section id="skills" className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          Tech Stack
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-12 rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-charcoal border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <h3 className="font-mono text-lg font-semibold text-electricBlue mb-1">
                {cat.title}
              </h3>
              <p className="text-sm text-mutedGray mb-4">{cat.description}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-xs font-mono bg-navy border border-steel/30 text-lightGray rounded-full hover:border-cyberTeal/50 hover:text-cyberTeal transition-colors duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
