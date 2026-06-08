"use client";

import { InductionTour } from "@/components/onboarding/induction-tour";
import { useState } from "react";

type OnboardingHostProps = {
  showInduction: boolean;
};

// Mounts the induction tour when the user has not completed onboarding.
export function OnboardingHost({ showInduction }: OnboardingHostProps) {
  const [active, setActive] = useState(showInduction);

  if (!active) return null;

  return <InductionTour active={active} onComplete={() => setActive(false)} />;
}
