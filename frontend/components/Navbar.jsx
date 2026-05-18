"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/products", label: "Products" },
];

function Squiggle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-full mt-1 h-2.5 w-full"
    >
      <path
        d="M 3 7 C 20 2, 40 11, 60 5 S 85 1, 97 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const isPilled = isHome && scrolled;

  let wrapperClass;
  if (!isHome) {
    wrapperClass = "sticky top-0 z-50 w-full bg-black text-white";
  } else if (isPilled) {
    wrapperClass =
      "fixed left-0 right-0 top-4 z-50 px-4 transition-all duration-300";
  } else {
    wrapperClass =
      "fixed left-0 right-0 top-0 z-50 transition-all duration-300";
  }

  const innerClass = isPilled
    ? "mx-auto grid h-14 max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-x-8 rounded-full bg-white px-6 text-black shadow-lg transition-all duration-300"
    : "mx-auto grid h-16 w-full grid-cols-[auto_1fr_auto] items-center gap-x-8 px-[5%] text-white transition-all duration-300 md:min-h-18";

  const linkClass = isPilled
    ? "text-sm font-medium text-gray-700 transition-colors hover:text-black"
    : "text-sm font-medium text-white transition-colors hover:text-gray-300";

  const loginClass = isPilled
    ? "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
    : "rounded-lg border border-white bg-transparent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10";

  const signupClass = isPilled
    ? "rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
    : "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-100";

  const hamburgerLineColor = isPilled ? "bg-black" : "bg-white";

  return (
    <header className={wrapperClass}>
      <nav className={innerClass}>
        <Link
          href="/"
          className="flex flex-shrink-0 items-center text-3xl [font-family:var(--font-script)]"
        >
          Logo
        </Link>

        <ul className="hidden items-center justify-center gap-x-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative inline-block ${linkClass}`}
                >
                  {link.label}
                  {isActive && <Squiggle />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-x-3 lg:flex">
          <Link href="/login" className={loginClass}>
            Log in
          </Link>
          <Link href="/signup" className={signupClass}>
            Sign up
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="col-start-3 flex size-10 flex-col items-center justify-center justify-self-end lg:hidden"
        >
          <span className={`my-[3px] h-0.5 w-6 ${hamburgerLineColor}`} />
          <span className={`my-[3px] h-0.5 w-6 ${hamburgerLineColor}`} />
          <span className={`my-[3px] h-0.5 w-6 ${hamburgerLineColor}`} />
        </button>
      </nav>

      {isOpen && (
        <div className="mx-4 mt-2 flex flex-col gap-y-2 rounded-2xl border border-white/20 bg-black/90 px-4 py-4 backdrop-blur lg:hidden">
          <ul className="flex flex-col gap-y-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="relative inline-block py-2 text-base font-medium text-white"
                  >
                    {link.label}
                    {isActive && <Squiggle />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex flex-col gap-y-2 border-t border-white/20 pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white bg-transparent px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-black"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
