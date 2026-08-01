"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { useSimulation } from "@/lib/simulation-store";
import { Button } from "@/components/ui/button";
import {
  Play,
  Navigation,
  RotateCcw,
  AlertTriangle,
  MapPin,
  ChevronRight,
  TrafficCone,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatETA(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AmbulanciaPage() {
  const phase = useSimulation((s) => s.phase);
  const startMission = useSimulation((s) => s.startMission);
  const simulateBlock = useSimulation((s) => s.simulateBlock);
  const resetSimulation = useSimulation((s) => s.resetSimulation);
  const intersections = useSimulation((s) => s.intersections);
  const segments = useSimulation((s) => s.segments);
  const elapsedSeconds = useSimulation((s) => s.elapsedSeconds);
  const blockSimulated = useSimulation((s) => s.blockSimulated);

  const isRunning = phase === "running" || phase === "rerouted";
  const totalETA = phase === "rerouted" ? 520 : 502;
  const currentETA = Math.max(0, totalETA - elapsedSeconds);
  const progress = Math.min(100, (elapsedSeconds / totalETA) * 100);

  // Find active segment
  const activeSeg = segments.find((s) => s.active);
  // Find next intersection that hasn't been traversed
  const nextIntersection = intersections.find(
    (i) => i.state === "preparing" || i.state === "priority" || i.state === "normal"
  );

  const priorityState = intersections.find(
    (i) => i.state === "traversing" || i.state === "priority"
  );

  const TURN_LABELS: Record<string, string> = {
    s0: "Continuar por Bv. Oroño",
    s1: "Girar derecha en Córdoba",
    s2: "Girar derecha en Rioja",
    s2alt: "Continuar por Balcarce",
    s3: "Continuar hacia San Luis",
    s4: "Destino a la derecha",
  };

  const nextTurn = activeSeg ? TURN_LABELS[activeSeg.id] ?? "Continuar" : "Iniciar navegación";

  const INTERSECTION_LABELS: Record<string, string> = {
    int1: "Bv. Oroño / Córdoba",
    int2: "Córdoba / Rioja",
    int3: "Rioja / San Luis",
    int4: "San Luis / Pellegrini",
  };

  const nextCrossing = nextIntersection
    ? INTERSECTION_LABELS[nextIntersection.id]
    : "Destino";

  const PRIORITY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    idle: { label: "Sin misión activa", color: "text-muted-foreground", bg: "bg-muted/20" },
    running: { label: "Prioridad de paso activa", color: "text-primary", bg: "bg-primary/15" },
    rerouted: { label: "Ruta alternativa — prioridad activa", color: "text-sky-400", bg: "bg-sky-400/10" },
    blocked: { label: "Bloqueo detectado — recalculando", color: "text-amber-400", bg: "bg-amber-400/10" },
    completed: { label: "Misión completada", color: "text-primary", bg: "bg-primary/15" },
  };

  const statusConfig = PRIORITY_STATUS[phase] ?? PRIORITY_STATUS.idle;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex flex-col items-center justify-start bg-background overflow-auto py-6 px-4">
        {/* Mobile frame */}
        <div className="w-full max-w-sm flex flex-col gap-0 bg-[oklch(0.1_0.01_240)] rounded-2xl overflow-hidden border border-border shadow-2xl">
          {/* Status bar */}
          <div className="bg-[oklch(0.08_0.01_240)] px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">14:03</span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-medium">CÓDIGO VERDE</span>
            </div>
            <span className="text-[10px] text-muted-foreground">A-12</span>
          </div>

          {/* Priority status bar */}
          <div
            className={cn(
              "px-4 py-2.5 flex items-center justify-center gap-2 transition-colors",
              statusConfig.bg
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-current animate-pulse" : "bg-current",
                statusConfig.color
              )}
            />
            <span className={cn("text-xs font-semibold", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Destination */}
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Destino
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Hospital Provincial del Centenario
                </p>
                <p className="text-xs text-muted-foreground">
                  Av. Pellegrini 3051, Rosario
                </p>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  Llegada estimada
                </p>
                <p className="text-4xl font-bold font-mono text-primary">
                  {isRunning || phase === "completed"
                    ? formatETA(currentETA)
                    : "8:22"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">minutos</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  Sin coordinacion
                </p>
                <p className="text-2xl font-mono text-rose-400/70 line-through">
                  10:40
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted/30 rounded-full h-2 mb-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${isRunning ? progress : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>HECA</span>
              <span>{Math.round(progress)}% completado</span>
              <span>Hosp. Central</span>
            </div>
          </div>

          {/* Next turn */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Proximo giro
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-400/15 flex items-center justify-center shrink-0">
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-foreground">{nextTurn}</p>
            </div>
          </div>

          {/* Next coordinated intersection */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Proximo cruce coordinado
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded flex items-center justify-center shrink-0",
                  nextIntersection?.state === "preparing"
                    ? "bg-amber-400/15"
                    : nextIntersection?.state === "priority" ||
                      nextIntersection?.state === "traversing"
                    ? "bg-primary/15"
                    : "bg-muted/20"
                )}
              >
                <TrafficCone
                  className={cn(
                    "w-4 h-4",
                    nextIntersection?.state === "preparing"
                      ? "text-amber-400"
                      : nextIntersection?.state === "priority" ||
                        nextIntersection?.state === "traversing"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{nextCrossing}</p>
                <p className="text-[10px] text-muted-foreground">
                  {nextIntersection?.state === "preparing"
                    ? "Preparando prioridad de paso"
                    : nextIntersection?.state === "priority" ||
                      nextIntersection?.state === "traversing"
                    ? "Semaforo en verde extendido"
                    : "Pendiente coordinacion"}
                </p>
              </div>
            </div>
          </div>

          {/* Route segments */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
              Ruta activa
            </p>
            <div className="flex flex-col gap-1">
              {segments
                .filter((s) => !s.alternative || s.active)
                .map((seg, idx) => (
                  <div
                    key={seg.id}
                    className={cn(
                      "flex items-center gap-2 text-xs py-0.5",
                      seg.blocked
                        ? "text-rose-400"
                        : seg.active
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        seg.blocked
                          ? "bg-rose-400"
                          : seg.active
                          ? "bg-primary animate-pulse"
                          : "bg-muted-foreground/40"
                      )}
                    />
                    {seg.label}
                    {seg.blocked && (
                      <span className="ml-auto text-[10px] bg-rose-500/15 text-rose-400 px-1 rounded">
                        BLOQ
                      </span>
                    )}
                    {seg.alternative && !seg.blocked && (
                      <span className="ml-auto text-[10px] bg-sky-400/15 text-sky-400 px-1 rounded">
                        ALT
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 py-4 flex flex-col gap-2">
            {phase === "idle" && (
              <Button
                onClick={startMission}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
              >
                <Play className="w-4 h-4" />
                Iniciar navegación
              </Button>
            )}

            {isRunning && (
              <>
                <Button
                  onClick={simulateBlock}
                  disabled={blockSimulated}
                  variant="outline"
                  className="w-full gap-2 h-11 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {blockSimulated ? "Bloqueo reportado" : "Reportar bloqueo"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-11 border-sky-400/40 text-sky-400 hover:bg-sky-400/10"
                  onClick={() => {
                    const origin = encodeURIComponent("HECA Hospital de Emergencias Clemente Alvarez, Rosario, Santa Fe");
                    const destination = encodeURIComponent("Hospital Provincial del Centenario, Av. Pellegrini 3051, Rosario, Santa Fe");
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                    if (window.self !== window.top) {
                      window.open(url, "_blank");
                    } else {
                      window.location.href = url;
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir en Google Maps
                </Button>
              </>
            )}

            {(isRunning || phase === "completed" || phase === "blocked") && (
              <Button
                onClick={resetSimulation}
                variant="ghost"
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </Button>
            )}

            {phase === "completed" && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-semibold">
                  Llegada exitosa
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hospital Central — 2m 18s antes de lo normal
                </p>
              </div>
            )}
          </div>

          {/* Demo footer */}
          <div className="px-4 pb-4">
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-2 text-center">
              <p className="text-[9px] text-amber-400/70">
                DEMOSTRACIÓN SIMULADA — No conectado a vehículo real
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
