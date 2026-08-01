import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { MetricCards } from "@/components/metric-cards";
import { SchematicMap } from "@/components/schematic-map";
import { MissionPanel } from "@/components/mission-panel";
import { EventTimeline } from "@/components/event-timeline";

export default function ControlCenterPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="px-6 py-3 border-b border-border shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Centro Municipal de Control
            </h1>
            <p className="text-xs text-muted-foreground">
              Coordinación de emergencias — Rosario, Santa Fe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-mono">SISTEMA ACTIVO</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 min-h-0">
          {/* Metrics */}
          <MetricCards />

          {/* Main content */}
          <div className="flex gap-4 flex-1 min-h-0" style={{ minHeight: 0, height: "calc(100vh - 260px)" }}>
            {/* Map */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
              <div className="flex-1 min-h-0" style={{ minHeight: "300px" }}>
                <SchematicMap />
              </div>
              <div className="h-52 shrink-0">
                <EventTimeline />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 overflow-y-auto">
              <MissionPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
