import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What a Data Engineer Actually Builds for an LLM Application",
  description:
    "Most AI content focuses on the model. Here is the infrastructure that makes it work in production. A Senior DE perspective on embedding pipelines, vector stores, and what actually breaks.",
  openGraph: {
    title: "What a Data Engineer Actually Builds for an LLM Application",
    description:
      "Most AI content focuses on the model. Here is the infrastructure that makes it work in production. A Senior DE perspective on embedding pipelines, vector stores, and what actually breaks.",
    type: "article",
    url: "https://ryankirsch.dev/blog/data-engineer-llm-application",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "What a Data Engineer Actually Builds for an LLM Application",
    description:
      "Most AI content focuses on the model. Here is the infrastructure that makes it work in production. A Senior DE perspective on embedding pipelines, vector stores, and what actually breaks.",
  },
  alternates: { canonical: "/blog/data-engineer-llm-application" },
};

export default function DataEngineerLlmApplicationPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/data-engineer-llm-application"
  );
  const postTitle = encodeURIComponent(
    "What a Data Engineer Actually Builds for an LLM Application"
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
            What a Data Engineer Actually Builds for an LLM Application
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · February 2026 ·{" "}
            <span className="text-cyberTeal">6 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Most AI content focuses on the model. Here is the infrastructure that makes it
            work in production.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <p className="leading-relaxed">
              Every week there is another blog post about prompt engineering, fine-tuning,
              or which frontier model wins some benchmark. What you almost never read
              about is the data layer underneath. That layer is why the LLM application
              works. It is also why most LLM applications fail quietly: the retrieval is
              bad, the context is stale, and nobody can tell why.
            </p>
            <p className="leading-relaxed">
              I am a Senior Data Engineer at The Philadelphia Inquirer. We build with
              Dagster, dbt, and DuckDB. Over the last year I have spent a significant
              chunk of my time on LLM-adjacent infrastructure: ingestion pipelines,
              embedding workflows, vector store integrations. This is what that work
              actually looks like.
            </p>
            <p className="leading-relaxed">
              Not theory. Not a vendor tutorial. Here is what a data engineer owns,
              builds, and maintains when a team ships an LLM application.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Data Layer No One Talks About</h2>
            <p className="leading-relaxed">Here is the stack, top to bottom:</p>
            <pre>
              <code>{`data source → ingestion pipeline → chunking + embedding → vector store → retrieval layer → LLM → application`}</code>
            </pre>
            <p className="leading-relaxed">
              The DE owns everything from &quot;data source&quot; through &quot;retrieval layer.&quot; The
              model, the prompt templates, the frontend: those belong to other people.
              The infrastructure that gets the right content in front of the model at
              query time is mine.
            </p>
            <p className="leading-relaxed">What that means concretely:</p>
            <ul>
              <li>
                <strong>Ingestion.</strong> Pulling from APIs, web sources, databases, file
                systems. Handling rate limits, auth failures, schema changes, and the fun
                situation where the upstream just... returns different fields now.
              </li>
              <li>
                <strong>Cleaning and transformation.</strong> Stripping HTML artifacts,
                normalizing encoding, deduplicating, structuring unstructured text into
                something a chunker can work with.
              </li>
              <li>
                <strong>Chunking and embedding.</strong> Splitting documents into chunks that
                will retrieve well. Running those chunks through an embedding model.
                Storing the vectors with their metadata.
              </li>
              <li>
                <strong>Vector store integration.</strong> Writing to pgvector or Pinecone,
                maintaining indexes, and making sure the retrieval queries are actually
                returning relevant results.
              </li>
              <li>
                <strong>Retrieval quality.</strong> This is ongoing. It is not a one-time
                setup. The pipeline needs monitoring the same way any production data
                pipeline does.
              </li>
            </ul>
            <p className="leading-relaxed">That is the scope. It is more than most job descriptions suggest.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">The Three Hardest Engineering Problems</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Chunking strategy</h3>
              <p className="leading-relaxed">
                How you split a document determines what the retrieval layer can find.
                Get it wrong and the LLM gets irrelevant context or no coherent context
                at all.
              </p>
              <p className="leading-relaxed">
                Chunk too large: the retrieved chunk contains the answer buried in 2,000
                tokens of noise. The model either misses it or hallucinates around it.
                Chunk too small: each chunk is semantically incomplete. A three-sentence
                chunk about a medication side effect means nothing without the two
                sentences before it that name the medication.
              </p>
              <p className="leading-relaxed">
                There is no universal right answer. The correct chunk size depends on
                the document type, the query patterns, and how the retrieval layer ranks
                results. I have shipped with 512-token chunks for article content and
                128-token chunks for structured reference data. Both were right for their
                use case. The decision takes actual testing, not a tutorial default.
              </p>
              <p className="leading-relaxed">
                One thing that helps: storing chunk metadata alongside the vector.
                Section headers, document IDs, position in the original document. That
                context improves re-ranking and helps when you need to debug a bad
                retrieval result.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Embedding pipeline maintenance</h3>
              <p className="leading-relaxed">Embeddings go stale. This is the part nobody mentions in the quickstart guides.</p>
              <p className="leading-relaxed">
                When a source document updates, you cannot just update the document in
                your warehouse. You have to re-embed the affected chunks and update the
                vector store. If you do not, the vector store holds embeddings for
                content that no longer exists as written. Retrieval returns outdated
                information. The LLM confidently cites something that changed three
                months ago.
              </p>
              <p className="leading-relaxed">
                At The Inquirer, content changes constantly. Articles get updated,
                corrections get appended, stories get retracted. Any embedding pipeline
                for news content has to handle incremental re-embedding as a first-class
                concern, not a later problem.
              </p>
              <p className="leading-relaxed">
                This is where orchestration matters. In Dagster, I model the embedding
                pipeline as assets with dependencies. When the source article asset
                updates, downstream embedding assets know they are stale. The lineage is
                explicit. Without that, you are manually tracking what needs to be
                re-embedded and you will miss things.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Evaluation without ground truth</h3>
              <p className="leading-relaxed">
                How do you test a retrieval pipeline when you have no labeled dataset of
                correct answers?
              </p>
              <p className="leading-relaxed">
                This is where data engineering and ML engineering start to overlap in
                uncomfortable ways. There is no clean &quot;accuracy&quot; metric to optimize.
                You cannot compute precision and recall if you do not have a labeled
                query set. Most teams building their first LLM app do not have one.
              </p>
              <p className="leading-relaxed">
                What I actually do: build a small set of known queries with known
                expected content, run them manually against the pipeline, and evaluate
                the top-k retrieved chunks by inspection. It is slow and not rigorous.
                It also catches the obvious failures: wrong document type being
                retrieved, chunking artifacts appearing in results, a metadata filter
                gone wrong.
              </p>
              <p className="leading-relaxed">
                Over time, user feedback signals become useful. If users are repeatedly
                rephrasing the same query, retrieval is probably failing them. That is a
                signal, not a metric, but it is something.
              </p>
              <p className="leading-relaxed">
                The honest answer is that DE evaluation for RAG pipelines is an unsolved
                problem in most shops. Anyone telling you otherwise is either running at
                massive scale with real labeled data or simplifying.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">The Stack</h2>
            <p className="leading-relaxed">Here is what I actually use, without the marketing copy.</p>
            <p className="leading-relaxed">
              <strong>Ingestion:</strong> Python with <code className="font-mono text-sm text-cyberTeal">httpx</code> for async API calls,
              <code className="font-mono text-sm text-cyberTeal">requests</code> when simplicity matters, <code className="font-mono text-sm text-cyberTeal">BeautifulSoup</code> for web sources. Most news content
              lives behind internal APIs. Some of it is HTML that has to be parsed
              carefully or you end up embedding navigation menus.
            </p>
            <p className="leading-relaxed">
              <strong>Transformation:</strong> <code className="font-mono text-sm text-cyberTeal">dbt</code> for structured source data: analytics tables,
              metadata, structured logs. Custom Python for unstructured text: cleaning,
              normalization, chunking logic. dbt does not handle arbitrary text
              transformation well and I do not try to make it.
            </p>
            <p className="leading-relaxed">
              <strong>Storage:</strong> DuckDB locally and in development pipelines where I need fast
              iteration without infrastructure overhead. BigQuery or Snowflake in
              production, depending on the client or the data volume. DuckDB&apos;s
              performance for development workflows has been genuinely surprising.
            </p>
            <p className="leading-relaxed">
              <strong>Embedding:</strong> OpenAI&apos;s <code className="font-mono text-sm text-cyberTeal">text-embedding-3-small</code> for most production work:
              fast, cheap, good quality. <code className="font-mono text-sm text-cyberTeal">sentence-transformers</code> locally when I need to iterate
              quickly without API costs or when a project has data sensitivity
              requirements that rule out sending content to a third party.
            </p>
            <p className="leading-relaxed">
              <strong>Vector store:</strong> pgvector for the majority of use cases. It runs inside
              Postgres, which means one less infrastructure dependency, and it handles
              the retrieval loads I have seen in practice. Pinecone when the scale or
              the query complexity justifies a dedicated vector database. Most projects
              do not need Pinecone. The ones that do know it early.
            </p>
            <p className="leading-relaxed">
              <strong>Orchestration:</strong> Dagster. Asset-based orchestration is the right mental
              model for embedding pipelines because the lineage matters. I need to know
              which embeddings depend on which source assets, and Dagster makes that
              explicit and trackable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What Interviewers Are Actually Asking</h2>
            <p className="leading-relaxed">
              Companies hiring DEs for LLM work are asking different questions than they
              were two years ago. Schema evolution and SCD Type 2 are still there. Now
              they are sitting next to questions like: &quot;How would you design an
              embedding pipeline for a 500,000-document corpus?&quot; and &quot;What breaks first
              when your vector store goes out of sync with your source data?&quot;
            </p>
            <p className="leading-relaxed">
              These are engineering questions, not data science questions. The skill set
              is pipeline design, infrastructure thinking, and operational discipline
              applied to a new class of storage: vector indexes.
            </p>
            <p className="leading-relaxed">
              If you are preparing for DE interviews in 2025 or 2026, especially at
              companies building AI products, this is the territory you need to cover.
              I put together 25 questions I have seen in real DE interview loops,
              including 10 specifically on LLM pipeline engineering. They are at{" "}
              <a
                href="https://drills.ryankirsch.dev"
                className="text-electricBlue hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                drills.ryankirsch.dev
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <p className="leading-relaxed">
              DE work on LLM applications is infrastructure work. It is quieter than
              model development, less visible than the product surface, and more
              consequential than most teams realize until retrieval fails in production
              and the LLM starts confidently making things up. The data layer either
              works or everything downstream breaks. That is the job.
            </p>
          </section>

          <section className="space-y-4">
            <p className="leading-relaxed">
              <em>
                Preparing for data engineering interviews? The 2025-2026 Drill Pack at{" "}
                <a
                  href="https://drills.ryankirsch.dev"
                  className="text-electricBlue hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  drills.ryankirsch.dev
                </a>{" "}
                covers 25 questions across pipelines, modeling, and LLM infrastructure.
                Built from real interview loops.
              </em>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-steel/30 flex items-center gap-4">
          <span className="text-sm text-mutedGray font-mono">Share:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
            className="text-sm text-electricBlue hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter/X
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-steel/30 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-electricBlue/20 border border-electricBlue/30 flex items-center justify-center text-electricBlue font-bold flex-shrink-0 text-sm">
            RK
          </div>
          <div>
            <p className="font-semibold text-white">Ryan Kirsch</p>
            <p className="text-sm text-mutedGray mt-1">
              Data Engineer at the Philadelphia Inquirer. Writing about practical data engineering,
              local-first stacks, and systems that scale without a cloud bill.
            </p>
            <Link
              href="/"
              className="text-sm text-electricBlue hover:text-white transition-colors mt-2 inline-block"
            >
              View portfolio →
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-electricBlue">
          <Link href="/" className="hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="text-steel"> / </span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
