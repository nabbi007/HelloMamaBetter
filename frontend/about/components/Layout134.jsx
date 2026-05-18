"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout134() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg text-center">
        <p className="mb-3 font-semibold md:mb-4">Our story</p>
        <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
          Built by students, for students
        </h2>
        <p className="md:text-md">
          We started HelloMamaBetter because we saw the gap. Students in Ghana
          were choosing silence over health—skipping doses, avoiding doctors,
          staying confused—because asking for help meant risking judgment. We
          decided that had to change. Privacy isn't something we added later.
          It's the reason we exist.
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
          <Button title="See how it works" variant="secondary">
            See how it works
          </Button>
          <Button
            title="Explore"
            variant="link"
            size="link"
            iconRight={<RxChevronRight />}
          >
            Explore
          </Button>
        </div>
      </div>
    </section>
  );
}
