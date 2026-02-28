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
            My focus now is data engineering and <span className="tech-term">AI/ML</span> infrastructure: building the pipelines, platforms, and systems that power intelligent applications.
          </p>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 py-2" aria-label="Career highlights">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-electricBlue font-mono">$220K+</div>
              <div className="text-xs sm:text-sm text-steel mt-1">Pipeline cost savings shipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-electricBlue font-mono">1M+</div>
              <div className="text-xs sm:text-sm text-steel mt-1">Daily readers served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-electricBlue font-mono">3+ Years</div>
              <div className="text-xs sm:text-sm text-steel mt-1">Production data engineering</div>
            </div>
          </div>

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
