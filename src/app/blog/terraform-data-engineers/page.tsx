import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Terraform for Data Engineers: Managing Infrastructure as Code | Ryan Kirsch - Data Engineer",
  description:
    "Learn how to manage Snowflake, Redshift, S3, and GCS infrastructure with Terraform. Real patterns for data platform teams who are tired of clicking through cloud consoles.",
  openGraph: {
    title:
      "Terraform for Data Engineers: Managing Infrastructure as Code | Ryan Kirsch - Data Engineer",
    description:
      "Learn how to manage Snowflake, Redshift, S3, and GCS infrastructure with Terraform. Real patterns for data platform teams who are tired of clicking through cloud consoles.",
    type: "article",
    url: "https://ryankirsch.dev/blog/terraform-data-engineers",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Terraform for Data Engineers: Managing Infrastructure as Code | Ryan Kirsch - Data Engineer",
    description:
      "Learn how to manage Snowflake, Redshift, S3, and GCS infrastructure with Terraform. Real patterns for data platform teams who are tired of clicking through cloud consoles.",
  },
  alternates: { canonical: "/blog/terraform-data-engineers" },
};

export default function TerraformDataEngineersPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/terraform-data-engineers"
  );
  const postTitle = encodeURIComponent(
    "Terraform for Data Engineers: Managing Infrastructure as Code"
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
            {["Terraform", "Infrastructure as Code", "Snowflake", "AWS", "GCP", "DevOps"].map(
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
            Terraform for Data Engineers: Managing Infrastructure as Code
          </h1>
          <p className="mt-4 text-mutedGray text-sm font-mono">
            March 27, 2026 &middot; 8 min read
          </p>
        </div>

        <div className="mt-10 prose prose-invert prose-sm max-w-none space-y-8 text-[15px] leading-relaxed text-steel">
          <p>
            I have spent years watching data platforms drift into infrastructure
            sprawl. Buckets get created by hand, roles are added in a rush, and
            the Snowflake warehouse that was meant for one workload becomes a
            catch-all for everything. It works until it does not. When a new
            team joins or a compliance audit lands in your lap, you discover you
            do not really know what your platform is or who changed it last.
          </p>
          <p>
            Infrastructure as code is the only reliable way I have found to
            keep data platforms sane. It gives you reproducibility, version
            control, and a shared language between data engineers and platform
            teams. More importantly, it turns infrastructure from a brittle set
            of clicks into a system you can review, test, and evolve with
            confidence. Terraform is the tool that has become the default, and
            for good reason.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Quick Terraform Primer
          </h2>
          <p>
            Terraform is a declarative tool. You describe the desired state of
            your infrastructure, and Terraform figures out how to get there. It
            uses providers to talk to APIs, resources to define what you want,
            and a state file to track what exists. The plan step shows you a
            diff. The apply step executes it. That simple loop is why teams can
            review infra changes the same way they review code.
          </p>
          <p>
            In my experience, the most important concept for data engineers is
            state. The state file is your source of truth for what Terraform
            manages. Put it in a remote backend, lock it, and treat it like a
            production database. Once you do, you have an audit trail and a
            repeatable process for every change across Snowflake, AWS, and GCP.
          </p>
          <p>
            I also encourage teams to learn terraform import early. Most data
            platforms already exist by the time Terraform shows up. Import lets
            you bring existing buckets, datasets, and roles under management
            without recreating them. It is not glamorous, but it is the fastest
            path to reducing drift. Pair that with a strict review process for
            plan output, and you have a system where changes are visible before
            they hit production.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Terraform for S3 and GCS
          </h2>
          <p>
            Data lakes live in buckets. That means buckets should be code. I
            define storage in Terraform with lifecycle policies, encryption, and
            explicit cross-account or cross-project access. When that is codified,
            onboarding new consumers stops being a ticket and becomes a pull
            request. Here is a simplified example that creates an S3 lake bucket
            and a mirrored GCS bucket for cross-cloud data exchange.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = "data-platform"
  region  = "us-central1"
}

resource "aws_s3_bucket" "lake" {
  bucket = "company-data-lake"
}

resource "aws_s3_bucket_lifecycle_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id

  rule {
    id     = "cold-storage"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }
  }
}

resource "google_storage_bucket" "exchange" {
  name     = "company-data-exchange"
  location = "US"
  uniform_bucket_level_access = true
}`}
          </pre>
          <p>
            This is not everything you need, but it is the foundation. I usually
            add bucket policies, object ownership enforcement, and a dedicated
            access role for data workloads. The key is that every bucket that
            matters is defined in code, not hidden in a console tab.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Terraform for Snowflake
          </h2>
          <p>
            Snowflake is where a lot of data engineering teams spend their
            budget, so it deserves the same rigor. The Snowflake provider lets
            you define databases, schemas, warehouses, roles, and grants in a
            consistent way. Once you do that, you can reason about access the
            same way you reason about application permissions. It also makes
            environment parity possible, which I have found to be the biggest
            pain point on teams that grow quickly.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`provider "snowflake" {
  account  = "acme"
  username = "terraform"
  role     = "ACCOUNTADMIN"
}

resource "snowflake_database" "analytics" {
  name = "ANALYTICS"
}

resource "snowflake_schema" "mart" {
  database = snowflake_database.analytics.name
  name     = "MART"
}

resource "snowflake_warehouse" "transform" {
  name           = "TRANSFORM_WH"
  warehouse_size = "MEDIUM"
  auto_suspend   = 60
  auto_resume    = true
}

resource "snowflake_role" "data_engineer" {
  name = "DATA_ENGINEER"
}

resource "snowflake_database_grant" "analytics_usage" {
  database_name = snowflake_database.analytics.name
  privilege     = "USAGE"
  roles         = [snowflake_role.data_engineer.name]
}`}
          </pre>
          <p>
            I keep these definitions in a module that enforces naming
            conventions and standard grants. That module becomes the template
            for every new database or warehouse, which keeps permissions
            predictable as the platform scales.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Terraform for Redshift and BigQuery
          </h2>
          <p>
            Redshift and BigQuery are different, but the idea is the same. Define
            clusters and datasets in code, attach IAM roles explicitly, and
            capture the relationships in the state file. In my experience, most
            access issues on these platforms come from manual IAM changes, not
            from the data layer itself. Terraform brings order to that chaos.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`resource "aws_redshift_cluster" "warehouse" {
  cluster_identifier = "analytics-warehouse"
  node_type          = "ra3.xlplus"
  number_of_nodes    = 2
  master_username    = "admin"
  master_password    = var.redshift_master_password
  iam_roles          = [aws_iam_role.redshift_role.arn]
}

resource "google_bigquery_dataset" "analytics" {
  dataset_id = "analytics"
  location   = "US"
}

resource "google_bigquery_dataset_iam_member" "analyst_access" {
  dataset_id = google_bigquery_dataset.analytics.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "group:analytics@company.com"
}`}
          </pre>
          <p>
            The key for both platforms is to stop treating IAM as an afterthought.
            If the dataset or cluster exists, the access should be defined right
            next to it. Terraform makes that a habit instead of a best effort.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Wiring It Together with Modules, Workspaces, and Remote State
          </h2>
          <p>
            The difference between a proof of concept and a real Terraform setup
            is how you structure it. I use modules for reusable building blocks,
            workspaces or separate state files for environments, and a remote
            backend so the state is shared and locked. An S3 backend with DynamoDB
            locking is a proven option for AWS heavy teams.
          </p>
          <pre className="bg-steel/10 border border-steel/20 rounded-lg p-4 text-xs font-mono text-electricBlue overflow-x-auto">
            {`terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "data-platform/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

module "snowflake_core" {
  source          = "./modules/snowflake-core"
  environment     = var.environment
  warehouse_size  = var.warehouse_size
}`}
          </pre>
          <p>
            I prefer separate state files per environment so production changes
            are isolated from development experiments. If you do use workspaces,
            be consistent about naming and never share a workspace across teams.
          </p>
          <p>
            Modules should be small, opinionated, and focused on a single domain.
            I keep a module for storage, a module for warehouses, and a module for
            identity and access. Each module exposes a narrow output surface so
            downstream systems can reference the right bucket or role without
            leaking internal details. That approach keeps refactors manageable
            and prevents every change from cascading across your whole stack.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Real-World Patterns That Actually Scale
          </h2>
          <p>
            The environment promotion pattern is the one that has saved me most
            often. Define dev, staging, and prod as separate environments, and
            keep the Terraform code identical while the variables change. That
            lets you test every change in dev, validate in staging, then ship to
            prod with confidence. It also makes audits easier because every
            difference is explicit in variable files, not hidden in someone
            else&apos;s console session.
          </p>
          <p>
            CI and Terraform go hand in hand. I wire Terraform plan into GitHub
            Actions so every pull request shows what will change before it is
            merged. The apply step runs only on protected branches. This is not
            overkill, it is the only way to keep a growing data platform under
            control without creating a bottleneck of approvals.
          </p>
          <p>
            Another pattern I rely on is ownership boundaries. Snowflake roles,
            S3 buckets, and BigQuery datasets map to teams, not individuals. That
            structure lets me delegate management while still keeping the core
            platform consistent. Terraform modules become the guardrails.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10">
            Closing: Infrastructure as Code Is the New Baseline
          </h2>
          <p>
            I have watched the role of data engineering shift from building
            pipelines to owning platforms. That shift comes with expectations
            around infrastructure maturity. Senior data engineers are expected
            to manage Snowflake, Redshift, S3, and GCS with the same discipline
            they apply to production code. Infrastructure as code is the fastest
            path to that discipline.
          </p>
          <p>
            The old model of infra as a ticket is slow and fragile. The model
            that works is infra as code, reviewed in pull requests, tested in
            CI, and promoted across environments with intention. Terraform is
            not just a tooling choice, it is a shift in mindset that turns data
            platforms into real products. That is the standard I expect on
            modern teams, and it is the standard I build toward.
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
