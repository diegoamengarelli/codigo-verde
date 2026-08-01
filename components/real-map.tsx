"use client";

import { useEffect, useRef } from "react";
import { useSimulation } from "@/lib/simulation-store";
import type { TrafficLightState } from "@/lib/simulation-store";

// Real Rosario coordinates
// HECA (Hospital de Emergencias Clemente Alvarez): -32.9495, -60.6782
// Hospital Provincial del Centenario (destination): -32.9391, -60.6464

const ORIGIN_LATLNG: [number, number] = [-32.9495, -60.6782];
const DEST_LATLNG: [number, number] = [-32.9391, -60.6464];

// Real intersections along the route
const INTERSECTION_COORDS: Record<string, [number, number]> = {
  int1: [-32.9462, -60.6717], // Bv. Oroño y Córdoba
  int2: [-32.9437, -60.6641], // Córdoba y Rioja
  int3: [-32.9414, -60.6551], // Rioja y San Luis
  int4: [-32.9397, -60.6504], // San Luis y Pellegrini
};

// Route polyline: origin -> int1 -> int2 -> int3 -> int4 -> dest
const ROUTE_COORDS: [number, number][] = [
  ORIGIN_LATLNG,
  INTERSECTION_COORDS.int1,
  INTERSECTION_COORDS.int2,
  INTERSECTION_COORDS.int3,
  INTERSECTION_COORDS.int4,
  DEST_LATLNG,
];

// Alt route skips int3: int2 -> int4 via Balcarce
const ALT_ROUTE_COORDS: [number, number][] = [
  ORIGIN_LATLNG,
  INTERSECTION_COORDS.int1,
  INTERSECTION_COORDS.int2,
  [-32.9422, -60.6575], // Balcarce mid-point
  INTERSECTION_COORDS.int4,
  DEST_LATLNG,
];

const LIGHT_COLORS: Record<TrafficLightState, string> = {
  normal:    "#6b7280",
  preparing: "#f59e0b",
  priority:  "#22c55e",
  traversing:"#22c55e",
  recovering:"#38bdf8",
};

// Get ambulance lat/lng based on active segment
function getAmbulancePosition(
  segments: ReturnType<typeof useSimulation.getState>["segments"],
  phase: string
): [number, number] {
  const activeSeg = segments.find((s) => s.active);
  if (phase === "completed") return DEST_LATLNG;
  if (!activeSeg) return ORIGIN_LATLNG;

  const segCoords: Record<string, [[number, number], [number, number]]> = {
    s0:    [ORIGIN_LATLNG,               INTERSECTION_COORDS.int1],
    s1:    [INTERSECTION_COORDS.int1,    INTERSECTION_COORDS.int2],
    s2:    [INTERSECTION_COORDS.int2,    INTERSECTION_COORDS.int3],
    s3:    [INTERSECTION_COORDS.int3,    INTERSECTION_COORDS.int4],
    s4:    [INTERSECTION_COORDS.int4,    DEST_LATLNG],
    s2alt: [INTERSECTION_COORDS.int2,    INTERSECTION_COORDS.int4],
  };

  const pair = segCoords[activeSeg.id];
  if (!pair) return ORIGIN_LATLNG;
  return [
    (pair[0][0] + pair[1][0]) / 2,
    (pair[0][1] + pair[1][1]) / 2,
  ];
}

export function RealMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any>({});

  const intersections = useSimulation((s) => s.intersections);
  const segments = useSimulation((s) => s.segments);
  const phase = useSimulation((s) => s.phase);

  // Initialize map once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-32.9445, -60.664],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark OSM tile layer (CartoDB Dark Matter — no API key needed)
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

      // Draw static elements once
      // Origin marker
      const originIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#6b7280;border:2px solid #9ca3af;box-shadow:0 0 6px #6b7280"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });
      L.marker(ORIGIN_LATLNG, { icon: originIcon })
        .addTo(map)
        .bindTooltip("HECA", { permanent: true, direction: "left", className: "map-tooltip" });

      // Destination marker
      const destIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#374151;border:2px solid #6b7280;box-shadow:0 0 6px #374151"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });
      layersRef.current.destMarker = L.marker(DEST_LATLNG, { icon: destIcon })
        .addTo(map)
        .bindTooltip("Hospital Central", { permanent: true, direction: "right", className: "map-tooltip" });

      // Camera markers
      const cameraCoords: Array<{ id: string; latlng: [number, number] }> = [
        { id: "C1", latlng: INTERSECTION_COORDS.int1 },
        { id: "C2", latlng: INTERSECTION_COORDS.int2 },
        { id: "C3", latlng: INTERSECTION_COORDS.int4 },
      ];
      cameraCoords.forEach(({ id, latlng }) => {
        const camIcon = L.divIcon({
          html: `<div style="background:#1d4ed8;color:white;font-size:9px;font-weight:bold;padding:2px 5px;border-radius:3px;opacity:0.85">${id}</div>`,
          iconSize: [24, 16],
          iconAnchor: [12, 8],
          className: "",
        });
        L.marker(latlng, { icon: camIcon }).addTo(map);
      });

      // Base route polyline (dim, always shown)
      layersRef.current.routeLine = L.polyline(ROUTE_COORDS, {
        color: "#374151",
        weight: 4,
        opacity: 0.5,
      }).addTo(map);

      // Active route overlay (bright, updated dynamically)
      layersRef.current.activeRouteLine = L.polyline([], {
        color: "#22c55e",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      // Alt route (dashed, shown when rerouted)
      layersRef.current.altRouteLine = L.polyline(ALT_ROUTE_COORDS, {
        color: "#38bdf8",
        weight: 4,
        opacity: 0,
        dashArray: "8 6",
      }).addTo(map);

      // Blocked segment overlay
      layersRef.current.blockedLine = L.polyline(
        [INTERSECTION_COORDS.int2, INTERSECTION_COORDS.int3],
        { color: "#ef4444", weight: 5, opacity: 0, dashArray: "4 4" }
      ).addTo(map);

      // Intersection circles
      layersRef.current.intersectionCircles = {};
      Object.entries(INTERSECTION_COORDS).forEach(([id, latlng]) => {
        const circle = L.circleMarker(latlng, {
          radius: 9,
          fillColor: "#6b7280",
          fillOpacity: 0.8,
          color: "#9ca3af",
          weight: 1.5,
        }).addTo(map);
        layersRef.current.intersectionCircles[id] = circle;
      });

      // Ambulance marker (hidden initially)
      const ambulanceIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 0 10px #22c55e;animation:pulse 1.5s infinite"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      });
      layersRef.current.ambulance = L.marker(ORIGIN_LATLNG, {
        icon: ambulanceIcon,
        opacity: 0,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip("A-12", { permanent: true, direction: "top", className: "map-tooltip-green" });

      // Inject CSS for tooltips and animations
      const style = document.createElement("style");
      style.textContent = `
        .map-tooltip { background: #111827; border: 1px solid #374151; color: #d1d5db; font-size: 11px; padding: 2px 6px; border-radius: 4px; }
        .map-tooltip-green { background: #052e16; border: 1px solid #22c55e; color: #22c55e; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution { font-size: 9px !important; background: rgba(0,0,0,0.5) !important; color: #6b7280 !important; }
        .leaflet-control-attribution a { color: #6b7280 !important; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 6px #22c55e} 50%{box-shadow:0 0 18px #22c55e} }
      `;
      document.head.appendChild(style);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update dynamic elements when simulation state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.intersectionCircles) return;

    import("leaflet").then((L) => {
      // Update intersection circle colors
      intersections.forEach((int) => {
        const circle = layersRef.current.intersectionCircles[int.id];
        if (!circle) return;
        const color = LIGHT_COLORS[int.state];
        circle.setStyle({
          fillColor: color,
          color: color,
          fillOpacity: int.state === "normal" ? 0.5 : 0.9,
          weight: int.state === "normal" ? 1.5 : 2.5,
        });
      });

      const isRerouted = phase === "rerouted" || segments.find((s) => s.id === "s2alt" && s.active);
      const isRunning = phase === "running" || phase === "rerouted" || phase === "completed";

      // Show/hide ambulance
      if (layersRef.current.ambulance) {
        const pos = getAmbulancePosition(segments, phase);
        layersRef.current.ambulance.setLatLng(pos);
        layersRef.current.ambulance.setOpacity(isRunning ? 1 : 0);
      }

      // Update destination marker color on completion
      if (layersRef.current.destMarker && phase === "completed") {
        const destIcon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 0 10px #22c55e"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: "",
        });
        layersRef.current.destMarker.setIcon(destIcon);
      }

      // Active route line: build from currently passed + active segments
      const segCoordMap: Record<string, [number, number][]> = {
        s0:    [ORIGIN_LATLNG, INTERSECTION_COORDS.int1],
        s1:    [INTERSECTION_COORDS.int1, INTERSECTION_COORDS.int2],
        s2:    [INTERSECTION_COORDS.int2, INTERSECTION_COORDS.int3],
        s3:    [INTERSECTION_COORDS.int3, INTERSECTION_COORDS.int4],
        s4:    [INTERSECTION_COORDS.int4, DEST_LATLNG],
        s2alt: [INTERSECTION_COORDS.int2, INTERSECTION_COORDS.int4],
      };

      // Build active route from all non-blocked, non-alternative segments that have been/are active
      const orderedSegIds = isRerouted
        ? ["s0", "s1", "s2alt", "s4"]
        : ["s0", "s1", "s2", "s3", "s4"];

      const activeIdx = orderedSegIds.findIndex((id) => segments.find((s) => s.id === id && s.active));
      const coveredIds = activeIdx >= 0 ? orderedSegIds.slice(0, activeIdx + 1) : [];

      const activePath: [number, number][] = [];
      coveredIds.forEach((id) => {
        const coords = segCoordMap[id];
        if (!coords) return;
        if (activePath.length === 0) activePath.push(coords[0]);
        activePath.push(coords[1]);
      });
      if (phase === "completed") {
        orderedSegIds.forEach((id) => {
          const coords = segCoordMap[id];
          if (!coords) return;
          if (activePath.length === 0) activePath.push(coords[0]);
          activePath.push(coords[1]);
        });
      }
      layersRef.current.activeRouteLine?.setLatLngs(activePath);

      // Blocked line
      const isBlocked = segments.find((s) => s.id === "s2" && s.blocked);
      layersRef.current.blockedLine?.setStyle({ opacity: isBlocked ? 0.9 : 0 });

      // Alt route
      layersRef.current.altRouteLine?.setStyle({
        opacity: isRerouted ? 0.7 : 0,
      });
      layersRef.current.routeLine?.setStyle({
        opacity: isRerouted ? 0.2 : 0.5,
      });
    });
  }, [intersections, segments, phase]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend overlay */}
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
          <span className="w-3 h-0.5 bg-sky-400 inline-block border-dashed" />
          <span className="text-muted-foreground">Ruta alt.</span>
        </div>
      </div>
    </div>
  );
}
