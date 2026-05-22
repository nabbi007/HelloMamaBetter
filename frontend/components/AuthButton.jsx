"use client";

const STATE_CLASS = {
  idle: "bg-black text-white hover:bg-neutral-800",
  loading: "bg-black text-white opacity-90 cursor-wait",
  success: "bg-green-600 text-white cursor-default",
};

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0 animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0 animate-in zoom-in-50 duration-300"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function AuthButton({
  state = "idle",
  idleLabel,
  loadingLabel,
  successLabel,
  type = "submit",
}) {
  const labels = {
    idle: idleLabel,
    loading: loadingLabel,
    success: successLabel,
  };

  return (
    <button
      type={type}
      disabled={state !== "idle"}
      aria-busy={state === "loading"}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ${STATE_CLASS[state]}`}
    >
      {state === "loading" && <Spinner />}
      {state === "success" && <CheckIcon />}
      <span>{labels[state]}</span>
    </button>
  );
}
