import Link from "next/link";

export const metadata = {
  title: "Blog | Ryan Kirsch",
  description: "Writing on data engineering, local-first stacks, and pragmatic infrastructure choices.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    title: "The Local-First Data Stack: Practical Lessons from Dagster, dbt, and DuckDB",
    href: "/blog/dagster-dbt-duckdb",
    date: "February 2026",
    teaser:
      "A production-quality pipeline on a laptop: why Dagster's asset model, dbt's tests, and DuckDB's speed make a local-first stack feel serious.",
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
