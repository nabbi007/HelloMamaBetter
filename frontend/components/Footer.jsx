"use client";

import { Button, Input } from "@relume_io/relume-ui";
import Link from "next/link";
import { useState } from "react";

const SECTIONS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Products", href: "/products" },
      { label: "Counselling", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Our story", href: "#" },
      { label: "Team", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "Data security", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Email support", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Report issue", href: "#" },
      { label: "Feedback", href: "#" },
      { label: "Resources", href: "#" },
    ],
  },
  {
    heading: "Health articles",
    links: [
      { label: "Myth busting", href: "#" },
      { label: "Student guide", href: "#" },
      { label: "Cycle tracking", href: "#" },
      { label: "Community", href: "#" },
      { label: "Join our community", href: "#" },
    ],
  },
  {
    heading: "Share your story",
    links: [
      { label: "Student testimonials", href: "#" },
      { label: "Events", href: "#" },
      { label: "Partnerships", href: "#" },
      { label: "Become a partner", href: "#" },
      { label: "Made with care in Ghana", href: "#" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ email });
  };

  return (
    <footer id="relume" className="bg-black px-[5%] py-12 text-white md:py-18 lg:py-20">
      <div className="container">
        <div className="lg:flex lg:items-start lg:justify-between">
          <div className="rb-6 mb-6 lg:mb-0">
            <h1 className="font-semibold md:text-md">Stay in the loop</h1>
            <p className="text-gray-300">Get updates on new features and health tips</p>
          </div>
          <div className="max-w-md lg:min-w-[25rem]">
            <form
              className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[1fr_max-content] sm:gap-y-4 md:gap-4"
              onSubmit={handleSubmit}
            >
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black placeholder:text-gray-500"
              />
              <Button
                title="Subscribe"
                size="sm"
                className="border-white bg-white text-black hover:bg-gray-100"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-gray-400">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="py-12 md:py-18 lg:py-20">
          <div className="h-px w-full bg-white/20" />
        </div>

        <div className="rb-12 mb-12 grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-3 md:mb-18 md:gap-y-12 lg:mb-20 lg:grid-cols-6">
          {SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col items-start justify-start">
              <h2 className="mb-2 font-semibold">{section.heading}</h2>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label} className="py-2 text-sm">
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-white/20" />

        <div className="flex flex-col items-start pb-4 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between md:pb-0 md:pt-8">
          <Link href="/" className="mb-6 sm:mb-0">
            <img
              src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
              alt="HelloMamaBetter"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} HelloMamaBetter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
