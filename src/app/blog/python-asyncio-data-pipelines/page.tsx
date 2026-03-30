import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Python AsyncIO for Data Engineers: Building Concurrent Pipelines | Ryan Kirsch - Data Engineer",
  description:
    "How to use Python asyncio to build high-throughput data pipelines: async/await patterns, concurrent HTTP fetching with aiohttp, asyncio.gather, semaphores for rate limiting, and real-world pipeline architecture.",
  openGraph: {
    title:
      "Python AsyncIO for Data Engineers: Building Concurrent Pipelines | Ryan Kirsch - Data Engineer",
    description:
      "How to use Python asyncio to build high-throughput data pipelines: async/await patterns, concurrent HTTP fetching with aiohttp, asyncio.gather, semaphores for rate limiting, and real-world pipeline architecture.",
    type: "article",
    url: "https://ryankirsch.dev/blog/python-asyncio-data-pipelines",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Python AsyncIO for Data Engineers: Building Concurrent Pipelines | Ryan Kirsch - Data Engineer",
    description:
      "How to use Python asyncio to build high-throughput data pipelines: async/await patterns, concurrent HTTP fetching with aiohttp, asyncio.gather, semaphores for rate limiting, and real-world pipeline architecture.",
  },
  alternates: { canonical: "/blog/python-asyncio-data-pipelines" },
};

export default function PythonAsyncioDataPipelinesPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/python-asyncio-data-pipelines"
  );
  const postTitle = encodeURIComponent(
    "Python AsyncIO for Data Engineers: Building Concurrent Pipelines"
  );

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="inline-flex items-center text-sm text-mutedGray">
          <span className="text-electricBlue">&larr;</span>
          <Link
            href="/"
            className="ml-2 text-electricBlue hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/blog"
            className="text-electricBlue hover:text-white transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="mt-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {["Python", "AsyncIO", "Data Pipelines", "Concurrency", "aiohttp", "Data Engineering"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-1 rounded bg-steel/10 text-mutedGray border border-steel/20"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Python AsyncIO for Data Engineers: Building Concurrent Pipelines
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 29, 2026 &middot; 10 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            Data engineering pipelines spend most of their time waiting: waiting for HTTP responses,
            waiting for database queries, waiting for file reads to complete. Synchronous Python
            processes one wait at a time. AsyncIO processes many simultaneously. For I/O-bound
            pipelines, switching from synchronous to async can reduce total runtime by an order of
            magnitude without adding hardware or rewriting logic in a distributed framework.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            The Core Concept: Cooperative Multitasking
          </h2>
          <p>
            AsyncIO is not multithreading and it is not multiprocessing. It runs in a single thread
            on a single CPU core. The event loop manages a queue of coroutines. When a coroutine
            hits an <code>await</code> expression, it yields control back to the event loop, which
            immediately runs another coroutine that is ready to proceed. No coroutine blocks the
            others while it waits for I/O.
          </p>
          <p>
            This model is efficient for I/O-bound work because the bottleneck is network latency
            or disk throughput, not CPU computation. For CPU-bound work (parsing large files,
            running transformations), asyncio adds overhead without benefit. Use
            <code>multiprocessing</code> or a distributed framework like Spark for CPU-bound tasks.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import time

async def fetch_data(item_id: int) -> dict:
    # Simulate an API call that takes 1 second
    await asyncio.sleep(1)
    return {"id": item_id, "value": item_id * 10}

async def main():
    start = time.monotonic()

    # Run 10 "fetches" concurrently
    results = await asyncio.gather(*[fetch_data(i) for i in range(10)])

    elapsed = time.monotonic() - start
    print(f"Fetched {len(results)} items in {elapsed:.2f}s")
    # Output: Fetched 10 items in 1.00s
    # Synchronous equivalent would take 10 seconds

asyncio.run(main())`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Concurrent HTTP Fetching with aiohttp
          </h2>
          <p>
            The most common asyncio use case in data engineering is concurrent HTTP fetching from
            external APIs. The standard library <code>urllib</code> and the <code>requests</code>
            library are synchronous. Use <code>aiohttp</code> for async HTTP.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import aiohttp
from typing import Any

async def fetch_entity(
    session: aiohttp.ClientSession,
    entity_id: int,
    base_url: str
) -> dict[str, Any]:
    url = f"{base_url}/entities/{entity_id}"
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.json()

async def fetch_all_entities(
    entity_ids: list[int],
    base_url: str
) -> list[dict[str, Any]]:
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_entity(session, eid, base_url)
            for eid in entity_ids
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)

# Usage
entity_ids = list(range(1, 501))  # 500 entities
results = asyncio.run(fetch_all_entities(entity_ids, "https://api.example.com"))`}
          </pre>
          <p>
            Note the <code>return_exceptions=True</code> flag on <code>asyncio.gather</code>.
            Without it, a single failed request raises an exception and cancels all pending tasks.
            With it, exceptions are returned as values in the results list, and you can handle
            failures per-item after the gather completes.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Rate Limiting with Semaphores
          </h2>
          <p>
            Firing 500 concurrent requests at an API that rate-limits at 50 requests per second
            will get your IP blocked. Use <code>asyncio.Semaphore</code> to cap concurrency.
            A semaphore is a counter that limits how many coroutines can run a given section
            of code simultaneously.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import aiohttp
from typing import Any

MAX_CONCURRENT = 20  # max simultaneous in-flight requests

async def fetch_with_semaphore(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    entity_id: int,
    base_url: str
) -> dict[str, Any]:
    async with semaphore:  # blocks if MAX_CONCURRENT tasks are already running
        url = f"{base_url}/entities/{entity_id}"
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            resp.raise_for_status()
            return await resp.json()

async def fetch_batch(entity_ids: list[int], base_url: str) -> list[dict]:
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_semaphore(session, semaphore, eid, base_url)
            for eid in entity_ids
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Error Handling and Retries
          </h2>
          <p>
            Production pipelines need retry logic for transient failures: rate limit responses
            (HTTP 429), temporary network errors, and gateway timeouts. Use exponential backoff
            to avoid hammering a struggling API.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import aiohttp

async def fetch_with_retry(
    session: aiohttp.ClientSession,
    url: str,
    max_retries: int = 3,
    backoff_base: float = 1.0
) -> dict:
    for attempt in range(max_retries):
        try:
            async with session.get(url) as response:
                if response.status == 429:
                    retry_after = int(response.headers.get("Retry-After", backoff_base * (2 ** attempt)))
                    await asyncio.sleep(retry_after)
                    continue
                response.raise_for_status()
                return await response.json()
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            if attempt == max_retries - 1:
                raise
            wait = backoff_base * (2 ** attempt)
            await asyncio.sleep(wait)
    raise RuntimeError(f"Failed after {max_retries} retries: {url}")`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Producer-Consumer Pattern for Streaming Ingestion
          </h2>
          <p>
            For pipelines that fetch data and immediately write it to a database or queue, a
            producer-consumer pattern using <code>asyncio.Queue</code> decouples the fetch rate
            from the write rate. Producers add items to the queue. Consumers process items from it.
            You tune each independently.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import aiohttp

async def producer(queue: asyncio.Queue, entity_ids: list[int], base_url: str):
    async with aiohttp.ClientSession() as session:
        semaphore = asyncio.Semaphore(30)
        async def fetch_and_enqueue(eid: int):
            async with semaphore:
                async with session.get(f"{base_url}/{eid}") as r:
                    data = await r.json()
                    await queue.put(data)
        await asyncio.gather(*[fetch_and_enqueue(eid) for eid in entity_ids])
    # Signal consumers that production is complete
    await queue.put(None)

async def consumer(queue: asyncio.Queue, output: list):
    while True:
        item = await queue.get()
        if item is None:
            break
        # Transform and write
        output.append({"id": item["id"], "processed": True})
        queue.task_done()

async def run_pipeline(entity_ids: list[int], base_url: str) -> list:
    queue = asyncio.Queue(maxsize=100)  # backpressure via bounded queue
    output = []
    await asyncio.gather(
        producer(queue, entity_ids, base_url),
        consumer(queue, output),
    )
    return output`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            When AsyncIO Is the Wrong Tool
          </h2>
          <p>
            AsyncIO is not a universal performance solution. It does not help with CPU-bound work:
            heavy data transformations, compression, encryption, or complex parsing all belong in
            separate processes via <code>concurrent.futures.ProcessPoolExecutor</code> or a
            proper distributed framework.
          </p>
          <p>
            It also does not help with database libraries that are not async-native. Libraries like
            <code>psycopg2</code> and <code>pymysql</code> are synchronous. Running them in an
            async context blocks the event loop. Use async-native alternatives like
            <code>asyncpg</code> for PostgreSQL or <code>aiomysql</code> for MySQL, or offload
            synchronous database calls to a thread pool via <code>asyncio.to_thread</code>.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`import asyncio
import psycopg2  # synchronous library

def sync_db_query(query: str) -> list:
    conn = psycopg2.connect("postgresql://user:pass@localhost/db")
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor.fetchall()

async def async_pipeline():
    # Run synchronous DB call in a thread pool to avoid blocking the event loop
    results = await asyncio.to_thread(sync_db_query, "SELECT id FROM entities")
    return results`}
          </pre>

          <h2 className="text-xl font-semibold text-white mt-10">
            Practical Starting Point
          </h2>
          <p>
            If you have a pipeline that makes sequential API calls in a loop, converting it to
            asyncio with aiohttp and a semaphore is a one-day project that reliably cuts runtime
            by 5 to 20x. Start there. Profile the result. The concurrency model is straightforward
            once you internalize that <code>await</code> is just a cooperative yield point, not
            a blocking wait.
          </p>
          <p>
            For new pipeline projects, evaluate whether the primary bottleneck is I/O (asyncio
            is the right tool) or computation (Spark, Dask, or multiprocessing is better).
            Most API ingestion pipelines and webhook consumers are I/O-bound by definition.
            AsyncIO was built for exactly this pattern.
          </p>

          <div className="mt-12 pt-8 border-t border-steel/20 space-y-4">
            <p className="text-sm text-mutedGray leading-relaxed">
              Questions or pushback on any of this?{" "}
              <a
                href="https://www.linkedin.com/in/ryanmkirsch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electricBlue hover:text-white transition-colors"
              >
                Find me on LinkedIn.
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-mutedGray hover:text-white transition-colors border border-steel/30 px-3 py-1 rounded"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-8 p-5 bg-steel/5 rounded-xl border border-steel/20">
            <p className="text-sm text-mutedGray leading-relaxed">
              <strong className="text-white">Ryan Kirsch</strong> is a senior data
              engineer with 8+ years building data infrastructure at media, SaaS, and
              fintech companies. He specializes in Kafka, dbt, Snowflake, and Spark,
              and writes about data engineering patterns from production experience.{" "}
              <Link
                href="/"
                className="text-electricBlue hover:text-white transition-colors"
              >
                See his full portfolio.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
