const timeline = [
  {
    role: "Lead Backend Engineer",
    company: "The Philadelphia Inquirer",
    period: "Sep 2022 – Present",
    description:
      "Architecting scalable cloud infrastructure and data platforms for digital media. Migrated ESP from Salesforce Marketing Cloud to Marigold SailThru ($100K+ annual savings). Reengineered ETL pipelines in Python/PySpark (50% more resilient, $120K/yr savings). Built serverless ETL on AWS replacing legacy billing systems. Created AI/RAG app over proprietary historical archive and internal HR chatbot. DevSecOps improvements drove 12% YoY checkout conversion increase. Cloud-first serverless migration cut operational costs 75%.",
  },
  {
    role: "Software Engineer",
    company: "Longevity Consulting",
    period: "Aug 2021 – Sep 2022",
    description:
      "Built full stack GRC platform using React, Django, FastAPI, GraphQL, and AWS FarGate. Developed RPA solutions with UiPath Studio saving $3K+/employee/year.",
  },
  {
    role: "IT Project Manager",
    company: "Asset Strategies International",
    period: "Sep 2011 – Aug 2021",
    description:
      "Led CRM/eCommerce integration (HubSpot, Shopify) and database migration from proprietary systems. Managed digital transformation initiatives bridging business operations and technology.",
  },
  {
    role: "Education",
    company: "UW-Madison · Nucamp · AWS Certifications",
    period: "",
    description:
      "BA Public Relations, UW-Madison. Nucamp Full Stack + Python/DevOps certifications. AWS Solutions Architect Associate, AWS Data Engineering Associate, AWS Cloud Practitioner.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          How I Got Here
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-12 rounded-full" />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-steel/30" />

          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-12 sm:pl-16">
                {/* Dot */}
                <div
                  className={`absolute left-2.5 sm:left-4.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                    i === 0
                      ? "bg-electricBlue border-electricBlue"
                      : "bg-navy border-steel"
                  }`}
                />
                <div className="bg-charcoal border border-electricBlue/10 rounded-xl p-5 hover:border-electricBlue/20 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-mono text-base font-semibold text-white">
                      {item.role}
                    </h3>
                    {item.period && (
                      <span className="text-xs font-mono text-electricBlue mt-1 sm:mt-0">
                        {item.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyberTeal font-medium mb-2">
                    {item.company}
                  </p>
                  <p className="text-sm text-mutedGray leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
