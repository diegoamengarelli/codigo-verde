"use client";

import { useSimulation } from "@/lib/simulation-store";
import { TrafficLightBadge } from "@/components/traffic-light-badge";
import { Play, RotateCcw, AlertTriangle, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

const PHASE_CONFIG = {
  idle:      { label: "Sin misión",        dot: "bg-muted-foreground/30",  text: "text-muted-foreground",  border: "border-border"           },
  running:   { label: "En ruta",           dot: "bg-primary animate-pulse", text: "text-primary",           border: "border-primary/30"       },
  blocked:   { label: "Bloqueado",         dot: "bg-rose-500 animate-pulse",text: "text-rose-400",          border: "border-rose-500/30"      },
  rerouted:  { label: "Ruta alternativa",  dot: "bg-amber-400 animate-pulse",text: "text-amber-400",        border: "border-amber-400/30"     },
  completed: { label: "Completada",        dot: "bg-primary",              text: "text-primary",           border: "border-primary/30"       },
};

export function MissionPanel() {
  const phase          = useSimulation((s) => s.phase);
  const startMission   = useSimulation((s) => s.startMission);
  const simulateBlock  = useSimulation((s) => s.simulateBlock);
  const resetSimulation= useSimulation((s) => s.resetSimulation);
  const intersections  = useSimulation((s) => s.intersections);
  const elapsedSeconds = useSimulation((s) => s.elapsedSeconds);
  const blockSimulated = useSimulation((s) => s.blockSimulated);

  const isRunning = phase === "running" || phase === "rerouted";
  const cfg = PHASE_CONFIG[phase];
  const currentETA = Math.max(0, 502 - elapsedSeconds);

  return (
    <div className="flex flex-col gap-3">

      {/* Mission status card */}
      <div className={cn("bg-card border rounded-lg overflow-hidden", cfg.border)}>
        {/* Header strip */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
            <span className={cn("text-xs font-semibold tracking-wide", cfg.text)}>
              {cfg.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
            A-12
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {phase === "idle" ? (
            <div className="text-center py-4">
              <Navigation className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/50">
                Inicie la simulación para ver la coordinación en tiempo real.
              </p>
            </div>
          ) : (
            <>
              {/* ETA comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-rose-500/8 border border-rose-500/15 px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-rose-400/60 mb-1">Sin coord.</p>
                  <p className="text-[17px] font-bold font-mono text-rose-400 leading-none">10m 40s</p>
                </div>
                <div className="rounded-md bg-primary/8 border border-primary/20 px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-primary/60 mb-1">ETA actual</p>
                  <p className={cn(
                    "text-[17px] font-bold font-mono leading-none",
                    isRunning ? "text-primary" : "text-primary/60"
                  )}>
                    {formatSeconds(currentETA)}
                  </p>
                </div>
              </div>

              {/* Route */}
              <div className="rounded-md bg-white/[0.03] border border-border px-3 py-2.5 space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Origen</p>
                    <p className="text-[11px] text-foreground/80 font-medium">HECA</p>
                  </div>
                </div>
                <div className="ml-1.5 w-px h-3 bg-border" />
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Destino</p>
                    <p className="text-[11px] text-foreground/80 font-medium">H. del Centenario</p>
                  </div>
                </div>
                {phase === "rerouted" && (
                  <p className="text-[9px] text-amber-400/80 pt-0.5 border-t border-border mt-1">
                    Ruta alternativa via Balcarce activa
                  </p>
                )}
              </div>

              {/* Time comparison bar */}
              {(isRunning || phase === "completed") && (
                <div className="space-y-2 pt-0.5">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40">Comparación</p>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground/60">Sin coordinación</span>
                        <span className="text-rose-400 font-mono">10m 40s</span>
                      </div>
                      <div className="h-1 bg-white/[0.04] rounded-full">
                        <div className="h-1 bg-rose-400/50 rounded-full w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground/60">Con Código Verde</span>
                        <span className="text-primary font-mono">8m 22s</span>
                      </div>
                      <div className="h-1 bg-white/[0.04] rounded-full">
                        <div className="h-1 bg-primary/70 rounded-full" style={{ width: "78.5%" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-primary font-mono">
                    −2m 18s · <span className="text-muted-foreground/60">Demora general +34s</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Intersections */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Intersecciones
          </p>
        </div>
        <div className="px-3 py-2 flex flex-col">
          {intersections.map((int, i) => (
            <div
              key={int.id}
              className={cn(
                "flex items-center justify-between gap-2 py-2",
                i < intersections.length - 1 && "border-b border-border/40"
              )}
            >
              <p className="text-[11px] text-foreground/70 font-medium truncate">{int.name}</p>
              <TrafficLightBadge state={int.state} size="xs" />
            </div>
          ))}
        </div>
      </div>

      {/* Simulation controls */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Simulación
          </p>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {phase === "idle" && (
            <button
              onClick={startMission}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold text-sm py-2.5 rounded-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar misión
            </button>
          )}

          {isRunning && (
            <button
              onClick={simulateBlock}
              disabled={blockSimulated}
              className={cn(
                "w-full flex items-center justify-center gap-2 text-sm py-2 rounded-md border font-medium transition-all active:scale-[0.98]",
                blockSimulated
                  ? "border-border text-muted-foreground/40 cursor-not-allowed"
                  : "border-amber-500/30 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/50"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {blockSimulated ? "Bloqueo simulado" : "Simular bloqueo"}
            </button>
          )}

          {(isRunning || phase === "blocked" || phase === "completed") && (
            <button
              onClick={resetSimulation}
              className="w-full flex items-center justify-center gap-2 text-[12px] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1.5 rounded-md hover:bg-white/[0.03]"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar simulación
            </button>
          )}

          {phase === "completed" && (
            <div className="bg-primary/8 border border-primary/20 rounded-md p-2.5 text-center">
              <p className="text-xs text-primary font-semibold">Misión completada</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
