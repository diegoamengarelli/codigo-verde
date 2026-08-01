"use client";

import { useEffect, useRef } from "react";
import { useSimulation } from "@/lib/simulation-store";
import type { TrafficLightState } from "@/lib/simulation-store";

// ---------------------------------------------------------------------------
// Coordinates
// ---------------------------------------------------------------------------
// Mission runs FROM Hospital del Centenario TO HECA (the emergency hospital).
const ORIGIN: [number, number] = [-32.9381, -60.6649]; // Hosp. del Centenario (Urquiza 3101)
const DEST:   [number, number] = [-32.9523, -60.6698]; // HECA (Pellegrini 3205)

// Intersections interpolated along the real Centenario -> HECA corridor
const INTERSECTIONS: Record<string, [number, number]> = {
  int1: [-32.9409, -60.6659],
  int2: [-32.9438, -60.6669],
  int3: [-32.9466, -60.6678],
  int4: [-32.9494, -60.6688],
};

const SEGMENT_DURATIONS     = [8, 12, 10, 10, 8]; // normal  -> total 48
const SEGMENT_DURATIONS_ALT = [8, 12, 14, 8];     // rerouted -> total 42

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
// Geometry interpolation (with cached cumulative lengths)
// ---------------------------------------------------------------------------
interface GeomCache {
  cum: number[];   // cumulative distance at each vertex
  total: number;
}

const geomCacheStore = new WeakMap<[number, number][], GeomCache>();

function getCache(pts: [number, number][]): GeomCache {
  const hit = geomCacheStore.get(pts);
  if (hit) return hit;
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dlat = pts[i][0] - pts[i - 1][0];
    const dlng = pts[i][1] - pts[i - 1][1];
    cum[i] = cum[i - 1] + Math.sqrt(dlat * dlat + dlng * dlng);
  }
  const cache = { cum, total: cum[cum.length - 1] || 0 };
  geomCacheStore.set(pts, cache);
  return cache;
}

/** Point that is `fraction` (0-1) along the polyline. */
function interpolate(pts: [number, number][], fraction: number): [number, number] {
  if (!pts.length) return ORIGIN;
  if (fraction <= 0) return pts[0];
  if (fraction >= 1) return pts[pts.length - 1];

  const { cum, total } = getCache(pts);
  const target = total * fraction;
  // binary search for the segment containing `target`
  let lo = 1, hi = pts.length - 1, idx = pts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] >= target) { idx = mid; hi = mid - 1; } else { lo = mid + 1; }
  }
  const segStart = cum[idx - 1];
  const seg = cum[idx] - segStart || 1;
  const t = (target - segStart) / seg;
  const dlat = pts[idx][0] - pts[idx - 1][0];
  const dlng = pts[idx][1] - pts[idx - 1][1];
  return [pts[idx - 1][0] + dlat * t, pts[idx - 1][1] + dlng * t];
}

/** First `fraction` of a polyline as a new polyline. */
function sliceGeom(pts: [number, number][], fraction: number): [number, number][] {
  if (!pts.length || fraction <= 0) return [];
  if (fraction >= 1) return pts;
  const { cum, total } = getCache(pts);
  const target = total * fraction;
  let idx = 1;
  while (idx < pts.length && cum[idx] < target) idx++;
  const segStart = cum[idx - 1];
  const seg = cum[idx] - segStart || 1;
  const t = (target - segStart) / seg;
  const dlat = pts[idx][0] - pts[idx - 1][0];
  const dlng = pts[idx][1] - pts[idx - 1][1];
  const midPt: [number, number] = [pts[idx - 1][0] + dlat * t, pts[idx - 1][1] + dlng * t];
  return [...pts.slice(0, idx), midPt];
}

/** Fraction along `pts` of the vertex closest to `target`. */
function fractionAt(pts: [number, number][], target: [number, number]): number {
  if (!pts.length) return 0;
  const { cum, total } = getCache(pts);
  let best = 0, bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const dlat = pts[i][0] - target[0];
    const dlng = pts[i][1] - target[1];
    const d = dlat * dlat + dlng * dlng;
    if (d < bestD) { bestD = d; best = i; }
  }
  return total ? cum[best] / total : 0;
}

// ---------------------------------------------------------------------------
export function RealMap() {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef      = useRef<Record<string, any>>({});
  const rafRef         = useRef<number | null>(null);

  // Motion state, driven by the store tick but rendered every frame
  const elapsedRef     = useRef(0);         // last store elapsed (seconds)
  const tickTsRef      = useRef(0);         // performance.now() at last tick
  const renderPosRef   = useRef<[number, number]>(ORIGIN); // eased marker position
  const reroutedRef    = useRef(false);     // has the mission rerouted?
  const blockFracRef   = useRef(0);         // frozen frac of main route at block
  const prevPhaseRef   = useRef<string>("idle");

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

      // CSS for pulsing rings and tooltips (guard against duplicate injection)
      if (!document.getElementById("real-map-styles")) {
        const style = document.createElement("style");
        style.id = "real-map-styles";
        style.textContent = `
          .map-tt       { background:#111827!important; border:1px solid #374151!important; color:#d1d5db!important; font-size:11px; padding:2px 6px; border-radius:4px; box-shadow:none!important; }
          .map-tt-green { background:#052e16!important; border:1px solid #22c55e!important; color:#22c55e!important; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; }
          .map-tt-blue  { background:#082f49!important; border:1px solid #38bdf8!important; color:#38bdf8!important; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; }
          .leaflet-tooltip-left::before  { border-left-color:#374151!important; }
          .leaflet-tooltip-right::before { border-right-color:#374151!important; }
          .leaflet-tooltip-top::before   { border-top-color:#374151!important; }
          .leaflet-attribution-flag { display:none!important; }
          .leaflet-control-attribution { font-size:9px!important; background:rgba(0,0,0,.5)!important; color:#6b7280!important; }
          .leaflet-control-attribution a { color:#6b7280!important; }

          @keyframes amb-beat {
            0%,100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(34,197,94,.7), 0 0 8px rgba(34,197,94,.6); }
            50%     { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(34,197,94,0), 0 0 20px rgba(34,197,94,.8); }
          }
          .amb-dot { animation: amb-beat 1.2s ease-in-out infinite; }

          @keyframes int-ring {
            0%   { transform: scale(1);   opacity: .9; }
            70%  { transform: scale(2.4); opacity: 0;  }
            100% { transform: scale(2.4); opacity: 0;  }
          }
          .int-ring { animation: int-ring 1.4s ease-out infinite; }

          @keyframes int-flash {
            0%,100% { opacity: 1; }
            50%     { opacity: .4; }
          }
          .int-flash { animation: int-flash .6s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
      }

      // ---- ORIGIN & DEST markers ------------------------------------------
      const pinIcon = (color: string) => L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.5);box-shadow:0 0 6px ${color}"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: "",
      });

      L.marker(ORIGIN, { icon: pinIcon("#9ca3af") })
        .addTo(map)
        .bindTooltip("Hosp. Centenario", { permanent: true, direction: "right", className: "map-tt" });

      layersRef.current.destMarker = L.marker(DEST, { icon: pinIcon("#9ca3af") })
        .addTo(map)
        .bindTooltip("HECA", { permanent: true, direction: "left", className: "map-tt" });

      // ---- Camera badges ---------------------------------------------------
      [
        { id: "C1", latlng: INTERSECTIONS.int1 },
        { id: "C2", latlng: INTERSECTIONS.int2 },
        { id: "C3", latlng: INTERSECTIONS.int4 },
      ].forEach(({ id, latlng }) => {
        L.marker(latlng as [number, number], {
          icon: L.divIcon({
            html: `<div style="background:#1d4ed8;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;opacity:.85">${id}</div>`,
            iconSize: [26, 16], iconAnchor: [13, -6], className: "",
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
        color: "#374151", weight: 5, opacity: 0, dashArray: "10 6",
      }).addTo(map);

      layersRef.current.altGreenLine = L.polyline([], {
        color: "#38bdf8", weight: 5, opacity: 0, dashArray: "10 6",
      }).addTo(map);

      layersRef.current.blockedLine = L.polyline(
        [INTERSECTIONS.int2, INTERSECTIONS.int3],
        { color: "#ef4444", weight: 5, opacity: 0, dashArray: "5 5" }
      ).addTo(map);

      // ---- Intersection markers -------------------------------------------
      layersRef.current.intMarkers = {} as Record<string, any>;
      Object.entries(INTERSECTIONS).forEach(([id, latlng]) => {
        const m = L.marker(latlng as [number, number], {
          icon: L.divIcon({ html: intIconHtml("#4b5563", false, false), iconSize: [24, 24], iconAnchor: [12, 12], className: "" }),
          zIndexOffset: 500,
        }).addTo(map);
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
        renderPosRef.current = mainCoords[0] ?? ORIGIN;

        map.fitBounds(L.polyline(mainCoords).getBounds(), {
          paddingTopLeft: [60, 40], paddingBottomRight: [60, 40], maxZoom: 15,
        });
      } catch {
        // keep straight-line fallback
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
  // Single continuous rAF loop, keyed only on phase (no per-tick restart)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!mapInstanceRef.current) return;

    const running = phase === "running" || phase === "blocked" || phase === "rerouted" || phase === "completed";
    if (!running) return;

    function frame(now: number) {
      if (!mapInstanceRef.current) return;

      const rerouted  = reroutedRef.current;
      const durations = rerouted ? SEGMENT_DURATIONS_ALT : SEGMENT_DURATIONS;
      const total     = durations.reduce((a, b) => a + b, 0);
      const geom: [number, number][] = (rerouted ? layersRef.current.altGeom : layersRef.current.mainGeom) ?? [];

      // constant-velocity target using sub-second interpolation between ticks
      const sub  = phase === "blocked" ? 0 : (now - tickTsRef.current) / 1000;
      const frac = Math.min((elapsedRef.current + sub) / total, 1);

      if (geom.length) {
        const target = interpolate(geom, frac);
        // ease marker toward target in world space -> absorbs reroute jump
        const rp = renderPosRef.current;
        const k  = 0.28;
        rp[0] += (target[0] - rp[0]) * k;
        rp[1] += (target[1] - rp[1]) * k;
        layersRef.current.ambulance?.setLatLng(rp);

        if (rerouted) {
          // keep the traveled main portion frozen (green), grow alt (blue) on top
          layersRef.current.altGreenLine?.setLatLngs(sliceGeom(geom, frac));
        } else {
          layersRef.current.greenLine?.setLatLngs(sliceGeom(geom, frac));
        }
      }

      if (phase === "completed") {
        // settle exactly onto the destination
        if (geom.length) {
          renderPosRef.current = [...geom[geom.length - 1]] as [number, number];
          layersRef.current.ambulance?.setLatLng(renderPosRef.current);
          if (rerouted) layersRef.current.altGreenLine?.setLatLngs(geom);
          else layersRef.current.greenLine?.setLatLngs(geom);
        }
        return; // stop looping once completed
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // -------------------------------------------------------------------------
  // Store tick sync: update motion refs + intersection / route state
  // -------------------------------------------------------------------------
  useEffect(() => {
    elapsedRef.current = elapsed;
    tickTsRef.current  = performance.now();

    if (!mapInstanceRef.current) return;

    const prevPhase = prevPhaseRef.current;

    // Capture the frozen main-route fraction at the moment the block happens
    if ((phase === "blocked" || phase === "rerouted") && prevPhase !== "blocked" && prevPhase !== "rerouted") {
      const mainGeom: [number, number][] = layersRef.current.mainGeom ?? [];
      blockFracRef.current = mainGeom.length ? fractionAt(mainGeom, INTERSECTIONS.int2) : 0;
    }
    if (phase === "rerouted") reroutedRef.current = true;
    if (phase === "idle") { reroutedRef.current = false; renderPosRef.current = [...ORIGIN]; }
    if (phase === "running" && prevPhase === "idle") { reroutedRef.current = false; renderPosRef.current = [...ORIGIN]; }
    prevPhaseRef.current = phase;

    import("leaflet").then((L) => {
      const isRunning = phase === "running" || phase === "blocked" || phase === "rerouted" || phase === "completed";
      const isRerouted = reroutedRef.current;
      const isBlocked  = !!segments.find((s) => s.id === "s2" && s.blocked);

      layersRef.current.ambulance?.setOpacity(isRunning ? 1 : 0);

      // Ambulance tooltip reflects route
      const tip = layersRef.current.ambulance?.getTooltip?.();
      if (tip) {
        tip.setContent("A-12");
        const el = tip.getElement?.();
        if (el) el.className = `leaflet-tooltip leaflet-tooltip-top ${isRerouted ? "map-tt-blue" : "map-tt-green"}`;
      }

      // Intersection icons
      intersections.forEach((int) => {
        const m = layersRef.current.intMarkers?.[int.id];
        if (!m) return;
        const html = intIconHtml(LIGHT_COLORS[int.state], int.state === "preparing", int.state === "traversing");
        m.setIcon(L.divIcon({ html, iconSize: [24, 24], iconAnchor: [12, 12], className: "" }));
      });

      // Blocked segment overlay
      layersRef.current.blockedLine?.setStyle({ opacity: isBlocked ? 0.9 : 0 });

      if (isRerouted) {
        const mainGeom: [number, number][] = layersRef.current.mainGeom ?? [];
        const altGeom:  [number, number][] = layersRef.current.altGeom ?? [];
        // freeze the already-traveled main portion in green
        if (mainGeom.length) layersRef.current.greenLine?.setLatLngs(sliceGeom(mainGeom, blockFracRef.current));
        // show the alt base route dashed
        if (altGeom.length) layersRef.current.altGreyLine?.setLatLngs(altGeom);
        layersRef.current.altGreyLine?.setStyle({ opacity: 0.5 });
        layersRef.current.altGreenLine?.setStyle({ opacity: 0.9 });
        layersRef.current.greyLine?.setStyle({ opacity: 0.15 });
      } else {
        layersRef.current.altGreyLine?.setStyle({ opacity: 0 });
        layersRef.current.altGreenLine?.setStyle({ opacity: 0 });
      }

      // Dest marker turns green/blue on completion
      if (phase === "completed") {
        const c = isRerouted ? "#38bdf8" : "#22c55e";
        layersRef.current.destMarker?.setIcon(L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${c};border:2px solid #fff;box-shadow:0 0 10px ${c}"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6], className: "",
        }));
      }

      // Full reset on idle
      if (phase === "idle") {
        layersRef.current.greenLine?.setLatLngs([]);
        layersRef.current.altGreenLine?.setLatLngs([]);
        layersRef.current.altGreyLine?.setStyle({ opacity: 0 });
        layersRef.current.blockedLine?.setStyle({ opacity: 0 });
        layersRef.current.greyLine?.setStyle({ opacity: 0.7 });
        const mainGeom: [number, number][] = layersRef.current.mainGeom ?? [];
        if (mainGeom.length) {
          layersRef.current.greyLine?.setLatLngs(mainGeom);
          layersRef.current.ambulance?.setLatLng(mainGeom[0]);
        }
        layersRef.current.destMarker?.setIcon(L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#9ca3af;border:2px solid rgba(255,255,255,.5);box-shadow:0 0 6px #9ca3af"></div>`,
          iconSize: [10, 10], iconAnchor: [5, 5], className: "",
        }));
      }
    });
  }, [intersections, segments, phase, elapsed]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" aria-label="Mapa de la ruta de la ambulancia en Rosario" role="application" />

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
// Intersection icon HTML with optional ring + flash animations
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
