"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

// Route changes: the old page fades out quickly, the new one fades and rises
// in (see .page in globals.css). Keyed on the path only, so a filter or sort
// change on the same page does not replay it.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
