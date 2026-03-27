import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Infrastructure as Code for Data Engineers: Terraform Patterns for Data Platforms | Ryan Kirsch",
  description:
    "A data engineer's guide to Terraform. How to manage data infrastructure as code -- Snowflake objects, S3 buckets, IAM roles, Kafka topics -- and the patterns that prevent the configuration drift that breaks data platforms.",
  openGraph: {
    title:
      "Infrastructure as Code for Data Engineers: Terraform Patterns for Data Platforms",
    description:
      "Managing Snowflake, S3, IAM, and Kafka infrastructure as code with Terraform -- and the patterns that prevent configuration drift.",
    type: "article",
    url: "https://ryankirsch.dev/blog/infrastructure-as-code-data-engineering",
    siteName: "Ryan Kirsch",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Infrastructure as Code for Data Engineers: Terraform Patterns for Data Platforms",
    description:
      "Managing Snowflake, S3, IAM, and Kafka infrastructure as code with Terraform.",
  },
  alternates: {
    canonical: "/blog/infrastructure-as-code-data-engineering",
  },
};

export default function IaCDataEngineeringPost() {
  const postUrl = encodeURIComponent(
    "https://ryankirsch.dev/blog/infrastructure-as-code-data-engineering"
  );
  const postTitle = encodeURIComponent(
    "Infrastructure as Code for Data Engineers: Terraform Patterns for Data Platforms"
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
            Infrastructure as Code for Data Engineers: Terraform Patterns for
            Data Platforms
          </h1>
          <p className="mt-3 text-sm font-mono text-mutedGray">
            Ryan Kirsch · March 2026 ·{" "}
            <span className="text-cyberTeal">8 min read</span>
          </p>
          <p className="mt-4 text-lg text-mutedGray leading-relaxed">
            Data platform configuration -- warehouses, schemas, roles, S3
            buckets, Kafka topics -- accumulates over time in ways that become
            impossible to track manually. Someone creates a warehouse for a
            project, forgets to set auto-suspend, and six months later it is
            still running at full cost. Someone grants a role manually, and
            six months later no one knows why it exists. Infrastructure as
            code is how you prevent this.
          </p>
        </header>

        <div className="mt-10 prose prose-invert max-w-none text-lightGray prose-headings:text-white prose-p:text-lightGray prose-li:text-lightGray prose-strong:text-white prose-a:text-electricBlue hover:prose-a:text-white">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Why Data Engineers Should Care About Terraform
            </h2>
            <p>
              Terraform is a tool that declares infrastructure as code and
              applies changes idempotently. You describe what you want to exist,
              and Terraform calculates the diff between current state and desired
              state, then applies only the necessary changes.
            </p>
            <p>
              For data engineers, the value is:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Reproducibility.</strong> A new environment (staging,
                dev) is provisioned by running <code>terraform apply</code>,
                not by manually recreating warehouse configurations, schemas,
                and permissions.
              </li>
              <li>
                <strong>Change visibility.</strong> Every infrastructure change
                goes through a pull request. Someone can see that a new role
                was granted, a warehouse was resized, or a schema was created --
                with the context of why.
              </li>
              <li>
                <strong>Drift prevention.</strong> Terraform detects and reports
                when someone has manually changed infrastructure outside of code.
                Configuration drift is caught before it causes failures.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Managing Snowflake with Terraform
            </h2>
            <p>
              The Snowflake Terraform provider manages databases, schemas,
              warehouses, roles, users, and grants. A basic Snowflake data
              platform:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# providers.tf
terraform {
  required_providers {
    snowflake = {
      source  = "Snowflake-Labs/snowflake"
      version = "~> 0.89"
    }
  }
}

provider "snowflake" {
  account   = var.snowflake_account
  username  = var.snowflake_username
  password  = var.snowflake_password
  role      = "SYSADMIN"
}

# warehouses.tf
resource "snowflake_warehouse" "analytics" {
  name                         = "ANALYTICS_MEDIUM"
  warehouse_size               = "medium"
  auto_suspend                 = 120      # 2 minutes
  auto_resume                  = true
  initially_suspended          = true
  max_concurrency_level        = 8
  statement_timeout_in_seconds = 300

  comment = "Analytics queries and dbt transformations"
}

resource "snowflake_warehouse" "etl" {
  name                         = "ETL_SMALL"
  warehouse_size               = "small"
  auto_suspend                 = 300      # 5 minutes
  auto_resume                  = true
  initially_suspended          = true
  comment                      = "Ingestion and ETL pipelines"
}

# databases.tf
resource "snowflake_database" "analytics" {
  name    = "ANALYTICS"
  comment = "Production analytics warehouse"
}

resource "snowflake_schema" "bronze" {
  database = snowflake_database.analytics.name
  name     = "BRONZE"
  comment  = "Raw ingested data, append-only"
}

resource "snowflake_schema" "silver" {
  database = snowflake_database.analytics.name
  name     = "SILVER"
  comment  = "Cleansed and conformed data"
}

resource "snowflake_schema" "gold" {
  database = snowflake_database.analytics.name
  name     = "GOLD"
  comment  = "Business-facing analytics models"
}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Role-Based Access Control as Code
            </h2>
            <p>
              Access control is one of the most common drift sources. Manual
              grants accumulate, roles get created for specific projects and
              never cleaned up, and no one can answer &ldquo;why does this user
              have this permission?&rdquo;. Managing roles in Terraform makes
              every grant intentional and auditable.
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# roles.tf
resource "snowflake_role" "analyst_read" {
  name    = "ANALYST_READ"
  comment = "Read access to gold schema for analysts"
}

resource "snowflake_role" "data_engineer" {
  name    = "DATA_ENGINEER"
  comment = "Read/write access for data engineering team"
}

# Grant gold schema read to analyst role
resource "snowflake_schema_grant" "gold_select_analyst" {
  database_name = snowflake_database.analytics.name
  schema_name   = snowflake_schema.gold.name
  privilege     = "SELECT"
  roles         = [snowflake_role.analyst_read.name]

  # Grant to future tables in schema automatically
  on_future = true
}

# Grant all schemas to data engineer role
resource "snowflake_database_grant" "analytics_usage_de" {
  database_name = snowflake_database.analytics.name
  privilege     = "USAGE"
  roles         = [snowflake_role.data_engineer.name]
}

# Assign warehouse to roles
resource "snowflake_warehouse_grant" "analytics_usage_analyst" {
  warehouse_name = snowflake_warehouse.analytics.name
  privilege      = "USAGE"
  roles          = [snowflake_role.analyst_read.name]
}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              S3 Bucket Management
            </h2>
            <p>
              Data lake S3 buckets have specific configuration requirements
              for data engineering workloads. Managing them in Terraform
              ensures every bucket has consistent lifecycle policies,
              encryption, and access controls:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# s3.tf
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake-prod"
  
  tags = {
    Environment = "production"
    Team        = "data-platform"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    id     = "bronze-intelligent-tiering"
    status = "Enabled"
    
    filter {
      prefix = "bronze/"
    }

    transition {
      days          = 90
      storage_class = "INTELLIGENT_TIERING"
    }
  }

  rule {
    id     = "temp-expiration"
    status = "Enabled"
    
    filter {
      prefix = "tmp/"
    }

    expiration {
      days = 7  # Clean up tmp files automatically
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Terraform State Management for Teams
            </h2>
            <p>
              Terraform stores state about what it has created. For teams,
              this state must live in shared, versioned storage -- not on a
              developer&apos;s laptop. The standard pattern is S3 with DynamoDB
              for state locking:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# backend.tf
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "data-platform/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"  # Prevents concurrent applies
  }
}

# Separate the state bucket from the data lake bucket
# (state bucket should have versioning enabled and strict access control)

# variables.tf
variable "environment" {
  type        = string
  description = "Environment: prod, staging, or dev"
  
  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment must be prod, staging, or dev."
  }
}

variable "snowflake_account" {
  type        = string
  sensitive   = true  # Prevents value from appearing in logs
}

variable "snowflake_password" {
  type      = string
  sensitive = true
}`}</code>
            </pre>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              The CI/CD Workflow for Infrastructure Changes
            </h2>
            <p>
              Infrastructure changes should follow the same review process
              as code changes. A standard CI/CD workflow:
            </p>
            <pre className="bg-obsidianDark border border-steel rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{`# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths: ["infrastructure/**"]
  push:
    branches: [main]
    paths: ["infrastructure/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Init
        run: terraform -chdir=infrastructure init
        
      - name: Terraform Plan
        run: terraform -chdir=infrastructure plan -out=tfplan
        env:
          TF_VAR_snowflake_account: ${"$"}{{ secrets.SNOWFLAKE_ACCOUNT }}
          TF_VAR_snowflake_password: ${"$"}{{ secrets.SNOWFLAKE_PASSWORD }}
          
      - name: Comment PR with Plan
        uses: actions/github-script@v7
        # ... post plan output as PR comment
  
  apply:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Apply
        run: terraform -chdir=infrastructure apply -auto-approve
        env:
          TF_VAR_snowflake_account: ${"$"}{{ secrets.SNOWFLAKE_ACCOUNT }}
          TF_VAR_snowflake_password: ${"$"}{{ secrets.SNOWFLAKE_PASSWORD }}`}</code>
            </pre>
            <p>
              The pattern: plan on every PR (shows reviewers exactly what will
              change), apply on merge to main. No manual <code>terraform apply</code>
              from developer machines in production. Infrastructure changes
              are reviewed, approved, and applied automatically -- the same
              discipline as application code.
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
