"use client";

// Three-state visual on the signup right panel:
//   idle    → plain off-white panel (no bean, just clean background)
//   peeping → Bean peering at your password (bean-peeping.png) — when a password field is focused
//   success → kidding / peace sign (kidding.png) + "I'm Kidding, you are safe"
//
// Peeping + kidding are always mounted (layered absolutely) and crossfade with
// CSS transitions. `success` wins over `peeping` if both are true.
export default function SignupShowcase({ success = false, peeping = false }) {
  const showKidding = success;
  const showPeeping = !success && peeping;

  // object-bottom anchors the cover crop to the bottom of each source PNG so the
  // bean's face stays visible regardless of how tall the panel renders.
  const baseImg =
    "absolute inset-0 h-full w-full object-cover object-bottom transition-all duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)]";

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-stone-100 lg:block">
      {/* Peeping bean — appears while a password field is focused */}
      <img
        src="/images/bean-peeping.png"
        alt=""
        className={`${baseImg} ${
          showPeeping ? "scale-100 opacity-100" : "scale-105 opacity-0"
        }`}
      />

      {/* Kidding bean — locks in after a successful register, slides in from the right */}
      <img
        src="/images/kidding.png"
        alt=""
        className={`${baseImg} ${
          showKidding
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      />

      {/* Vignette so the success headline reads on the kidding image */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-700 ${
          showKidding ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Caption while peeping — small, top-left, plays into the gag */}
      <div
        className={`absolute left-8 top-8 z-10 transition-all duration-500 ${
          showPeeping
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          {" "}He&apos;s watching…
        </span>
      </div>

      {/* "I'm Kidding, you are safe" — fades + rises after the swap */}
      <div
        className={`absolute inset-x-0 bottom-16 z-10 px-12 text-center transition-all duration-700 ease-out ${
          showKidding
            ? "translate-y-0 opacity-100 delay-500"
            : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
          Welcome aboard
        </p>
        <h2 className="mt-3 text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
          I&apos;m Kidding,
          <br />
          you are safe.
        </h2>
      </div>
    </div>
  );
}
