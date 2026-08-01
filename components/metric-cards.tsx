"use client";

import { useSimulation } from "@/lib/simulation-store";
import { Ambulance, Camera, TrafficCone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCards() {
  const phase = useSimulation((s) => s.phase);
  const intersections = useSimulation((s) => s.intersections);

  const isActive = phase === "running" || phase === "rerouted";
  const isCompleted = phase === "completed";
  const prioritizedCount = intersections.filter(
    (i) => i.state === "priority" || i.state === "traversing" || i.state === "preparing"
  ).length;

  const metrics = [
    {
      label: "Ambulancias activas",
      value: isActive ? "1" : "0",
      unit: null,
      icon: Ambulance,
      active: isActive,
      color: "text-primary",
      dimColor: "text-muted-foreground",
      bg: "bg-primary/10",
      dimBg: "bg-white/[0.04]",
      sub: isActive ? "A-12 en ruta activa" : "Sin misiones activas",
      trend: isActive ? "EN RUTA" : null,
      trendColor: "text-primary",
    },
    {
      label: "Cámaras conectadas",
      value: "3",
      unit: "/ 3",
      icon: Camera,
      active: true,
      color: "text-sky-400",
      dimColor: "text-sky-400",
      bg: "bg-sky-400/10",
      dimBg: "bg-sky-400/10",
      sub: "Todas operativas",
      trend: "ONLINE",
      trendColor: "text-sky-400",
    },
    {
      label: "Intersecciones priorizadas",
      value: String(prioritizedCount),
      unit: "/ 4",
      icon: TrafficCone,
      active: prioritizedCount > 0,
      color: "text-amber-400",
      dimColor: "text-muted-foreground",
      bg: "bg-amber-400/10",
      dimBg: "bg-white/[0.04]",
      sub: prioritizedCount > 0 ? `${prioritizedCount} activas ahora` : "Sin prioridad activa",
      trend: prioritizedCount > 0 ? "ACTIVO" : null,
      trendColor: "text-amber-400",
    },
    {
      label: "Tiempo recuperado",
      value: isActive || isCompleted ? "2m 18s" : "—",
      unit: null,
      icon: Timer,
      active: isActive || isCompleted,
      color: "text-primary",
      dimColor: "text-muted-foreground",
      bg: "bg-primary/10",
      dimBg: "bg-white/[0.04]",
      sub: isActive || isCompleted ? "21.6% más rápido" : "Sin datos aún",
      trend: isActive || isCompleted ? "−21.6%" : null,
      trendColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        const lit = m.active;
        return (
          <div
            key={m.label}
            className={cn(
              "relative rounded-lg border px-4 py-3.5 flex flex-col gap-2 overflow-hidden transition-all duration-300",
              lit
                ? "bg-card border-white/[0.1] metric-active"
                : "bg-card border-border"
            )}
          >
            {/* Top row: icon + trend badge */}
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center",
                lit ? m.bg : m.dimBg
              )}>
                <Icon className={cn("w-3.5 h-3.5", lit ? m.color : m.dimColor)} strokeWidth={2} />
              </div>
              {m.trend && lit && (
                <span className={cn(
                  "text-[9px] font-bold font-mono tracking-widest px-1.5 py-0.5 rounded",
                  m.trendColor,
                  "bg-current/10"
                )}>
                  {m.trend}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 leading-none">
              <span className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                lit ? m.color : "text-muted-foreground/40"
              )}>
                {m.value}
              </span>
              {m.unit && (
                <span className="text-sm font-mono text-muted-foreground/40">{m.unit}</span>
              )}
            </div>

            {/* Label + sub */}
            <div className="leading-tight">
              <p className="text-[11px] font-medium text-foreground/70">{m.label}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">{m.sub}</p>
            </div>

            {/* Active bar */}
            {lit && (
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px]",
                m.bg
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
