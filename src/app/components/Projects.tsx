'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

type Project = {
  title: string;
  description: string;
  metrics: string;
  tags: string[];
  link?: string;
  diagram?: string;
};

const projects: Project[] = [
  {
    title: "Health & Activity Analytics Pipeline",
    description:
      "Designed a production-grade data platform architecture around asset-centric orchestration, then directed AI tooling to build within it. I architected the medallion model (Bronze/Silver/Gold), defined data quality contracts via Great Expectations, and established Kafka streaming patterns. The result: a documented human-in-the-loop workflow where architectural decisions are mine and mechanical implementation is AI-directed. 17 passing dbt tests, 3 validated GX suites, real-time streaming extension via Kafka.",
    metrics: "3 live APIs • 17 dbt tests • 3 GX suites • Kafka streaming",
    tags: ["Dagster", "dbt Core", "DuckDB", "Great Expectations", "Kafka", "AI-Directed Workflow"],
    link: "https://github.com/agalloch88/data-pipeline",
    diagram:
      "graph LR; Oura/GitHub/OpenWeatherMap -> Dagster Orchestration -> DuckDB Bronze -> Silver -> Gold -> dbt Core Transforms -> Streamlit Dashboard.",
  },
  {
    title: "Email Service Provider Migration",
    description:
      "The Philadelphia Inquirer needed to exit Salesforce Marketing Cloud without losing subscriber history or segmentation, so I designed a controlled migration path. I built pipelines from Salesforce Service Cloud into Marigold SailThru with rigorous field mapping, validation, and reconciliation. The cutover preserved segmentation and engagement history, achieved zero data loss, and reduced annual platform costs by over $100K.",
    metrics: "$100K+ annual savings • Zero subscriber data loss",
    tags: ["Python", "Salesforce", "AWS", "Data Pipelines"],
    diagram:
      "graph LR; Salesforce Marketing Cloud -(Legacy State)-> Migration Pipelines; Salesforce Service Cloud -(Subscriber Records)-> Migration Pipelines -> Field Mapping + Validation -> Reconciliation Layer -> Marigold SailThru -> Segmented Lists and Engagement History.",
  },
  {
    title: "Serverless ETL Platform",
    description:
      "Legacy billing ETL ran on always-on servers and required frequent manual intervention, so I replaced it with an event-driven AWS architecture. The flow used EventBridge, Lambda, SQS, DynamoDB, and S3 to decouple ingestion, transformation, and reconciliation while maintaining state and auditability. This shift cut infrastructure costs by 75% and reduced manual operations by half.",
    metrics: "75% cost reduction • 50% less manual workload",
    tags: ["AWS Lambda", "EventBridge", "SQS", "DynamoDB", "Serverless Framework"],
    diagram:
      "graph LR; Billing Event Trigger -> EventBridge -> Lambda Ingest -> SQS Queue -> Lambda Transform -> S3 Raw Storage and DynamoDB State + Audit -> Lambda Reconcile.",
  },
  {
    title: "AI/RAG Historical Archive",
    description:
      "The Inquirer's 45-year archive was locked in siloed content systems with no unified search capability, so I designed and deployed a privately-hosted RAG application to surface it. I built an embedding pipeline over 1977-to-present articles, set up a vector retrieval layer, and hosted the inference stack internally to satisfy legal and editorial controls around proprietary content. The result: journalists and editors can now surface decades of institutional knowledge in seconds.",
    metrics: "45+ years of searchable archive • Private hosting",
    tags: ["Python", "OpenAI", "RAG", "Vector DB", "AWS"],
  },
  {
    title: "ETL Pipeline Reengineering",
    description:
      "Legacy Informatica pipelines were brittle, expensive to maintain, and locked behind proprietary licensing that inflated costs without delivering flexibility. I rewrote the critical paths in Python and PySpark, replacing vendor-owned processes with testable, version-controlled code. The migration delivered 50% better resilience on failure recovery and eliminated the Informatica licensing overhead entirely.",
    metrics: "$120K/year savings • 50% more resilient",
    tags: ["Python", "PySpark", "ETL", "Data Engineering"],
  },
  {
    title: "Internal HR Chatbot",
    description:
      "HR was fielding repetitive questions about PTO, org structure, and policy that consumed significant time and created inconsistent answers. I built a RAG-powered chatbot embedded directly in Slack, indexing the employee handbook, org charts, and policy documents into a vector store backed by the OpenAI API. Employees get authoritative, instant answers without leaving their workflow; HR gets fewer tickets.",
    metrics: "Slack-native • Real-time RAG responses",
    tags: ["OpenAI API", "Slack", "Python", "RAG"],
  },
  {
    title: "Full Stack GRC Platform",
    description:
      "Longevity Consulting's GRC processes were entirely manual, tracked across spreadsheets with no audit trail, no workflow automation, and no visibility across risk domains. I designed and built a full-stack platform with a React front end, Django and FastAPI services, a GraphQL API layer, and containerized deployment on AWS Fargate. The platform gave compliance teams a single source of truth with automated workflows and full audit history.",
    metrics: "Full stack • Enterprise GRC",
    tags: ["React", "Django", "FastAPI", "GraphQL", "AWS Fargate"],
  },
];

const springConfig = { stiffness: 300, damping: 30 };

type Mermaid = {
  initialize: (config: {
    startOnLoad: boolean;
    theme: string;
    themeVariables: {
      background: string;
      primaryColor: string;
      primaryBorderColor: string;
      primaryTextColor: string;
      lineColor: string;
    };
  }) => void;
  run: (options?: { nodes?: Element[] }) => void;
};

declare global {
  interface Window {
    mermaid?: Mermaid;
  }
}

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
  const runMermaid = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const { mermaid } = window;
    if (!mermaid || typeof mermaid.run !== 'function') return false;
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        background: '#0b1b2b',
        primaryColor: '#0f2d46',
        primaryBorderColor: '#2ac3de',
        primaryTextColor: '#e6edf3',
        lineColor: '#5a6b7a',
      },
    });
    const nodes = Array.from(document.querySelectorAll('.mermaid'));
    if (nodes.length === 0) return true;
    mermaid.run({ nodes });
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tryRun = () => {
      if (cancelled) return;
      const ok = runMermaid();
      if (!ok && attempts < 10) {
        attempts += 1;
        window.setTimeout(tryRun, 200);
      }
    };
    tryRun();
    return () => {
      cancelled = true;
    };
  }, [runMermaid]);

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
          {projects.map((project, index) => (
            <TiltCard
              key={project.title}
              skip={skip}
              index={index}
              className={`relative bg-charcoal card-glow border border-electricBlue/10 rounded-xl p-6 hover:border-electricBlue/30 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(42,195,222,0.15)] transition-all transition-shadow duration-300 group ${
                index < 2 ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              <h3 className="relative z-10 font-mono text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                {project.title}
              </h3>
              <p className="relative z-10 text-mutedGray text-sm mb-3 leading-relaxed group-hover:text-gray-200">
                {project.description}
              </p>
              <div className="relative z-10 flex flex-wrap gap-1.5 mb-4">
                {project.metrics.split(" • ").map((metric) => (
                  <span
                    key={metric}
                    className="bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs rounded-full px-3 py-0.5 font-medium"
                  >
                    {metric}
                  </span>
                ))}
              </div>
              <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-mono bg-navy border border-steel/30 text-cyberTeal rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {project.diagram && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-orange-400 hover:text-orange-300 list-none flex items-center gap-1">
                      <span className="group-open:hidden">▶ How it works</span>
                      <span className="hidden group-open:inline">▼ How it works</span>
                    </summary>
                    <div className="mt-2">
                      <pre className="mermaid text-xs">{project.diagram}</pre>
                    </div>
                  </details>
                </div>
              )}
              {project.link ? (
                <a
                  href={project.link}
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

        {/* Currently Building */}
        <div className="mt-16">
          <h3 className="font-mono text-lg font-semibold text-white mb-2">Currently Building</h3>
          <div className="w-12 h-0.5 bg-cyberTeal mb-4 rounded-full" />
          <p className="text-mutedGray text-sm mb-6 max-w-xl">
            Side projects I ship on nights and weekends. Full-stack execution from idea to production.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://roampage.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-charcoal border border-white/10 hover:border-cyberTeal/30 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🗺️</span>
                <span className="font-mono text-sm font-semibold text-white group-hover:text-cyberTeal transition-colors">Roampage</span>
                <span className="text-xs text-steel ml-auto">Live</span>
              </div>
              <p className="text-xs text-mutedGray leading-relaxed">
                Surprise trip planner with PIN-protected reveal pages, itinerary builder, and LemonSqueezy Pro tier. Next.js, Supabase, Vercel.
              </p>
            </a>
            <a
              href="https://tryangles.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-charcoal border border-white/10 hover:border-cyberTeal/30 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🥋</span>
                <span className="font-mono text-sm font-semibold text-white group-hover:text-cyberTeal transition-colors">TryAngles</span>
                <span className="text-xs text-steel ml-auto">Spring 2026</span>
              </div>
              <p className="text-xs text-mutedGray leading-relaxed">
                BJJ lifestyle apparel brand. Pre-launch email capture. Static site with custom WebGL GLSL shader.
              </p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
