import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "API Design for Data Engineers: Building Reliable Data Ingestion Endpoints | Ryan Kirsch",
  description:
    "A data engineer's guide to API design for data ingestion. Pagination patterns, rate limiting, idempotency keys, webhook reliability, and the design decisions that determine whether an API is pleasant or painful to build pipelines on.",
  openGraph: {
    title:
      "API Design for Data Engineers: Building Reliable Data Ingestion Endpoints",
    description:
      "Pagination, rate limiting, idempotency, webhooks, and the design decisions that determine whether an API is pleasant or painful to build pipelines on.",
    type: "article",
    url: "https://ryankirsch.dev/blog/api-design-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Design for Data Engineers: Building Reliable Data Ingestion Endpoints",
    description:
      "Pagination, rate limiting, idempotency, webhooks, and the decisions that make an API pipeline-friendly.",
  },
  alternates: { canonical: "/blog/api-design-data-engineers" },
};

export default function APIDesignDataEngineersPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/api-design-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "API Design for Data Engineers: Building Reliable Data Ingestion Endpoints"
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
          <p className="text-sm font-mono text-cyberTeal uppercase tracking-[0.2em]">
            Blog
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            API Design for Data Engineers: Building Reliable Data Ingestion
            Endpoints
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">8 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data engineers spend a significant amount of time consuming APIs
            built by other teams. Some APIs are a pleasure to pipeline --
            predictable pagination, reliable rate limit headers, stable schemas,
            and idempotent endpoints. Others are a nightmare. Understanding
            what makes an API pipeline-friendly helps both when you are
            evaluating whether to build on a source API and when you are
            designing data endpoints yourself.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Pagination Patterns: Cursor vs. Offset
            </h2>
            <p>
              Pagination is the first major design decision that affects
              pipeline reliability. The two main approaches have very different
              failure modes for data engineering use cases.
            </p>
            <p>
              <strong>Offset pagination</strong> uses <code>?page=2&page_size=100</code>
              or <code>?offset=200&limit=100</code>. It is simple to implement
              and understand. The problem: if records are inserted or deleted
              while your pipeline is paginating, pages shift. You can miss
              records or see the same record on two different pages. For
              pipelines that take minutes to paginate through large datasets,
              this is a real risk.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Offset pagination -- simple but fragile
import httpx

def fetch_all_orders_offset(base_url: str, api_key: str) -> list[dict]:
    """Offset pagination -- OK for static datasets, risky for live ones."""
    orders = []
    page = 1
    
    while True:
        resp = httpx.get(
            f"{base_url}/orders",
            params={"page": page, "page_size": 100},
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
        
        if not data["orders"]:
            break
        orders.extend(data["orders"])
        page += 1
    
    return orders`}</code>
            </pre>
            <p>
              <strong>Cursor pagination</strong> uses an opaque cursor that
              represents a position in the dataset. Each response includes
              a cursor for the next page. New inserts do not shift existing
              pages because position is not based on record count.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Cursor pagination -- stable and reliable
def fetch_all_orders_cursor(base_url: str, api_key: str) -> list[dict]:
    """Cursor pagination -- stable even as data changes during pagination."""
    orders = []
    cursor = None
    
    while True:
        params = {"limit": 100}
        if cursor:
            params["cursor"] = cursor
        
        resp = httpx.get(
            f"{base_url}/orders",
            params=params,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
        
        orders.extend(data["orders"])
        
        cursor = data.get("next_cursor")
        if not cursor:
            break
    
    return orders`}</code>
            </pre>
            <p>
              When designing an API that data engineers will consume, use
              cursor pagination for any dataset that changes during pagination.
              Use offset pagination only for static reference data.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Rate Limiting: The Headers That Save Pipelines
            </h2>
            <p>
              A pipeline that hits a rate limit and does not handle it
              gracefully either fails (if it raises on 429) or hammers
              the API with retries until it is blocked entirely. Reliable
              pipelines handle rate limits explicitly.
            </p>
            <p>
              API rate limit headers to look for and respect:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`import httpx
import time
from typing import Optional

def request_with_rate_limit_handling(
    url: str,
    headers: dict,
    max_retries: int = 5,
) -> httpx.Response:
    """
    Handle rate limits using the Retry-After header.
    Falls back to exponential backoff if header is absent.
    """
    for attempt in range(max_retries):
        resp = httpx.get(url, headers=headers)
        
        if resp.status_code == 429:
            # Use Retry-After header if available
            retry_after = resp.headers.get("Retry-After")
            if retry_after:
                wait_seconds = int(retry_after)
            else:
                # Exponential backoff: 1, 2, 4, 8, 16 seconds
                wait_seconds = 2 ** attempt
            
            print(f"Rate limited. Waiting {wait_seconds}s (attempt {attempt + 1})")
            time.sleep(wait_seconds)
            continue
        
        resp.raise_for_status()
        
        # Log remaining rate limit for monitoring
        remaining = resp.headers.get("X-RateLimit-Remaining")
        reset_at = resp.headers.get("X-RateLimit-Reset")
        if remaining and int(remaining) < 10:
            print(f"Warning: {remaining} API calls remaining, resets at {reset_at}")
        
        return resp
    
    raise Exception(f"Max retries exceeded for {url}")`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Idempotency: The Most Underspecified API Property
            </h2>
            <p>
              An idempotent API endpoint produces the same result whether
              called once or multiple times. This is critical for pipelines
              because network failures mean you often cannot know whether
              a request succeeded. If retrying is safe, you retry. If it
              is not, you have to implement complex state tracking.
            </p>
            <p>
              When consuming an API that creates or modifies resources,
              use idempotency keys if the API supports them:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`import uuid
import httpx

def create_order_idempotent(
    api_url: str,
    order_data: dict,
    idempotency_key: Optional[str] = None,
) -> dict:
    """
    Create an order with idempotency key.
    Safe to retry: same key = same result, no duplicates.
    """
    if idempotency_key is None:
        # Derive a deterministic key from the order data
        # This way, retrying the same order always uses the same key
        key_source = f"{order_data['customer_id']}:{order_data['external_id']}"
        idempotency_key = str(uuid.uuid5(uuid.NAMESPACE_DNS, key_source))
    
    resp = httpx.post(
        f"{api_url}/orders",
        json=order_data,
        headers={
            "Idempotency-Key": idempotency_key,
            "Authorization": "Bearer ...",
        },
    )
    
    if resp.status_code == 409:
        # Idempotency conflict: order already created with different key
        raise ValueError(f"Idempotency conflict for key {idempotency_key}")
    
    resp.raise_for_status()
    return resp.json()`}</code>
            </pre>
            <p>
              When designing an API that pipelines will write to, implement
              idempotency keys. The Idempotency-Key header is a standard
              pattern (used by Stripe, Square, and others). A server stores
              the request and response for a configurable window (typically
              24 hours) and returns the cached response for duplicate keys.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Webhooks: Reliable Event Delivery
            </h2>
            <p>
              Webhooks push events to your endpoint rather than requiring
              polling. They are more efficient for near-real-time data, but
              they introduce reliability challenges that polling does not have.
            </p>
            <p>
              The critical webhook implementation requirements for pipelines:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from fastapi import FastAPI, Request, HTTPException
import hashlib
import hmac
import json

app = FastAPI()

WEBHOOK_SECRET = "your_webhook_secret"

@app.post("/webhooks/orders")
async def handle_order_webhook(request: Request):
    # 1. Verify the signature (prevents spoofing)
    signature = request.headers.get("X-Signature-SHA256")
    body = await request.body()
    
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    
    if not hmac.compare_digest(f"sha256={expected}", signature or ""):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # 2. Parse the event
    event = json.loads(body)
    event_id = event.get("id")
    event_type = event.get("type")
    
    # 3. Deduplicate (webhooks deliver at-least-once)
    if is_duplicate_event(event_id):
        return {"status": "already_processed"}
    
    # 4. Enqueue for async processing (return 200 immediately)
    # Do NOT process inline -- slow handlers cause delivery failures
    enqueue_event(event)
    
    # 5. Return 200 quickly (webhook will retry if you return 5xx)
    return {"status": "accepted", "event_id": event_id}`}</code>
            </pre>
            <p>
              The key rules for webhook consumers: verify signatures, return
              200 immediately and process asynchronously, deduplicate event
              IDs (webhooks guarantee at-least-once delivery), and handle
              out-of-order delivery gracefully.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Incremental Data APIs: The Pattern That Saves Hours
            </h2>
            <p>
              The most pipeline-friendly API pattern is one that supports
              incremental fetching -- returning only records that changed
              since a given timestamp. Without this, every pipeline run
              must re-fetch and deduplicate the entire dataset.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# Consuming an API that supports incremental fetching
from datetime import datetime, timezone
import httpx

def fetch_orders_since(
    api_url: str,
    api_key: str,
    since: datetime,
    batch_size: int = 500,
) -> list[dict]:
    """
    Fetch only orders modified after 'since'.
    Use the last successful run timestamp as 'since'.
    """
    orders = []
    cursor = None
    since_iso = since.isoformat()
    
    while True:
        params = {
            "updated_at_gte": since_iso,
            "limit": batch_size,
            "sort": "updated_at_asc",  # Stable sort for pagination
        }
        if cursor:
            params["cursor"] = cursor
        
        resp = httpx.get(
            f"{api_url}/orders",
            params=params,
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()
        
        orders.extend(data["orders"])
        cursor = data.get("next_cursor")
        
        if not cursor:
            break
    
    return orders`}</code>
            </pre>
            <p>
              When designing an API that data engineers will consume
              incrementally, support <code>updated_at_gte</code> or
              equivalent filter parameters, return results sorted by
              update time, and use cursor pagination within the incremental
              window. This single design decision reduces ingestion cost
              and latency by orders of magnitude for large datasets.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-steel">
          <p className="text-sm text-mutedGray">Share this post:</p>
          <div className="mt-3 flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              Twitter/X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electricBlue hover:text-white transition-colors text-sm font-mono"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-steel">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-cyberTeal/20 border border-cyberTeal/40 flex items-center justify-center flex-shrink-0">
              <span className="text-cyberTeal font-bold text-sm">RK</span>
            </div>
            <div>
              <p className="font-semibold text-white">Ryan Kirsch</p>
              <p className="text-sm text-mutedGray mt-1">
                Senior Data Engineer with experience building production
                pipelines at scale. Works with dbt, Snowflake, and Dagster, and
                writes about data engineering patterns from production
                experience.{" "}
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
      </div>
    </main>
  );
}
