const timeline = [
  {
    role: "Lead Backend Software Engineer",
    company: "The Philadelphia Inquirer",
    period: "Sep 2022 – Present",
    bullets: [
      "Spearheaded ESP migration from Salesforce Marketing Cloud to Marigold SailThru; architected end-to-end data pipelines with Salesforce Service Cloud, delivering one month ahead of schedule, $100K+ annual savings",
      "Led migration off Informatica ETL by reengineering pipelines in Python/PySpark, 50% more resilient, $120K/year savings",
      "Architected serverless ETL pipelines on AWS (Serverless Framework) — S3, Lambda, EventBridge, SQS, DynamoDB — replacing legacy subscription/billing systems, enabling real-time Salesforce→SailThru sync via event-driven architecture",
      "Developed privately-hosted AI app enabling chat-based RAG over proprietary historical archive (1977–present)",
      "Integrated internal HR chatbot with OpenAI API for Slack-based RAG access to handbook, PTO, performance goals, org charts",
      "DevSecOps best practices to minimize Salesforce-induced outages and bot attacks; optimized checkout flow increasing conversion 12% YoY",
      "Led migration from legacy print subscription management to cloud-first serverless solution, cutting operational costs 75% and manual workload 50%",
    ],
  },
  {
    role: "Software Engineer",
    company: "Longevity Consulting",
    period: "Aug 2021 – Sep 2022",
    bullets: [
      "Architected full stack GRC platform with React, Django, FastAPI, GraphQL, serverless on AWS FarGate, CICD pipelines",
      "Led globally distributed agile team through full SDLC",
      "Developed RPA solutions using UiPath Studio saving $3K+/employee/year",
      "Assisted US Dept. of Education in Drupal 7→9 migration, AWS/GovCloud compliance, PIV/SAML auth",
    ],
  },
  {
    role: "Instructor & Career Coach",
    company: "Nucamp Coding Bootcamp",
    period: "Dec 2021 – Dec 2022",
    bullets: [
      "Taught 4-5 week cohorts of up to 12 web dev students, 4-hour live workshops weekly",
    ],
  },
  {
    role: "Software Engineer",
    company: "Loxe Inc",
    period: "Jul 2021 – Oct 2022",
    bullets: [
      "Built decentralized mediation platform on Cardano blockchain",
      "React + Tailwind frontend, GraphQL, crypto wallet integration (CCVault, Nami, Flint), KYC via SumSub",
    ],
  },
  {
    role: "IT Project Manager",
    company: "Asset Strategies International",
    period: "Sep 2011 – Aug 2021",
    bullets: [
      "Designed secure services with C# and SQL",
      "Orchestrated CRM/eCommerce integration (HubSpot, Shopify) with proprietary workflow sync",
      "Managed database migration from proprietary system",
    ],
  },
];

const education = [
  "BA Public Relations, University of Wisconsin-Madison",
  "Full Stack Web & Mobile Development Certificate, Nucamp",
  "Python Data Structures & Algorithms, PostgreSQL with Python, & DevOps Certificate, Nucamp",
  "AWS Certified Solutions Architect Associate",
  "AWS Certified Data Engineering Associate",
  "AWS Certified Cloud Practitioner",
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
                    <span className="text-xs font-mono text-electricBlue mt-1 sm:mt-0">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm text-cyberTeal font-medium mb-3">
                    {item.company}
                  </p>
                  <ul className="space-y-2">
                    {item.bullets.map((bullet, j) => (
                      <li
                        key={j}
                        className="text-sm text-mutedGray leading-relaxed flex gap-2"
                      >
                        <span className="text-electricBlue/60 mt-1 flex-shrink-0">▸</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {/* Education */}
            <div className="relative pl-12 sm:pl-16">
              <div className="absolute left-2.5 sm:left-4.5 top-1.5 w-3 h-3 rounded-full border-2 bg-navy border-steel" />
              <div className="bg-charcoal border border-electricBlue/10 rounded-xl p-5 hover:border-electricBlue/20 transition-all duration-300">
                <h3 className="font-mono text-base font-semibold text-white mb-2">
                  Education &amp; Certifications
                </h3>
                <p className="text-sm text-cyberTeal font-medium mb-3">
                  UW-Madison · Nucamp · AWS
                </p>
                <ul className="space-y-2">
                  {education.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm text-mutedGray leading-relaxed flex gap-2"
                    >
                      <span className="text-electricBlue/60 mt-1 flex-shrink-0">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
