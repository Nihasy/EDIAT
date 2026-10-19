"use client";

import { useState } from "react";
import { ShareIcon } from "./Icons";

// Native share sheet on phones (WhatsApp, Messenger…), otherwise copies the link.
export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Partager ce véhicule"
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
            return;
          } catch (err) {
            // Closed by the visitor: nothing to do. Refused (no permission): copy instead.
            if ((err as Error).name === "AbortError") return;
          }
        }
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="relative flex h-11 w-11 items-center justify-center"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-colors duration-200 hover:bg-white">
        <ShareIcon className="h-[18px] w-[18px]" />
      </span>
      <span role="status" className={`absolute top-full right-0 mt-1 rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-white transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}>
        {copied ? "Lien copié" : ""}
      </span>
    </button>
  );
}
