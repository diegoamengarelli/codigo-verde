"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { SimulationTicker } from "@/components/simulation-ticker";
import { PageHeader } from "@/components/page-header";
import { useSimulation } from "@/lib/simulation-store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingDown, Clock, Activity, TrafficCone, AlertCircle } from "lucide-react";

const BEFORE_AFTER = [
  { label: "Sin coordinación", time: 640, color: "#ef4444" },
  { label: "Con Código Verde", time: 502, color: "#22c55e" },
];

const INCIDENTS = [
  { type: "Prioridad de paso activada", count: 4, icon: TrafficCone, color: "text-primary" },
  { type: "Cambios de fase de semáforo", count: 16, icon: Activity, color: "text-sky-400" },
  { type: "Demora promedio por vehículo", count: 8.5, unit: "s", icon: Clock, color: "text-amber-400" },
  { type: "Rerouting activado", count: 1, icon: AlertCircle, color: "text-rose-400" },
];

const STATIC_ETA = [
  { t: 0, eta: 502 },
  { t: 30, eta: 472 },
  { t: 60, eta: 442 },
  { t: 90, eta: 412 },
  { t: 120, eta: 382 },
  { t: 150, eta: 352 },
  { t: 180, eta: 322 },
  // Block detected around t=190 — ETA spikes up while the detour is calculated
  { t: 195, eta: 398 },
  { t: 210, eta: 372 },
  { t: 240, eta: 320 },
  { t: 270, eta: 282 },
  { t: 300, eta: 248 },
  { t: 330, eta: 218 },
  { t: 360, eta: 188 },
  { t: 390, eta: 158 },
  { t: 420, eta: 128 },
  { t: 450, eta: 98 },
  { t: 480, eta: 68 },
  { t: 502, eta: 0 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Compact clock format for axis ticks, e.g. 502 -> "8:22"
function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ResultadosPage() {
  const phase = useSimulation((s) => s.phase);
  const etaHistory = useSimulation((s) => s.etaHistory);

  const displayData =
    etaHistory.length > 2 ? etaHistory : STATIC_ETA;

  const blockT = etaHistory.findIndex((p, i) =>
    i > 0 && etaHistory[i].eta > etaHistory[i - 1].eta
  );
  const blockTime = blockT > 0 ? etaHistory[blockT].t : 190;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavSidebar />
      <SimulationTicker />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Resultados de la misión"
          subtitle="Análisis comparativo — Código Verde vs. ruta sin coordinación"
          status={phase === "completed" ? "active" : "waiting"}
          statusLabel={phase === "completed" ? "MISIÓN COMPLETADA" : "DATOS DEMO"}
        />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-5xl flex flex-col gap-4">
            {/* Top stat cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "Tiempo sin coordinación",
                  value: "10m 40s",
                  sub: "Ruta base",
                  color: "text-rose-400",
                  bg: "bg-rose-500/10",
                  icon: Clock,
                },
                {
                  label: "Tiempo con Código Verde",
                  value: "8m 22s",
                  sub: "Ruta optimizada",
                  color: "text-primary",
                  bg: "bg-primary/10",
                  icon: TrendingDown,
                },
                {
                  label: "Tiempo recuperado",
                  value: "2m 18s",
                  sub: "21.6% más rápido",
                  color: "text-primary",
                  bg: "bg-primary/10",
                  icon: TrendingDown,
                },
                {
                  label: "Demora al tránsito general",
                  value: "+34s",
                  sub: "Promedio por vehículo",
                  color: "text-amber-400",
                  bg: "bg-amber-400/10",
                  icon: Clock,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-card border border-border rounded-lg p-4 flex items-start gap-3"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded flex items-center justify-center shrink-0",
                        stat.bg
                      )}
                    >
                      <Icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <div>
                      <p className={cn("text-xl font-bold font-mono leading-none", stat.color)}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* ETA chart */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  ETA durante la misión
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Tiempo estimado de llegada en segundos a lo largo de la misión
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={displayData}
                    margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="etaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(1 0 0 / 6%)"
                    />
                    <XAxis
                      dataKey="t"
                      type="number"
                      domain={[0, "dataMax"]}
                      tickCount={7}
                      tickFormatter={formatClock}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={{ stroke: "oklch(1 0 0 / 8%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, "auto"]}
                      tickFormatter={formatClock}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={42}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.14 0.01 240)",
                        border: "1px solid oklch(1 0 0 / 8%)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: "#e5e7eb",
                      }}
                      formatter={(v: number) => [formatMMSS(v), "ETA restante"]}
                      labelFormatter={(l) => `Transcurrido: ${formatMMSS(Number(l))}`}
                    />
                    {blockT > 0 && (
                      <ReferenceLine
                        x={blockTime}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{
                          value: "Bloqueo / reruteo",
                          fill: "#f59e0b",
                          fontSize: 9,
                          position: "insideTopRight",
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="eta"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#etaFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#22c55e", stroke: "#0a0a0a", strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Before/After bar */}
              <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Comparación antes / después
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Duración total del trayecto (segundos)
                </p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={BEFORE_AFTER} barSize={40}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(1 0 0 / 6%)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#6b7280", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `${Math.floor(v / 60)}m`}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                        domain={[0, 720]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.14 0.01 240)",
                          border: "1px solid oklch(1 0 0 / 8%)",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: "#e5e7eb",
                        }}
                        formatter={(v: number) => [formatMMSS(v), "Tiempo"]}
                      />
                      <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                        {BEFORE_AFTER.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Tiempo recuperado
                  </p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    2m 18s
                  </p>
                  <p className="text-[10px] text-primary/70 mt-0.5">
                    21.6% de mejora
                  </p>
                </div>
              </div>
            </div>

            {/* Intersections table */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Intersecciones coordinadas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-muted-foreground font-medium pb-2 pr-4">
                        Intersección
                      </th>
                      <th className="text-left text-muted-foreground font-medium pb-2 pr-4">
                        Tiempo preparación
                      </th>
                      <th className="text-left text-muted-foreground font-medium pb-2 pr-4">
                        Duración prioridad
                      </th>
                      <th className="text-left text-muted-foreground font-medium pb-2 pr-4">
                        Tiempo recuperación
                      </th>
                      <th className="text-left text-muted-foreground font-medium pb-2">
                        Estado final
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Bv. Oroño / Córdoba",
                        prep: "4s",
                        priority: "2s",
                        recovery: "3s",
                        status: "Normal",
                      },
                      {
                        name: "Córdoba / Rioja",
                        prep: "4s",
                        priority: "2s",
                        recovery: "3s",
                        status: "Normal",
                      },
                      {
                        name: "Rioja / San Luis",
                        prep: "4s",
                        priority: "2s",
                        recovery: "3s",
                        status: "Normal",
                      },
                      {
                        name: "San Luis / Pellegrini",
                        prep: "4s",
                        priority: "2s",
                        recovery: "3s",
                        status: "Normal",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/40 last:border-0">
                        <td className="py-2 pr-4 font-medium text-foreground">
                          {row.name}
                        </td>
                        <td className="py-2 pr-4 text-amber-400 font-mono">{row.prep}</td>
                        <td className="py-2 pr-4 text-primary font-mono">{row.priority}</td>
                        <td className="py-2 pr-4 text-sky-400 font-mono">{row.recovery}</td>
                        <td className="py-2">
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px]">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detected events */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Eventos detectados
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {INCIDENTS.map((inc) => {
                  const Icon = inc.icon;
                  return (
                    <div
                      key={inc.type}
                      className="bg-muted/20 rounded-lg p-3 flex flex-col gap-1"
                    >
                      <Icon className={cn("w-4 h-4 mb-1", inc.color)} />
                      <p className="text-xl font-bold font-mono text-foreground">
                        {inc.count}
                        {inc.unit && (
                          <span className="text-sm text-muted-foreground ml-0.5">
                            {inc.unit}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {inc.type}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demo note */}
            <div className="bg-card border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Todos los datos mostrados son demostrativos y simulados. No representan resultados
                operativos reales de la Municipalidad de Rosario. Este sistema es una demostración
                conceptual del proyecto Código Verde.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
