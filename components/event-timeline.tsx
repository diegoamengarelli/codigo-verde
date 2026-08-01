"use client";

import { useSimulation } from "@/lib/simulation-store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

const TYPE_STYLES = {
  info: "border-sky-400/40 text-sky-400",
  success: "border-primary/40 text-primary",
  warning: "border-amber-400/40 text-amber-400",
  error: "border-rose-500/40 text-rose-400",
};

const DOT_STYLES = {
  info: "bg-sky-400",
  success: "bg-primary",
  warning: "bg-amber-400",
  error: "bg-rose-500",
};

export function EventTimeline() {
  const timeline = useSimulation((s) => s.timeline);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [timeline.length]);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Cronologia de eventos
        </h3>
      </div>

      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0 min-h-0"
      >
        {timeline.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Los eventos aparecerán aqui al iniciar la misión.
            </p>
          </div>
        ) : (
          [...timeline].reverse().map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex gap-2.5 py-2 border-l-2 pl-2.5 border-b border-border/30",
                TYPE_STYLES[event.type]
              )}
            >
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    DOT_STYLES[event.type]
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-mono mb-0.5">
                  {event.time}
                </p>
                <p className="text-xs text-foreground leading-snug">
                  {event.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
