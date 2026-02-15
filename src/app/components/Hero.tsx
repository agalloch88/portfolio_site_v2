export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-4 hero-gradient">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <img
            src="/ryan-headshot.jpg"
            alt="Ryan Kirsch"
            className="w-36 h-36 rounded-full mx-auto object-cover border-2 border-electricBlue/40 shadow-lg shadow-electricBlue/10"
          />
        </div>
        <p className="font-mono text-electricBlue text-sm sm:text-base mb-4 tracking-wider">
          Lead Backend Software Engineer &amp; Cloud Architect
        </p>
        <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          I build systems that scale.{" "}
          <span className="text-electricBlue">Full stop.</span>
        </h1>
        <p className="text-lg sm:text-xl text-mutedGray max-w-2xl mx-auto mb-10 leading-relaxed">
          Lead Backend Engineer &amp; Cloud Architect, Philadelphia Inquirer.
          I design and deploy production infrastructure, data platforms, and AI/ML
          pipelines that handle millions of requests and petabytes of data.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            className="px-8 py-3 bg-electricBlue text-navy font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-8 py-3 border border-electricBlue text-electricBlue rounded-lg hover:bg-electricBlue/10 transition-colors duration-200"
          >
            Get In Touch
          </a>
        </div>
        <p className="text-sm text-steel mt-6">
          Building systems, rolling BJJ, exploring AI
        </p>
        <div className="max-w-md mx-auto mt-8">
          <img
            src="https://streak-stats.demolab.com?user=agalloch88&theme=tokyonight&hide_border=true&background=1a1b26"
            alt="GitHub Streak"
          />
        </div>
      </div>
    </section>
  );
}
