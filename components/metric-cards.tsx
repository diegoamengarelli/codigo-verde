"use client";

import { useSimulation } from "@/lib/simulation-store";
import { Ambulance, Camera, TrafficCone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCards() {
  const phase = useSimulation((s) => s.phase);
  const intersections = useSimulation((s) => s.intersections);

  const isActive = phase === "running" || phase === "rerouted";
  const prioritizedCount = intersections.filter(
    (i) => i.state === "priority" || i.state === "traversing" || i.state === "preparing"
  ).length;

  const metrics = [
    {
      label: "Ambulancias activas",
      value: isActive ? "1" : "0",
      icon: Ambulance,
      color: isActive ? "text-primary" : "text-muted-foreground",
      bg: isActive ? "bg-primary/10" : "bg-muted/20",
      sub: isActive ? "A-12 en ruta" : "Sin misiones",
    },
    {
      label: "Cámaras conectadas",
      value: "3",
      icon: Camera,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      sub: "3 de 3 online",
    },
    {
      label: "Intersecciones priorizadas",
      value: String(prioritizedCount),
      icon: TrafficCone,
      color: prioritizedCount > 0 ? "text-amber-400" : "text-muted-foreground",
      bg: prioritizedCount > 0 ? "bg-amber-400/10" : "bg-muted/20",
      sub: prioritizedCount > 0 ? `${prioritizedCount} de 4 activas` : "Sin prioridad activa",
    },
    {
      label: "Tiempo recuperado",
      value: isActive || phase === "completed" ? "2m 18s" : "—",
      icon: Timer,
      color: isActive || phase === "completed" ? "text-primary" : "text-muted-foreground",
      bg: isActive || phase === "completed" ? "bg-primary/10" : "bg-muted/20",
      sub: "vs. ruta sin coordinación",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className="bg-card border border-border rounded-lg px-4 py-3 flex items-start gap-3"
          >
            <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0", m.bg)}>
              <Icon className={cn("w-4 h-4", m.color)} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-xl font-bold font-mono leading-none", m.color)}>
                {m.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">{m.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
