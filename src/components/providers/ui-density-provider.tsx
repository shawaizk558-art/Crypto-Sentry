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

export function useUiDensity() {
  return useContext(UiDensityContext);
}

function applyDensity(density: UiDensity) {
  document.documentElement.dataset.uiDensity = density;
}

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
