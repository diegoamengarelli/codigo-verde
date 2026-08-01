"use client";

import { cn } from "@/lib/utils";
import type { TrafficLightState } from "@/lib/simulation-store";

const CONFIG: Record<
  TrafficLightState,
  { label: string; color: string; dot: string; ring: string }
> = {
  normal: {
    label: "Normal",
    color: "text-muted-foreground",
    dot: "bg-muted-foreground",
    ring: "",
  },
  preparing: {
    label: "Preparando",
    color: "text-amber-400",
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
  },
  priority: {
    label: "Prioridad activa",
    color: "text-primary",
    dot: "bg-primary",
    ring: "ring-primary/30",
  },
  traversing: {
    label: "Atravesando",
    color: "text-primary",
    dot: "bg-primary",
    ring: "ring-primary/40",
  },
  recovering: {
    label: "Recuperando",
    color: "text-sky-400",
    dot: "bg-sky-400",
    ring: "ring-sky-400/30",
  },
};

export function TrafficLightBadge({
  state,
  size = "sm",
}: {
  state: TrafficLightState;
  size?: "sm" | "xs";
}) {
  const cfg = CONFIG[state];
  const isActive = state !== "normal";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        size === "xs" ? "text-[10px]" : "text-xs",
        cfg.color,
        isActive ? "border-current/20 bg-current/5" : "border-border bg-muted/30"
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          size === "xs" ? "w-1.5 h-1.5" : "w-2 h-2",
          cfg.dot,
          isActive && state !== "normal" ? "animate-pulse" : ""
        )}
      />
      {cfg.label}
    </span>
  );
}
