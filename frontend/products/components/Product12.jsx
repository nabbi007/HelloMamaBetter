"use client";

import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@relume_io/relume-ui";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

const useCarousel = () => {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const handleDotClick = (index) => () => {
    if (api) {
      api.scrollTo(index);
    }
  };
  const dotClassName = (index) => {
    return clsx("mx-[3px] size-2 rounded-full", {
      "bg-black": current === index + 1,
      "bg-neutral-light": current !== index + 1,
    });
  };
  return { api, setApi, handleDotClick, dotClassName };
};

export function Product12() {
  const carouselState = useCarousel();
  return (
    <section
      id="relume"
      className="overflow-hidden px-[5%] py-16 md:py-24 lg:py-28"
    >
      <div className="container">
        <div className="mb-12 grid grid-cols-1 items-end gap-12 md:mb-18 md:grid-cols-[1fr_max-content] lg:mb-20 lg:gap-20">
          <div className="max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">Shop</p>
            <h1 className="mb-3 text-5xl font-bold md:mb-4 md:text-7xl lg:text-8xl">
              Products
            </h1>
            <p className="md:text-md">
              All items ship discreetly to campus pickup points.
            </p>
          </div>
          <div className="hidden md:flex">
            <Button variant="secondary" size="primary" title="View all">
              View all
            </Button>
          </div>
        </div>
        <Carousel
          setApi={carouselState.setApi}
          opts={{ loop: true, align: "start" }}
        >
          <div className="relative pb-24">
            <CarouselContent className="ml-0">
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
              <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-[33%] lg:pr-12">
                <div className="mb-3 block aspect-[5/6] md:mb-4">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                    alt="Relume placeholder image"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex justify-between md:text-md">
                  <div className="mr-4">
                    <h3 className="font-semibold">Birth control pills</h3>
                    <div className="text-sm">Monthly pack</div>
                  </div>
                  <div className="text-md font-semibold md:text-lg">₵45</div>
                </div>
                <Button
                  className="mt-3 w-full md:mt-4"
                  variant="secondary"
                  size="sm"
                  title="Add to cart"
                >
                  Add to cart
                </Button>
              </CarouselItem>
            </CarouselContent>
            <div className="absolute bottom-0 flex w-full items-end justify-between">
              <div className="flex h-7 pt-[10px]">
                <button
                  onClick={carouselState.handleDotClick(0)}
                  className={carouselState.dotClassName(0)}
                />
                <button
                  onClick={carouselState.handleDotClick(1)}
                  className={carouselState.dotClassName(1)}
                />
                <button
                  onClick={carouselState.handleDotClick(2)}
                  className={carouselState.dotClassName(2)}
                />
                <button
                  onClick={carouselState.handleDotClick(3)}
                  className={carouselState.dotClassName(3)}
                />
                <button
                  onClick={carouselState.handleDotClick(4)}
                  className={carouselState.dotClassName(4)}
                />
                <button
                  onClick={carouselState.handleDotClick(5)}
                  className={carouselState.dotClassName(5)}
                />
              </div>
              <div className="flex gap-2 md:gap-4">
                <CarouselPrevious className="static size-12 -translate-y-0" />
                <CarouselNext className="static size-12 -translate-y-0" />
              </div>
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
