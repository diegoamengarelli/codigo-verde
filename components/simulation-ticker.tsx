"use client";

import { useEffect } from "react";
import { useSimulation } from "@/lib/simulation-store";

export function SimulationTicker() {
  const tick = useSimulation((s) => s.tick);
  const phase = useSimulation((s) => s.phase);

  useEffect(() => {
    if (phase !== "running" && phase !== "rerouted") return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, tick]);

  return null;
}
