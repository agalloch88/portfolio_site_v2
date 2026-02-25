export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-2">
          Let&apos;s Build Something
        </h2>
        <div className="w-16 h-1 bg-electricBlue mb-8 rounded-full mx-auto" />

        <p className="text-mutedGray text-base sm:text-lg leading-relaxed mb-4">
          I&apos;m always interested in challenging backend problems, cloud
          architecture discussions, and opportunities to build systems that scale.
          If you&apos;re looking to optimize infrastructure, design data
          pipelines, or need someone who can translate business requirements into
          robust technical solutions, I&apos;d like to hear from you.
        </p>

        <p className="text-sm text-steel mb-8">
          <span className="text-lightGray">Currently based in:</span> Charlotte, NC
          &nbsp;·&nbsp;
          <span className="text-lightGray">Open to:</span> Remote collaboration,
          consulting, interesting full-time opportunities
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="mailto:ryankirsch88@gmail.com"
            className="px-8 py-3 bg-electricBlue text-navy font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
          >
            Send a Message
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <a
            href="https://www.linkedin.com/in/ryan-s-kirsch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mutedGray hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/agalloch88"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mutedGray hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
        <p className="text-xs text-steel mt-6">Response time: usually same day.</p>
      </div>
    </section>
  );
}
