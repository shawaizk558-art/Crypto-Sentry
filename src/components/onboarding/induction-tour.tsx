"use client";

import { INDUCTION_STEPS } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type InductionTourProps = {
  active: boolean;
  onComplete: () => void;
};

const TOOLTIP_WIDTH = 380;
const TOOLTIP_HEIGHT = 220;

const SIDEBAR_TARGETS = new Set([
  "sentry-brand",
  "nav-market",
  "nav-watchlist",
  "nav-alerts",
  "sidebar-profile",
]);

// Guided spotlight tour that walks new users through key UI areas.
export function InductionTour({ active, onComplete }: InductionTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const step = INDUCTION_STEPS[stepIndex];
  const isLast = stepIndex === INDUCTION_STEPS.length - 1;
  const isViewportCenter = step.placement === "center" && !step.target;
  const useSpotlight = Boolean(step.target && targetRect);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Measures the DOM rect of the current tour step's target element.
  const measureTarget = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [step.target]);

  useEffect(() => {
    if (!active) return;

    if (step.requiresDashboard && pathname !== "/") {
      router.push("/");
      return;
    }

    measureTarget();

    const onLayout = () => measureTarget();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);

    const timer = window.setTimeout(measureTarget, 120);

    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
      window.clearTimeout(timer);
    };
  }, [active, step, pathname, router, measureTarget]);

  // Marks onboarding complete on the server and closes the tour.
  async function finish() {
    await fetch("/api/user/onboarding", { method: "PATCH" });
    onComplete();
  }

  // Advances to the next tour step or finishes on the last step.
  function next() {
    if (isLast) {
      void finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  if (!active || !mounted) return null;

  const pad = 10;
  const spotlight = targetRect
    ? {
        top: targetRect.top - pad,
        left: targetRect.left - pad,
        width: targetRect.width + pad * 2,
        height: targetRect.height + pad * 2,
      }
    : null;

  const tooltipStyle = (() => {
    if (isViewportCenter || !spotlight) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      } as const;
    }

    const isSidebarTarget = step.target && SIDEBAR_TARGETS.has(step.target);
    let left: number;
    let top = spotlight.top + spotlight.height / 2 - TOOLTIP_HEIGHT / 2;

    if (isSidebarTarget) {
      const sidebar = document.querySelector(".density-sidebar");
      const sidebarWidth = sidebar?.getBoundingClientRect().width ?? 240;
      left = sidebarWidth + 28;
    } else {
      const gap = 24;
      left = spotlight.left + spotlight.width + gap;
      if (left + TOOLTIP_WIDTH > window.innerWidth - 16) {
        left = Math.max(16, spotlight.left - TOOLTIP_WIDTH - gap);
      }
    }

    top = Math.max(16, Math.min(top, window.innerHeight - TOOLTIP_HEIGHT - 16));

    return { left, top, transform: "none" } as const;
  })();

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal aria-label="Induction guide">
      {useSpotlight && spotlight ? (
        <div
          className="pointer-events-none fixed rounded-sm border-2 border-neon-green"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.82), 0 0 16px rgba(5, 255, 161, 0.4)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/82 backdrop-blur-sm" />
      )}

      <div
        className={cn(
          "fixed z-[201] rounded-md border border-neon-green/30 bg-bg-panel p-6 shadow-[0_0_40px_rgba(0,255,136,0.12)]",
          "w-[min(380px,calc(100vw-2rem))]",
        )}
        style={tooltipStyle}
      >
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-neon-green" strokeWidth={2} />
          <p className="font-display text-xs font-bold uppercase tracking-wider text-neon-green">
            {step.title}
          </p>
        </div>

        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-wide text-muted">
          {step.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void finish()}
            className="font-mono text-[10px] uppercase tracking-wider text-dim transition-colors hover:text-foreground"
          >
            Skip induction
          </button>

          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-sm bg-neon-green px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-bg-deep transition-opacity hover:opacity-90"
          >
            {isLast ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Finish guide
              </>
            ) : (
              <>
                Got it
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex gap-1">
          {INDUCTION_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= stepIndex ? "bg-neon-green" : "bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
