import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { MetricCards } from "@/components/metric-cards";
import { MapWrapper } from "@/components/map-wrapper";
import { MissionPanel } from "@/components/mission-panel";
import { EventTimeline } from "@/components/event-timeline";
import { PageHeader } from "@/components/page-header";

export default function ControlCenterPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Centro de Control"
          subtitle="Coordinación de emergencias — Rosario, Santa Fe"
        />

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 min-h-0">
          <MetricCards />

          <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 256px)" }}>
            {/* Map + timeline */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0" style={{ minHeight: "280px" }}>
                <MapWrapper />
              </div>
              <div className="h-48 shrink-0">
                <EventTimeline />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-60 shrink-0 overflow-y-auto">
              <MissionPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
