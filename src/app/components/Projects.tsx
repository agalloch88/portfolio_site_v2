'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const projects = [
  {
    title: "Health & Activity Analytics Pipeline",
    description:
      "Built an end-to-end ELT pipeline ingesting real data from Oura Ring, GitHub, and OpenWeatherMap APIs. Transforms through a medallion architecture using Dagster for asset-centric orchestration and dbt Core for SQL transformations, with DuckDB as the OLAP warehouse. Includes 17 automated data quality tests and a Streamlit dashboard for wellness correlations.",
    metrics: "3 live APIs • 17 dbt tests • Medallion architecture",
    tags: ["Dagster", "dbt Core", "DuckDB", "Python", "Streamlit"],
  },
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
  {
    title: "Roampage: Surprise Trip Planner",
    description:
      "Built a full-stack web app for planning and revealing surprise trips to partners. Features Supabase auth, PIN-protected trip reveal pages, LemonSqueezy payment integration for Pro tier, a 3D globe with real destination markers, and occasion-specific gift landing pages. Shipped from idea to paying product in under 30 days.",
    metrics: "Live at roampage.vercel.app · LemonSqueezy Pro tier",
    tags: ["Next.js 16", "Supabase", "TypeScript", "Tailwind", "LemonSqueezy", "WebGL"],
    link: "https://roampage.vercel.app",
  },
  {
    title: "TryAngles: BJJ Apparel Brand",
    description:
      "Designed and built the brand identity and landing page for a BJJ lifestyle apparel brand. Includes a custom Stripe-style WebGL FBM shader mesh gradient written in raw GLSL, mobile fallback CSS gradient, and email capture waitlist flow. Zero dependencies for the WebGL effect.",
    metrics: "Live at tryangles.shop · WebGL GLSL shader",
    tags: ["Static HTML", "WebGL / GLSL", "CSS", "JavaScript", "Brand Design"],
    link: "https://tryangles.shop",
  },
];

const springConfig = { stiffness: 300, damping: 30 };

function TiltCard({
  children,
  className,
  skip,
  index,
}: {
  children: React.ReactNode;
  className: string;
  skip: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (skip || isTouchDevice) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -10); // max 5deg each direction
      rotateY.set((x - 0.5) * 10);
    },
    [skip, isTouchDevice, rotateX, rotateY],
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      initial={skip ? undefined : { opacity: 0, y: 30 }}
      whileInView={skip ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={skip ? undefined : { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      style={
        skip
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 1000 }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Projects() {
  const prefersReducedMotion = useReducedMotion();
  const skip = !!prefersReducedMotion;

  return (
    <section id="projects" className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          What I&apos;ve Built
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-4 rounded-full" />
        <p className="text-mutedGray mb-12 max-w-2xl text-base sm:text-lg">
          Production systems powering digital media at scale, from serverless
          data pipelines to AI-powered applications over decades of content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ perspective: 1000 }}>
          {projects.map((p, index) => (
            <TiltCard
              key={p.title}
              skip={skip}
              index={index}
              className={`relative bg-charcoal card-glow border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(42,195,222,0.15)] transition-all transition-shadow duration-300 group ${
                index < 2 ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              <h3 className="relative z-10 font-mono text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                {p.title}
              </h3>
              <p className="relative z-10 text-mutedGray text-sm mb-3 leading-relaxed group-hover:text-gray-200">
                {p.description}
              </p>
              <p className="relative z-10 text-xs text-steel mb-4 group-hover:text-gray-300">{p.metrics}</p>
              <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-mono bg-navy border border-steel/30 text-cyberTeal rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {p.link ? (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 text-xs text-electricBlue hover:underline"
                >
                  View live →
                </a>
              ) : (
                <p className="relative z-10 text-xs text-steel italic">Enterprise production system</p>
              )}
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
