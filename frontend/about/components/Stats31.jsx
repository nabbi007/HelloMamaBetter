"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Stats31() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-[0.5fr_1fr] lg:items-center lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Impact</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              What we've built so far
            </h2>
            <p className="md:text-md">
              Numbers that matter. Real students, real change, real privacy.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button title="Download" variant="secondary">
                Download
              </Button>
              <Button
                title="Share"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
              >
                Share
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 py-2 md:grid-cols-2">
            <div className="border border-border-primary p-8">
              <p className="mb-8 text-10xl font-bold leading-[1.3] md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                12,000+
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Students using HelloMamaBetter
              </h3>
              <p className="mt-2">
                Across universities in Ghana and growing every week
              </p>
            </div>
            <div className="border border-border-primary p-8">
              <p className="mb-8 text-10xl font-bold leading-[1.3] md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                98%
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Say they feel more confident
              </h3>
              <p className="mt-2">
                About their reproductive health choices after using the platform
              </p>
            </div>
            <div className="border border-border-primary p-8">
              <p className="mb-8 text-10xl font-bold leading-[1.3] md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                8
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Licensed doctors on staff
              </h3>
              <p className="mt-2">
                All registered with Ghana Health Service and available daily
              </p>
            </div>
            <div className="border border-border-primary p-8">
              <p className="mb-8 text-10xl font-bold leading-[1.3] md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                100%
              </p>
              <h3 className="text-md font-bold leading-[1.4] md:text-xl">
                Packages delivered discreetly
              </h3>
              <p className="mt-2">No names, no questions, no judgment ever</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
