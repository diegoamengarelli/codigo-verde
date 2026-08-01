"use client";

import { useEffect, useRef } from "react";
import { useSimulation } from "@/lib/simulation-store";
import type { TrafficLightState } from "@/lib/simulation-store";

// ---------------------------------------------------------------------------
// Coordinates
// ---------------------------------------------------------------------------
const ORIGIN: [number, number] = [-32.9571, -60.6910]; // HECA
const DEST:   [number, number] = [-32.9449, -60.6399]; // Hosp. del Centenario

const INTERSECTIONS: Record<string, [number, number]> = {
  int1: [-32.9467, -60.6634],
  int2: [-32.9448, -60.6529],
  int3: [-32.9439, -60.6474],
  int4: [-32.9430, -60.6432],
};

const SEGMENT_DURATIONS     = [8, 12, 10, 10, 8];  // normal
const SEGMENT_DURATIONS_ALT = [8, 12, 14, 8];       // rerouted

const LIGHT_COLORS: Record<TrafficLightState, string> = {
  normal:     "#4b5563",
  preparing:  "#f59e0b",
  priority:   "#22c55e",
  traversing: "#22c55e",
  recovering: "#38bdf8",
};

// ---------------------------------------------------------------------------
// OSRM helpers
// ---------------------------------------------------------------------------
function toOSRM(pts: [number, number][]): string {
  return pts.map(([lat, lng]) => `${lng},${lat}`).join(";");
}

async function fetchRoute(waypoints: [number, number][]): Promise<[number, number][]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${toOSRM(waypoints)}?overview=full&geometries=geojson`;
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("OSRM error");
  const data = await res.json();
  return data.routes[0].geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  );
}

// ---------------------------------------------------------------------------
// Geometry interpolation
// ---------------------------------------------------------------------------
function totalLength(pts: [number, number][]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dlat = pts[i][0] - pts[i - 1][0];
    const dlng = pts[i][1] - pts[i - 1][1];
    len += Math.sqrt(dlat * dlat + dlng * dlng);
  }
  return len;
}

/** Return the [lat,lng] point that is `fraction` (0–1) along the polyline. */
function interpolate(pts: [number, number][], fraction: number): [number, number] {
  if (!pts.length) return ORIGIN;
  if (fraction <= 0) return pts[0];
  if (fraction >= 1) return pts[pts.length - 1];

  const target = totalLength(pts) * fraction;
  let accumulated = 0;
  for (let i = 1; i < pts.length; i++) {
    const dlat = pts[i][0] - pts[i - 1][0];
    const dlng = pts[i][1] - pts[i - 1][1];
    const seg = Math.sqrt(dlat * dlat + dlng * dlng);
    if (accumulated + seg >= target) {
      const t = (target - accumulated) / seg;
      return [pts[i - 1][0] + dlat * t, pts[i - 1][1] + dlng * t];
    }
    accumulated += seg;
  }
  return pts[pts.length - 1];
}

/** Slice the first `fraction` of a polyline and return it. */
function sliceGeom(pts: [number, number][], fraction: number): [number, number][] {
  if (!pts.length || fraction <= 0) return [];
  if (fraction >= 1) return pts;
  const target = totalLength(pts) * fraction;
  let accumulated = 0;
  for (let i = 1; i < pts.length; i++) {
    const dlat = pts[i][0] - pts[i - 1][0];
    const dlng = pts[i][1] - pts[i - 1][1];
    const seg = Math.sqrt(dlat * dlat + dlng * dlng);
    if (accumulated + seg >= target) {
      const t = (target - accumulated) / seg;
      const midPt: [number, number] = [pts[i - 1][0] + dlat * t, pts[i - 1][1] + dlng * t];
      return [...pts.slice(0, i), midPt];
    }
    accumulated += seg;
  }
  return pts;
}

/** Compute how far along [0,1] the ambulance is given elapsed seconds and a segment schedule. */
function missionFraction(elapsed: number, durations: number[]): number {
  const total = durations.reduce((a, b) => a + b, 0);
  return Math.min(elapsed / total, 1);
}

// ---------------------------------------------------------------------------
export function RealMap() {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef      = useRef<Record<string, any>>({});
  const rafRef         = useRef<number | null>(null);
  // Track elapsed at last tick for smooth interpolation
  const lastTickRef    = useRef<{ elapsed: number; ts: number }>({ elapsed: 0, ts: 0 });

  const intersections = useSimulation((s) => s.intersections);
  const segments      = useSimulation((s) => s.segments);
  const phase         = useSimulation((s) => s.phase);
  const elapsed       = useSimulation((s) => s.elapsedSeconds);

  // -------------------------------------------------------------------------
  // Map init
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;
    const container = mapRef.current;

    import("leaflet").then(async (L) => {
      if (!container || (container as any)._leaflet_id) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(container, {
        center: [-32.948, -60.666],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;

      // CSS for pulsing rings and tooltips
      const style = document.createElement("style");
      style.textContent = `
        .map-tt       { background:#111827!important; border:1px solid #374151!important; color:#d1d5db!important; font-size:11px; padding:2px 6px; border-radius:4px; box-shadow:none!important; }
        .map-tt-green { background:#052e16!important; border:1px solid #22c55e!important; color:#22c55e!important; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; }
        .leaflet-tooltip-left::before  { border-left-color:#374151!important; }
        .leaflet-tooltip-right::before { border-right-color:#374151!important; }
        .leaflet-tooltip-top::before   { border-top-color:#374151!important; }
        .leaflet-attribution-flag { display:none!important; }
        .leaflet-control-attribution { font-size:9px!important; background:rgba(0,0,0,.5)!important; color:#6b7280!important; }
        .leaflet-control-attribution a { color:#6b7280!important; }

        /* Ambulance pulse */
        @keyframes amb-beat {
          0%,100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(34,197,94,.7), 0 0 8px rgba(34,197,94,.6); }
          50%     { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(34,197,94,0), 0 0 20px rgba(34,197,94,.8); }
        }
        .amb-dot { animation: amb-beat 1.2s ease-in-out infinite; }

        /* Intersection ring pulse */
        @keyframes int-ring {
          0%   { transform: scale(1);   opacity: .9; }
          70%  { transform: scale(2.4); opacity: 0;  }
          100% { transform: scale(2.4); opacity: 0;  }
        }
        .int-ring { animation: int-ring 1.4s ease-out infinite; }

        /* Traversing flash */
        @keyframes int-flash {
          0%,100% { opacity: 1; }
          50%     { opacity: .4; }
        }
        .int-flash { animation: int-flash .6s ease-in-out infinite; }

        /* Route dash animation */
        @keyframes dash-flow {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0; }
        }
      `;
      document.head.appendChild(style);

      // ---- ORIGIN & DEST markers ------------------------------------------
      const pinIcon = (color: string, label: string) => L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.5);box-shadow:0 0 6px ${color}"></div>
        </div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: "",
      });

      L.marker(ORIGIN, { icon: pinIcon("#9ca3af", "HECA") })
        .addTo(map)
        .bindTooltip("HECA", { permanent: true, direction: "left", className: "map-tt" });

      layersRef.current.destMarker = L.marker(DEST, { icon: pinIcon("#9ca3af", "Hosp. Centenario") })
        .addTo(map)
        .bindTooltip("Hosp. Centenario", { permanent: true, direction: "right", className: "map-tt" });

      // ---- Camera badges ---------------------------------------------------
      [
        { id: "C1", latlng: INTERSECTIONS.int1 },
        { id: "C2", latlng: INTERSECTIONS.int2 },
        { id: "C3", latlng: INTERSECTIONS.int4 },
      ].forEach(({ id, latlng }) => {
        L.marker(latlng as [number, number], {
          icon: L.divIcon({
            html: `<div style="background:#1d4ed8;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;opacity:.85">${id}</div>`,
            iconSize: [26, 16], iconAnchor: [13, 8], className: "",
          }),
          zIndexOffset: 200,
        }).addTo(map);
      });

      // ---- Route polylines -------------------------------------------------
      layersRef.current.greyLine = L.polyline(
        [ORIGIN, ...Object.values(INTERSECTIONS), DEST] as [number, number][],
        { color: "#374151", weight: 5, opacity: 0.7 }
      ).addTo(map);

      layersRef.current.greenLine = L.polyline([], {
        color: "#22c55e", weight: 5, opacity: 0.95,
      }).addTo(map);

      layersRef.current.altGreyLine = L.polyline([], {
        color: "#374151", weight: 5, opacity: 0.7, dashArray: "10 6",
      }).addTo(map);

      layersRef.current.altGreenLine = L.polyline([], {
        color: "#38bdf8", weight: 5, opacity: 0, dashArray: "10 6",
      }).addTo(map);

      layersRef.current.blockedLine = L.polyline(
        [INTERSECTIONS.int2, INTERSECTIONS.int3],
        { color: "#ef4444", weight: 5, opacity: 0, dashArray: "5 5" }
      ).addTo(map);

      // ---- Intersection markers (div icons so we can animate in CSS) -------
      layersRef.current.intMarkers = {} as Record<string, any>;
      Object.entries(INTERSECTIONS).forEach(([id, latlng]) => {
        const icon = L.divIcon({
          html: intIconHtml("#4b5563", false, false),
          iconSize: [24, 24], iconAnchor: [12, 12], className: "",
        });
        const m = L.marker(latlng as [number, number], { icon, zIndexOffset: 500 }).addTo(map);
        layersRef.current.intMarkers[id] = m;
      });

      // ---- Ambulance marker ------------------------------------------------
      layersRef.current.ambulance = L.marker(ORIGIN, {
        icon: L.divIcon({
          html: `<div class="amb-dot" style="width:18px;height:18px;border-radius:50%;background:#22c55e;border:2.5px solid #fff"></div>`,
          iconSize: [18, 18], iconAnchor: [9, 9], className: "",
        }),
        opacity: 0,
        zIndexOffset: 1000,
      }).addTo(map)
        .bindTooltip("A-12", { permanent: true, direction: "top", className: "map-tt-green" });

      // ---- Fetch OSRM routes -----------------------------------------------
      const mainWpts: [number, number][] = [ORIGIN, INTERSECTIONS.int1, INTERSECTIONS.int2, INTERSECTIONS.int3, INTERSECTIONS.int4, DEST];
      const altWpts:  [number, number][] = [ORIGIN, INTERSECTIONS.int1, INTERSECTIONS.int2, INTERSECTIONS.int4, DEST];

      try {
        const [mainCoords, altCoords] = await Promise.all([
          fetchRoute(mainWpts),
          fetchRoute(altWpts),
        ]);
        layersRef.current.mainGeom = mainCoords;
        layersRef.current.altGeom  = altCoords;
        layersRef.current.greyLine.setLatLngs(mainCoords);

        map.fitBounds(L.polyline(mainCoords).getBounds(), {
          paddingTopLeft: [60, 40], paddingBottomRight: [60, 40], maxZoom: 15,
        });
      } catch {
        // Keep straight-line fallback
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) delete (mapRef.current as any)._leaflet_id;
    };
  }, []);

  // -------------------------------------------------------------------------
  // rAF animation loop — runs independently of the 1-second tick
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const isRunning = phase === "running" || phase === "rerouted" || phase === "completed";
    const isRerouted = phase === "rerouted";
    const durations = isRerouted ? SEGMENT_DURATIONS_ALT : SEGMENT_DURATIONS;
    const totalDur  = durations.reduce((a, b) => a + b, 0);

    if (!isRunning || !mapInstanceRef.current) return;

    // Snapshot the tick time to interpolate between ticks
    lastTickRef.current = { elapsed, ts: performance.now() };

    function frame(now: number) {
      if (!mapInstanceRef.current) return;
      const { elapsed: tickElapsed, ts: tickTs } = lastTickRef.current;
      // Interpolate: add sub-second progress since the last store tick
      const subSecond  = (now - tickTs) / 1000;
      const smoothElapsed = Math.min(tickElapsed + subSecond, totalDur);
      const frac = smoothElapsed / totalDur;

      const mainGeom: [number, number][] = layersRef.current.mainGeom ?? [];
      const altGeom:  [number, number][] = layersRef.current.altGeom  ?? [];
      const geom = isRerouted ? altGeom : mainGeom;

      if (geom.length) {
        // Smooth ambulance position
        const pos = interpolate(geom, frac);
        layersRef.current.ambulance?.setLatLng(pos);

        // Smooth green progress line
        const sliced = sliceGeom(geom, frac);
        layersRef.current.greenLine?.setLatLngs(sliced);

        if (isRerouted && altGeom.length) {
          const altSliced = sliceGeom(altGeom, frac);
          layersRef.current.altGreenLine?.setLatLngs(altSliced);
          layersRef.current.altGreenLine?.setStyle({ opacity: 0.85 });
          layersRef.current.greyLine?.setStyle({ opacity: 0.15 });
          layersRef.current.greenLine?.setLatLngs([]);
        } else {
          layersRef.current.altGreenLine?.setStyle({ opacity: 0 });
        }
      }

      if (phase !== "completed") {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Final state: full green line
        if (geom.length) {
          layersRef.current.greenLine?.setLatLngs(geom);
          layersRef.current.ambulance?.setLatLng(DEST);
        }
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, elapsed]);

  // -------------------------------------------------------------------------
  // Sync tick: update elapsed reference + intersection + static state changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Update the tick reference so the rAF loop sub-second interpolation resets
    lastTickRef.current = { elapsed, ts: performance.now() };

    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const isRunning  = phase === "running" || phase === "rerouted" || phase === "completed";
      const isRerouted = phase === "rerouted";
      const isBlocked  = !!segments.find((s) => s.id === "s2" && s.blocked);

      // Ambulance visibility
      layersRef.current.ambulance?.setOpacity(isRunning ? 1 : 0);

      // Intersection icons — animated via CSS classes
      intersections.forEach((int) => {
        const m = layersRef.current.intMarkers?.[int.id];
        if (!m) return;
        const isPreparing   = int.state === "preparing";
        const isTraversing  = int.state === "traversing";
        const html = intIconHtml(LIGHT_COLORS[int.state], isPreparing, isTraversing);
        m.setIcon(L.divIcon({ html, iconSize: [24, 24], iconAnchor: [12, 12], className: "" }));
      });

      // Blocked segment overlay
      layersRef.current.blockedLine?.setStyle({ opacity: isBlocked ? 0.9 : 0 });

      // Alt route grey base
      if (isRerouted) {
        const altGeom: [number, number][] = layersRef.current.altGeom ?? [];
        if (altGeom.length) layersRef.current.altGreyLine?.setLatLngs(altGeom);
        layersRef.current.altGreyLine?.setStyle({ opacity: 0.5 });
      } else {
        layersRef.current.altGreyLine?.setStyle({ opacity: 0 });
      }

      // Dest marker turns green on completion
      if (phase === "completed") {
        layersRef.current.destMarker?.setIcon(L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 0 10px #22c55e"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6], className: "",
        }));
      }

      // Reset on idle
      if (phase === "idle") {
        layersRef.current.greenLine?.setLatLngs([]);
        layersRef.current.altGreenLine?.setLatLngs([]);
        layersRef.current.altGreyLine?.setStyle({ opacity: 0 });
        layersRef.current.blockedLine?.setStyle({ opacity: 0 });
        layersRef.current.greyLine?.setStyle({ opacity: 0.7 });
        const mainGeom: [number, number][] = layersRef.current.mainGeom ?? [];
        if (mainGeom.length) layersRef.current.greyLine?.setLatLngs(mainGeom);
      }
    });
  }, [intersections, segments, phase, elapsed]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 border border-border rounded-md px-3 py-2 text-xs space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <span className="text-muted-foreground">Ambulancia</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
          <span className="text-muted-foreground">Preparando</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-400 shrink-0" />
          <span className="text-muted-foreground">Recuperando</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 bg-red-500 shrink-0" />
          <span className="text-muted-foreground">Bloqueado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 border-t-2 border-dashed border-sky-400 shrink-0" />
          <span className="text-muted-foreground">Ruta alt.</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build the intersection icon HTML with optional ring + flash animations
// ---------------------------------------------------------------------------
function intIconHtml(color: string, ring: boolean, flash: boolean): string {
  const ringHtml = ring
    ? `<div class="int-ring" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.5"></div>`
    : "";
  const flashClass = flash ? " int-flash" : "";
  return `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center">
    ${ringHtml}
    <div class="${flashClass}" style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.5);box-shadow:0 0 8px ${color};position:relative;z-index:1"></div>
  </div>`;
}
