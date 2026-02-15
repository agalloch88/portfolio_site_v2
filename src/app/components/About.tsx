export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          About Me
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-8 rounded-full" />

        <div className="space-y-6 text-lightGray leading-relaxed text-base sm:text-lg">
          <p>
            Most people don&apos;t pivot from running a precious metals business to
            leading backend engineering at a major media company. But most people
            don&apos;t build production systems that serve millions of readers daily,
            either.
          </p>
          <p>
            After a decade in strategic communications and business operations, I
            made a calculated bet during COVID: teach myself full-stack development
            through a MERN bootcamp, then get my hands dirty with real code. Three
            and a half years later, I&apos;m architecting cloud infrastructure and
            data pipelines at the Philadelphia Inquirer, designing systems that
            ingest, process, and serve content at scale.
          </p>
          <p>
            My unconventional path gives me something most engineers don&apos;t have:
            deep business context. I understand both the technical requirements and
            the strategic implications. Whether I&apos;m optimizing database queries,
            containerizing microservices, or building ML pipelines, I&apos;m solving
            real problems that move the needle.
          </p>
          <p className="text-cyberTeal font-medium">
            Currently expanding into data engineering and AI/ML because the future
            of backend is data-driven, and I&apos;m building it.
          </p>
        </div>
      </div>
    </section>
  );
}
