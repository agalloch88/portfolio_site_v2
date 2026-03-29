import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Python Type Hints and Dataclasses for Data Engineers: Writing Code That Doesn't Surprise You | Ryan Kirsch",
  description:
    "A practical guide to type hints, Pydantic, and dataclasses in data engineering pipelines. How to use Python's type system to catch data schema errors at development time instead of production time.",
  openGraph: {
    title:
      "Python Type Hints and Dataclasses for Data Engineers: Writing Code That Doesn't Surprise You",
    description:
      "A practical guide to type hints, Pydantic, and dataclasses in data engineering pipelines. Catch schema errors at development time instead of production time.",
    type: "article",
    url: "https://ryankirsch.dev/blog/python-type-hints-data-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Python Type Hints and Dataclasses for Data Engineers: Writing Code That Doesn't Surprise You",
    description:
      "A practical guide to type hints, Pydantic, and dataclasses in data engineering pipelines. Catch schema errors at development time instead of production time.",
  },
  alternates: { canonical: "/blog/python-type-hints-data-engineering" },
};

export default function PythonTypeHintsPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/python-type-hints-data-engineering"
  );
  const postTitle = encodeURIComponent(
    "Python Type Hints and Dataclasses for Data Engineers: Writing Code That Doesn't Surprise You"
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
            Python Type Hints and Dataclasses for Data Engineers: Writing Code
            That Does Not Surprise You
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · December 3, 2025 ·{" "}
            <span className="text-cyberTeal">9 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data engineering Python tends to be loosely typed, dictionary-heavy,
            and full of implicit contracts between functions. This works until
            a source API changes a field name, a pipeline function silently
            accepts the wrong shape, and you find out three stages downstream
            when something is None that should not be. Type hints and structured
            data classes are the cheapest way to fix this.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The Problem with Dictionary-Driven Pipelines
            </h2>
            <p>
              Most data engineering Python looks like this:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`def process_order(order: dict) -> dict:
    return {
        "order_id": order["order_id"],
        "revenue": order["amount"] / 100,
        "customer": order["customer_id"],
    }

# Called somewhere else, 200 lines away:
result = process_order(api_response["data"])
print(result["customer"])  # KeyError if API renamed the field`}</code>
            </pre>
            <p>
              This code has no way to tell you at development time that the
              API response might not have an <code>amount</code> field, or
              that <code>customer_id</code> was renamed to <code>customerId</code>{" "}
              in the v2 API. The failure surface is the entire pipeline, and
              the error appears at runtime on production data, not in your IDE.
            </p>
            <p>
              Type hints do not eliminate this problem entirely -- Python&apos;s
              type system is gradual and optional -- but they move a significant
              portion of the error surface to development time when combined
              with a type checker like mypy or pyright, and to ingestion time
              when combined with a validation library like Pydantic.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Type Hints: The Foundation
            </h2>
            <p>
              Python type hints are annotations that declare the expected types
              of function parameters and return values. They do not enforce
              anything at runtime on their own -- they are checked by static
              analysis tools and communicate intent to other developers.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from typing import Optional, List, Dict, Any
from datetime import datetime

# Without type hints
def extract_orders(source, start_date, end_date):
    pass

# With type hints -- immediately communicates contract
def extract_orders(
    source: str,
    start_date: datetime,
    end_date: datetime,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    pass

# Modern Python (3.10+) uses union operator instead of Optional
def get_customer(
    customer_id: str,
    include_deleted: bool = False,
) -> dict | None:
    pass`}</code>
            </pre>
            <p>
              Run mypy or pyright over a typed codebase and it catches callers
              passing a string where a datetime is expected, functions returning
              None where a list is expected, and attribute access on potentially
              None values. These are the bugs that show up as runtime failures
              at 2 AM in production.
            </p>
            <p>
              The investment is low. Adding type hints to function signatures
              takes minutes per function. The payoff in a team environment is
              that new engineers understand the API of every function from the
              signature alone without reading the body.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Dataclasses: Structured Data Without Boilerplate
            </h2>
            <p>
              Python dataclasses, introduced in 3.7, give you structured
              objects with automatic <code>__init__</code>, <code>__repr__</code>,
              and <code>__eq__</code> without writing any boilerplate. For
              data engineering, they are the right abstraction for representing
              pipeline records, configuration objects, and intermediate
              computation results.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class OrderRecord:
    order_id: str
    customer_id: str
    amount_usd: float
    status: str
    created_at: datetime
    shipped_at: Optional[datetime] = None
    tags: list[str] = field(default_factory=list)
    
    def is_delivered(self) -> bool:
        return self.status == "delivered"
    
    def to_dict(self) -> dict:
        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "amount_usd": self.amount_usd,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
        }

# Usage -- IDE autocompletes fields, mypy checks types
order = OrderRecord(
    order_id="ord_123",
    customer_id="cust_456",
    amount_usd=49.99,
    status="shipped",
    created_at=datetime(2026, 3, 27, 10, 0, 0),
)
print(order.is_delivered())  # False
print(order.to_dict())`}</code>
            </pre>
            <p>
              Compare this to a dictionary: you cannot access{" "}
              <code>order.is_delivered()</code> on a dict, your IDE cannot
              autocomplete <code>order.amount_usd</code>, and nothing tells
              you at write time that you missed a required field.
            </p>
            <p>
              For frozen (immutable) configuration objects, add{" "}
              <code>frozen=True</code>:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`@dataclass(frozen=True)
class PipelineConfig:
    source_table: str
    destination_schema: str
    batch_size: int = 1000
    dry_run: bool = False

config = PipelineConfig(
    source_table="raw.orders",
    destination_schema="silver",
)
# config.batch_size = 500  # Raises FrozenInstanceError`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Pydantic: Validation at the Boundary
            </h2>
            <p>
              Dataclasses describe structure but do not validate values. Pydantic
              does both: it defines typed models and validates incoming data
              against them at runtime. In data engineering, this is most
              valuable at the ingestion boundary -- when you receive data from
              an external API, webhook, or file upload.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from pydantic import BaseModel, Field, validator, model_validator
from datetime import datetime
from typing import Literal

class IncomingOrder(BaseModel):
    order_id: str = Field(..., min_length=1, max_length=50)
    customer_id: str
    amount_cents: int = Field(..., gt=0)
    currency: str = Field(..., pattern=r"^[A-Z]{3}$")
    status: Literal["pending", "processing", "shipped", "delivered", "cancelled"]
    created_at: datetime
    
    @validator("customer_id")
    def customer_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("customer_id cannot be empty or whitespace")
        return v.strip()
    
    @model_validator(mode="after")
    def delivered_needs_ship_date(self) -> "IncomingOrder":
        # You could add cross-field validation here
        return self
    
    @property
    def amount_usd(self) -> float:
        return self.amount_cents / 100

# Pydantic raises ValidationError with field-level details on bad data
try:
    order = IncomingOrder(
        order_id="ord_123",
        customer_id="cust_456",
        amount_cents=-50,    # Fails: gt=0
        currency="usd",      # Fails: pattern requires uppercase
        status="unknown",    # Fails: not in Literal
        created_at="2026-03-27T10:00:00Z",
    )
except Exception as e:
    print(e)  # Detailed field-level error messages`}</code>
            </pre>
            <p>
              The key pattern for pipelines: validate at the source boundary
              using Pydantic, convert to a dataclass or typed dict for internal
              processing, and serialize back to a dict or JSON for warehouse
              loading. This keeps the messy external-world validation logic
              isolated at the edge and lets your internal pipeline code work
              with clean, typed objects.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              TypedDict: Typing Without Abandoning Dicts
            </h2>
            <p>
              Sometimes you are working with APIs or libraries that expect
              dictionaries. <code>TypedDict</code> lets you add type information
              to dicts without converting them to objects:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from typing import TypedDict, Required, NotRequired

class OrderRow(TypedDict):
    order_id: Required[str]
    customer_id: Required[str]
    amount_usd: Required[float]
    status: Required[str]
    notes: NotRequired[str]  # Optional field

def load_to_snowflake(rows: list[OrderRow]) -> None:
    # mypy knows each row has order_id, customer_id, amount_usd, status
    for row in rows:
        print(row["order_id"])  # Autocompleted + type-checked
        print(row.get("notes", ""))  # NotRequired handled correctly`}</code>
            </pre>
            <p>
              TypedDict is the right tool when you need compatibility with
              dict-expecting APIs (Snowflake connectors, Pandas, Spark) but
              want type-checker visibility into the dict structure.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Practical Integration: A Typed Ingestion Pipeline
            </h2>
            <p>
              Putting it together into a typed ingestion pipeline:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`from pydantic import BaseModel
from dataclasses import dataclass
from typing import Iterator
import httpx

# 1. Pydantic: validates external API response
class ApiOrder(BaseModel):
    id: str
    customerId: str
    totalCents: int
    orderStatus: str
    createdAt: str

# 2. Dataclass: internal clean representation
@dataclass
class OrderRecord:
    order_id: str
    customer_id: str
    amount_usd: float
    status: str
    created_at: str

def parse_order(raw: dict) -> OrderRecord:
    """Validate external data, convert to internal type."""
    validated = ApiOrder.model_validate(raw)
    return OrderRecord(
        order_id=validated.id,
        customer_id=validated.customerId,
        amount_usd=validated.totalCents / 100,
        status=validated.orderStatus.lower(),
        created_at=validated.createdAt,
    )

def fetch_orders(api_url: str, api_key: str) -> Iterator[OrderRecord]:
    """Typed generator -- callers know they get OrderRecord objects."""
    response = httpx.get(
        api_url,
        headers={"Authorization": f"Bearer {api_key}"},
    )
    response.raise_for_status()
    
    for raw_order in response.json()["orders"]:
        try:
            yield parse_order(raw_order)
        except Exception as e:
            # Log and skip invalid records rather than failing the batch
            print(f"Skipping invalid order {raw_order.get('id')}: {e}")

def load_to_warehouse(orders: Iterator[OrderRecord]) -> int:
    """Returns row count loaded."""
    rows = [
        {
            "order_id": o.order_id,
            "customer_id": o.customer_id,
            "amount_usd": o.amount_usd,
            "status": o.status,
            "created_at": o.created_at,
        }
        for o in orders
    ]
    # ... warehouse insert
    return len(rows)`}</code>
            </pre>
            <p>
              Every function has a declared input and output type. mypy can
              verify that <code>fetch_orders</code> returns the right type,
              that <code>load_to_warehouse</code> receives the right iterator,
              and that the field names used in the dict comprehension exist on
              the dataclass. Schema changes in the API now surface as
              ValidationError at runtime, not as silent wrong data three stages
              downstream.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Getting Started: The Practical Path
            </h2>
            <p>
              You do not need to type an entire codebase to get value. The
              highest-leverage starting points:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Type all function signatures.</strong> Return types,
                parameter types. This alone significantly improves IDE
                autocomplete and mypy coverage without touching the function
                bodies.
              </li>
              <li>
                <strong>Add Pydantic models to ingestion boundaries.</strong>{" "}
                Every place you receive external data (API call, file read,
                webhook payload), add a Pydantic model. This is where the
                most unexpected runtime errors originate.
              </li>
              <li>
                <strong>Replace config dicts with dataclasses.</strong> Pipeline
                configuration objects are the easiest refactor -- well-scoped,
                not in the hot path, and immediately improve readability.
              </li>
              <li>
                <strong>Run mypy in CI.</strong> Even with{" "}
                <code>--ignore-missing-imports</code> and lenient settings,
                running mypy in your CI pipeline catches regressions as the
                codebase evolves.
              </li>
            </ul>
            <p>
              The payoff is not just fewer runtime errors. A typed Python
              codebase is faster to navigate, easier to refactor, and requires
              less documentation because the types carry the intent. For a
              data engineering team where pipelines are maintained by multiple
              people over years, that compounding clarity is worth the upfront
              annotation work.
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
