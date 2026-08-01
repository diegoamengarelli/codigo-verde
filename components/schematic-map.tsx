"use client";

import { useSimulation } from "@/lib/simulation-store";
import { cn } from "@/lib/utils";
import type { TrafficLightState } from "@/lib/simulation-store";

const LIGHT_COLORS: Record<TrafficLightState, string> = {
  normal: "#6b7280",
  preparing: "#f59e0b",
  priority: "#22c55e",
  traversing: "#22c55e",
  recovering: "#38bdf8",
};

// SVG path for streets connecting nodes
// Points: origin(10,78), int1(30,25), int2(50,25), int3(65,45), int4(65,65), dest(85,75)
// alt: int2(50,25) -> int4(65,65)

export function SchematicMap() {
  const intersections = useSimulation((s) => s.intersections);
  const segments = useSimulation((s) => s.segments);
  const phase = useSimulation((s) => s.phase);

  const pts = {
    origin: { x: 10, y: 78 },
    int1: { x: 30, y: 28 },
    int2: { x: 50, y: 28 },
    int3: { x: 65, y: 48 },
    int4: { x: 65, y: 68 },
    dest: { x: 85, y: 75 },
  };

  const segmentPaths = [
    { id: "s0", from: pts.origin, to: pts.int1 },
    { id: "s1", from: pts.int1, to: pts.int2 },
    { id: "s2", from: pts.int2, to: pts.int3 },
    { id: "s3", from: pts.int3, to: pts.int4 },
    { id: "s4", from: pts.int4, to: pts.dest },
    { id: "s2alt", from: pts.int2, to: pts.int4 },
  ];

  const getSegmentStyle = (segId: string) => {
    const seg = segments.find((s) => s.id === segId);
    if (!seg) return { stroke: "#374151", strokeWidth: 1.5, opacity: 0.4 };
    if (seg.blocked)
      return { stroke: "#ef4444", strokeWidth: 2, opacity: 0.9 };
    if (seg.active)
      return { stroke: "#22c55e", strokeWidth: 2.5, opacity: 1 };
    if (seg.alternative && !seg.blocked)
      return { stroke: "#38bdf8", strokeWidth: 1.5, opacity: 0.5, strokeDasharray: "3 3" };
    return { stroke: "#374151", strokeWidth: 1.5, opacity: 0.5 };
  };

  // Ambulance position: along active segment midpoint
  const activeSeg = segments.find((s) => s.active);
  let ambulancePos = pts.origin;
  if (activeSeg) {
    const path = segmentPaths.find((p) => p.id === activeSeg.id);
    if (path) {
      ambulancePos = {
        x: (path.from.x + path.to.x) / 2,
        y: (path.from.y + path.to.y) / 2,
      };
    }
  }
  if (phase === "completed") ambulancePos = pts.dest;

  return (
    <div className="relative w-full h-full bg-[oklch(0.11_0.01_240)] rounded-lg overflow-hidden border border-border">
      {/* Grid background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {/* Map SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background streets (static grid) */}
        {/* Horizontal streets */}
        {[20, 35, 50, 65, 80].map((y) => (
          <line
            key={`h${y}`}
            x1="5"
            y1={y}
            x2="95"
            y2={y}
            stroke="#1f2937"
            strokeWidth="1"
          />
        ))}
        {/* Vertical streets */}
        {[20, 35, 50, 65, 80].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="5"
            x2={x}
            y2="95"
            stroke="#1f2937"
            strokeWidth="1"
          />
        ))}

        {/* Route segments */}
        {segmentPaths.map((path) => {
          const style = getSegmentStyle(path.id);
          return (
            <line
              key={path.id}
              x1={path.from.x}
              y1={path.from.y}
              x2={path.to.x}
              y2={path.to.y}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              opacity={style.opacity}
              strokeDasharray={(style as any).strokeDasharray}
            />
          );
        })}

        {/* Origin marker */}
        <circle cx={pts.origin.x} cy={pts.origin.y} r={2.5} fill="#6b7280" />
        <text
          x={pts.origin.x}
          y={pts.origin.y - 4}
          textAnchor="middle"
          fontSize="3.5"
          fill="#9ca3af"
          fontFamily="sans-serif"
        >
          HECA
        </text>

        {/* Destination marker */}
        <circle
          cx={pts.dest.x}
          cy={pts.dest.y}
          r={3}
          fill={phase === "completed" ? "#22c55e" : "#374151"}
          stroke={phase === "completed" ? "#22c55e" : "#6b7280"}
          strokeWidth="0.5"
        />
        <text
          x={pts.dest.x}
          y={pts.dest.y - 4}
          textAnchor="middle"
          fontSize="3"
          fill="#9ca3af"
          fontFamily="sans-serif"
        >
          Hosp. Central
        </text>

        {/* Camera icons */}
        {[
          { x: pts.int1.x + 4, y: pts.int1.y - 2, label: "C1" },
          { x: pts.int2.x + 4, y: pts.int2.y - 2, label: "C2" },
          { x: pts.int4.x + 4, y: pts.int4.y + 4, label: "C3" },
        ].map((cam) => (
          <g key={cam.label}>
            <rect
              x={cam.x - 2}
              y={cam.y - 2}
              width="7"
              height="4"
              rx="0.5"
              fill="#1d4ed8"
              opacity="0.6"
            />
            <text
              x={cam.x + 1.5}
              y={cam.y + 1.2}
              textAnchor="middle"
              fontSize="2.5"
              fill="white"
              fontFamily="sans-serif"
            >
              {cam.label}
            </text>
          </g>
        ))}

        {/* Intersection nodes */}
        {intersections.map((int) => {
          const pos =
            pts[int.id.replace("int", "int") as keyof typeof pts] ||
            Object.values(pts)[parseInt(int.id.replace("int", "")) - 1 + 1];
          const pt = [pts.int1, pts.int2, pts.int3, pts.int4][
            parseInt(int.id.replace("int", "")) - 1
          ];
          if (!pt) return null;

          const color = LIGHT_COLORS[int.state];
          const isActive = int.state !== "normal";

          return (
            <g key={int.id}>
              {isActive && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.3"
                  className="animate-ping"
                />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill={color}
                opacity={isActive ? 1 : 0.5}
              />
              <text
                x={pt.x}
                y={pt.y + 7}
                textAnchor="middle"
                fontSize="2.8"
                fill="#d1d5db"
                fontFamily="sans-serif"
              >
                {int.id.replace("int", "I")}
              </text>
            </g>
          );
        })}

        {/* Ambulance dot */}
        {phase !== "idle" && (
          <g>
            <circle
              cx={ambulancePos.x}
              cy={ambulancePos.y}
              r="4"
              fill="none"
              stroke="#22c55e"
              strokeWidth="0.5"
              opacity="0.4"
              className="animate-ping"
            />
            <circle
              cx={ambulancePos.x}
              cy={ambulancePos.y}
              r="2.5"
              fill="#22c55e"
            />
            <text
              x={ambulancePos.x}
              y={ambulancePos.y - 5}
              textAnchor="middle"
              fontSize="3"
              fill="#22c55e"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              A-12
            </text>
          </g>
        )}

        {/* Blocked indicator */}
        {segments.find((s) => s.blocked) && (
          <g>
            <line
              x1={pts.int2.x - 3}
              y1={pts.int2.y + 5}
              x2={pts.int3.x - 3}
              y2={pts.int3.y - 5}
              stroke="#ef4444"
              strokeWidth="1"
            />
            <text
              x={(pts.int2.x + pts.int3.x) / 2 - 6}
              y={(pts.int2.y + pts.int3.y) / 2}
              fontSize="3.5"
              fill="#ef4444"
              fontFamily="sans-serif"
            >
              BLOQ
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(2, 88)">
          <rect width="28" height="10" rx="1" fill="#111827" opacity="0.8" />
          <circle cx="4" cy="5" r="1.5" fill="#22c55e" />
          <text x="7" y="6.5" fontSize="2.5" fill="#9ca3af" fontFamily="sans-serif">
            Ambulancia
          </text>
          <circle cx="18" cy="5" r="1.5" fill="#1d4ed8" opacity="0.8" />
          <text x="21" y="6.5" fontSize="2.5" fill="#9ca3af" fontFamily="sans-serif">
            Cám
          </text>
        </g>
      </svg>

      {/* Corner label */}
      <div className="absolute bottom-1 right-2 text-[9px] text-muted-foreground/40 font-mono">
        ROSARIO · SIM
      </div>
    </div>
  );
}
