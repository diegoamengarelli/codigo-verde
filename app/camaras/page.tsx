"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { useSimulation } from "@/lib/simulation-store";
import { cn } from "@/lib/utils";
import { Car, Bike, Bus, Truck, AlertCircle, Wifi } from "lucide-react";

function YouTubeCameraFeed({
  id,
  name,
  location,
  cars,
  motos,
  buses,
  trucks,
  queueLength,
  occupancy,
  status,
}: {
  id: string;
  name: string;
  location: string;
  cars: number;
  motos: number;
  buses: number;
  trucks: number;
  queueLength: number;
  occupancy: number;
  status: "normal" | "alert" | "offline";
}) {
  const total = cars + motos + buses + trucks;

  return (
    <div className="bg-card border border-primary/30 rounded-lg overflow-hidden flex flex-col">
      {/* Live YouTube embed */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/NfsyRx50gAI?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
          title="Cámara en vivo — UADE Buenos Aires"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <span className="text-[10px] text-white font-mono font-bold">{name}</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] text-rose-400 font-mono font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border text-primary border-primary/30 bg-primary/10 shrink-0">
            En vivo
          </span>
        </div>

        {/* Vehicle counts */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { Icon: Car, label: "Autos", value: cars, color: "text-foreground" },
            { Icon: Bike, label: "Motos", value: motos, color: "text-sky-400" },
            { Icon: Bus, label: "Colect.", value: buses, color: "text-amber-400" },
            { Icon: Truck, label: "Camion.", value: trucks, color: "text-rose-400" },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="bg-muted/20 rounded p-1.5 flex flex-col items-center gap-0.5">
              <Icon className={cn("w-3 h-3", color)} />
              <p className="text-sm font-bold font-mono text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Queue and occupancy */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/20 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Long. de fila</p>
            <p className="text-base font-bold font-mono text-foreground">{queueLength}m</p>
          </div>
          <div className="bg-muted/20 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Ocupación</p>
            <div className="flex items-end gap-1">
              <p className="text-base font-bold font-mono text-foreground">{occupancy}%</p>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
              <div
                className={cn("h-1 rounded-full transition-all", occupancy > 75 ? "bg-amber-400" : occupancy > 50 ? "bg-sky-400" : "bg-primary")}
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Source note */}
        <div className="flex items-center gap-1 justify-center">
          <AlertCircle className="w-3 h-3 text-muted-foreground/50" />
          <p className="text-[9px] text-muted-foreground/50">
            Fuente: Cámara pública en vivo — Buenos Aires
          </p>
        </div>
      </div>
    </div>
  );
}

function SimulatedCameraFeed({
  id,
  name,
  location,
  cars,
  motos,
  buses,
  trucks,
  queueLength,
  occupancy,
  status,
}: {
  id: string;
  name: string;
  location: string;
  cars: number;
  motos: number;
  buses: number;
  trucks: number;
  queueLength: number;
  occupancy: number;
  status: "normal" | "alert" | "offline";
}) {
  const total = cars + motos + buses + trucks;

  // Simulated "video" using CSS patterns
  const vehicleColors = [
    "#374151",
    "#4b5563",
    "#6b7280",
    "#1f2937",
    "#111827",
    "#374151",
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Camera feed simulation */}
      <div className="relative aspect-video bg-[oklch(0.08_0.01_240)] overflow-hidden">
        {/* Road simulation */}
        <div className="absolute inset-0">
          {/* Road */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#1a1f2e]">
            {/* Lane markings */}
            <div className="absolute top-1/3 left-0 right-0 flex justify-center gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-6 h-0.5 bg-yellow-400/30" />
              ))}
            </div>
            {/* Center line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

            {/* Simulated vehicles */}
            {Array.from({ length: Math.min(cars + motos + buses, 12) }).map(
              (_, i) => {
                const row = Math.floor(i / 4);
                const col = i % 4;
                const isLarge = i < buses;
                return (
                  <div
                    key={i}
                    className="absolute rounded-sm transition-all duration-1000"
                    style={{
                      width: isLarge ? "28px" : "16px",
                      height: isLarge ? "14px" : "8px",
                      backgroundColor:
                        vehicleColors[i % vehicleColors.length],
                      left: `${15 + col * 22}%`,
                      top: `${20 + row * 30}%`,
                      opacity: 0.7 + Math.random() * 0.3,
                    }}
                  />
                );
              }
            )}
          </div>

          {/* Sky/background */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-[oklch(0.1_0.01_240)]">
            {/* Building silhouettes */}
            <div
              className="absolute bottom-0 left-0 right-0 h-8 bg-[oklch(0.12_0.01_240)]"
              style={{
                clipPath:
                  "polygon(0% 100%, 0% 60%, 5% 60%, 5% 30%, 10% 30%, 10% 50%, 20% 50%, 20% 20%, 25% 20%, 25% 50%, 35% 50%, 35% 35%, 40% 35%, 40% 55%, 50% 55%, 50% 25%, 55% 25%, 55% 55%, 65% 55%, 65% 40%, 70% 40%, 70% 55%, 80% 55%, 80% 30%, 85% 30%, 85% 50%, 95% 50%, 95% 60%, 100% 60%, 100% 100%)",
              }}
            />
          </div>
        </div>

        {/* Overlay: vehicle detection boxes */}
        {status !== "offline" && (
          <>
            <div className="absolute top-[35%] left-[14%] w-4 h-2 border border-sky-400/70 rounded-sm" />
            <div className="absolute top-[35%] left-[36%] w-4 h-2 border border-sky-400/70 rounded-sm" />
            <div className="absolute top-[50%] left-[22%] w-7 h-3.5 border border-amber-400/70 rounded-sm" />
            <div className="absolute top-[38%] left-[57%] w-4 h-2 border border-sky-400/70 rounded-sm" />
            {cars > 10 && (
              <div className="absolute top-[62%] left-[55%] w-4 h-2 border border-sky-400/70 rounded-sm" />
            )}
          </>
        )}

        {/* Top overlay: cam name + status */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-black/60 to-transparent">
          <span className="text-[10px] text-white font-mono font-bold">{name}</span>
          <div className="flex items-center gap-1">
            {status === "offline" ? (
              <span className="text-[9px] text-rose-400 font-mono">OFFLINE</span>
            ) : (
              <>
                <Wifi className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] text-primary font-mono">LIVE</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom overlay: timestamp */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-[9px] text-white/70 font-mono">
            2026-01-08 14:03:22
          </span>
          <span className="text-[9px] text-amber-400/80 font-mono">
            {total} veh detectados
          </span>
        </div>

        {/* Alert overlay */}
        {status === "alert" && (
          <div className="absolute inset-0 border-2 border-amber-400/50 pointer-events-none">
            <div className="absolute top-8 right-2 bg-amber-400/20 border border-amber-400/40 rounded px-1.5 py-0.5">
              <span className="text-[9px] text-amber-400 font-mono">
                CONGESTIÓN
              </span>
            </div>
          </div>
        )}

        {/* Demo watermark */}
        <div className="absolute bottom-6 right-2 text-[8px] text-white/20 font-mono">
          DEMO
        </div>
      </div>

      {/* Info panel */}
      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
              status === "normal"
                ? "text-primary border-primary/30 bg-primary/10"
                : status === "alert"
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-rose-400 border-rose-500/30 bg-rose-500/10"
            )}
          >
            {status === "normal"
              ? "Normal"
              : status === "alert"
              ? "Alerta"
              : "Offline"}
          </span>
        </div>

        {/* Vehicle counts */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { Icon: Car, label: "Autos", value: cars, color: "text-foreground" },
            { Icon: Bike, label: "Motos", value: motos, color: "text-sky-400" },
            { Icon: Bus, label: "Colect.", value: buses, color: "text-amber-400" },
            { Icon: Truck, label: "Camion.", value: trucks, color: "text-rose-400" },
          ].map(({ Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-muted/20 rounded p-1.5 flex flex-col items-center gap-0.5"
            >
              <Icon className={cn("w-3 h-3", color)} />
              <p className="text-sm font-bold font-mono text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Queue and occupancy */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/20 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Long. de fila
            </p>
            <p className="text-base font-bold font-mono text-foreground">
              {queueLength}m
            </p>
          </div>
          <div className="bg-muted/20 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Ocupación
            </p>
            <div className="flex items-end gap-1">
              <p className="text-base font-bold font-mono text-foreground">
                {occupancy}%
              </p>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all",
                  occupancy > 75
                    ? "bg-amber-400"
                    : occupancy > 50
                    ? "bg-sky-400"
                    : "bg-primary"
                )}
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Demo label */}
        <div className="flex items-center gap-1 justify-center">
          <AlertCircle className="w-3 h-3 text-muted-foreground/50" />
          <p className="text-[9px] text-muted-foreground/50">
            Datos demostrativos — no reflejan tránsito real
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CamarasPage() {
  const cameras = useSimulation((s) => s.cameras);
  const phase = useSimulation((s) => s.phase);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="px-6 py-3 border-b border-border shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Monitoreo de cámaras
            </h1>
            <p className="text-xs text-muted-foreground">
              3 cámaras activas — Intersecciones coordinadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                phase === "running" || phase === "rerouted"
                  ? "bg-primary animate-pulse"
                  : "bg-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-xs font-mono",
                phase === "running" || phase === "rerouted"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {phase === "running" || phase === "rerouted"
                ? "MISIÓN ACTIVA"
                : "EN ESPERA"}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-4 max-w-6xl">
            {cameras.map((cam, i) =>
              i === 0 ? (
                <YouTubeCameraFeed key={cam.id} {...cam} />
              ) : (
                <SimulatedCameraFeed key={cam.id} {...cam} />
              )
            )}
          </div>

          {/* System note */}
          <div className="mt-4 bg-card border border-border rounded-lg p-4 max-w-6xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Sistema de detección de vehículos — Modo demostración
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los feeds de video y datos de tránsito mostrados son completamente simulados y no
                  representan datos reales de la infraestructura municipal de Rosario. Esta demostración
                  tiene fines ilustrativos para la presentación del sistema Código Verde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
