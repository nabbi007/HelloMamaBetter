"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout526() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Features</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Everything you need
            </h2>
            <p className="md:text-md">
              Built for your health and your peace of mind
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <div className="group relative flex flex-col justify-center overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8 lg:min-h-[32rem]">
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Relume placeholder image"
                />
              </div>
              <div className="relative z-10">
                <div>
                  <p className="mb-2 inline-block text-sm font-semibold text-text-alternative">
                    Shop
                  </p>
                  <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                    Discreet marketplace
                  </h3>
                  <p className="text-text-alternative">
                    Order contraceptives delivered to an anonymous pickup point
                    on campus
                  </p>
                </div>
                <div className="mt-5 flex items-center md:mt-6">
                  <Button
                    variant="link-alt"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Explore
                  </Button>
                </div>
              </div>
            </div>
            <div className="group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="/images/online-consultation.jpg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Online consultation with a healthcare professional"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col justify-between">
                <div>
                  <div className="mb-5 md:mb-6">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/relume-icon-white.svg"
                      className="size-12"
                      alt="Relume logo"
                    />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                    Talk to a doctor
                  </h3>
                  <p className="text-text-alternative">
                    Book a private text consultation with a licensed healthcare
                    professional
                  </p>
                </div>
                <div className="mt-5 flex items-center md:mt-6">
                  <Button
                    variant="link-alt"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Book
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <div className="group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Relume placeholder image"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col justify-between">
                <div>
                  <div className="mb-5 md:mb-6">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/relume-icon-white.svg"
                      className="size-12"
                      alt="Relume logo"
                    />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                    AI health assistant
                  </h3>
                  <p className="text-text-alternative">
                    Get instant answers to reproductive health questions, 24/7,
                    with no judgment
                  </p>
                </div>
                <div className="mt-5 flex items-center md:mt-6">
                  <Button
                    variant="link-alt"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Ask
                  </Button>
                </div>
              </div>
            </div>
            <div className="group relative flex flex-col justify-center overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8 lg:min-h-[32rem]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Relume placeholder image"
                />
              </div>
              <div className="relative z-10">
                <p className="mb-2 inline-block text-sm font-semibold text-text-alternative">
                  Track
                </p>
                <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Cycle tracking
                </h3>
                <p className="text-text-alternative">
                  Log your period, predict your cycle, and set reminders for
                  pills or injections
                </p>
                <div className="mt-5 flex items-center md:mt-6">
                  <Button
                    variant="link-alt"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <div className="group relative flex flex-col justify-center overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8 lg:min-h-[32rem]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Relume placeholder image"
                />
              </div>
              <div className="relative z-10">
                <p className="mb-2 inline-block text-sm font-semibold text-text-alternative">
                  Learn & debunk
                </p>
                <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Access expert articles and myth-busting content written by
                  health professionals
                </h3>
                <p className="text-text-alternative">Read</p>
                <div className="mt-5 flex items-center md:mt-6">
                  <Button
                    variant="link-alt"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Built for privacy
                  </Button>
                </div>
              </div>
            </div>
            <div className="group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/35" />
                <img
                  src="/images/secure-private.jpeg"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt="Lock illustration representing secure and private chat"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col justify-between">
                <div>
                  <div className="mb-5 md:mb-6">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/relume-icon-white.svg"
                      className="size-12"
                      alt="Relume logo"
                    />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-text-alternative md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                    Your name, your data, your business. We encrypt everything
                    and share nothing
                  </h3>
                  <p className="text-text-alternative">Trust</p>
                  <div className="mt-5 flex items-center md:mt-6">
                    <Button
                      variant="link-alt"
                      size="link"
                      iconRight={<RxChevronRight />}
                    >
                      Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
