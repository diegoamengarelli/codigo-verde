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
  CheckCircle2,
  Radio,
  Clock,
  ArrowRight,
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

  const activeSeg = segments.find((s) => s.active);
  const nextIntersection = intersections.find(
    (i) => i.state === "preparing" || i.state === "priority" || i.state === "normal"
  );

  const TURN_LABELS: Record<string, string> = {
    s0: "Continuar por Bv. Oroño",
    s1: "Girar derecha en Córdoba",
    s2: "Girar derecha en Rioja",
    s2alt: "Continuar por Balcarce",
    s3: "Continuar hacia San Luis",
    s4: "Destino a la derecha",
  };

  const nextTurn = activeSeg
    ? TURN_LABELS[activeSeg.id] ?? "Continuar"
    : "Iniciar navegación";

  const INTERSECTION_LABELS: Record<string, string> = {
    int1: "Bv. Oroño / Córdoba",
    int2: "Córdoba / Rioja",
    int3: "Rioja / San Luis",
    int4: "San Luis / Pellegrini",
  };

  const nextCrossing = nextIntersection
    ? INTERSECTION_LABELS[nextIntersection.id]
    : "Destino alcanzado";

  const statusMap: Record<string, { label: string; color: string; dot: string }> = {
    idle:      { label: "Sin misión activa",                      color: "text-muted-foreground", dot: "bg-muted-foreground"        },
    running:   { label: "Prioridad de paso activa",               color: "text-primary",           dot: "bg-primary animate-pulse"  },
    rerouted:  { label: "Ruta alternativa — prioridad activa",    color: "text-sky-400",           dot: "bg-sky-400 animate-pulse"  },
    blocked:   { label: "Bloqueo detectado — recalculando",       color: "text-amber-400",         dot: "bg-amber-400 animate-pulse"},
    completed: { label: "Misión completada exitosamente",         color: "text-primary",           dot: "bg-primary"                },
  };
  const status = statusMap[phase] ?? statusMap.idle;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex overflow-hidden">
        {/* Left: phone mockup */}
        <div className="flex items-center justify-center w-80 shrink-0 border-r border-border bg-[oklch(0.07_0.008_240)] p-6">
          <div className="w-full flex flex-col bg-[oklch(0.1_0.01_240)] rounded-2xl overflow-hidden border border-border shadow-2xl">
            {/* Status bar */}
            <div className="bg-[oklch(0.08_0.01_240)] px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono">14:03</span>
              <div className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                <span className="text-[10px] text-primary font-semibold tracking-widest">CÓDIGO VERDE</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">A-12</span>
            </div>

            {/* Status banner */}
            <div className={cn(
              "px-3 py-2 flex items-center justify-center gap-2",
              isRunning ? "bg-primary/10" : phase === "completed" ? "bg-primary/10" : "bg-muted/10"
            )}>
              <span className={cn("text-[11px] font-semibold", status.color)}>{status.label}</span>
            </div>

            {/* Destination */}
            <div className="px-3 pt-3 pb-2.5 border-b border-border/60 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Destino</p>
                <p className="text-[12px] font-semibold text-foreground leading-tight">HECA — Hosp. de Emergencias</p>
                <p className="text-[10px] text-muted-foreground">Av. Pellegrini 3205, Rosario</p>
              </div>
            </div>

            {/* ETA */}
            <div className="px-3 py-3 border-b border-border/60">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Llegada estimada</p>
                  <p className="text-3xl font-bold font-mono text-primary leading-none">
                    {isRunning || phase === "completed" ? formatETA(currentETA) : "8:22"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">minutos</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Sin coord.</p>
                  <p className="text-lg font-mono text-rose-400/60 line-through">10:40</p>
                </div>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-1.5 mb-1">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${isRunning ? progress : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                <span>Centenario</span>
                <span>{Math.round(progress)}%</span>
                <span>HECA</span>
              </div>
            </div>

            {/* Next turn */}
            <div className="px-3 py-2.5 border-b border-border/60 flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-400/15 flex items-center justify-center shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Próximo giro</p>
                <p className="text-[11px] font-medium text-foreground">{nextTurn}</p>
              </div>
            </div>

            {/* Next crossing */}
            <div className="px-3 py-2.5 border-b border-border/60 flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded flex items-center justify-center shrink-0",
                nextIntersection?.state === "preparing" ? "bg-amber-400/15" :
                nextIntersection?.state === "traversing" ? "bg-primary/15" : "bg-muted/20"
              )}>
                <TrafficCone className={cn(
                  "w-3.5 h-3.5",
                  nextIntersection?.state === "preparing" ? "text-amber-400" :
                  nextIntersection?.state === "traversing" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Próximo cruce</p>
                <p className="text-[11px] font-medium text-foreground">{nextCrossing}</p>
                <p className="text-[9px] text-muted-foreground/60">
                  {nextIntersection?.state === "preparing" ? "Preparando prioridad" :
                   nextIntersection?.state === "traversing" ? "Verde extendido activo" : "Pendiente coordinación"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-3 py-3 flex flex-col gap-2">
              {phase === "idle" && (
                <Button
                  onClick={startMission}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9 text-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Iniciar navegación
                </Button>
              )}
              {isRunning && (
                <>
                  <Button
                    onClick={simulateBlock}
                    disabled={blockSimulated}
                    variant="outline"
                    className="w-full gap-2 h-9 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {blockSimulated ? "Bloqueo reportado" : "Reportar bloqueo"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 h-9 text-xs border-sky-400/40 text-sky-400 hover:bg-sky-400/10"
                    onClick={() => {
                      const url = "https://www.google.com/maps/dir/Hospital+Provincial+del+Centenario,+Urquiza+3101,+Rosario/HECA+Hospital+de+Emergencias+Clemente+Alvarez,+Pellegrini+3205,+Rosario/@-32.9452,-60.6674,15z";
                      window.open(url, "_blank");
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Google Maps
                  </Button>
                </>
              )}
              {(isRunning || phase === "completed" || phase === "blocked") && (
                <Button
                  onClick={resetSimulation}
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground text-xs"
                  size="sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar
                </Button>
              )}
              {phase === "completed" && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-primary font-semibold">Llegada exitosa</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">2m 18s antes de lo estimado sin coordinación</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 pb-3">
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-1.5 text-center">
                <p className="text-[9px] text-amber-400/60 font-mono uppercase tracking-widest">
                  Demostración simulada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: operational data panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-sm font-semibold text-foreground">App de Ambulancia</h1>
              <p className="text-xs text-muted-foreground">Unidad A-12 — Código Verde activo</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", status.dot)} />
              <span className={cn("text-xs font-mono font-semibold", status.color)}>
                {phase === "idle" ? "ESPERA" : phase === "completed" ? "COMPLETADO" : "EN RUTA"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 grid grid-cols-2 gap-4 content-start">
            {/* Mission summary */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Resumen de misión</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ETA optimizado", value: isRunning || phase === "completed" ? formatETA(currentETA) : "8:22", color: "text-primary" },
                  { label: "Sin coordinación", value: "10:40", color: "text-rose-400/70" },
                  { label: "Tiempo ganado", value: "2:18", color: "text-primary" },
                  { label: "Progreso", value: `${Math.round(progress)}%`, color: "text-foreground" },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/10 rounded-lg p-2.5">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className={cn("text-xl font-bold font-mono", m.color)}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Intersection status */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Estado de intersecciones</p>
              <div className="space-y-2">
                {intersections.map((inter) => {
                  const stateConfig: Record<string, { label: string; color: string; dot: string }> = {
                    normal:     { label: "Normal",           color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
                    preparing:  { label: "Preparando",       color: "text-amber-400",         dot: "bg-amber-400 animate-pulse" },
                    priority:   { label: "Prioridad activa", color: "text-primary",           dot: "bg-primary animate-pulse"  },
                    traversing: { label: "Atravesando",      color: "text-primary",           dot: "bg-primary animate-pulse"  },
                    recovering: { label: "Recuperando",      color: "text-sky-400",           dot: "bg-sky-400"                },
                  };
                  const sc = stateConfig[inter.state] ?? stateConfig.normal;
                  return (
                    <div key={inter.id} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sc.dot)} />
                        <p className="text-xs text-foreground/80">{INTERSECTION_LABELS_STATIC[inter.id]}</p>
                      </div>
                      <span className={cn("text-[10px] font-mono", sc.color)}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route segments */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Segmentos de ruta</p>
              <div className="space-y-2">
                {segments.filter((s) => !s.alternative || s.active || phase === "rerouted").map((seg) => (
                  <div key={seg.id} className={cn(
                    "flex items-center gap-2 py-1 border-b border-border/40 last:border-0",
                    seg.blocked ? "text-rose-400" : seg.active ? "text-primary" : "text-muted-foreground"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      seg.blocked ? "bg-rose-400" : seg.active ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                    )} />
                    <p className="text-xs flex-1">{seg.label}</p>
                    {seg.blocked && <span className="text-[9px] font-mono bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded">BLOQ</span>}
                    {seg.alternative && !seg.blocked && <span className="text-[9px] font-mono bg-sky-400/15 text-sky-400 px-1.5 py-0.5 rounded">ALT</span>}
                    {seg.active && !seg.blocked && <span className="text-[9px] font-mono bg-primary/15 text-primary px-1.5 py-0.5 rounded">ACTIVO</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Control */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Control de simulación</p>
              <div className="space-y-2">
                {phase === "idle" && (
                  <Button onClick={startMission} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar misión
                  </Button>
                )}
                {isRunning && (
                  <Button
                    onClick={simulateBlock}
                    disabled={blockSimulated}
                    variant="outline"
                    className="w-full gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {blockSimulated ? "Bloqueo reportado" : "Simular bloqueo"}
                  </Button>
                )}
                {(isRunning || phase === "completed" || phase === "blocked") && (
                  <Button onClick={resetSimulation} variant="outline" className="w-full gap-2 text-muted-foreground">
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar simulación
                  </Button>
                )}
                {phase === "completed" && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center mt-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm text-primary font-semibold">Llegada exitosa</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">2m 18s antes de lo normal</p>
                  </div>
                )}
                {phase === "idle" && (
                  <p className="text-[10px] text-muted-foreground/40 text-center pt-1">
                    Inicia la misión desde aquí o desde el Centro de Control
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const INTERSECTION_LABELS_STATIC: Record<string, string> = {
  int1: "Bv. Oroño / Córdoba",
  int2: "Córdoba / Rioja",
  int3: "Rioja / San Luis",
  int4: "San Luis / Pellegrini",
};
