const categories = [
  {
    title: "Languages",
    items: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "C#", "SQL", "bash"],
  },
  {
    title: "Frontend",
    items: ["React", "React Native", "NextJS", "Bootstrap", "Tailwind CSS"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express", "Django", "Flask", "FastAPI", "GraphQL"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MongoDB", "DynamoDB", "Redis", "Elasticsearch", "BigQuery", "Neo4j"],
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS (ECS/ECR, EKS, FarGate, EventBridge, S3, SQS, SNS, Lambda, API Gateway, EC2, IAM, KMS, Kinesis)", "GCP", "Azure", "Docker", "Kubernetes", "Serverless Framework"],
  },
  {
    title: "Data",
    items: ["PySpark", "NumPy", "Pandas", "SQLAlchemy", "boto3"],
  },
  {
    title: "Enterprise",
    items: ["Salesforce (Service Cloud, Marketing Cloud)", "HubSpot", "Shopify", "UiPath RPA"],
  },
  {
    title: "Tools",
    items: ["Git", "GitHub", "BitBucket", "Jira", "Postman", "VSCode", "PyCharm"],
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
              <h3 className="font-mono text-lg font-semibold text-electricBlue mb-4">
                {cat.title}
              </h3>
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
