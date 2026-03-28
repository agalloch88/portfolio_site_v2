import Link from "next/link";

export const metadata = {
  title: "Blog | Ryan Kirsch",
  description: "Writing on data engineering, local-first stacks, and pragmatic infrastructure choices.",
  openGraph: {
    title: "Blog | Ryan Kirsch",
    description: "Writing on data engineering, local-first stacks, and pragmatic infrastructure choices.",
    type: "website",
    url: "https://ryankirsch.dev/blog",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Ryan Kirsch",
    description: "Writing on data engineering, local-first stacks, and pragmatic infrastructure choices.",
  },
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    title: "Data Engineering Career Mistakes (And How to Avoid Them)",
    href: "/blog/data-engineering-career-mistakes",
    date: "March 27, 2026",
    tags: ["Career", "Growth", "Data Engineering", "Leadership", "Mindset"],
    teaser:
      "The patterns that keep skilled engineers stuck at mid-level: measuring progress in tools not outcomes, treating communication as optional, shipping without owning, and confusing complexity with quality. Plus the shifts that break through.",
  },
  {
    title: "Databricks for Data Engineers: What You Need to Know",
    href: "/blog/databricks-for-data-engineers",
    date: "March 27, 2026",
    tags: ["Databricks", "Delta Lake", "Spark", "Streaming", "Unity Catalog"],
    teaser:
      "A practical guide to Databricks: Delta Lake ACID transactions and time travel, Unity Catalog three-level namespacing and lineage, Structured Streaming with Auto Loader, SQL Warehouses for dbt, and when Databricks is the right choice versus a warehouse.",
  },
  {
    title:
      "Cost-Efficient Data Engineering: How to Spend Less on Infrastructure Without Sacrificing Reliability",
    href: "/blog/cost-efficient-data-engineering",
    date: "March 27, 2026",
    tags: ["Cost Optimization", "Warehousing", "FinOps", "dbt", "Infrastructure"],
    teaser:
      "A pragmatic cost playbook: right-size warehouses with auto-suspend, move cold data to Iceberg + S3, use spot instances for Spark, avoid runaway SELECT *, monitor spend spikes, and build a cost-per-insight culture that keeps reliability intact.",
  },
  {
    title: "Kafka for Data Engineers: Production Patterns That Actually Matter",
    href: "/blog/kafka-production-patterns",
    date: "March 27, 2026",
    tags: ["Kafka", "Streaming", "Data Engineering", "Reliability", "Operations"],
    teaser:
      "The production Kafka patterns that keep pipelines boring: producer/consumer lifecycle, delivery semantics, rebalancing, partition key strategy, offset management, schema registry with Avro, compacted topics, and the Kafka vs Kinesis decision.",
  },
  {
    title: "SQL Window Functions: The Complete Guide for Data Engineers",
    href: "/blog/sql-window-functions-guide",
    date: "March 27, 2026",
    tags: ["SQL", "Window Functions", "Analytics", "Data Engineering", "Sessionization"],
    teaser:
      "The complete window function guide: ROW_NUMBER, RANK, LAG/LEAD, running aggregates, frame syntax, sessionization with time gaps, gaps-and-islands, NTILE, FIRST_VALUE/LAST_VALUE, and performance considerations that matter in production.",
  },
  {
    title: "Building Internal Data Tools: When to Build, When to Buy, and How to Ship",
    href: "/blog/building-internal-data-tools",
    date: "March 27, 2026",
    tags: ["Internal Tools", "Engineering", "Streamlit", "Build vs Buy", "Data Products"],
    teaser:
      "When internal data tools create compounding leverage vs. when they become abandoned dashboards. The buy-first rule, maintenance reality checks, stack choices, shipping lean, and the four ways most internal tools die.",
  },
  {
    title: "Analytics Engineering Playbook: Modeling, Testing, and Earning Trust",
    href: "/blog/analytics-engineering-playbook",
    date: "March 27, 2026",
    tags: ["Analytics Engineering", "dbt", "Modeling", "Testing", "Semantics"],
    teaser:
      "A practical playbook for analytics engineering: layered model design, tests that matter, semantic clarity, stakeholder alignment, and why dashboard trust is usually won or lost in the modeling layer below the BI tool.",
  },
  {
    title: "Modern Data Stack Lessons: What Actually Holds Up After the Hype",
    href: "/blog/modern-data-stack-lessons",
    date: "March 27, 2026",
    tags: ["Modern Data Stack", "Strategy", "Warehousing", "dbt", "Tooling"],
    teaser:
      "What the modern data stack got right, where modularity created more seams than leverage, and the smaller, more durable tool patterns that still hold up after the hype cycle cooled off.",
  },
  {
    title: "Data Contracts in Practice: How to Stop Breaking Downstream Teams",
    href: "/blog/data-contracts-in-practice",
    date: "March 27, 2026",
    tags: ["Data Contracts", "Governance", "Schema", "Ownership", "Freshness"],
    teaser:
      "Why most downstream breakages are really interface failures, and how to use lightweight data contracts to make schema, freshness, ownership, and change policies explicit without turning the data team into process police.",
  },
  {
    title: "Data Warehouse Migration Playbook: How to Move Without Breaking Everything",
    href: "/blog/warehouse-migration-playbook",
    date: "March 27, 2026",
    tags: ["Migration", "Warehousing", "Cutover", "Validation", "Platform"],
    teaser:
      "Warehouse migrations are trust migrations too. A practical playbook for dual-running, validation, schema compatibility, consumer cutover, cost/performance checks, and keeping stakeholder confidence intact while the platform moves.",
  },
  {
    title: "Data Reliability Engineering: The Missing Discipline Between Pipelines and Trust",
    href: "/blog/data-reliability-engineering",
    date: "March 27, 2026",
    tags: ["Reliability", "SLOs", "Observability", "Incidents", "Trust"],
    teaser:
      "Why data failures are really trust failures, and how to borrow from SRE without getting ceremonial about it: freshness, completeness, correctness, consistency, SLOs, incident response, and the operational habits that keep stakeholders from losing faith in the platform.",
  },
  {
    title: "Reverse ETL: How to Move Warehouse Data Back Into the Business",
    href: "/blog/reverse-etl-guide",
    date: "March 27, 2026",
    tags: ["Reverse ETL", "Activation", "Salesforce", "Operations", "Data Products"],
    teaser:
      "Reverse ETL is where analytics becomes operational leverage, if the fields are trustworthy. How to design publish models, define destination ownership, set sync reliability expectations, and avoid spraying unstable scores into operational systems.",
  },
  {
    title: "Data Lineage in Practice: How to Know What Breaks When You Change a Model",
    href: "/blog/data-lineage-in-practice",
    date: "March 27, 2026",
    tags: ["Data Lineage", "Governance", "dbt", "Impact Analysis", "Metadata"],
    teaser:
      "Why lineage matters long before an auditor asks for it: table-level vs. column-level lineage, how dbt lineage helps, where lineage metadata really comes from, and how impact analysis changes code review and incident response.",
  },
  {
    title: "ETL vs ELT in Practice: When Each Pattern Actually Makes Sense",
    href: "/blog/etl-vs-elt-in-practice",
    date: "March 27, 2026",
    tags: ["ETL", "ELT", "Architecture", "Data Warehousing", "CDC"],
    teaser:
      "ETL still wins in some places, ELT wins in many others, and most real platforms use both. A practical guide to where transformations should happen based on compliance, cost, debuggability, warehouse economics, and workload type.",
  },
  {
    title: "How to Ace Data Engineering Interviews: SQL, System Design, and Behavioral",
    href: "/blog/data-engineering-interviews",
    date: "March 27, 2026",
    tags: ["Career", "Interviews", "SQL", "System Design", "Negotiation"],
    teaser:
      "What data engineering interviews actually test: practical SQL (window functions, SCD Type 2, gap-and-island), system design tradeoffs for pipelines and warehouses, behavioral questions that reveal engineering judgment, and how to negotiate the offer once you get it.",
  },
  {
    title: "Building Streaming Data Pipelines: Flink, Spark Streaming, and Kafka Streams",
    href: "/blog/streaming-data-pipelines",
    date: "March 27, 2026",
    tags: ["Streaming", "Flink", "Spark", "Kafka", "Data Pipelines"],
    teaser:
      "When streaming is actually worth the complexity, how Flink differs from Spark Structured Streaming and Kafka Streams, and the patterns that matter in production: watermarks, late data, checkpointing, state size, and framework selection by latency and workload.",
  },
  {
    title: "The Soft Skills That Make Data Engineers Irreplaceable",
    href: "/blog/data-engineer-soft-skills",
    date: "March 27, 2026",
    tags: ["Career", "Soft Skills", "Data Engineering", "Communication", "Leadership"],
    teaser:
      "Technical skills get you hired. These determine how far you go: translating data concepts for business stakeholders without losing them, pushing back on bad requirements constructively, making invisible infrastructure work visible, and giving estimates that are actually reliable.",
  },
  {
    title: "Writing SQL for Data Pipelines: Patterns That Scale",
    href: "/blog/sql-for-data-pipelines",
    date: "March 27, 2026",
    tags: ["SQL", "dbt", "Data Pipelines", "Window Functions", "Snowflake"],
    teaser:
      "Pipeline SQL has different constraints than analytical SQL: it runs on a schedule, gets called with different inputs, and its failures are silent. CTE layering as a debugging affordance, window functions for sessionization and SCD Type 2, idempotent incremental patterns, and the anti-patterns that produce wrong answers quietly.",
  },
  {
    title: "Data Engineering Skills That Actually Matter in 2026",
    href: "/blog/data-engineering-skills-2026",
    date: "March 27, 2026",
    tags: ["Career", "Skills", "Data Engineering", "Job Market", "Portfolio"],
    teaser:
      "What the data engineering job market actually rewards in 2026: SQL fluency that goes beyond syntax, system design reasoning that anticipates failure, and the difference between tools listed in job postings and skills actually probed in senior interviews.",
  },
  {
    title: "Airbyte vs. Fivetran: Which One Makes Sense for Your Data Team?",
    href: "/blog/airbyte-vs-fivetran-data-teams",
    date: "March 27, 2026",
    tags: ["Airbyte", "Fivetran", "ELT", "Data Ingestion", "Data Platform"],
    teaser:
      "A practical Airbyte vs. Fivetran comparison from a data engineer's perspective: where Fivetran wins on reliability and low operational burden, where Airbyte wins on flexibility and cost control, and the hybrid approach many mature teams quietly end up using.",
  },
  {
    title: "dbt in Production: The Patterns That Scale",
    href: "/blog/data-engineering-with-dbt",
    date: "March 27, 2026",
    tags: ["dbt", "Data Engineering", "SQL", "CI/CD", "Data Quality"],
    teaser:
      "Advanced dbt patterns for projects that live past 50 models: source-scoped staging structure, custom schema generation for environments, macro libraries, slim CI with defer and state, and the testing philosophy that actually gets followed.",
  },
  {
    title: "Data Lake Architecture: From Swamp to Lakehouse",
    href: "/blog/data-lake-architecture",
    date: "March 27, 2026",
    tags: ["Data Lake", "Iceberg", "Delta Lake", "Architecture", "Lakehouse"],
    teaser:
      "How data lakes become swamps and how to prevent it: open table formats (Iceberg vs. Delta Lake), folder structure conventions, AWS Glue catalog, the lakehouse architecture pattern, and how to serve multiple compute engines from a single storage layer.",
  },
  {
    title: "PySpark for Data Engineers: Production Patterns Beyond the Tutorial",
    href: "/blog/data-engineering-with-spark",
    date: "March 27, 2026",
    tags: ["Spark", "PySpark", "Data Engineering", "Performance", "Distributed Computing"],
    teaser:
      "Spark tutorials show you word count. Production Spark work involves partition skew, broadcast join strategy, UDF performance traps, and knowing when to stop using Spark entirely. A practical guide to PySpark patterns that survive production.",
  },
  {
    title: "Building Data Products: From Pipeline to Product Thinking",
    href: "/blog/building-data-products",
    date: "March 27, 2026",
    tags: ["Data Products", "Data Contracts", "SLA", "Data Engineering", "Data Catalog"],
    teaser:
      "A pipeline delivers data. A data product makes data reliably useful. How to define SLAs, version schemas, write data contracts, make data discoverable, and build the organizational accountability that makes product thinking actually work.",
  },
  {
    title: "Monitoring Data Quality in Production: A Practical Framework",
    href: "/blog/monitoring-data-quality",
    date: "March 27, 2026",
    tags: ["Data Quality", "Monitoring", "dbt", "Great Expectations", "Data Engineering"],
    teaser:
      "How to build data quality monitoring that catches problems before stakeholders do: freshness checks, statistical volume anomaly detection, schema change tracking, distribution checks with dbt tests, and a Great Expectations vs. dbt comparison.",
  },
  {
    title: "Async Python for Data Engineering: When and How to Use It",
    href: "/blog/async-python-data-pipelines",
    date: "March 27, 2026",
    tags: ["Python", "Async", "aiohttp", "Data Engineering", "Performance"],
    teaser:
      "Fetching 500 API endpoints sequentially takes 500x longer than it needs to. A practical guide to async Python with asyncio and aiohttp: concurrent API ingestion, semaphore rate limiting, async database drivers, Dagster integration, and when async is the wrong tool.",
  },
  {
    title: "Data Warehouse Architecture Patterns: Kimball, Inmon, and the Modern Lakehouse",
    href: "/blog/data-warehouse-architecture-patterns",
    date: "March 27, 2026",
    tags: ["Architecture", "Kimball", "Data Vault", "Lakehouse", "Data Warehouse"],
    teaser:
      "A practical comparison of data warehouse architecture approaches: Kimball dimensional modeling, Inmon enterprise DW, Data Vault, and the modern lakehouse synthesis. How to choose based on your team size, data complexity, and query patterns.",
  },
  {
    title: "Testing Data Pipelines with Python: A Practical Guide",
    href: "/blog/python-testing-data-pipelines",
    date: "March 27, 2026",
    tags: ["Python", "Testing", "pytest", "Data Engineering", "Data Quality"],
    teaser:
      "Unit tests for transformation logic, integration tests with in-memory DuckDB, pytest fixtures for reusable test infrastructure, and property-based testing with Hypothesis. A practical framework for pipeline test coverage that actually catches bugs.",
  },
  {
    title: "Change Data Capture: How CDC Works and When to Use It",
    href: "/blog/change-data-capture-guide",
    date: "March 27, 2026",
    tags: ["CDC", "Debezium", "Kafka", "Data Ingestion", "Data Engineering"],
    teaser:
      "CDC reads the database transaction log to capture every insert, update, and delete in near real-time. A practical guide covering log-based vs. query-based approaches, Debezium setup, schema changes, and when CDC is worth the operational overhead.",
  },
  {
    title: "How Data Engineers Grow Into Senior and Staff Roles",
    href: "/blog/data-engineer-career-growth",
    date: "March 27, 2026",
    tags: ["Career", "Data Engineering", "Senior Engineer", "Staff Engineer", "Growth"],
    teaser:
      "The mid-to-senior transition is mostly technical. The senior-to-staff transition is mostly not. A practical breakdown of the skills, behaviors, and visibility patterns that drive career growth at each stage.",
  },
  {
    title: "DuckDB for Data Engineers: The In-Process Analytics Engine",
    href: "/blog/duckdb-for-data-engineers",
    date: "March 27, 2026",
    tags: ["DuckDB", "SQL", "Data Engineering", "Parquet", "Analytics"],
    teaser:
      "DuckDB runs inside your Python process, queries Parquet files and S3 directly, and handles analytical workloads that used to require a Spark cluster. A practical guide covering pipeline patterns, dbt integration, and the honest limitations.",
  },
  {
    title: "Data Pipeline Reliability: How to Build Pipelines That Don't Break at 2 AM",
    href: "/blog/data-pipeline-reliability",
    date: "March 27, 2026",
    tags: ["Data Engineering", "Reliability", "Idempotency", "Alerting", "Production"],
    teaser:
      "The patterns that separate pipelines that quietly fail from ones you can trust: idempotency design, exponential backoff with jitter, dead letter queues, outcome-based alerting, and runbooks that let junior engineers handle incidents at 3 AM.",
  },
  {
    title: "Orchestrating Data Pipelines with Dagster: A Production Guide",
    href: "/blog/orchestrating-data-pipelines-dagster",
    date: "March 27, 2026",
    tags: ["Dagster", "Orchestration", "Data Pipelines", "Software-Defined Assets", "Data Engineering"],
    teaser:
      "Dagster takes an asset-centric approach to orchestration that changes how you think about pipelines. A practical guide covering software-defined assets, resources, schedules, sensors, partitioning, asset checks, and a realistic Dagster vs. Airflow comparison.",
  },
  {
    title: "Data Engineering System Design: How to Approach Architecture Interviews",
    href: "/blog/data-engineering-system-design",
    date: "March 27, 2026",
    tags: ["System Design", "Career", "Interviews", "Architecture", "Data Engineering"],
    teaser:
      "A repeatable framework for data engineering system design interviews: requirements first, architecture second, tradeoffs explicit. Includes worked examples for real-time analytics and data warehouse ingestion, plus the phrases that signal senior thinking.",
  },
  {
    title: "PostgreSQL for Data Engineers: Beyond Basic Queries",
    href: "/blog/postgres-for-data-engineers",
    date: "March 27, 2026",
    tags: ["PostgreSQL", "SQL", "Data Engineering", "Query Optimization", "Window Functions"],
    teaser:
      "PostgreSQL patterns that matter for data engineering: window functions, CTEs, JSONB for semi-structured data, table partitioning, EXPLAIN ANALYZE for query diagnosis, and a clear view of when Postgres is the right tool versus when to reach for a dedicated warehouse.",
  },
  {
    title: "Data Engineering with Python and Pandas: Production Patterns",
    href: "/blog/data-engineering-with-python-pandas",
    date: "March 27, 2026",
    tags: ["Python", "Pandas", "Data Engineering", "Polars", "DuckDB"],
    teaser:
      "Pandas patterns for production data pipelines: memory optimization with dtype management, chunked processing for large files, method chaining, vectorization vs apply performance, and when to reach for Polars or DuckDB instead.",
  },
  {
    title: "dbt Incremental Models: A Complete Guide to Strategies and Tradeoffs",
    href: "/blog/dbt-incremental-models-guide",
    date: "March 27, 2026",
    tags: ["dbt", "Incremental Models", "Data Engineering", "SQL", "Performance"],
    teaser:
      "A deep dive into dbt incremental model strategies: append, merge, delete+insert, insert_overwrite. When to use each, how to handle late-arriving data, and the common mistakes that cause silent data quality issues.",
  },
  {
    title: "Data Modeling for Data Engineers: Dimensional, OBT, and When to Use Each",
    href: "/blog/data-modeling-for-data-engineers",
    date: "March 27, 2026",
    tags: ["Data Modeling", "Dimensional Modeling", "dbt", "Data Vault", "Star Schema"],
    teaser:
      "A practical guide to data modeling patterns: dimensional modeling, one big table, data vault, and entity-centric models. Includes grain definition, SCD types, the dbt layer architecture, and how to actually choose the right pattern for your use case.",
  },
  {
    title: "dbt Exposures: Documenting Downstream Dependencies",
    href: "/blog/dbt-exposures-guide",
    date: "March 27, 2026",
    tags: ["dbt", "Metadata", "Lineage", "Analytics Engineering", "Data Engineering"],
    teaser:
      "Most dbt documentation stops at models. Exposures document the dashboards, notebooks, and applications that actually depend on them. This guide shows how to define exposures in YAML, use them for impact analysis before refactors, integrate them with catalogs, and roll them out without turning metadata into busywork.",
  },
  {
    title: "Kafka Consumer Group Patterns for High-Throughput Pipelines",
    href: "/blog/kafka-consumer-group-patterns",
    date: "March 27, 2026",
    tags: ["Kafka", "Consumer Groups", "Streaming", "Python", "Data Engineering"],
    teaser:
      "Consumer groups are where throughput dies: rebalances, hot partitions, lag cliffs, and sloppy commits. This post is a production playbook for scaling Kafka consumers with cooperative rebalancing, partition strategy, lag analysis, and commit discipline, plus Python patterns that survive real traffic.",
  },
  {
    title: "Data Lineage and Catalog Tools: The Practical Comparison for 2026",
    href: "/blog/data-lineage-catalog-tools",
    date: "March 27, 2026",
    tags: ["Data Catalog", "Lineage", "DataHub", "OpenMetadata", "dbt"],
    teaser:
      "Every data team eventually wants a data catalog. The practical decision framework: when dbt docs are enough, when open-source tools like DataHub or OpenMetadata are worth the operational overhead, when a commercial catalog like Atlan makes sense, and the mistake that makes every catalog useless -- not maintaining it.",
  },
  {
    title: "Infrastructure as Code for Data Engineers: Terraform Patterns for Data Platforms",
    href: "/blog/infrastructure-as-code-data-engineering",
    date: "March 27, 2026",
    tags: ["Terraform", "Infrastructure as Code", "Snowflake", "AWS", "Data Platform"],
    teaser:
      "Data platform configuration accumulates drift. Someone creates a warehouse, forgets auto-suspend, and six months later it's still running. Terraform patterns for data engineers: Snowflake warehouses, schemas, and RBAC as code; S3 lifecycle policies; state management for teams; and the CI/CD workflow that makes infrastructure changes reviewable -- same discipline as application code.",
  },
  {
    title: "API Design for Data Engineers: Building Reliable Data Ingestion Endpoints",
    href: "/blog/api-design-data-engineers",
    date: "March 27, 2026",
    tags: ["API Design", "Data Ingestion", "Python", "Webhooks", "Pagination"],
    teaser:
      "Some APIs are a pleasure to pipeline. Others are a nightmare. A data engineer's perspective on what makes the difference: cursor vs offset pagination (offset is fragile for live data), rate limit handling with Retry-After, idempotency keys for safe retries, webhook reliability patterns, and the incremental API design that reduces ingestion cost by orders of magnitude.",
  },
  {
    title: "Data Pipeline Testing Strategies: How to Know Your Pipeline Is Correct Before Production Finds Out",
    href: "/blog/data-pipeline-testing-strategies",
    date: "March 27, 2026",
    tags: ["Testing", "dbt", "Python", "Data Quality", "Data Engineering"],
    teaser:
      "Data pipeline bugs run silently for days before anyone notices. The testing pyramid for data pipelines: unit tests for transformation logic (pytest patterns), dbt schema tests at the right layers, contract tests for source systems, integration tests with sample data, and the reconciliation test that catches silent data loss most teams skip.",
  },
  {
    title: "Spark vs. dbt: When to Use Each for Large-Scale Data Transformations",
    href: "/blog/spark-vs-dbt-transformations",
    date: "March 27, 2026",
    tags: ["Spark", "dbt", "PySpark", "Data Transformations", "Architecture"],
    teaser:
      "Spark or dbt? Usually both -- applied to the workloads each handles best. A practical decision framework: dbt for SQL-expressible analytics modeling with lineage and docs; Spark for procedural logic, petabyte-scale economics, ML features, and streaming. The architecture that stitches both into a coherent platform, the common mistakes, and the PySpark write pattern that makes dbt consumption predictable.",
  },
  {
    title: "BigQuery for Data Engineers: Architecture, Optimization, and When to Use It",
    href: "/blog/bigquery-for-data-engineers",
    date: "March 27, 2026",
    tags: ["BigQuery", "GCP", "Data Warehouse", "Partitioning", "dbt"],
    teaser:
      "BigQuery charges per byte scanned, not per compute second -- which changes everything about how you optimize. A data engineer's guide to BigQuery: serverless architecture vs Snowflake, partition + cluster strategies for cost control, require_partition_filter as a safeguard, dbt configuration, BigQuery-specific SQL patterns (STRUCT, UNNEST, MERGE), and when to choose BigQuery vs Snowflake.",
  },
  {
    title: "Data Governance in Practice: The Parts That Actually Work",
    href: "/blog/data-governance-practical-guide",
    date: "March 27, 2026",
    tags: ["Data Governance", "dbt", "Snowflake", "Access Control", "Data Ownership"],
    teaser:
      "Most governance programs fail because they require separate effort with no immediate engineering benefit. A practical guide to governance that actually sticks: ownership in dbt YAML, role-based access control with column masking, lineage from manifest.json, a data dictionary that auto-updates with every pipeline run, and PII classification at ingestion.",
  },
  {
    title: "Data Platform Cost Optimization: Reducing Cloud Spend Without Sacrificing Reliability",
    href: "/blog/data-platform-cost-optimization",
    date: "March 27, 2026",
    tags: ["Cost Optimization", "Snowflake", "dbt", "Cloud Spend", "Data Engineering"],
    teaser:
      "Data platform costs scale faster than teams expect. The specific levers that move the needle: cost visibility queries before you optimize anything, warehouse auto-suspend and resource monitors, Time Travel storage tuning, the query patterns that generate disproportionate cost, dbt incremental vs. table materialization impact, and how to build cost culture before the bill surprises you.",
  },
  {
    title: "ML Feature Engineering Patterns for Data Engineers: Building the Pipeline That Feeds the Model",
    href: "/blog/ml-feature-engineering-data-engineers",
    date: "March 27, 2026",
    tags: ["Machine Learning", "Feature Engineering", "dbt", "Data Engineering", "Training-Serving Skew"],
    teaser:
      "Data engineers own the pipelines that feed ML models -- and the bugs in those pipelines are data engineering bugs. Window aggregations, point-in-time correct features, training-serving skew (the silent model killer), shared feature logic patterns, when a feature store is worth the investment, and feature drift monitoring with Great Expectations.",
  },
  {
    title: "Event-Driven Architecture for Data Engineers: When and How to Build Event Pipelines",
    href: "/blog/event-driven-architecture-data-engineering",
    date: "March 27, 2026",
    tags: ["Event-Driven Architecture", "Kafka", "CDC", "Debezium", "Streaming"],
    teaser:
      "Every webhook, CDC feed, and clickstream is an event stream. A practical guide to event-driven architecture from a data engineering perspective: event schema design mistakes that last forever, idempotent consumer patterns, consumer groups and parallelism, Debezium CDC from existing databases, and the hybrid architecture where events and batch warehouse coexist.",
  },
  {
    title: "Data Engineering Interview Questions: What Senior Roles Actually Ask",
    href: "/blog/data-engineering-interview-questions",
    date: "March 27, 2026",
    tags: ["Career", "Interviews", "Data Engineering", "System Design", "SQL"],
    teaser:
      "The interview questions that actually separate senior DE candidates: system design probes (what questions you ask before proposing architecture), pipeline failure debugging scenarios, SQL edge cases that reveal production instincts, behavioral questions about pushing back on stakeholders, and the questions you should ask the interviewer.",
  },
  {
    title: "Apache Airflow in Production: Lessons from Running It at Scale",
    href: "/blog/apache-airflow-production-lessons",
    date: "March 27, 2026",
    tags: ["Airflow", "Orchestration", "Data Engineering", "Production", "DAG Design"],
    teaser:
      "The Airflow docs teach you to write a DAG. They don't explain why your scheduler is crawling, why tasks zombie, or what retry config prevents 3 AM incidents. Hard-won lessons: scheduler bottlenecks, operator selection (PythonOperator vs. KubernetesPodOperator), safe retry patterns, XCom limits, secrets management, and the workflows where Airflow is the wrong tool entirely.",
  },
  {
    title: "Getting to Senior Data Engineer: The Skills Interviewers Actually Test",
    href: "/blog/data-engineering-career-senior",
    date: "March 27, 2026",
    tags: ["Career", "Data Engineering", "Interviews", "Senior Engineer", "System Design"],
    teaser:
      "Every DE above junior claims the same tools. What actually separates senior from mid-level in interviews: system design thinking that starts with trade-offs, production mindset (idempotency, explicit failure modes, volume alerts), the ability to say no intelligently, and how to tell technical stories that lead with business impact.",
  },
  {
    title: "Building a Data Platform from Scratch: Decisions, Trade-offs, and the Order That Matters",
    href: "/blog/building-data-platform-from-scratch",
    date: "March 27, 2026",
    tags: ["Data Platform", "Architecture", "dbt", "Snowflake", "Dagster"],
    teaser:
      "The most expensive decisions in data engineering are made in the first 90 days and are very hard to undo. A practical decision sequence for building a modern data platform -- storage, ingestion, transformation, orchestration, serving -- plus the foundational choices around keys, timezones, nulls, and access control that haunt every team that skips them.",
  },
  {
    title: "Snowflake Performance Optimization: The Queries, Warehouses, and Patterns That Actually Move the Needle",
    href: "/blog/snowflake-performance-optimization",
    date: "March 27, 2026",
    tags: ["Snowflake", "Performance", "Query Optimization", "Clustering Keys", "Data Engineering"],
    teaser:
      "Most slow Snowflake queries are slow because of how they scan data, not compute limits. Practical guide to partition pruning, clustering keys, the five SQL anti-patterns that kill performance, result caching, warehouse sizing logic, and using Query Profile to diagnose what is actually slow.",
  },
  {
    title: "Dagster Assets: How Software-Defined Assets Change the Way You Think About Pipelines",
    href: "/blog/dagster-assets-software-defined",
    date: "March 27, 2026",
    tags: ["Dagster", "Software-Defined Assets", "Orchestration", "dbt", "Data Platform"],
    teaser:
      "Airflow orchestrates tasks. Dagster orchestrates data. A practical guide to Software-Defined Assets: how asset-based orchestration gives you freshness tracking, lineage, asset checks, partitioned backfills, and the operational advantage that matters most -- knowing exactly what broke and what to re-run at 2 AM.",
  },
  {
    title: "Python Type Hints and Dataclasses for Data Engineers: Writing Code That Doesn't Surprise You",
    href: "/blog/python-type-hints-data-engineering",
    date: "March 27, 2026",
    tags: ["Python", "Type Hints", "Pydantic", "Dataclasses", "Data Engineering"],
    teaser:
      "Dictionary-driven Python pipelines fail silently when API schemas change. A practical guide to using type hints, dataclasses, Pydantic, and TypedDict to catch schema errors at development time -- plus a fully-typed ingestion pipeline pattern you can apply today.",
  },
  {
    title: "dbt Best Practices for Senior Data Engineers: Beyond the Tutorial",
    href: "/blog/dbt-best-practices-senior-engineers",
    date: "March 27, 2026",
    tags: ["dbt", "Data Engineering", "Best Practices", "Data Contracts", "Incremental Models"],
    teaser:
      "The dbt patterns that separate senior engineers from analysts who learned it last year. Project structure decisions that compound, incremental model strategy that won't blow up in production, data contracts for cross-team governance, and the meta-skills -- naming discipline, deprecation, documentation as design review -- that keep a project maintainable at scale.",
  },
  {
    title: "Data Observability: How to Know When Your Pipeline Is Lying to You",
    href: "/blog/data-observability-monitoring",
    date: "March 27, 2026",
    tags: ["Data Observability", "dbt", "Monte Carlo", "Data Quality", "Pipeline Monitoring"],
    teaser:
      "A pipeline that fails loudly is easy to fix. The dangerous one succeeds silently while delivering wrong data. Practical guide to data observability: freshness checks, volume anomaly detection, schema change alerts, lineage tracking, and tool selection -- so you find problems before your stakeholders do.",
  },
  {
    title: "Real-Time Analytics: Building a Streaming Data Warehouse with Redpanda and Materialize",
    href: "/blog/real-time-analytics-streaming",
    date: "March 27, 2026",
    tags: ["Streaming", "Redpanda", "Materialize", "Kafka", "Real-Time"],
    teaser:
      "A practical guide to real-time analytics without rebuilding your data stack. How Redpanda (Kafka-compatible, no JVM), Materialize (streaming SQL), and dbt combine into a system that answers questions in milliseconds -- and when real-time is actually worth the complexity.",
  },
  {
    title: "Medallion Architecture in Practice: Bronze, Silver, and Gold Data Layers",
    href: "/blog/medallion-architecture-data-engineering",
    date: "March 27, 2026",
    tags: ["Medallion Architecture", "dbt", "Delta Lake", "Dagster", "Data Platform"],
    teaser:
      "A practical guide to implementing the medallion architecture in production. How to design bronze (raw ingestion), silver (cleansed, conformed), and gold (business-ready) layers with dbt, Delta Lake, and Dagster -- plus the common mistakes that undermine it.",
  },
  {
    title: "Data Mesh Architecture: A Practical Guide for Data Engineers",
    href: "/blog/data-mesh-architecture-guide",
    date: "March 27, 2026",
    tags: ["Data Mesh", "Architecture", "Data Products", "dbt", "Federated Governance"],
    teaser:
      "A practical guide to data mesh architecture: domain-oriented ownership, data as a product, self-serve platform components, and the culture shift that makes it work. Includes Python data contracts with Pydantic and dbt domain ownership patterns.",
  },
  {
    title: "Data Contracts: Enforcing Trust Across Your Data Pipeline in 2026",
    href: "/blog/data-contracts-data-engineering",
    date: "March 27, 2026",
    tags: ["Data Contracts", "dbt", "Soda", "Data Quality", "Pipeline Reliability"],
    teaser:
      "A practical guide to implementing data contracts with dbt and Soda. How to stop bad data at the source, enforce schema agreements between producers and consumers, and build pipelines that fail loudly instead of silently.",
  },
  {
    title: "Apache Iceberg for Data Engineers: The Complete Guide to Open Table Formats in 2026",
    href: "/blog/apache-iceberg-data-engineers",
    date: "March 27, 2026",
    tags: ["Apache Iceberg", "Data Lakes", "PySpark", "Delta Lake", "Open Table Format"],
    teaser:
      "A hands-on guide to Apache Iceberg in production: PySpark examples, schema evolution, time travel, migration patterns from Parquet, and a decision framework for choosing between Iceberg and Delta Lake.",
  },
  {
    title: "Snowflake for Data Engineers: Architecture, Performance, and Why It's Still the Cloud DWH to Beat",
    href: "/blog/snowflake-for-data-engineers",
    date: "March 2026",
    tags: ["Snowflake", "Cloud DWH", "dbt", "Airflow", "Performance"],
    teaser:
      "A practical guide to Snowflake architecture, performance tuning, dbt and Airflow integration, data sharing, and when to look elsewhere.",
  },
  {
    title: "Stream Processing with Apache Flink: Real-Time Pipelines for the Modern Data Engineer",
    href: "/blog/stream-processing-apache-flink",
    date: "March 2026",
    tags: ["Apache Flink", "Stream Processing", "Kafka", "Lakehouse", "Real-Time"],
    teaser:
      "Apache Flink is the backbone of real-time data platforms. When to choose Flink vs Spark Structured Streaming vs Kafka Streams, and production patterns for streaming lakehouses.",
  },
  {
    title: "Terraform for Data Engineers: Managing Infrastructure as Code",
    href: "/blog/terraform-data-engineers",
    date: "March 27, 2026",
    tags: ["Terraform", "Infrastructure as Code", "Snowflake", "AWS", "GCP", "DevOps"],
    teaser:
      "Learn how to manage Snowflake, Redshift, S3, and GCS infrastructure with Terraform. Real patterns for data platform teams who are tired of clicking through cloud consoles.",
  },
  {
    title: "Python for Data Engineers: pandas, PySpark, Polars, and the Modern Python Data Stack",
    href: "/blog/python-data-engineering-stack",
    date: "July 2025",
    teaser:
      "A practical guide to the Python data processing ecosystem. When to reach for pandas, when to upgrade to Polars, and when you actually need PySpark.",
  },
  {
    href: "/blog/azure-data-engineers-guide",
    title: "Azure for Data Engineers: Data Factory, Synapse Analytics, and the Microsoft Cloud Data Stack",
    teaser:
      "The Microsoft cloud data stack from the practitioner's perspective: ADLS Gen2, ADF, Synapse Analytics, Event Hubs, and Microsoft Fabric. Plus how dbt fits in.",
    date: "March 26, 2026",
    tags: ["Azure", "Synapse", "ADF", "Microsoft Fabric"],
  },
  {
    title: "Kafka vs Kinesis: A Data Engineer's Guide to Real-Time Streaming in 2026",
    href: "/blog/kafka-vs-kinesis-guide",
    date: "March 26, 2026",
    tags: ["Kafka", "Kinesis", "Streaming", "Real-Time", "Data Engineering", "AWS"],
    teaser:
      "A senior engineer's comparison of Apache Kafka and Amazon Kinesis for real-time streaming, with production code, cost analysis, and architecture recommendations by team size.",
  },
  {
    title: "GCP for Data Engineers: BigQuery, Dataflow, Pub/Sub, and the Modern Google Cloud Data Stack",
    href: "/blog/gcp-data-engineers-guide",
    date: "March 26, 2026",
    tags: ["GCP", "BigQuery", "Dataflow", "Pub/Sub", "Cloud Composer", "Apache Beam"],
    teaser:
      "A senior engineer's guide to the modern GCP data stack: BigQuery architecture, Dataflow pipelines, Pub/Sub streaming, Cloud Composer, and BigQuery ML.",
  },
  {
    title: "Building a Modern Data Platform on AWS: S3, Glue, Athena, and the Lakehouse Pattern",
    href: "/blog/aws-data-platform-lakehouse",
    date: "July 2026",
    tags: ["AWS", "S3", "Glue", "Athena", "Lakehouse", "Apache Iceberg", "dbt"],
    teaser:
      "AWS dominates data platform builds for good reason. Here is how to combine S3, Glue, Athena, and Apache Iceberg into a modern lakehouse that scales without the Redshift bill.",
  },
  {
    title: "Dagster in Production: Assets, Partitions, and Why Modern Data Teams Are Moving Beyond Airflow",
    href: "/blog/dagster-production-guide",
    date: "March 26, 2026",
    tags: ["Dagster", "Data Pipelines", "Orchestration", "dbt", "Software-Defined Assets"],
    teaser:
      "Dagster's Software-Defined Assets changed how data engineers think about pipelines. Core concepts, production patterns, and when to choose Dagster over Airflow.",
  },
  {
    title: "Apache Iceberg and the Open Lakehouse: Why Every Data Engineer Needs to Know It in 2026",
    href: "/blog/apache-iceberg-open-lakehouse",
    date: "March 26, 2026",
    tags: ["Iceberg", "Lakehouse", "Open Table Format"],
    teaser:
      "Apache Iceberg is the open table format powering modern lakehouses. Here's how it enables reliable analytics, interoperability, and scalable data engineering in 2026.",
  },
  {
    title: "Real-Time Data Processing with Kafka Streams and Flink: A Production Guide",
    href: "/blog/kafka-streams-flink-guide",
    date: "July 2026",
    teaser:
      "Kafka Streams and Apache Flink both handle stateful stream processing, but they solve different problems. A production guide to windowing, exactly-once semantics, and choosing the right tool.",
  },
  {
    title: "Data Quality in Production: dbt Tests, Great Expectations, and the Medallion Architecture",
    href: "/blog/data-quality-production",
    date: "July 2026",
    teaser:
      "Bad data does not crash pipelines, it poisons dashboards. A practical guide to dbt tests, Great Expectations, and mapping quality checks to the medallion architecture in production.",
  },
  {
    title: "Delta Lake and the Lakehouse Architecture: What Every Data Engineer Needs to Know",
    href: "/blog/delta-lake-lakehouse",
    date: "March 2026",
    teaser:
      "Delta Lake brings ACID transactions, schema evolution, and time travel to your data lake. Here's what the lakehouse architecture is, why it matters, and how to use it.",
  },
  {
    title: "Snowflake, BigQuery, and Redshift: Choosing a Cloud Data Warehouse for Your Data Stack",
    href: "/blog/cloud-data-warehouse",
    date: "March 2026",
    teaser:
      "A practical guide to choosing between the big three cloud data warehouses. Covers performance, cost, dbt compatibility, and when each platform actually makes sense.",
  },
  {
    title: "Apache Kafka in Production: Partitioning, Consumer Groups, and Exactly-Once Semantics",
    href: "/blog/kafka-real-time-patterns",
    date: "March 2026",
    teaser:
      "Real-time pipelines need more than a Kafka cluster. Partitioning decisions, consumer group scaling, exactly-once semantics, and the production patterns that keep streaming data reliable.",
  },
  {
    title: "Airflow vs. Dagster: Lessons From Running Both in Production",
    href: "/blog/airflow-dagster",
    date: "March 25 2026",
    excerpt:
      "A practical comparison from someone who has run both tools in a production data platform.",
    slug: "airflow-dagster",
    readTime: "7 min read",
    tags: ["Airflow", "Dagster", "Orchestration", "Data Engineering"],
    teaser:
      "A practical comparison from someone who has run both tools in a production data platform.",
  },
  {
    title: "PySpark for Data Engineers: Transformations, Partitioning, and Production Patterns",
    href: "/blog/pyspark-patterns",
    date: "March 2026",
    teaser:
      "PySpark is table stakes for senior DE roles. Here are the patterns that matter in production: DataFrame operations, partition strategies, broadcast joins, Delta Lake integration, and how to write Spark code that actually survives code review.",
  },
  {
    title: "dbt in Production: Testing, CI/CD, and the Medallion Architecture",
    href: "/blog/dbt-in-production",
    date: "March 2026",
    teaser:
      "How to build a production-grade dbt project: medallion architecture, data tests, CI/CD pipelines, and the practices that turn a collection of SQL files into a reliable data platform.",
  },
  {
    title: "Kafka in Production: Lessons from Running Real-Time Pipelines at Scale",
    href: "/blog/kafka-production-lessons",
    date: "March 2026",
    teaser:
      "Three years running Kafka at a major news publisher. Topic design, consumer lag, exactly-once semantics, CDC with Debezium, and when not to use it.",
  },
  {
    title: "Building an LLM-Ready Data Pipeline with Kafka, DuckDB, and pgvector",
    href: "/blog/llm-ready-pipeline",
    date: "February 2026",
    teaser:
      "Most data teams build pipelines to feed dashboards. AI applications need something different. Here is the architecture, the tradeoffs, and what I would do differently.",
  },
  {
    title: "What a Data Engineer Actually Builds for an LLM Application",
    href: "/blog/data-engineer-llm-application",
    date: "February 2026",
    teaser:
      "Ingestion, embedding pipelines, vector stores, and retrieval quality: what a DE actually owns when the team ships an LLM product.",
  },
  {
    title: "The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB",
    href: "/blog/dagster-dbt-duckdb",
    date: "February 2026",
    teaser:
      "A production-quality pipeline on a laptop: why Dagster's asset model, dbt's tests, and DuckDB's speed make a local-first stack feel serious.",
  },
  {
    title: "dbt Macros: The Power Feature Most Engineers Underuse",
    href: "/blog/dbt-macros-guide",
    date: "March 28, 2026",
    tags: ["dbt", "Data Engineering", "SQL", "Analytics Engineering"],
    teaser:
      "A practical guide to dbt macros for mid-to-senior engineers: when to use them over models, cross-database compatibility patterns, generic tests, utility macros, and the mistakes that cost teams time.",
  },
  {
    title: "Data Engineering With DuckDB: Fast Local Analytics Without the Cloud",
    href: "/blog/duckdb-local-analytics",
    date: "March 28, 2026",
    tags: ["DuckDB", "Data Engineering", "Local Dev", "Analytics"],
    teaser:
      "DuckDB is the fastest path from a CSV to a query result you will find anywhere. What it is, when to use it, and how it compares to Pandas, Spark, and BigQuery for real engineering work.",
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-electricBlue hover:text-white transition-colors"
        >
          ← Back to home
        </Link>

        <div className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Blog</h1>
          <p className="mt-3 text-mutedGray">
            Practical notes on data engineering, local-first tooling, and building
            systems that feel production-grade without the cloud bill.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {posts.map((post) => (
            <article
              key={post.href}
              className="border border-steel/40 rounded-2xl p-6 bg-charcoal/40 hover:border-electricBlue/60 transition-colors"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                <Link href={post.href} className="hover:text-electricBlue transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm font-mono text-mutedGray">{post.date}</p>
              <p className="mt-3 text-mutedGray leading-relaxed">{post.teaser}</p>
              <div className="mt-4">
                <Link
                  href={post.href}
                  className="text-sm text-electricBlue hover:text-white transition-colors"
                >
                  Read post →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-electricBlue hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
