"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    type: "quote",
    body: "Your reproductive health is not a luxury — it's a right. Take charge of it, privately and confidently.",
    author: "Dr. Akosua Mensah",
    role: "OB-GYN, Korle Bu Teaching Hospital",
  },
  {
    type: "event",
    badge: "Upcoming event",
    title: "Free Cycle Tracking Workshop",
    body: "Join Dr. Yvonne Boateng for a live session on understanding your cycle. Learn the signs your body is telling you.",
    meta: "May 28, 2026 · 6:00 PM GMT · Free",
  },
  {
    type: "quote",
    body: "When students have private access to contraception, unplanned pregnancies drop by 60% on campus.",
    author: "WHO Adolescent Health Report",
    role: "2024",
  },
  {
    type: "event",
    badge: "Awareness week",
    title: "STI Testing Week — All Tests 50% Off",
    body: "Anonymous at-home STI screening kits delivered in plain packaging. No appointments. No judgment.",
    meta: "June 3–10, 2026",
  },
  {
    type: "quote",
    body: "Knowing more about your body shouldn't be embarrassing. It should be empowering.",
    author: "Ama Asante",
    role: "University of Ghana, Year 3",
  },
];

const ROTATE_MS = 6000;

export default function AuthShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-[#08110B] text-white lg:flex lg:items-center lg:justify-center">
      {/* Soft gradient accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0E1A12] via-[#08110B] to-[#08110B]" />

      {/* Top right link */}
      <a
        href="/about"
        className="absolute right-8 top-8 z-10 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:border-white/30 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        About HelloMama
      </a>

      {/* Slide content */}
      <div className="relative z-10 mx-auto max-w-lg px-12">
        <div key={index} className="animate-[fadeIn_700ms_ease-out]">
          {slide.type === "quote" ? (
            <QuoteSlide slide={slide} />
          ) : (
            <EventSlide slide={slide} />
          )}
        </div>

        {/* Dots */}
        <div className="mt-12 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function QuoteSlide({ slide }) {
  return (
    <>
      <svg className="mb-6 h-8 w-8 text-white/40" fill="currentColor" viewBox="0 0 32 32">
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36 1 24.832 4.32 28 8.32 28c3.776 0 6.56-2.992 6.56-6.56 0-3.504-2.448-6.176-5.696-6.176-.656 0-1.552.128-1.776.256.464-3.024 3.328-6.624 6.176-8.4L9.352 4zm17.408 0c-4.832 3.456-8.288 9.12-8.288 15.36C18.472 24.832 21.792 28 25.792 28c3.712 0 6.56-2.992 6.56-6.56 0-3.504-2.512-6.176-5.76-6.176-.656 0-1.488.128-1.712.256.464-3.024 3.264-6.624 6.112-8.4L26.76 4z" />
      </svg>
      <p className="text-2xl font-medium leading-snug text-white sm:text-3xl">
        {slide.body}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
          {slide.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{slide.author}</p>
          <p className="text-xs text-white/60">{slide.role}</p>
        </div>
      </div>
    </>
  );
}

function EventSlide({ slide }) {
  return (
    <>
      <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#D4E8C2]/15 px-3 py-1 text-xs font-medium text-[#D4E8C2]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4E8C2]" />
        {slide.badge}
      </span>
      <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
        {slide.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-white/70">
        {slide.body}
      </p>
      <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {slide.meta}
      </p>
    </>
  );
}
