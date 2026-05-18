"use client";

import React from "react";

export function Stats34() {
  return (
    <section id="relume" className="bg-[#D8D9D8] px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Trusted</p>
          <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Backed by real people
          </h1>
          <p className="md:text-md">
            Students across Ghana's universities rely on us every day
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:gap-x-6 sm:gap-y-6 lg:grid-cols-[0.5fr_1fr] lg:gap-x-8 lg:gap-y-8">
          <div className="flex flex-col justify-center gap-x-6 gap-y-6 md:flex-row md:gap-y-8 lg:flex-col lg:gap-x-8">
            <div className="flex w-full flex-col border border-border-primary p-8">
              <p className="mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
                5000+
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Active students
              </h3>
              <p className="mt-2">
                Using HelloMamaBetter to manage their health privately
              </p>
            </div>
            <div className="flex w-full flex-col border border-border-primary p-8">
              <p className="mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
                50+
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Licensed professionals
              </h3>
              <p className="mt-2">
                Doctors and nurses available for confidential consultations
              </p>
            </div>
            <div className="flex w-full flex-col border border-border-primary p-8">
              <p className="mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
                100%
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Ghana Health Service aligned
              </h3>
              <p className="mt-2">
                Operating within national health standards and regulations
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <img
              src="https://relume-assets.s3.us-east-1.amazonaws.com/placeholder-image.svg"
              alt="Relume placeholder image"
              className="aspect-[3/2] size-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
