"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "./ui/Spinner";

// Put inside a <Link>: covers the clicked card with a spinner while the next
// page loads, so a tap always gets an immediate answer.
export function LinkPendingOverlay() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-white/55 backdrop-blur-[1px] transition-opacity duration-200 ${pending ? "opacity-100" : "opacity-0"}`}
    >
      {pending && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg">
          <Spinner className="h-5 w-5" />
        </span>
      )}
    </span>
  );
}
