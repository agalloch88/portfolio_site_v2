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
            through a <span className="tech-term">MERN</span> bootcamp, then get my hands dirty with real code. Three
            and a half years later, I&apos;m architecting <span className="tech-term">cloud infrastructure</span> and
            data pipelines at the Philadelphia Inquirer, designing systems that
            ingest, process, and serve content at scale.
          </p>
          <p>
            My unconventional path gives me something most engineers don&apos;t have:
            deep business context. I understand both the technical requirements and
            the strategic implications. Whether I&apos;m optimizing <span className="tech-term">database queries</span>,
            containerizing microservices, or building <span className="tech-term">ML pipelines</span>, I&apos;m solving
            problems with measurable outcomes: systems that cut costs, reduce latency, and ship on time.
          </p>
          <p className="text-cyberTeal font-medium">
            Currently expanding into data engineering and <span className="tech-term">AI/ML</span> because the future
            of backend is data-driven, and I&apos;m building it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-charcoal border border-electricBlue/10 rounded-xl p-6">
            <picture>
              <source srcSet="/ryan-bjj.webp" type="image/webp" />
              <img
                src="/ryan-bjj.jpg"
                alt="Ryan with Professor Fred Silva at Lucas Lepri Jiu Jitsu Academy"
                className="w-48 h-48 rounded-lg object-cover flex-shrink-0"
              />
            </picture>
            <p className="text-sm text-steel italic">
              When I&apos;m not engineering systems, you&apos;ll find me on the mats
              training Brazilian Jiu-Jitsu, here with Professor Fred Silva at
              Lucas Lepri Jiu Jitsu Academy in Charlotte, NC. The discipline,
              problem-solving, and continuous improvement translate directly to
              how I approach code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
