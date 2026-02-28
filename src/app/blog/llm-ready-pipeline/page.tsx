import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector",
  description:
    "Most data teams build pipelines to feed dashboards. AI applications need something different: low-latency retrieval, semantic search, and structured context injection.",
  openGraph: {
    title: "Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector",
    description:
      "Most data teams build pipelines to feed dashboards. AI applications need something different: low-latency retrieval, semantic search, and structured context injection.",
    type: "article",
    url: "https://ryankirsch.dev/blog/llm-ready-pipeline",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector",
    description:
      "Most data teams build pipelines to feed dashboards. AI applications need something different: low-latency retrieval, semantic search, and structured context injection.",
  },
  alternates: { canonical: "/blog/llm-ready-pipeline" },
};

export default function LlmReadyPipelinePost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/llm-ready-pipeline");
  const postTitle = encodeURIComponent(
    "Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">←</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2 text-steel">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">Blog</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · February 2026 · <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most data teams build pipelines to feed dashboards. AI applications need
            something different: low-latency retrieval, semantic search, and structured
            context injection. The moment you try to bolt a RAG system onto a traditional
            warehouse pipeline, you feel the gap immediately.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Architecture</h2>
            <p className="leading-relaxed">
              I built this pipeline at the intersection of my existing streaming work and
              a new requirement: make internal documents and structured data queryable by
              an LLM. The stack I landed on was Kafka for ingestion, DuckDB for
              pre-embedding normalization, a Python embedding layer, pgvector as the
              vector store, and Dagster tying it all together.
            </p>

            <p className="leading-relaxed">Here is how each layer actually works.</p>

            <p className="leading-relaxed">
              <strong>Kafka as the ingestion layer.</strong> Kafka handles the document
              and event stream coming in from multiple producers: CMS exports, structured
              records, and user-generated content. The key advantage here is decoupling.
              Producers do not need to know anything about the downstream embedding
              pipeline. They publish to a topic, and the pipeline consumes at its own
              pace. For document pipelines, this matters: embedding is not free, and you
              want the ability to throttle, retry, and replay without touching the source
              system.
            </p>

            <p className="leading-relaxed">
              <strong>DuckDB for batch aggregation and normalization.</strong> Before
              anything gets embedded, it needs to be clean: deduped, normalized, and
              chunked appropriately. I use DuckDB here instead of a cloud warehouse for
              two reasons. First, cost. Running aggregation queries over a few hundred
              thousand records in DuckDB is free and fast. Spinning up a Snowflake
              compute cluster for the same job would cost real money and add latency.
              Second, DuckDB runs local and in-process. I can query Parquet files from an
              S3 staging bucket directly, join against local CSVs, and write results to
              another Parquet file, all without managing any infrastructure. For the
              pre-embedding step, that simplicity is a feature.
            </p>

            <p className="leading-relaxed">
              <strong>The Python embedding layer.</strong> After normalization, documents
              hit a Python service that handles chunking and then calls an embedding
              model. I defaulted to{" "}
              <code className="font-mono text-sm bg-charcoal px-1 py-0.5 rounded">
                text-embedding-3-small
              </code>{" "}
              from OpenAI for early development because the quality-to-cost ratio is hard
              to beat at scale. For latency-sensitive or offline workloads, I tested{" "}
              <code className="font-mono text-sm bg-charcoal px-1 py-0.5 rounded">
                nomic-embed-text
              </code>{" "}
              via Ollama as a drop-in local alternative. The tradeoff: local models are
              zero marginal cost, but you are managing GPU resources and the embedding
              quality varies by domain. For general-purpose document retrieval,{" "}
              <code className="font-mono text-sm bg-charcoal px-1 py-0.5 rounded">
                text-embedding-3-small
              </code>{" "}
              held up better in my testing.
            </p>

            <p className="leading-relaxed">
              <strong>pgvector as the vector store.</strong> Vectors land in Postgres
              with the pgvector extension. I considered Pinecone and Chroma, but for this
              use case pgvector was the right call. It lives in the same Postgres instance
              I was already running. No additional service, no additional auth layer, no
              additional cost. Query performance at under 10 million vectors is solid with
              an IVFFLAT or HNSW index. For most teams building internal RAG tools,
              pgvector is genuinely enough.
            </p>

            <p className="leading-relaxed">
              <strong>Dagster for orchestration.</strong> Dagster manages the full DAG:
              consume from Kafka, run the DuckDB normalization job, call the embedding
              service, write to pgvector. The asset-based model in Dagster works well here
              because each stage has clear inputs and outputs. I can materialize individual
              assets for debugging, see lineage across the pipeline, and get alerting when
              the embedding step fails or lags.
            </p>
          </section>

          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-white">
              Three Design Decisions Worth Explaining
            </h2>

            <p className="leading-relaxed">
              <strong>1. Why DuckDB instead of a cloud warehouse as the intermediary.</strong>{" "}
              The answer comes down to the operational surface area you want to manage. A
              cloud warehouse is overkill for a normalization step that runs every 15
              minutes over a rolling 24-hour window of documents. DuckDB executes that
              query in seconds, locally, with no cluster to spin up or shut down. It also
              makes local development trivial: I can run the full pipeline on my laptop
              against a sample dataset without touching any cloud credentials. The one
              gotcha is that DuckDB is not the right tool if your normalization step
              requires concurrent writes from multiple workers. It is optimized for
              single-writer workloads.
            </p>

            <p className="leading-relaxed">
              <strong>2. Chunking strategy tradeoffs.</strong> Fixed-size chunking (512
              tokens with 64-token overlap) is the easiest to implement and works well for
              homogenous document types. Semantic chunking, where you split on sentence
              boundaries and merge until you hit a size threshold, performs better for
              mixed-format documents but adds complexity and is slower. Document-aware
              chunking, where you respect structural boundaries like headers and
              paragraphs, gave me the best retrieval quality on the documents I was
              working with: long-form articles with clear section structure. The tradeoff
              is that it requires knowing something about your document schema upfront. I
              started with fixed-size for speed and migrated to document-aware once
              retrieval quality became the primary concern.
            </p>

            <p className="leading-relaxed">
              <strong>3. When pgvector is enough vs. when to reach for Pinecone or Chroma.</strong>{" "}
              pgvector handles sub-10M vector workloads without drama, especially with an
              HNSW index and appropriate maintenance settings. Where it starts to show
              limits: very high query concurrency (hundreds of simultaneous ANN searches),
              multi-tenancy at scale, or if you need metadata filtering that would require
              complex SQL joins on every retrieval. If your retrieval layer is hitting
              pgvector from a single-threaded RAG chain, you are nowhere near its limits.
              If you are building a production search product with thousands of concurrent
              users, you probably want a dedicated vector database sooner rather than later.
            </p>
          </section>

          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-white">What I Would Do Differently</h2>
            <p className="leading-relaxed">
              If I rebuilt this from scratch, I would invest more time upfront in the
              metadata schema attached to each vector. I treated metadata as an
              afterthought initially: just document ID and a timestamp. That became painful
              when I needed to filter retrievals by document type, date range, or source
              system. Adding structured metadata to the pgvector table required a schema
              migration mid-project, and it forced me to re-embed a large chunk of
              documents to backfill. The fix is straightforward: design your metadata
              columns before you embed anything, and include enough context to filter
              without doing a full table scan. Boring advice, but I paid the tax for
              skipping it.
            </p>
          </section>

          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-white">The Takeaway</h2>
            <p className="leading-relaxed">
              LLM-ready pipelines are not a different category of infrastructure. They are
              an extension of the streaming and batch patterns data engineers already know,
              with vector storage and embedding as new primitives. The stack above scales
              from a weekend project to a production RAG system with relatively few changes.
            </p>
            <p className="leading-relaxed">
              If you are preparing for DE interviews in 2026, this architecture pattern is
              now showing up in system design rounds. I have included RAG pipeline
              questions covering vector store selection, chunking tradeoffs, and embedding
              pipeline design in the{" "}
              <a
                href="https://drills.ryankirsch.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Interview Drill Pack
              </a>
              . Worth a look if you are actively interviewing.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-steel/30">
          <p className="text-sm text-mutedGray mb-4">Share this post:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-electricBlue hover:text-white transition-colors font-mono"
            >
              Share on X →
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-electricBlue hover:text-white transition-colors font-mono"
            >
              Share on LinkedIn →
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/blog"
            className="text-sm text-electricBlue hover:text-white transition-colors font-mono"
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
