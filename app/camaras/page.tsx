"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { PageHeader } from "@/components/page-header";
import { useSimulation } from "@/lib/simulation-store";
import { cn } from "@/lib/utils";
import { Car, Bike, Bus, Truck, AlertCircle } from "lucide-react";

function LocalVideoCameraFeed({
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
  videoSrc,
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
  videoSrc: string;
}) {
  return (
    <div className="bg-card border border-primary/30 rounded-lg overflow-hidden flex flex-col">
      {/* Video feed */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10">
          <span className="text-[10px] text-white font-mono font-bold">{name}</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] text-primary font-mono font-bold">REC</span>
          </div>
        </div>
        {/* Bottom timestamp overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10">
          <span className="text-[9px] text-white/60 font-mono">{location}</span>
          <span className="text-[9px] text-white/40 font-mono">{cars + motos + buses + trucks} veh</span>
        </div>
      </div>

      {/* Info panel */}
      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
            status === "alert"
              ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
              : "text-primary border-primary/30 bg-primary/10"
          )}>
            {status === "alert" ? "Alerta" : "Normal"}
          </span>
        </div>

        {/* Vehicle counts */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { Icon: Car,   label: "Autos",   value: cars,   color: "text-foreground" },
            { Icon: Bike,  label: "Motos",   value: motos,  color: "text-sky-400"    },
            { Icon: Bus,   label: "Colect.", value: buses,  color: "text-amber-400"  },
            { Icon: Truck, label: "Camion.", value: trucks, color: "text-rose-400"   },
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
            <p className="text-base font-bold font-mono text-foreground">{occupancy}%</p>
            <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
              <div
                className={cn("h-1 rounded-full transition-all", occupancy > 75 ? "bg-amber-400" : occupancy > 50 ? "bg-sky-400" : "bg-primary")}
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
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
        <PageHeader
          title="Monitoreo de cámaras"
          subtitle="3 cámaras activas — Intersecciones coordinadas"
          status={phase === "running" || phase === "rerouted" ? "active" : "waiting"}
          statusLabel={phase === "running" || phase === "rerouted" ? "MISIÓN ACTIVA" : "EN ESPERA"}
        />

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-4 max-w-6xl">
            {cameras.map((cam, i) => (
              <LocalVideoCameraFeed
                key={cam.id}
                {...cam}
                videoSrc={`/videos/cam-0${i + 1}.mp4`}
              />
            ))}
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
