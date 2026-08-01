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
  { label: "Tiempo con Código Verde", value: "8 m 22 s", sub: "corredor prioritario" },
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
          subtitle="Cómo funciona Código Verde — flujo, stack técnico y modelo de datos"
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
                <span className="text-primary">Código Verde prepara la ciudad para que pueda llegar.</span>
              </blockquote>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl pl-5">
                Las aplicaciones de navegación optimizan rutas según el tránsito existente, pero no controlan
                la infraestructura urbana. Código Verde conecta ambulancia, cámaras y centro municipal
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
