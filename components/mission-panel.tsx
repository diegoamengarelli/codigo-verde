"use client";

import { useSimulation } from "@/lib/simulation-store";
import { TrafficLightBadge } from "@/components/traffic-light-badge";
import { Play, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

export function MissionPanel() {
  const phase = useSimulation((s) => s.phase);
  const startMission = useSimulation((s) => s.startMission);
  const simulateBlock = useSimulation((s) => s.simulateBlock);
  const resetSimulation = useSimulation((s) => s.resetSimulation);
  const intersections = useSimulation((s) => s.intersections);
  const segments = useSimulation((s) => s.segments);
  const elapsedSeconds = useSimulation((s) => s.elapsedSeconds);
  const blockSimulated = useSimulation((s) => s.blockSimulated);

  const isRunning = phase === "running" || phase === "rerouted";
  const totalNormalETA = 640; // 10m 40s
  const totalOptimizedETA = 502; // 8m 22s
  const currentETA = Math.max(0, totalOptimizedETA - elapsedSeconds);

  return (
    <div className="flex flex-col gap-4">
      {/* Mission header */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Misión activa</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ambulancia A-12</p>
          </div>
          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border",
              phase === "idle"
                ? "border-muted text-muted-foreground bg-muted/20"
                : phase === "completed"
                ? "border-primary/40 text-primary bg-primary/10"
                : phase === "blocked"
                ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                : "border-primary/40 text-primary bg-primary/10 animate-pulse"
            )}
          >
            {phase === "idle"
              ? "Sin misión"
              : phase === "running"
              ? "En ruta"
              : phase === "blocked"
              ? "Bloqueado"
              : phase === "rerouted"
              ? "Ruta alternativa"
              : "Completada"}
          </div>
        </div>

        {phase !== "idle" && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-muted/30 rounded p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  Tiempo normal
                </p>
                <p className="text-base font-mono font-bold text-rose-400">10m 40s</p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  ETA optimizado
                </p>
                <p className="text-base font-mono font-bold text-primary">
                  {formatSeconds(currentETA)}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                Origen → Destino
              </p>
              <p className="text-xs text-foreground">
                HECA → Hospital Provincial del Centenario
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {phase === "rerouted"
                  ? "Ruta alternativa via Balcarce activa"
                  : "Ruta principal activa"}
              </p>
            </div>
          </>
        )}

        {/* Comparison */}
        {(isRunning || phase === "completed") && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">
              Comparacion de tiempo
            </p>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground">Sin coordinacion</span>
                  <span className="text-rose-400 font-mono">10m 40s</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-rose-400/60 h-1.5 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground">Con coordinacion</span>
                  <span className="text-primary font-mono">8m 22s</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-primary/80 h-1.5 rounded-full" style={{ width: "78.5%" }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-primary mt-1.5 font-medium">
              2m 18s recuperados · Demora general: +34s
            </p>
          </div>
        )}
      </div>

      {/* Intersection states */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Intersecciones coordinadas
        </h3>
        <div className="flex flex-col gap-2">
          {intersections.map((int) => (
            <div
              key={int.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs text-foreground font-medium truncate">{int.name}</p>
              </div>
              <TrafficLightBadge state={int.state} size="xs" />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Control de simulacion
        </h3>

        {phase === "idle" && (
          <Button
            onClick={startMission}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            size="sm"
          >
            <Play className="w-3.5 h-3.5" />
            Iniciar misión
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              onClick={simulateBlock}
              disabled={blockSimulated}
              variant="outline"
              size="sm"
              className="w-full gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {blockSimulated ? "Bloqueo simulado" : "Simular bloqueo"}
            </Button>
          </>
        )}

        {(isRunning || phase === "blocked" || phase === "completed") && (
          <Button
            onClick={resetSimulation}
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar simulación
          </Button>
        )}

        {phase === "completed" && (
          <div className="bg-primary/10 border border-primary/20 rounded p-2 text-center">
            <p className="text-xs text-primary font-medium">
              Misión completada exitosamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
