"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "Tech Stack", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleMenuKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const focusable = Array.from(
      menu.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button")
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
      return;
    }

    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const focusable = Array.from(
      menu.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button")
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }

    menu.addEventListener("keydown", handleMenuKeyDown);

    return () => {
      menu.removeEventListener("keydown", handleMenuKeyDown);
    };
  }, [open, handleMenuKeyDown]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/80 backdrop-blur-md border-b border-electricBlue/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="font-mono text-xl font-bold text-electricBlue">
            RK
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-mutedGray hover:text-white transition-colors duration-300"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            className="md:hidden text-lightGray"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div ref={menuRef} className="md:hidden bg-charcoal border-t border-electricBlue/10">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-sm text-mutedGray hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
