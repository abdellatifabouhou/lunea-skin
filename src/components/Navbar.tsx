"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CTA, SITE } from "@/lib/config";

const links = [
  { href: "#benefits", label: "الفوائد" },
  { href: "#ingredients", label: "المكونات" },
  { href: "#how-to-use", label: "طريقة الاستعمال" },
  { href: "#offer", label: "العرض" },
  { href: "#faq", label: "أسئلة شائعة" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-dark/60 bg-cream/85 backdrop-blur-md">
      <nav aria-label="القائمة الرئيسية" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-brand text-xl font-semibold text-sage-900 sm:text-2xl" aria-label={`${SITE.brand} — الصفحة الرئيسية`}>
          LUNÉA <span className="text-gold">SKIN</span>
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-sage-900">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#order" className="btn-primary hidden !py-2.5 !px-5 text-sm md:inline-flex">
            {CTA.primary}
          </a>
          <a href="#order" className="btn-primary !py-2 !px-4 text-sm md:hidden">
            {CTA.primary}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            className="grid h-10 w-10 place-items-center rounded-full border border-sand-dark bg-white/70 text-sage-900 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-sand-dark/60 bg-cream md:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-base font-medium text-ink">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 hover:bg-sage-50">
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a href="#order" onClick={() => setOpen(false)} className="btn-primary w-full">
              {CTA.primary} — 149 درهم
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
