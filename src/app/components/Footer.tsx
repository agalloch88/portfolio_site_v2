export default function Footer() {
  return (
    <footer className="border-t border-steel/20 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-steel">
        <p>
          © {new Date().getFullYear()} Ryan Kirsch. Built with Next.js &amp;
          Tailwind CSS.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/agalloch88"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-electricBlue transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/ryan-s-kirsch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-electricBlue transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
