"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isInternalAppLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("http")) return false;
  if (anchor.target === "_blank") return false;
  if (href === pathname) return false;
  return href.startsWith("/");
}

// Thin progress bar while the next app route is loading.
export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setPending(false);
    }
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalAppLink(anchor, pathname)) return;
      setPending(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-50 h-px overflow-hidden transition-opacity duration-150",
        pending ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <div className="nav-progress-bar h-full bg-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.8)]" />
    </div>
  );
}
