"use client";

import { useState, type FormEvent } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );

  const subject = `Portfolio Contact: ${name} via ryankirsch.dev`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("_subject", subject);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      setStatus("success");
      form.reset();
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

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

        <form
          action="https://formsubmit.co/ryankirsch88@gmail.com"
          method="POST"
          onSubmit={handleSubmit}
          className="w-full text-left bg-charcoal border border-electricBlue/10 rounded-xl p-6 mb-8"
        >
          <input type="hidden" name="_subject" value={subject} />
          <input type="hidden" name="_captcha" value="true" />
          <input type="hidden" name="_template" value="table" />
          <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div className="flex flex-col gap-4">
            <label className="text-sm text-lightGray">
              Name
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-lg bg-charcoal/60 border border-steel/40 px-4 py-3 text-lightGray placeholder:text-steel focus:outline-none focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors"
                placeholder="Your name"
              />
            </label>

            <label className="text-sm text-lightGray">
              Email
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg bg-charcoal/60 border border-steel/40 px-4 py-3 text-lightGray placeholder:text-steel focus:outline-none focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors"
                placeholder="you@example.com"
              />
            </label>

            <label className="text-sm text-lightGray">
              Message
              <textarea
                name="message"
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full rounded-lg bg-charcoal/60 border border-steel/40 px-4 py-3 text-lightGray placeholder:text-steel focus:outline-none focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors resize-none"
                placeholder="Tell me about your project or challenge."
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full sm:w-auto px-8 py-3 bg-electricBlue text-navy font-semibold rounded-lg hover:scale-105 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-electricBlue focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Sending..." : "Send a Message"}
            </button>

            {status === "success" ? (
              <span className="text-sm text-electricBlue">
                Message sent! I&apos;ll get back to you soon.
              </span>
            ) : null}

            {status === "error" ? (
              <span className="text-sm text-rose-300">
                Something went wrong. Please try again.
              </span>
            ) : null}
          </div>
        </form>

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
