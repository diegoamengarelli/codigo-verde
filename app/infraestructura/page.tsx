"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { PageHeader } from "@/components/page-header";
import {
  Activity,
  Camera,
  Cpu,
  Database,
  Globe,
  MapPin,
  Radio,
  Server,
  Smartphone,
  TrafficCone,
  Zap,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  BarChart3,
  TrendingDown,
  FlaskConical,
  ScanLine,
  GitMerge,
  Timer,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ────────────────────────────────────────────────────────────────── */

const FLOW_STEPS = [
  {
    step: "01",
    icon: Radio,
    title: "Creación de misión",
    description:
      "El operador registra la ambulancia, origen, destino y prioridad. El sistema calcula una ruta prioritaria y una ruta alternativa.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    step: "02",
    icon: Camera,
    title: "Análisis de cámaras",
    description:
      "Las cámaras aportan métricas agregadas: cantidad de vehículos por tipo, longitud de fila, ocupación y estado de congestión de cada intersección.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    step: "03",
    icon: MapPin,
    title: "Aprobación del corredor",
    description:
      "El operador revisa la ruta, los cruces involucrados y el impacto estimado al tránsito general. Pulsa \"Activar corredor\" para confirmar.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    step: "04",
    icon: TrafficCone,
    title: "Preparación semafórica",
    description:
      "Cada intersección avanza por fases: Normal → Preparando → Prioridad activa → Ambulancia atravesando → Recuperando → Normal.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    step: "05",
    icon: Smartphone,
    title: "Navegación de la ambulancia",
    description:
      "El conductor recibe destino, ETA, próximo giro y estado del próximo cruce coordinado. La interfaz mobile-first prioriza lectura rápida.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
  {
    step: "06",
    icon: AlertTriangle,
    title: "Detección de incidente",
    description:
      "Si se detecta un bloqueo, el sistema descarta la ruta original, recalcula una alternativa, actualiza el ETA y notifica a la ambulancia.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  {
    step: "07",
    icon: BarChart3,
    title: "Resultados",
    description:
      "Al completarse la misión se genera una comparación antes/después: tiempo recuperado, cruces coordinados y demora agregada al tránsito.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

const SIGNAL_STATES = [
  { label: "Normal",              color: "bg-muted-foreground/40",  text: "text-muted-foreground", desc: "Operación ordinaria" },
  { label: "Preparando",          color: "bg-amber-400",             text: "text-amber-400",        desc: "> 20 s antes del cruce" },
  { label: "Prioridad activa",    color: "bg-primary",               text: "text-primary",          desc: "Corredor abierto" },
  { label: "Atravesando",         color: "bg-sky-400 animate-pulse", text: "text-sky-400",          desc: "Ambulancia en cruce" },
  { label: "Recuperando",         color: "bg-orange-400",            text: "text-orange-400",       desc: "Retorno gradual" },
];

const STACK_LAYERS = [
  {
    label: "Frontend",
    icon: Globe,
    color: "text-sky-400",
    border: "border-sky-400/20",
    bg: "bg-sky-400/5",
    items: ["Next.js 16 · App Router", "TypeScript", "Tailwind CSS v4", "shadcn/ui", "Recharts", "Leaflet + OpenStreetMap", "Zustand (estado demo)"],
  },
  {
    label: "Hosting",
    icon: Server,
    color: "text-primary",
    border: "border-primary/20",
    bg: "bg-primary/5",
    items: ["Vercel", "Deploy automático por commit", "GitHub · rama main", "Generado con v0"],
  },
  {
    label: "Visión artificial",
    icon: Cpu,
    color: "text-violet-400",
    border: "border-violet-400/20",
    bg: "bg-violet-400/5",
    items: ["Python", "Roboflow Supervision", "YOLO / Roboflow Inference", "ByteTrack", "LineZone · PolygonZone", "Videos preprocesados"],
  },
  {
    label: "Persistencia futura",
    icon: Database,
    color: "text-amber-400",
    border: "border-amber-400/20",
    bg: "bg-amber-400/5",
    items: ["Neon Postgres", "Vercel Blob", "Route Handlers", "Actualmente: datos mock en TypeScript"],
  },
];

const DATA_TYPES = [
  {
    icon: MapPin,
    label: "Intersection",
    color: "text-primary",
    fields: ["id, name", "latitude, longitude", "congestion", "signalState", "cameraId"],
  },
  {
    icon: Activity,
    label: "Mission",
    color: "text-sky-400",
    fields: ["ambulanceId", "origin / destination", "priority", "normalEta / optimizedEta", "status, route"],
  },
  {
    icon: Camera,
    label: "CameraMetrics",
    color: "text-violet-400",
    fields: ["vehicleCount", "motorcycles, buses, trucks", "queueLength", "occupancy", "blockedIntersection"],
  },
  {
    icon: Zap,
    label: "MissionEvent",
    color: "text-amber-400",
    fields: ["mission_created", "corridor_activated", "signal_preparing", "blockage_detected", "route_recalculated"],
  },
];

const METRICS = [
  { label: "Tiempo sin coordinación", value: "10 m 40 s", sub: "ruta convencional" },
  { label: "Tiempo con NEXO", value: "8 m 22 s", sub: "corredor prioritario" },
  { label: "Tiempo recuperado",       value: "2 m 18 s", sub: "diferencia real"       },
  { label: "Cruces coordinados",      value: "4",         sub: "intersecciones"        },
  { label: "Demora al tránsito",      value: "34 s",      sub: "demora distribuida"    },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function InfrastructuraPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Arquitectura e infraestructura"
          subtitle="Cómo funciona NEXO — flujo, stack técnico y modelo de datos"
          status="waiting"
          statusLabel="MODO DEMO"
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-14">

            {/* Hero statement */}
            <section className="space-y-3">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-primary/60">
                Propuesta central
              </p>
              <blockquote className="text-xl font-semibold text-foreground leading-snug border-l-2 border-primary pl-5">
                Google Maps le dice a la ambulancia por dónde ir.
                <br />
                <span className="text-primary">NEXO prepara la ciudad para que pueda llegar.</span>
              </blockquote>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl pl-5">
                Las aplicaciones de navegación optimizan rutas según el tránsito existente, pero no controlan
                la infraestructura urbana. NEXO conecta ambulancia, cámaras y centro municipal
                para crear un corredor de prioridad dinámico que la ciudad ayuda activamente a despejar.
              </p>
            </section>

            {/* Flow */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Flujo de operación
                </p>
                <h2 className="text-sm font-semibold text-foreground">Ciclo completo de una misión</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {FLOW_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.step}
                      className={cn(
                        "flex items-start gap-4 rounded-lg border p-4 bg-card",
                        s.border
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-md flex items-center justify-center shrink-0", s.bg)}>
                        <Icon className={cn("w-4 h-4", s.color)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn("text-[10px] font-mono font-bold tracking-widest", s.color)}>
                            PASO {s.step}
                          </span>
                          <span className="text-[10px] text-muted-foreground/30 font-mono">—</span>
                          <span className="text-[12.5px] font-semibold text-foreground">{s.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 shrink-0 mt-1 hidden sm:block" />
                      )}
                      {i === FLOW_STEPS.length - 1 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary/40 shrink-0 mt-1 hidden sm:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Signal states */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Coordinación semafórica
                </p>
                <h2 className="text-sm font-semibold text-foreground">Estados de intersección</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {SIGNAL_STATES.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 min-w-0">
                    <div className="flex items-center gap-2">
                      {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground/20 shrink-0" />}
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.color)} />
                    </div>
                    <div>
                      <p className={cn("text-[12px] font-semibold", s.text)}>{s.label}</p>
                      <p className="text-[10px] text-muted-foreground/50">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-mono text-muted-foreground/40 uppercase tracking-widest text-[9px] mb-2">Regla de activación</p>
                  <div className="space-y-1">
                    {[
                      ["> 50 s antes", "Normal"],
                      ["50–20 s antes", "Preparando"],
                      ["20–5 s antes", "Prioridad activa"],
                      ["Cruzando", "Ambulancia atravesando"],
                      ["Post cruce", "Recuperando → Normal"],
                    ].map(([time, state]) => (
                      <div key={time} className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground font-mono">{time}</span>
                        <span className="text-foreground/70">{state}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-muted-foreground/40 uppercase tracking-widest text-[9px] mb-2">Lógica de bloqueo</p>
                  <div className="space-y-1 text-muted-foreground">
                    {[
                      "Segmento 3 → bloqueado",
                      "Evento registrado en timeline",
                      "Ruta original descartada",
                      "Ruta alternativa activada",
                      "ETA recalculado",
                      "Ambulancia notificada",
                    ].map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <RotateCcw className="w-2.5 h-2.5 shrink-0 text-rose-400/60" />
                        <span className="text-[11px]">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture diagram */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Arquitectura del sistema
                </p>
                <h2 className="text-sm font-semibold text-foreground">Capas y responsabilidades</h2>
              </div>

              {/* Diagram */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                {[
                  {
                    label: "Aplicación Next.js · Vercel",
                    sublabel: "Dashboard municipal · Vista ambulancia · Simulación · Resultados",
                    color: "border-primary/40 bg-primary/5",
                    textColor: "text-primary",
                    icon: Globe,
                  },
                  {
                    label: "Datos del MVP",
                    sublabel: "Intersecciones · Cámaras · Ambulancias · Misiones · Eventos",
                    color: "border-sky-400/40 bg-sky-400/5",
                    textColor: "text-sky-400",
                    icon: Database,
                  },
                  {
                    label: "Pipeline Python · Visión artificial",
                    sublabel: "YOLO · ByteTrack · LineZone · PolygonZone · Videos preprocesados",
                    color: "border-violet-400/40 bg-violet-400/5",
                    textColor: "text-violet-400",
                    icon: Cpu,
                  },
                ].map((layer, i) => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.label}>
                      <div className={cn("rounded-lg border px-4 py-3 flex items-center gap-3", layer.color)}>
                        <Icon className={cn("w-4 h-4 shrink-0", layer.textColor)} />
                        <div>
                          <p className={cn("text-[12px] font-semibold", layer.textColor)}>{layer.label}</p>
                          <p className="text-[10px] text-muted-foreground/60">{layer.sublabel}</p>
                        </div>
                      </div>
                      {i < 2 && (
                        <div className="flex justify-center my-1">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-px h-3 bg-border" />
                            <ArrowRight className="w-3 h-3 text-muted-foreground/20 rotate-90" />
                            <p className="text-[8px] text-muted-foreground/30 font-mono">
                              {i === 0 ? "JSON / API" : "Métricas precalculadas"}
                            </p>
                            <ArrowRight className="w-3 h-3 text-muted-foreground/20 rotate-90" />
                            <div className="w-px h-3 bg-border" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stack grid */}
              <div className="grid grid-cols-2 gap-3">
                {STACK_LAYERS.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.label} className={cn("rounded-lg border p-4 flex flex-col gap-3", layer.border, layer.bg)}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-3.5 h-3.5", layer.color)} />
                        <p className={cn("text-[11px] font-semibold uppercase tracking-widest", layer.color)}>
                          {layer.label}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {layer.items.map((item) => (
                          <li key={item} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Data model */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Modelo de datos
                </p>
                <h2 className="text-sm font-semibold text-foreground">Tipos principales del sistema</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DATA_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.label} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", type.color)} />
                        <p className={cn("text-[12px] font-semibold font-mono", type.color)}>{type.label}</p>
                      </div>
                      <ul className="space-y-1">
                        {type.fields.map((f) => (
                          <li key={f} className="text-[10.5px] text-muted-foreground font-mono flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/20 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Key metrics */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Datos de referencia
                </p>
                <h2 className="text-sm font-semibold text-foreground">Resultados de la simulación</h2>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {METRICS.map((m) => (
                  <div key={m.label} className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-lg font-bold font-mono text-primary tabular-nums">{m.value}</p>
                    <p className="text-[10px] text-foreground/70 mt-1 leading-tight">{m.label}</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-400/60 leading-relaxed">
                  Todos los datos son simulados con fines demostrativos. Esta plataforma no está conectada
                  a infraestructura semafórica, cámaras municipales ni centrales de emergencias reales.
                  Los datos no representan información oficial de la Municipalidad de Rosario.
                </p>
              </div>
            </section>

            {/* ── Metrics system ─────────────────────────────────────────── */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Sistema de métricas
                </p>
                <h2 className="text-sm font-semibold text-foreground">Qué se mide, cómo y para qué</h2>
              </div>

              {/* Three metric categories */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: Camera,
                    color: "text-violet-400",
                    border: "border-violet-400/20",
                    bg: "bg-violet-400/5",
                    label: "Métricas de cámara",
                    sublabel: "Por intersección · cada ciclo",
                    items: [
                      { name: "vehicleCount", desc: "Vehículos en zona de espera" },
                      { name: "occupancy",    desc: "0.0 – 1.0 · ratio de ocupación" },
                      { name: "queueLength",  desc: "Metros estimados de cola" },
                      { name: "flowRate",     desc: "Vehículos / minuto entrantes" },
                      { name: "motorcycles / buses / trucks", desc: "Conteo por clase" },
                    ],
                  },
                  {
                    icon: Activity,
                    color: "text-sky-400",
                    border: "border-sky-400/20",
                    bg: "bg-sky-400/5",
                    label: "Métricas de misión",
                    sublabel: "Por ambulancia · en tiempo real",
                    items: [
                      { name: "normalEta",     desc: "ETA sin coordinación (s)" },
                      { name: "optimizedEta",  desc: "ETA con corredor activo (s)" },
                      { name: "etaDelta",      desc: "Tiempo recuperado (s)" },
                      { name: "crossingsCoord",desc: "Cruces coordinados exitosos" },
                      { name: "aggregateDelay",desc: "Demora distribuida al tránsito" },
                    ],
                  },
                  {
                    icon: BarChart3,
                    color: "text-primary",
                    border: "border-primary/20",
                    bg: "bg-primary/5",
                    label: "Métricas de corredor",
                    sublabel: "Por activación · post misión",
                    items: [
                      { name: "signalCyclesUsed",   desc: "Ciclos semafóricos modificados" },
                      { name: "avgRecoveryTime",    desc: "Tiempo promedio de recuperación" },
                      { name: "blockageCount",      desc: "Incidentes detectados" },
                      { name: "rerouteCount",       desc: "Recálculos de ruta ejecutados" },
                      { name: "missionCompleted",   desc: "Misión completada con éxito" },
                    ],
                  },
                ].map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.label} className={cn("rounded-lg border p-4 flex flex-col gap-3", group.border, group.bg)}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-3.5 h-3.5", group.color)} />
                        <div>
                          <p className={cn("text-[11px] font-semibold", group.color)}>{group.label}</p>
                          <p className="text-[9px] text-muted-foreground/40 font-mono">{group.sublabel}</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {group.items.map((item) => (
                          <li key={item.name} className="space-y-0.5">
                            <p className="text-[10.5px] font-mono text-foreground/80">{item.name}</p>
                            <p className="text-[9.5px] text-muted-foreground/50">{item.desc}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Traffic status classification */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold text-foreground">Clasificación de estado de tránsito</p>
                  <span className="ml-auto text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">calculateTrafficStatus()</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { status: "clear",     label: "Libre",       occ: "< 35 %",  queue: "< 5 m",   color: "text-primary",       dot: "bg-primary"       },
                    { status: "moderate",  label: "Moderado",    occ: "35–60 %", queue: "5–10 m",  color: "text-amber-400",     dot: "bg-amber-400"     },
                    { status: "congested", label: "Congestionado",occ: "60–80 %",queue: "10–15 m", color: "text-orange-400",    dot: "bg-orange-400"    },
                    { status: "critical",  label: "Crítico",     occ: "> 80 %",  queue: "> 15 m",  color: "text-rose-400",      dot: "bg-rose-400"      },
                  ].map((s) => (
                    <div key={s.status} className="bg-muted/10 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
                        <p className={cn("text-[11px] font-semibold", s.color)}>{s.label}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-muted-foreground/50 font-mono">ocupación {s.occ}</p>
                        <p className="text-[9px] text-muted-foreground/50 font-mono">cola {s.queue}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-mono text-muted-foreground/40 mb-2 uppercase tracking-widest">Regla de prioridad de activación</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Una intersección se prioriza si su estado es <span className="text-orange-400">congestionado</span> o <span className="text-rose-400">crítico</span> Y se encuentra en la ruta activa de la ambulancia.
                    El corredor descarta intersecciones <span className="text-primary">libres</span> que no requieren preparación anticipada para no impactar innecesariamente al tránsito general.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Prediction model ───────────────────────────────────────── */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Modelo de predicción
                </p>
                <h2 className="text-sm font-semibold text-foreground">Cómo se calcula y optimiza el ETA</h2>
              </div>

              {/* ETA formula */}
              <div className="bg-card border border-sky-400/20 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-sky-400" />
                  <p className="text-[11px] font-semibold text-sky-400">Fórmula base de ETA</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-2">ETA sin coordinación</p>
                      <p className="text-[12px] font-mono text-foreground/80 leading-relaxed">
                        ETA_normal =<br />
                        <span className="text-muted-foreground/60 text-[10px] ml-3">Σ (distancia_seg / velocidad_libre)</span><br />
                        <span className="text-amber-400/80 text-[10px] ml-3">+ Σ tiempo_espera_semaforo</span><br />
                        <span className="text-rose-400/80 text-[10px] ml-3">+ Σ penalidad_congestion</span>
                      </p>
                    </div>
                    <div className="bg-muted/10 rounded-lg p-3">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-2">ETA con NEXO</p>
                      <p className="text-[12px] font-mono text-foreground/80 leading-relaxed">
                        ETA_optimizado =<br />
                        <span className="text-muted-foreground/60 text-[10px] ml-3">Σ (distancia_seg / velocidad_libre)</span><br />
                        <span className="text-primary/80 text-[10px] ml-3">+ Σ tiempo_cruce_coordinado</span><br />
                        <span className="text-rose-400/80 text-[10px] ml-3">+ Σ penalidad_bloqueos</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">Variables del modelo</p>
                    {[
                      { var: "velocidad_libre",      val: "40 km/h en zona urbana" },
                      { var: "tiempo_espera_semaforo",val: "15–45 s promedio" },
                      { var: "penalidad_congestion",  val: "+30 % por estado congested, +60 % critical" },
                      { var: "tiempo_cruce_coord",    val: "3–5 s (paso libre garantizado)" },
                      { var: "penalidad_bloqueo",     val: "+90 s recálculo + desvío" },
                      { var: "factor_hora_pico",      val: "×1.4 en 7–9 h y 17–20 h" },
                    ].map((v) => (
                      <div key={v.var} className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-sky-400/70 shrink-0 mt-px">{v.var}</span>
                        <span className="text-[10px] text-muted-foreground/50">{v.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prediction pipeline steps */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold text-foreground">Pipeline de predicción en tiempo real</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { n: "1", label: "Input",        desc: "Métricas de cámaras + posición ambulancia",   color: "text-violet-400", bg: "bg-violet-400/10" },
                    { n: "2", label: "Estado",        desc: "Clasificación de congestión por intersección", color: "text-amber-400",  bg: "bg-amber-400/10"  },
                    { n: "3", label: "Ruta",          desc: "Selección de segmentos y penalidades activas", color: "text-sky-400",    bg: "bg-sky-400/10"    },
                    { n: "4", label: "ETA",           desc: "Cálculo de tiempo optimizado vs. normal",      color: "text-primary",    bg: "bg-primary/10"    },
                    { n: "5", label: "Corredor",      desc: "Activación anticipada de intersecciones",      color: "text-primary",    bg: "bg-primary/10"    },
                  ].map((step, i) => (
                    <div key={step.n} className="flex flex-col items-center gap-1.5 text-center relative">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-bold", step.bg, step.color)}>
                        {step.n}
                      </div>
                      <p className={cn("text-[10px] font-semibold", step.color)}>{step.label}</p>
                      <p className="text-[9px] text-muted-foreground/50 leading-tight">{step.desc}</p>
                      {i < 4 && (
                        <ArrowRight className="absolute top-2.5 -right-1 w-3 h-3 text-muted-foreground/15" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Correction factors */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold text-foreground">Factores de corrección del ETA</p>
                  <span className="ml-auto text-[9px] font-mono text-muted-foreground/30">Futuras iteraciones del modelo</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Hora del día",
                      color: "text-amber-400",
                      border: "border-amber-400/15",
                      rows: [
                        ["Valle (22–6 h)",    "×0.8"],
                        ["Hora pico (7–9 h)", "×1.4"],
                        ["Pico tarde (17–20 h)","×1.4"],
                        ["Resto del día",     "×1.0"],
                      ],
                    },
                    {
                      label: "Tipo de ruta",
                      color: "text-sky-400",
                      border: "border-sky-400/15",
                      rows: [
                        ["Avenida principal", "×0.9"],
                        ["Calle secundaria",  "×1.1"],
                        ["Zona escolar",      "×1.3"],
                        ["Autopista",         "×0.7"],
                      ],
                    },
                    {
                      label: "Condiciones",
                      color: "text-violet-400",
                      border: "border-violet-400/15",
                      rows: [
                        ["Lluvia",           "+15 %"],
                        ["Obra vial activa", "+25 %"],
                        ["Evento masivo",    "+40 %"],
                        ["Corte de luz",     "+50 %"],
                      ],
                    },
                  ].map((group) => (
                    <div key={group.label} className={cn("rounded-lg border p-3 space-y-2", group.border)}>
                      <p className={cn("text-[10px] font-semibold uppercase tracking-widest", group.color)}>{group.label}</p>
                      <table className="w-full">
                        <tbody>
                          {group.rows.map(([cond, factor]) => (
                            <tr key={cond}>
                              <td className="text-[10px] text-muted-foreground py-0.5 pr-2">{cond}</td>
                              <td className={cn("text-[10px] font-mono text-right", group.color)}>{factor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Data analysis pipeline ─────────────────────────────────── */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Pipeline de análisis
                </p>
                <h2 className="text-sm font-semibold text-foreground">De video crudo a decisión operativa</h2>
              </div>

              {/* Full pipeline diagram */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                {[
                  {
                    stage: "A",
                    icon: Camera,
                    color: "text-violet-400",
                    bg: "bg-violet-400/10",
                    label: "Captura de video",
                    tech: "Cámaras IP · RTSP · H.264",
                    outputs: ["stream de frames", "resolución 1080p", "25–30 fps"],
                  },
                  {
                    stage: "B",
                    icon: Cpu,
                    color: "text-violet-400",
                    bg: "bg-violet-400/10",
                    label: "Detección de objetos",
                    tech: "YOLO · Roboflow Inference",
                    outputs: ["bounding boxes", "clase de vehículo", "score de confianza"],
                  },
                  {
                    stage: "C",
                    icon: ScanLine,
                    color: "text-sky-400",
                    bg: "bg-sky-400/10",
                    label: "Tracking de vehículos",
                    tech: "ByteTrack · ID persistente",
                    outputs: ["track_id por vehículo", "trayectoria", "velocidad estimada"],
                  },
                  {
                    stage: "D",
                    icon: Layers,
                    color: "text-sky-400",
                    bg: "bg-sky-400/10",
                    label: "Zonas de análisis",
                    tech: "LineZone · PolygonZone",
                    outputs: ["conteo por dirección", "ocupación de zona", "longitud de cola"],
                  },
                  {
                    stage: "E",
                    icon: FlaskConical,
                    color: "text-primary",
                    bg: "bg-primary/10",
                    label: "Agregación de métricas",
                    tech: "Python · Supervision · JSON",
                    outputs: ["camera-metrics.json", "video anotado .mp4", "estado por ciclo"],
                  },
                  {
                    stage: "F",
                    icon: Database,
                    color: "text-primary",
                    bg: "bg-primary/10",
                    label: "Ingesta al sistema",
                    tech: "Route Handlers · Neon Postgres",
                    outputs: ["CameraMetrics actualizado", "evento registrado", "UI reactiva"],
                  },
                ].map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.stage}>
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5", row.bg)}>
                          <Icon className={cn("w-4 h-4", row.color)} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-3 gap-x-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={cn("text-[9px] font-mono font-bold", row.color)}>ETAPA {row.stage}</span>
                            </div>
                            <p className="text-[12px] font-semibold text-foreground">{row.label}</p>
                            <p className="text-[10px] text-muted-foreground/50 font-mono">{row.tech}</p>
                          </div>
                          <div className="col-span-2 flex items-center gap-2 flex-wrap">
                            {row.outputs.map((out) => (
                              <span key={out} className="text-[9.5px] font-mono bg-muted/20 text-muted-foreground/70 px-2 py-0.5 rounded border border-border">
                                {out}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {i < 5 && (
                        <div className="flex items-center gap-2 ml-4 my-1">
                          <div className="w-px h-4 bg-border ml-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* JSON output example */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold text-foreground">Salida del pipeline — <span className="font-mono text-muted-foreground/50">camera-metrics.json</span></p>
                </div>
                <pre className="text-[10.5px] font-mono text-muted-foreground/70 leading-relaxed bg-muted/10 rounded-lg p-4 overflow-x-auto border border-border whitespace-pre">{`{
  "cameraId":           "CAM-01",
  "intersectionId":     "INT-BV-ORONO-CORDOBA",
  "timestamp":          "2026-08-01T12:30:00-03:00",
  "vehicleCount":       27,
  "motorcycles":        8,
  "buses":              2,
  "trucks":             1,
  "queueLength":        14,
  "occupancy":          0.78,
  "status":             "congested",
  "blockedIntersection": false,
  "flowRate":           12,
  "avgSpeed":           22
}`}</pre>
                <div className="border-t border-border pt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Frecuencia de actualización", value: "Cada 10 s en modo activo" },
                    { label: "Retención de datos",           value: "Últimas 24 h en Postgres" },
                    { label: "Video anotado",                value: "Archivado en Vercel Blob" },
                  ].map((m) => (
                    <div key={m.label} className="space-y-0.5">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">{m.label}</p>
                      <p className="text-[11px] text-foreground/70">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future model note */}
              <div className="flex items-start gap-3 bg-violet-400/5 border border-violet-400/15 rounded-lg px-4 py-3">
                <FlaskConical className="w-3.5 h-3.5 text-violet-400/70 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-violet-400/80 font-semibold mb-0.5">Modelo predictivo — fase futura</p>
                  <p className="text-[10.5px] text-violet-400/50 leading-relaxed">
                    Con historial acumulado (mínimo 30 días de misiones), el pipeline puede entrenar un modelo de regresión que prediga el ETA con mayor precisión incorporando patrones históricos por intersección, hora del día y día de la semana.
                    Las variables de entrada serían: hora, día, estado de cada intersección, clima y tipo de evento urbano activo.
                    El output sería un ETA calibrado con intervalos de confianza que el operador puede ver antes de activar el corredor.
                  </p>
                </div>
              </div>
            </section>

            {/* Scope */}
            <section className="space-y-5 pb-8">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Alcance del MVP
                </p>
                <h2 className="text-sm font-semibold text-foreground">Incluido y fuera de alcance</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-primary/20 rounded-lg p-4">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-primary/60 mb-3">
                    Incluido
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Dashboard municipal",
                      "Vista mobile ambulancia",
                      "Mapa real (Leaflet + OSM)",
                      "Ambulancia simulada",
                      "4 intersecciones · 3 cámaras",
                      "Estados semafóricos simulados",
                      "Evento de bloqueo + recálculo",
                      "Métricas agregadas de tránsito",
                      "Comparación antes / después",
                      "Videos públicos de referencia",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card border border-rose-400/15 rounded-lg p-4">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-rose-400/60 mb-3">
                    Fuera de alcance
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Control real de semáforos",
                      "Acceso a cámaras municipales",
                      "Geolocalización real continua",
                      "Aplicación móvil nativa",
                      "Reconocimiento de patentes",
                      "Reconocimiento facial",
                      "Modelo propio de visión",
                      "Google Navigation SDK",
                      "Centrales de emergencias reales",
                      "Autenticación institucional",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="w-3 h-3 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-px bg-rose-400/40 block" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
