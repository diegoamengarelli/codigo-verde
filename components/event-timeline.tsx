"use client";

import { useSimulation } from "@/lib/simulation-store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";

const TYPE_CONFIG = {
  info:    { dot: "bg-sky-400",    line: "border-sky-400/30",    label: "INFO",    labelColor: "text-sky-400/70"   },
  success: { dot: "bg-primary",    line: "border-primary/30",    label: "OK",      labelColor: "text-primary/70"   },
  warning: { dot: "bg-amber-400",  line: "border-amber-400/30",  label: "AVISO",   labelColor: "text-amber-400/70" },
  error:   { dot: "bg-rose-500",   line: "border-rose-500/30",   label: "ALERTA",  labelColor: "text-rose-400/70"  },
};

export function EventTimeline() {
  const timeline = useSimulation((s) => s.timeline);
  const phase    = useSimulation((s) => s.phase);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [timeline.length]);

  const isLive = phase === "running" || phase === "rerouted";

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border shrink-0 flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Registro de eventos
        </p>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[9px] font-mono text-primary tracking-widest">EN VIVO</span>
          </div>
        )}
      </div>

      {/* Events */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto min-h-0"
      >
        {timeline.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground/40 text-center px-6">
              Los eventos aparecerán aquí al iniciar la misión.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {[...timeline].reverse().map((event, i) => {
              const cfg = TYPE_CONFIG[event.type];
              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex gap-3 px-4 py-2.5 border-b border-border/30 transition-colors",
                    i === 0 && "bg-white/[0.025]"
                  )}
                >
                  {/* Dot + left line */}
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-[9px] font-bold font-mono tracking-widest", cfg.labelColor)}>
                        {cfg.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground/40 font-mono">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-foreground/75 leading-snug">
                      {event.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
