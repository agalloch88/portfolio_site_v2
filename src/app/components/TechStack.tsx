'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const categories = [
  {
    title: "Data Engineering",
    description: "Core stack",
    items: [
      "dbt",
      "Dagster",
      "Apache Kafka",
      "Apache Spark / PySpark",
      "DuckDB",
      "Snowflake",
      "BigQuery",
      "Apache Airflow",
    ],
  },
  {
    title: "Cloud & AI",
    description: "Platforms & pipelines",
    items: [
      "AWS",
      "GCP",
      "Python",
      "OpenAI API",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "Redis",
    ],
  },
];

const coreSkills = new Set([
  "Python",
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "FastAPI",
  "PostgreSQL",
  "Redis",
  "AWS (EC2, S3, Lambda, ECS/ECR, EKS, Fargate, Glue)",
  "GCP",
  "Docker",
  "Kubernetes",
  "BigQuery",
  "Spark (PySpark)",
  "OpenAI API",
]);

const fullStackGroups = [
  {
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL", "Bash/Shell", "Scala", "Go", "R"],
  },
  {
    title: "Frameworks & Runtimes",
    items: ["Next.js", "FastAPI", "Node.js", "React", "Spark (PySpark)", "dbt"],
  },
  {
    title: "Cloud & Infrastructure",
    items: [
      "AWS (EC2, S3, Lambda, ECS/ECR, EKS, Fargate, Glue)",
      "GCP",
      "Azure",
      "Docker",
      "Kubernetes",
      "Terraform",
      "CI/CD pipelines",
    ],
  },
  {
    title: "Data & AI",
    items: [
      "Snowflake",
      "Databricks",
      "Airflow",
      "Kafka",
      "BigQuery",
      "Redshift",
      "PostgreSQL",
      "MySQL",
      "DuckDB",
      "Pandas",
      "NumPy",
      "OpenAI API",
    ],
  },
  {
    title: "Enterprise & Tools",
    items: [
      "Jira",
      "Confluence",
      "Tableau",
      "PowerBI",
      "GitHub",
      "GitLab",
      "DataDog",
      "Great Expectations",
      "HubSpot",
    ],
  },
];

export default function TechStack() {
  const prefersReducedMotion = useReducedMotion();
  const skip = !!prefersReducedMotion;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="skills" className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          Tech Stack
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-12 rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, catIndex) => (
            <motion.div
              key={cat.title}
              initial={skip ? undefined : { opacity: 0, y: 30 }}
              whileInView={skip ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={skip ? undefined : { duration: 0.5, delay: catIndex * 0.1, ease: 'easeOut' }}
              className="bg-charcoal card-glow border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 hover:shadow-[0_0_30px_rgba(42,195,222,0.15)] transition-all transition-shadow duration-300 hover:-translate-y-0.5 md:col-span-1"
            >
              <h3 className="font-mono text-lg font-semibold text-electricBlue mb-1">
                {cat.title}
              </h3>
              <p className="text-sm text-mutedGray mb-4">{cat.description}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item, itemIndex) => (
                  <motion.span
                    key={item}
                    initial={skip ? undefined : { opacity: 0, scale: 0.8 }}
                    whileInView={skip ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={skip ? undefined : { duration: 0.3, delay: catIndex * 0.1 + itemIndex * 0.04, ease: 'easeOut' }}
                    className="px-3 py-1 text-xs font-mono bg-navy border border-steel/30 text-lightGray rounded-full hover:border-cyberTeal/50 hover:text-white hover:bg-cyberTeal/10 transition-colors duration-200"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="border border-electricBlue/40 rounded-full px-4 py-1.5 text-sm font-mono text-electricBlue hover:bg-electricBlue/10 transition-colors cursor-pointer"
          >
            {isExpanded ? "Hide full stack" : "Show full stack ↓"}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-6 bg-charcoal/60 border border-electricBlue/10 rounded-xl p-6"
            >
              {fullStackGroups.map((group) => (
                <div key={group.title}>
                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-2 mt-4">
                    {group.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-mono bg-navy border border-steel/30 text-lightGray rounded-full"
                      >
                        {skill}
                        {coreSkills.has(skill) && (
                          <span className="ml-1 text-[9px] uppercase tracking-wider text-electricBlue/70">
                            core
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
