"use client";

import { useEffect, useState } from "react";

// Sticky header in charcoal glass. Over a full-bleed photo banner (any element
// with data-hero-overlay) it is see-through until the page scrolls: that part
// is CSS (.site-header in globals.css), so the first paint is already right.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header data-scrolled={scrolled} className="site-header sticky top-0 z-30" style={{ viewTransitionName: "site-header" }}>
      {children}
    </header>
  );
}
