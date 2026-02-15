const timeline = [
  {
    role: "Lead Backend Engineer & Cloud Architect",
    company: "Philadelphia Inquirer",
    period: "2023 – Present",
    description:
      "Architecting scalable cloud infrastructure and data platforms for digital media at enterprise scale.",
  },
  {
    role: "Backend Engineer",
    company: "Philadelphia Inquirer",
    period: "2022 – 2023",
    description:
      "Built and maintained production APIs and microservices serving millions of daily readers.",
  },
  {
    role: "Full-Stack Developer",
    company: "First Dev Role",
    period: "July 2021 – 2022",
    description:
      "Transitioned from business operations to software development. Built production applications using modern web technologies.",
  },
  {
    role: "Operations & Strategy",
    company: "Family Precious Metals Business",
    period: "2011 – 2021",
    description:
      "Led business operations, strategic communications, and digital transformation initiatives. This decade taught me how technology serves business goals — not the other way around.",
  },
  {
    role: "Strategic Communications",
    company: "Education Foundation",
    period: "",
    description:
      "Where it all started. Communications degree that taught me how to translate complex concepts into clear, actionable insights.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          How I Got Here
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-12 rounded-full" />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-steel/30" />

          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-12 sm:pl-16">
                {/* Dot */}
                <div
                  className={`absolute left-2.5 sm:left-4.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                    i === 0
                      ? "bg-electricBlue border-electricBlue"
                      : "bg-navy border-steel"
                  }`}
                />
                <div className="bg-charcoal border border-electricBlue/10 rounded-xl p-5 hover:border-electricBlue/20 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-mono text-base font-semibold text-white">
                      {item.role}
                    </h3>
                    {item.period && (
                      <span className="text-xs font-mono text-electricBlue mt-1 sm:mt-0">
                        {item.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyberTeal font-medium mb-2">
                    {item.company}
                  </p>
                  <p className="text-sm text-mutedGray leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
