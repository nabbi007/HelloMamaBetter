import Link from "next/link";
import React from "react";

export function Header36() {
  return (
    <section
      id="relume"
      className="relative -mt-16 min-h-[calc(100vh+4rem)] w-full overflow-hidden md:-mt-18 md:min-h-[calc(100vh+4.5rem)]"
    >
      <img
        src="/images/hero.jpg"
        alt="Three young women standing together outdoors"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 from-0% to-transparent to-50%" />

      <div className="relative z-10 mx-[5%] flex min-h-[calc(100vh+4rem)] max-w-xl flex-col justify-center pt-24 md:min-h-[calc(100vh+4.5rem)] md:pt-32">
        <h1 className="mb-5 text-6xl font-bold text-white md:mb-6 md:text-9xl lg:text-10xl">
          Your reproductive health, completely private
        </h1>
        <p className="text-white md:text-md">
          Order contraceptives, chat with a doctor, and track your cycle — all
          in one confidential space built for students. 100% confidential ·
          Discreet packaging · No judgment
        </p>
        <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
          <Link
            href="/signup"
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Get started
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-neutral-100"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
