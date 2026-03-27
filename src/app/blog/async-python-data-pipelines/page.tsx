import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Async Python for Data Engineering: When and How to Use It | Ryan Kirsch",
  description:
    "Async Python with asyncio and aiohttp can dramatically speed up I/O-bound data pipelines. When async helps, when it doesn't, practical patterns for concurrent API calls, and how to avoid common async pitfalls.",
  openGraph: {
    title: "Async Python for Data Engineering: When and How to Use It",
    description:
      "Async Python with asyncio and aiohttp can dramatically speed up I/O-bound data pipelines. When async helps, when it doesn't, practical patterns for concurrent API calls, and how to avoid common async pitfalls.",
    type: "article",
    url: "https://ryankirsch.dev/blog/async-python-data-pipelines",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Async Python for Data Engineering: When and How to Use It",
    description:
      "Async Python with asyncio and aiohttp can dramatically speed up I/O-bound data pipelines. When async helps, when it doesn't, practical patterns for concurrent API calls, and how to avoid common async pitfalls.",
  },
  alternates: { canonical: "/blog/async-python-data-pipelines" },
};

export default function AsyncPythonPost() {
  const postUrl = encodeURIComponent("https://ryankirsch.dev/blog/async-python-data-pipelines");
  const postTitle = encodeURIComponent("Async Python for Data Engineering: When and How to Use It");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Blog</Link>
      </div>
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">Python</span>
            <span className="text-sm text-gray-500">March 27, 2026</span>
            <span className="text-sm text-gray-500">8 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Async Python for Data Engineering: When and How to Use It
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Fetching 500 API endpoints sequentially takes 500x longer than it needs to. Async Python solves I/O-bound bottlenecks that threading and multiprocessing cannot address as cleanly.
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-800">
          <p>
            Data pipelines spend a lot of time waiting. Waiting for HTTP responses, waiting for database queries to return, waiting for S3 reads to complete. In synchronous Python, each wait blocks the entire process. In async Python, the process can move on to other work while waiting, which means you can run dozens or hundreds of concurrent operations with a single thread.
          </p>
          <p>
            This guide covers the async mental model, practical patterns for concurrent API ingestion, rate limiting, and error handling, and the honest assessment of when async is not the right tool.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Async Mental Model</h2>
          <p>
            Async Python uses cooperative multitasking: coroutines voluntarily yield control when they are waiting for I/O, allowing other coroutines to run. This is different from threading (OS-managed preemptive switching) and multiprocessing (separate processes).
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import asyncio
import aiohttp
import time

# Synchronous: 10 requests take 10 * response_time
def fetch_sync(urls: list[str]) -> list[dict]:
    results = []
    for url in urls:
        response = requests.get(url)  # blocks here
        results.append(response.json())
    return results

# Async: 10 requests take ~1 * response_time (concurrent)
async def fetch_one(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json()

async def fetch_all(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# Run the async code
results = asyncio.run(fetch_all(urls))`}
          </pre>
          <p>
            The key primitives: <code>async def</code> defines a coroutine. <code>await</code> yields control while waiting. <code>asyncio.gather()</code> runs multiple coroutines concurrently and waits for all of them to complete. <code>asyncio.run()</code> is the entry point that creates an event loop and runs a coroutine.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Concurrent API Ingestion with Rate Limiting</h2>
          <p>
            The most common async pattern in data engineering is fetching data from many API endpoints concurrently. Without rate limiting, this will exceed most API quotas immediately. Use a semaphore to limit concurrency.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import asyncio
import aiohttp
from typing import Optional
import logging

logger = logging.getLogger(__name__)

async def fetch_with_retry(
    session: aiohttp.ClientSession,
    url: str,
    semaphore: asyncio.Semaphore,
    max_retries: int = 3,
    backoff_base: float = 1.0
) -> Optional[dict]:
    """Fetch a URL with semaphore-limited concurrency and exponential backoff."""
    async with semaphore:  # limits concurrent requests
        for attempt in range(max_retries):
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    if resp.status == 429:  # rate limited
                        retry_after = int(resp.headers.get('Retry-After', 60))
                        logger.warning(f"Rate limited, waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue
                    resp.raise_for_status()
                    return await resp.json()
            except aiohttp.ClientError as e:
                if attempt == max_retries - 1:
                    logger.error(f"Failed after {max_retries} attempts: {url} — {e}")
                    return None
                delay = backoff_base * (2 ** attempt)
                await asyncio.sleep(delay)
    return None

async def ingest_api_endpoints(
    urls: list[str],
    max_concurrent: int = 20
) -> list[dict]:
    """Fetch all endpoints with controlled concurrency."""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_retry(session, url, semaphore)
            for url in urls
        ]
        results = await asyncio.gather(*tasks, return_exceptions=False)
    
    # Filter out None results (failed fetches)
    successful = [r for r in results if r is not None]
    logger.info(f"Fetched {len(successful)}/{len(urls)} endpoints successfully")
    return successful`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Batching with asyncio.gather</h2>
          <p>
            For very large sets of URLs, launching all tasks at once and relying solely on a semaphore can accumulate too many coroutines in memory. Batching provides a cleaner alternative.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`async def fetch_in_batches(
    urls: list[str],
    batch_size: int = 50,
    delay_between_batches: float = 0.5
) -> list[dict]:
    """Process URLs in batches with a delay between batches."""
    all_results = []
    
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(urls), batch_size):
            batch = urls[i:i + batch_size]
            semaphore = asyncio.Semaphore(batch_size)
            
            tasks = [fetch_with_retry(session, url, semaphore) for url in batch]
            batch_results = await asyncio.gather(*tasks)
            all_results.extend(r for r in batch_results if r is not None)
            
            if i + batch_size < len(urls):
                await asyncio.sleep(delay_between_batches)
    
    return all_results`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Async Database Operations</h2>
          <p>
            Standard database drivers (psycopg2, sqlite3) are synchronous and block the event loop when used in async code. Use async drivers instead.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`import asyncpg  # async PostgreSQL driver
import asyncio

async def batch_insert(records: list[dict], dsn: str) -> int:
    """Insert records concurrently using connection pool."""
    pool = await asyncpg.create_pool(dsn, min_size=5, max_size=20)
    
    async def insert_one(record: dict) -> bool:
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO events (event_id, user_id, amount, event_date)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (event_id) DO UPDATE SET
                    amount = EXCLUDED.amount
            """, record['event_id'], record['user_id'],
                record['amount'], record['event_date'])
            return True
    
    tasks = [insert_one(r) for r in records]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    await pool.close()
    successes = sum(1 for r in results if r is True)
    return successes`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Integrating Async into Dagster</h2>
          <p>
            Dagster assets are synchronous by default. Running async code inside a Dagster asset requires <code>asyncio.run()</code>.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-6">
            {`from dagster import asset
import asyncio

@asset
def api_ingestion_results(context) -> list[dict]:
    """Sync Dagster asset wrapping async fetch logic."""
    urls = generate_api_urls(context)
    
    context.log.info(f"Fetching {len(urls)} endpoints concurrently")
    results = asyncio.run(fetch_in_batches(urls, batch_size=50))
    context.log.info(f"Fetched {len(results)} records")
    
    return results`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When Async Is Not the Right Tool</h2>
          <p>
            Async helps with I/O-bound work: HTTP requests, database queries, file reads. It does not help with CPU-bound work: data transformation, compression, encryption, mathematical computation. For CPU-bound work, use multiprocessing or Spark.
          </p>
          <p>
            Async adds complexity. The code is harder to read than synchronous code, exceptions propagate differently, and debugging requires understanding the event loop. For a pipeline that makes a handful of API calls, the concurrency gain does not justify the complexity overhead. Use async when you genuinely need to make dozens or hundreds of concurrent I/O calls.
          </p>
          <p>
            Also avoid async when the downstream system cannot handle the concurrency. A database with 20 connections cannot benefit from 100 concurrent async queries. The connection pool becomes the bottleneck, and you have added complexity without gaining performance. Profile first, optimize second.
          </p>
          <p>
            For the cases where async applies well (large-scale API ingestion, concurrent file uploads, parallel database reads), the performance improvement is dramatic. A pipeline that fetches 1,000 endpoints sequentially and takes 16 minutes can be reduced to under a minute with well-structured async concurrency. That improvement is real and worth the engineering investment when the use case is right.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Found this useful? Share it:</p>
          <div className="flex gap-4">
            <a href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on X</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Share on LinkedIn</a>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">← Back to all posts</Link>
        </div>
      </article>
    </main>
  );
}
