"use client";

import {
  useSimulation,
  ETA_TARGET,
  ETA_TOLERABLE_MAX,
  ETA_CRITICAL_MAX,
} from "@/lib/simulation-store";
import { Gauge, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

// Bar scale: from 0 to slightly past the critical reference
const SCALE_MAX = ETA_CRITICAL_MAX * 1.06;

export function ContingencyBarometer() {
  const phase = useSimulation((s) => s.phase);
  const etaHistory = useSimulation((s) => s.etaHistory);
  const emergencyWaveActive = useSimulation((s) => s.emergencyWaveActive);
  const activateEmergencyWave = useSimulation((s) => s.activateEmergencyWave);

  const isActive = phase !== "idle";
  const last = etaHistory[etaHistory.length - 1];

  // Projected TOTAL trip time = elapsed real seconds + remaining ETA
  const projected = last ? last.t + last.eta : ETA_TARGET;

  const zone: "optimal" | "tolerable" | "critical" =
    projected <= ETA_TARGET
      ? "optimal"
      : projected <= ETA_TOLERABLE_MAX
      ? "tolerable"
      : "critical";

  const pct = Math.min(100, (projected / SCALE_MAX) * 100);
  const targetPct = (ETA_TARGET / SCALE_MAX) * 100;
  const tolerablePct = (ETA_TOLERABLE_MAX / SCALE_MAX) * 100;
  const criticalRefPct = (ETA_CRITICAL_MAX / SCALE_MAX) * 100;

  const zoneConfig = {
    optimal: {
      label: "ÓPTIMO",
      text: "text-primary",
      chip: "bg-primary/10 border-primary/30 text-primary",
      indicator: "bg-primary border-primary",
    },
    tolerable: {
      label: "TOLERABLE",
      text: "text-amber-400",
      chip: "bg-amber-400/10 border-amber-400/30 text-amber-400",
      indicator: "bg-amber-400 border-amber-400",
    },
    critical: {
      label: "CRÍTICO",
      text: "text-rose-400",
      chip: "bg-rose-500/10 border-rose-500/40 text-rose-400",
      indicator: "bg-rose-500 border-rose-400",
    },
  } as const;
  const zc = zoneConfig[zone];

  const showAlert = isActive && zone === "critical" && !emergencyWaveActive && phase !== "completed";

  return (
    <div
      className={cn(
        "bg-card border rounded-lg px-4 py-3 shrink-0 transition-colors",
        showAlert ? "border-rose-500/50" : "border-border"
      )}
      role="status"
      aria-label="Barómetro de contingencia del auxilio"
    >
      <div className="flex items-center gap-4">
        {/* Title + zone chip */}
        <div className="flex items-center gap-2.5 shrink-0 w-52">
          <Gauge className={cn("w-4 h-4 shrink-0", isActive ? zc.text : "text-muted-foreground/40")} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground leading-tight">
              Barómetro de contingencia
            </p>
            <p className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-widest">
              ETA objetivo vs. real
            </p>
          </div>
        </div>

        {/* Band bar */}
        <div className="flex-1 min-w-0">
          <div className="relative h-6">
            {/* Bands */}
            <div className="absolute inset-y-1.5 left-0 right-0 flex rounded-full overflow-hidden">
              <div className="bg-primary/15" style={{ width: `${targetPct}%` }} />
              <div className="bg-amber-400/15" style={{ width: `${tolerablePct - targetPct}%` }} />
              <div className="bg-rose-500/15 flex-1" />
            </div>

            {/* Target marker (ETA teórico) */}
            <div
              className="absolute inset-y-0 w-px bg-primary/60"
              style={{ left: `${targetPct}%` }}
              title={`Objetivo: ${formatMMSS(ETA_TARGET)}`}
            />
            {/* No-coordination reference marker */}
            <div
              className="absolute inset-y-0 w-px bg-rose-400/50"
              style={{ left: `${criticalRefPct}%` }}
              title={`Sin coordinación: ${formatMMSS(ETA_CRITICAL_MAX)}`}
            />

            {/* Moving indicator */}
            {isActive && (
              <div
                className="absolute top-0 bottom-0 flex items-center transition-all duration-700 ease-out"
                style={{ left: `calc(${pct}% - 6px)` }}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-full border-2 shadow-lg",
                    zc.indicator,
                    zone === "critical" && "animate-pulse"
                  )}
                />
              </div>
            )}
          </div>

          {/* Scale labels */}
          <div className="relative h-3.5 text-[8.5px] font-mono text-muted-foreground/40">
            <span className="absolute whitespace-nowrap" style={{ left: `${targetPct}%`, transform: "translateX(calc(-100% - 4px))" }}>
              {formatMMSS(ETA_TARGET)} obj.
            </span>
            <span className="absolute whitespace-nowrap" style={{ left: `${criticalRefPct}%`, transform: "translateX(-100%)" }}>
              {formatMMSS(ETA_CRITICAL_MAX)} sin coord.
            </span>
          </div>
        </div>

        {/* Current reading + action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className={cn("text-[15px] font-bold font-mono leading-none", isActive ? zc.text : "text-muted-foreground/40")}>
              {isActive ? formatMMSS(projected) : "—"}
            </p>
            <p className="text-[9px] text-muted-foreground/50 mt-0.5">proyección total</p>
          </div>
          <span
            className={cn(
              "text-[9px] font-mono font-bold px-2 py-1 rounded border tracking-widest",
              isActive ? zc.chip : "bg-muted/10 border-border text-muted-foreground/40"
            )}
          >
            {isActive ? zc.label : "SIN MISIÓN"}
          </span>

          {showAlert && (
            <button
              onClick={activateEmergencyWave}
              className="flex items-center gap-1.5 bg-rose-500 text-white hover:bg-rose-400 active:scale-[0.97] transition-all text-[11px] font-bold px-3 py-2 rounded-md animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Activar Onda Verde
            </button>
          )}
          {emergencyWaveActive && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/30 px-2.5 py-1.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Onda Verde activa
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
