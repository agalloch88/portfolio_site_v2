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
      "Personal health data was fragmented across wearables, coding activity, and environmental signals, so I unified it into a single analytical flow. I built a Dagster-orchestrated ELT on DuckDB with a dbt Core medallion model, pulling from Oura, GitHub, and OpenWeatherMap. The result was 17 data quality tests and a Streamlit view that surfaced clear wellness and productivity correlations.",
    metrics: "3 live APIs • 17 dbt tests • Medallion architecture",
    tags: ["Dagster", "dbt Core", "DuckDB", "Python", "Streamlit"],
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
    title: "Interview Drill Pack",
    description:
      "Built and launched a paid digital product for data engineering and AI interview preparation. 50 real interview questions with model answers, scoring rubrics, and a 7-day prep plan. Full marketing funnel: landing page with lead magnet email capture, free 10-question guide, and Gumroad checkout integration.",
    metrics: "Live at drills.ryankirsch.dev · 50 questions · Gumroad checkout",
    tags: ["Static HTML/CSS", "FormSubmit", "Gumroad", "Vercel", "SEO", "Product Launch"],
    link: "https://drills.ryankirsch.dev",
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
              <p className="relative z-10 text-xs text-steel mb-4 group-hover:text-gray-300">
                {project.metrics}
              </p>
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
      </div>
    </section>
  );
}
