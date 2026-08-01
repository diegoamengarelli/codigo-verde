"use client";

import { useEffect, useRef } from "react";
import { useSimulation } from "@/lib/simulation-store";
import type { TrafficLightState } from "@/lib/simulation-store";

// ---------------------------------------------------------------------------
// Real Rosario coordinates
// Origin:      HECA — Hospital de Emergencias Clemente Alvarez
// Destination: Hospital Provincial del Centenario
// Route along: Av. Pellegrini → Bv. Oroño → Córdoba → Laprida → Urquiza
// ---------------------------------------------------------------------------

const ORIGIN:      [number, number] = [-32.9571, -60.6910]; // HECA
const DEST:        [number, number] = [-32.9449, -60.6399]; // Hosp. del Centenario

// Real street intersections along the route (lat, lng)
const INTERSECTIONS: Record<string, [number, number]> = {
  int1: [-32.9467, -60.6634], // Bv. Oroño & Av. Córdoba
  int2: [-32.9448, -60.6529], // Av. Córdoba & Laprida
  int3: [-32.9439, -60.6474], // Laprida & San Luis
  int4: [-32.9430, -60.6432], // San Luis & Pellegrini
};

// OSRM coordinate string helper  (OSRM expects lng,lat)
function toOSRM(pts: [number, number][]): string {
  return pts.map(([lat, lng]) => `${lng},${lat}`).join(";");
}

// Fetch a route geometry (GeoJSON coords [lng,lat]) from the public OSRM API
async function fetchRoute(waypoints: [number, number][]): Promise<[number, number][]> {
  const coords = toOSRM(waypoints);
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("OSRM error");
  const data = await res.json();
  // OSRM returns [lng, lat] — flip to [lat, lng] for Leaflet
  return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
}

const LIGHT_COLORS: Record<TrafficLightState, string> = {
  normal:     "#6b7280",
  preparing:  "#f59e0b",
  priority:   "#22c55e",
  traversing: "#22c55e",
  recovering: "#38bdf8",
};

// ---------------------------------------------------------------------------
// Determine ambulance position based on active segment progress
// ---------------------------------------------------------------------------
function getAmbulancePosition(
  segments: ReturnType<typeof useSimulation.getState>["segments"],
  phase: string
): [number, number] {
  if (phase === "completed") return DEST;
  if (phase === "idle")      return ORIGIN;
  const active = segments.find((s) => s.active);
  if (!active) return ORIGIN;

  const segMid: Record<string, [number, number]> = {
    s0:    midpoint(ORIGIN,               INTERSECTIONS.int1),
    s1:    midpoint(INTERSECTIONS.int1,   INTERSECTIONS.int2),
    s2:    midpoint(INTERSECTIONS.int2,   INTERSECTIONS.int3),
    s3:    midpoint(INTERSECTIONS.int3,   INTERSECTIONS.int4),
    s4:    midpoint(INTERSECTIONS.int4,   DEST),
    s2alt: midpoint(INTERSECTIONS.int2,   INTERSECTIONS.int4),
  };
  return segMid[active.id] ?? ORIGIN;
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// ---------------------------------------------------------------------------
export function RealMap() {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef     = useRef<Record<string, any>>({});

  const intersections = useSimulation((s) => s.intersections);
  const segments      = useSimulation((s) => s.segments);
  const phase         = useSimulation((s) => s.phase);

  // -------------------------------------------------------------------------
  // Initialize map + fetch real routes from OSRM
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    // Capture the node synchronously so the async body can detect stale mounts.
    // StrictMode unmounts+remounts; by the time the Promise resolves the node
    // may have been cleaned up already — guard against that below.
    const container = mapRef.current;

    import("leaflet").then(async (L) => {
      // Abort if the component unmounted while the dynamic import was in flight.
      if (!container || (container as any)._leaflet_id) return;

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-32.948, -60.666],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;

      // ---- Inject tooltip + animation CSS -----------------------------------
      const style = document.createElement("style");
      style.textContent = `
        .map-tt       { background:#111827!important; border:1px solid #374151!important; color:#d1d5db!important; font-size:11px; padding:2px 6px; border-radius:4px; box-shadow:none!important; }
        .map-tt-green { background:#052e16!important; border:1px solid #22c55e!important; color:#22c55e!important; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px; box-shadow:none!important; }
        .leaflet-tooltip-left::before  { border-left-color:#374151!important; }
        .leaflet-tooltip-right::before { border-right-color:#374151!important; }
        .leaflet-tooltip-top::before   { border-top-color:#374151!important; }
        .leaflet-attribution-flag { display:none!important; }
        .leaflet-control-attribution { font-size:9px!important; background:rgba(0,0,0,.5)!important; color:#6b7280!important; }
        .leaflet-control-attribution a { color:#6b7280!important; }
        @keyframes amb-pulse { 0%,100%{box-shadow:0 0 6px #22c55e} 50%{box-shadow:0 0 18px #22c55e,0 0 32px #22c55e} }
      `;
      document.head.appendChild(style);

      // ---- Static markers ---------------------------------------------------
      const dotIcon = (color: string, size = 12) => L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,.4);box-shadow:0 0 6px ${color}"></div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "",
      });

      L.marker(ORIGIN, { icon: dotIcon("#6b7280") })
        .addTo(map)
        .bindTooltip("HECA", { permanent: true, direction: "left", className: "map-tt" });

      layersRef.current.destMarker = L.marker(DEST, { icon: dotIcon("#6b7280") })
        .addTo(map)
        .bindTooltip("Hosp. Centenario", { permanent: true, direction: "right", className: "map-tt" });

      // Camera badges at int1, int2, int4
      [
        { id: "C1", latlng: INTERSECTIONS.int1 },
        { id: "C2", latlng: INTERSECTIONS.int2 },
        { id: "C3", latlng: INTERSECTIONS.int4 },
      ].forEach(({ id, latlng }) => {
        const icon = L.divIcon({
          html: `<div style="background:#1d4ed8;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;opacity:.85;white-space:nowrap">${id}</div>`,
          iconSize: [26, 16], iconAnchor: [13, 8], className: "",
        });
        L.marker(latlng as [number, number], { icon }).addTo(map);
      });

      // ---- Base route polylines (grey placeholder while fetching) -----------
      layersRef.current.mainRouteLine = L.polyline(
        [ORIGIN, ...Object.values(INTERSECTIONS), DEST] as [number,number][],
        { color: "#4b5563", weight: 5, opacity: 0.8 }
      ).addTo(map);

      layersRef.current.altRouteLine = L.polyline([], {
        color: "#38bdf8", weight: 4, opacity: 0, dashArray: "10 6",
      }).addTo(map);

      layersRef.current.activeRouteLine = L.polyline([], {
        color: "#22c55e", weight: 5, opacity: 0.9,
      }).addTo(map);

      layersRef.current.blockedLine = L.polyline(
        [INTERSECTIONS.int2, INTERSECTIONS.int3],
        { color: "#ef4444", weight: 5, opacity: 0, dashArray: "5 5" }
      ).addTo(map);

      // ---- Intersection circles ---------------------------------------------
      layersRef.current.intCircles = {} as Record<string, any>;
      Object.entries(INTERSECTIONS).forEach(([id, latlng]) => {
        layersRef.current.intCircles[id] = L.circleMarker(latlng as [number, number], {
          radius: 9, fillColor: "#6b7280", fillOpacity: 0.8,
          color: "#9ca3af", weight: 1.5,
        }).addTo(map);
      });

      // ---- Ambulance marker -------------------------------------------------
      layersRef.current.ambulance = L.marker(ORIGIN, {
        icon: L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:2px solid #fff;animation:amb-pulse 1.5s infinite"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8], className: "",
        }),
        opacity: 0,
        zIndexOffset: 1000,
      }).addTo(map)
        .bindTooltip("A-12", { permanent: true, direction: "top", className: "map-tt-green" });

      // ---- Fetch real street routes from OSRM (fire & forget) ---------------
      const mainWaypoints: [number, number][] = [
        ORIGIN,
        INTERSECTIONS.int1,
        INTERSECTIONS.int2,
        INTERSECTIONS.int3,
        INTERSECTIONS.int4,
        DEST,
      ];
      const altWaypoints: [number, number][] = [
        ORIGIN,
        INTERSECTIONS.int1,
        INTERSECTIONS.int2,
        INTERSECTIONS.int4,
        DEST,
      ];

      try {
        const [mainCoords, altCoords] = await Promise.all([
          fetchRoute(mainWaypoints),
          fetchRoute(altWaypoints),
        ]);
        layersRef.current.mainRouteGeom = mainCoords;
        layersRef.current.altRouteGeom  = altCoords;

        // Replace placeholder with real geometry
        layersRef.current.mainRouteLine.setLatLngs(mainCoords);
        layersRef.current.altRouteLine.setLatLngs(altCoords);

        // Fit map to route bounds with comfortable padding
        map.fitBounds(L.polyline(mainCoords).getBounds(), {
          paddingTopLeft:     [60, 40],
          paddingBottomRight: [60, 40],
          maxZoom: 15,
        });
      } catch {
        // OSRM unavailable — keep straight-line placeholders
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Reactively update markers / lines when simulation state changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.intCircles) return;

    import("leaflet").then((L) => {
      // Intersection circle colors
      intersections.forEach((int) => {
        const circle = layersRef.current.intCircles[int.id];
        if (!circle) return;
        const col = LIGHT_COLORS[int.state];
        circle.setStyle({
          fillColor: col, color: col,
          fillOpacity: int.state === "normal" ? 0.45 : 0.9,
          weight:      int.state === "normal" ? 1.5 : 2.5,
        });
      });

      const isRerouted = phase === "rerouted" || !!segments.find((s) => s.id === "s2alt" && s.active);
      const isRunning  = phase === "running" || phase === "rerouted" || phase === "completed";

      // Ambulance position & visibility
      const pos = getAmbulancePosition(segments, phase);
      layersRef.current.ambulance?.setLatLng(pos);
      layersRef.current.ambulance?.setOpacity(isRunning ? 1 : 0);

      // Destination marker turns green on arrival
      if (phase === "completed") {
        layersRef.current.destMarker?.setIcon(L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 0 8px #22c55e"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7], className: "",
        }));
      }

      // Build active path geometry
      const mainGeom: [number,number][] = layersRef.current.mainRouteGeom ?? [];
      const altGeom:  [number,number][] = layersRef.current.altRouteGeom  ?? [];

      const segIndexMap: Record<string, number> = { s0: 0, s1: 1, s2: 2, s3: 3, s4: 4, s2alt: 2 };
      const orderedIds = isRerouted
        ? ["s0", "s1", "s2alt", "s4"]
        : ["s0", "s1", "s2", "s3", "s4"];

      const activeIdx = orderedIds.findIndex((id) => segments.find((s) => s.id === id && s.active));

      // For the active overlay we slice the fetched geometry proportionally
      const geomToSlice = isRerouted ? altGeom : mainGeom;
      let activeGeom: [number,number][] = [];

      if (phase === "completed") {
        activeGeom = geomToSlice;
      } else if (activeIdx >= 0 && geomToSlice.length > 0) {
        const fraction = (activeIdx + 1) / orderedIds.length;
        activeGeom = geomToSlice.slice(0, Math.floor(geomToSlice.length * fraction));
      }

      layersRef.current.activeRouteLine?.setLatLngs(activeGeom);

      // Blocked / alt visibility
      const isBlocked = !!segments.find((s) => s.id === "s2" && s.blocked);
      layersRef.current.blockedLine?.setStyle({ opacity: isBlocked ? 0.9 : 0 });
      layersRef.current.altRouteLine?.setStyle({ opacity: isRerouted ? 0.7 : 0 });
      layersRef.current.mainRouteLine?.setStyle({ opacity: isRerouted ? 0.2 : 0.5 });
    });
  }, [intersections, segments, phase]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 border border-border rounded-md px-3 py-2 text-xs space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          <span className="text-muted-foreground">Ambulancia</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span className="text-muted-foreground">Preparando</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
          <span className="text-muted-foreground">Recuperando</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-red-500 inline-block" />
          <span className="text-muted-foreground">Bloqueado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-sky-400 inline-block" style={{ borderTop: "2px dashed" }} />
          <span className="text-muted-foreground">Ruta alt.</span>
        </div>
      </div>
    </div>
  );
}
