"use client";

import { create } from "zustand";

export type TrafficLightState =
  | "normal"
  | "preparing"
  | "priority"
  | "traversing"
  | "recovering";

export type MissionPhase =
  | "idle"
  | "running"
  | "blocked"
  | "rerouted"
  | "completed";

export interface Intersection {
  id: string;
  name: string;
  streets: string;
  x: number; // % position on map
  y: number;
  state: TrafficLightState;
  segmentIndex: number; // which route segment leads here
}

export interface RouteSegment {
  id: string;
  label: string;
  from: string;
  to: string;
  blocked: boolean;
  active: boolean;
  alternative: boolean;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  x: number;
  y: number;
  cars: number;
  motos: number;
  buses: number;
  trucks: number;
  queueLength: number; // metros
  occupancy: number; // %
  status: "normal" | "alert" | "offline";
}

export interface TimelineEvent {
  id: string;
  time: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
}

export interface ETAPoint {
  t: number;
  eta: number;
}

export interface SimulationState {
  phase: MissionPhase;
  elapsedSeconds: number;
  currentSegmentIndex: number;
  intersections: Intersection[];
  segments: RouteSegment[];
  cameras: Camera[];
  timeline: TimelineEvent[];
  etaHistory: ETAPoint[];
  blockSimulated: boolean;

  // actions
  startMission: () => void;
  simulateBlock: () => void;
  resetSimulation: () => void;
  tick: () => void;
}

const INTERSECTIONS_INITIAL: Intersection[] = [
  {
    id: "int1",
    name: "Bv. Oroño / Córdoba",
    streets: "Bv. Oroño y Córdoba",
    x: 30,
    y: 25,
    state: "normal",
    segmentIndex: 0,
  },
  {
    id: "int2",
    name: "Córdoba / Rioja",
    streets: "Córdoba y Rioja",
    x: 50,
    y: 25,
    state: "normal",
    segmentIndex: 1,
  },
  {
    id: "int3",
    name: "Rioja / San Luis",
    streets: "Rioja y San Luis",
    x: 65,
    y: 45,
    state: "normal",
    segmentIndex: 2,
  },
  {
    id: "int4",
    name: "San Luis / Pellegrini",
    streets: "San Luis y Pellegrini",
    x: 65,
    y: 65,
    state: "normal",
    segmentIndex: 3,
  },
];

const SEGMENTS_INITIAL: RouteSegment[] = [
  {
    id: "s0",
    label: "HECA → Bv. Oroño",
    from: "origin",
    to: "int1",
    blocked: false,
    active: false,
    alternative: false,
  },
  {
    id: "s1",
    label: "Bv. Oroño → Córdoba/Rioja",
    from: "int1",
    to: "int2",
    blocked: false,
    active: false,
    alternative: false,
  },
  {
    id: "s2",
    label: "Córdoba → Rioja/San Luis",
    from: "int2",
    to: "int3",
    blocked: false,
    active: false,
    alternative: false,
  },
  {
    id: "s3",
    label: "Rioja → San Luis/Pellegrini",
    from: "int3",
    to: "int4",
    blocked: false,
    active: false,
    alternative: false,
  },
  {
    id: "s4",
    label: "Pellegrini → Hospital Central",
    from: "int4",
    to: "destination",
    blocked: false,
    active: false,
    alternative: false,
  },
  // Alternative segment (bypass s2)
  {
    id: "s2alt",
    label: "Alt: Córdoba → Balcarce → San Luis",
    from: "int2",
    to: "int4",
    blocked: false,
    active: false,
    alternative: true,
  },
];

const CAMERAS_INITIAL: Camera[] = [
  {
    id: "cam1",
    name: "Cámara 01",
    location: "Bv. Oroño y Córdoba",
    x: 30,
    y: 25,
    cars: 12,
    motos: 4,
    buses: 2,
    trucks: 1,
    queueLength: 47,
    occupancy: 68,
    status: "normal",
  },
  {
    id: "cam2",
    name: "Cámara 02",
    location: "Córdoba y Rioja",
    x: 50,
    y: 25,
    cars: 8,
    motos: 2,
    buses: 1,
    trucks: 0,
    queueLength: 22,
    occupancy: 41,
    status: "normal",
  },
  {
    id: "cam3",
    name: "Cámara 03",
    location: "San Luis y Pellegrini",
    x: 65,
    y: 65,
    cars: 15,
    motos: 5,
    buses: 3,
    trucks: 2,
    queueLength: 63,
    occupancy: 82,
    status: "alert",
  },
];

// Segment timing (seconds each segment takes)
const SEGMENT_DURATIONS = [8, 12, 10, 10, 8];
const SEGMENT_DURATIONS_ALT = [8, 12, 14, 8]; // bypass s2, goes s0→s1→s2alt→s4

// How many seconds before reaching an intersection does the light start preparing?
const PREP_LEAD = 4;

function makeTimestamp(elapsed: number): string {
  const base = new Date(2026, 0, 8, 14, 0, 0);
  base.setSeconds(base.getSeconds() + elapsed);
  return base.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function resetIntersections(): Intersection[] {
  return INTERSECTIONS_INITIAL.map((i) => ({ ...i, state: "normal" }));
}

function resetSegments(): RouteSegment[] {
  return SEGMENTS_INITIAL.map((s) => ({
    ...s,
    blocked: false,
    active: false,
    alternative: false,
  }));
}

export const useSimulation = create<SimulationState>((set, get) => ({
  phase: "idle",
  elapsedSeconds: 0,
  currentSegmentIndex: 0,
  intersections: resetIntersections(),
  segments: resetSegments(),
  cameras: CAMERAS_INITIAL,
  timeline: [],
  etaHistory: [],
  blockSimulated: false,

  startMission: () => {
    set({
      phase: "running",
      elapsedSeconds: 0,
      currentSegmentIndex: 0,
      intersections: resetIntersections(),
      segments: resetSegments().map((s, i) =>
        i === 0 ? { ...s, active: true } : s
      ),
      timeline: [
        {
          id: "ev0",
          time: makeTimestamp(0),
          message: "Misión iniciada. Ambulancia A-12 en ruta a Hospital Central.",
          type: "success",
        },
        {
          id: "ev1",
          time: makeTimestamp(1),
          message: "Sistema de coordinación activado para 4 intersecciones.",
          type: "info",
        },
      ],
      etaHistory: [{ t: 0, eta: 502 }],
      blockSimulated: false,
    });
  },

  simulateBlock: () => {
    const { phase, blockSimulated, currentSegmentIndex, elapsedSeconds, timeline } = get();
    if (phase !== "running" || blockSimulated) return;
    if (currentSegmentIndex < 2) {
      // Force advance to segment 2
    }
    set((state) => ({
      phase: "blocked",
      blockSimulated: true,
      segments: state.segments.map((s) =>
        s.id === "s2" ? { ...s, blocked: true, active: false } : s
      ),
      timeline: [
        ...state.timeline,
        {
          id: `block-${Date.now()}`,
          time: makeTimestamp(elapsedSeconds),
          message: "ALERTA: Bloqueo detectado en Córdoba / Rioja — vehículo detenido en carril.",
          type: "warning",
        },
        {
          id: `reroute-${Date.now() + 1}`,
          time: makeTimestamp(elapsedSeconds + 2),
          message: "Recalculando ruta alternativa via Balcarce...",
          type: "info",
        },
      ],
    }));

    setTimeout(() => {
      set((state) => ({
        phase: "rerouted",
        segments: state.segments.map((s) =>
          s.id === "s2alt" ? { ...s, active: true } : s
        ),
        timeline: [
          ...state.timeline,
          {
            id: `rerouted-${Date.now()}`,
            time: makeTimestamp(elapsedSeconds + 4),
            message: "Ruta alternativa activada: Córdoba → Balcarce → San Luis. ETA recalculado.",
            type: "success",
          },
        ],
      }));
    }, 2000);
  },

  resetSimulation: () => {
    set({
      phase: "idle",
      elapsedSeconds: 0,
      currentSegmentIndex: 0,
      intersections: resetIntersections(),
      segments: resetSegments(),
      timeline: [],
      etaHistory: [],
      blockSimulated: false,
    });
  },

  tick: () => {
    const state = get();
    if (state.phase !== "running" && state.phase !== "rerouted") return;

    const elapsed = state.elapsedSeconds + 1;
    const normal = state.phase !== "rerouted";
    const durations = normal ? SEGMENT_DURATIONS : SEGMENT_DURATIONS_ALT;

    // Figure out current segment from elapsed
    let cumulative = 0;
    let segIdx = 0;
    for (let i = 0; i < durations.length; i++) {
      if (elapsed < cumulative + durations[i]) {
        segIdx = i;
        break;
      }
      cumulative += durations[i];
      segIdx = i + 1;
    }

    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const isCompleted = elapsed >= totalDuration;

    // Update intersections state based on how close we are
    const intersections = state.intersections.map((int) => {
      const arrivalTime = durations
        .slice(0, int.segmentIndex + 1)
        .reduce((a, b) => a + b, 0);
      const diff = arrivalTime - elapsed;

      let newState: TrafficLightState = "normal";
      if (diff > 0 && diff <= PREP_LEAD) newState = "preparing";
      else if (diff <= 0 && diff > -2) newState = "traversing";
      else if (diff <= -2 && diff > -5) newState = "recovering";
      else if (diff > PREP_LEAD) newState = "normal";
      else newState = "normal";

      return { ...int, state: newState };
    });

    // Update segments active state
    const segmentIds = normal
      ? ["s0", "s1", "s2", "s3", "s4"]
      : ["s0", "s1", "s2alt", "s4"];
    const segments = state.segments.map((s) => {
      const idx = segmentIds.indexOf(s.id);
      if (idx === -1) return s;
      return { ...s, active: idx === segIdx };
    });

    // ETA
    const remainingSeconds = Math.max(0, totalDuration - elapsed);
    const etaHistory = [
      ...state.etaHistory,
      { t: elapsed, eta: remainingSeconds },
    ];

    // Timeline events for intersections
    const newEvents: TimelineEvent[] = [];
    state.intersections.forEach((int, i) => {
      const prev = int.state;
      const next = intersections[i].state;
      if (prev !== next) {
        const messages: Record<string, string> = {
          preparing: `${int.name}: preparando prioridad para ambulancia.`,
          traversing: `${int.name}: ambulancia atravesando — semáforos en prioridad activa.`,
          recovering: `${int.name}: recuperando operación normal.`,
          normal: `${int.name}: tránsito normal restablecido.`,
        };
        if (messages[next]) {
          newEvents.push({
            id: `${int.id}-${next}-${elapsed}`,
            time: makeTimestamp(elapsed),
            message: messages[next],
            type:
              next === "traversing"
                ? "success"
                : next === "preparing"
                ? "info"
                : "info",
          });
        }
      }
    });

    set({
      elapsedSeconds: elapsed,
      currentSegmentIndex: segIdx,
      intersections,
      segments,
      etaHistory,
      timeline: [...state.timeline, ...newEvents],
      phase: isCompleted ? "completed" : state.phase,
    });

    if (isCompleted && state.phase !== "completed") {
      set((s) => ({
        timeline: [
          ...s.timeline,
          {
            id: `complete-${Date.now()}`,
            time: makeTimestamp(elapsed),
            message: "Ambulancia A-12 llegó a destino. Misión completada exitosamente.",
            type: "success",
          },
        ],
      }));
    }
  },
}));
