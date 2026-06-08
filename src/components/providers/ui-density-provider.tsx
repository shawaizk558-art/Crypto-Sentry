"use client";

import type { UiDensity } from "@/lib/user/settings";
import { createContext, useContext, useLayoutEffect, useState } from "react";

type UiDensityContextValue = {
  density: UiDensity;
  setDensity: (density: UiDensity) => void;
};

const UiDensityContext = createContext<UiDensityContextValue>({
  density: "compact",
  setDensity: () => {},
});

// React hook: get/set compact vs expanded layout.
export function useUiDensity() {
  return useContext(UiDensityContext);
}

// Set compact or expanded mode on the page.
function applyDensity(density: UiDensity) {
  document.documentElement.dataset.uiDensity = density;
}

// Wrap app so child components can change layout density.
export function UiDensityProvider({
  initialDensity,
  children,
}: {
  initialDensity: UiDensity;
  children: React.ReactNode;
}) {
  const [density, setDensityState] = useState<UiDensity>(initialDensity);

  useLayoutEffect(() => {
    applyDensity(initialDensity);
  }, [initialDensity]);

  useLayoutEffect(() => {
    applyDensity(density);
  }, [density]);

  // Change density in React and on the HTML element.
  function setDensity(next: UiDensity) {
    setDensityState(next);
    applyDensity(next);
  }

  return (
    <UiDensityContext.Provider value={{ density, setDensity }}>
      {children}
    </UiDensityContext.Provider>
  );
}
