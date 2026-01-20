"use client";

import React, { useEffect, useRef } from "react";

// Dynamically import Leaflet in the browser only to avoid SSR errors
let L: any = null;


type Pos = { lat: number; lng: number };

function hashToLatLng(s: string): Pos {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  const lat = 6 + ((h % 1000) / 1000) * 0.3;
  const lng = 3 + (((h >> 2) % 1000) / 1000) * 0.3;
  return { lat, lng };
}

export default function MapLeaflet({
  pickup,
  destination,
  driverPos,
  drivers,
  onPick,
  onDriverSelect,
}: {
  pickup?: string;
  destination?: string;
  driverPos?: Pos | null;
  drivers?: Array<{ id: string; name?: string; lat: number; lng: number; available?: boolean }> | null;
  onPick?: (k: "pickup" | "destination", t: string) => void;
  onDriverSelect?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) return;
    // Dynamically import Leaflet and CSS in the browser only
    import("leaflet")
      .then((mod) => {
        L = mod.default || mod;
        return import("leaflet/dist/leaflet.css").catch(() => {});
      })
      .then(() => {
        if (!ref.current) return;
        const map = L.map(ref.current, { center: [6.5, 3.5], zoom: 12, zoomControl: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        mapRef.current = map;
      })
      .catch((err) => {
        // safe fallback: don't crash the app during SSR/build
        console.warn("Leaflet load failed", err);
      });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const pk = pickup ? hashToLatLng(pickup) : null;
    const ds = destination ? hashToLatLng(destination) : null;

    // helper to set marker (uses circleMarker for reliable styling)
    const colorMap: Record<string, string> = { blue: "#2563eb", green: "#10b981", yellow: "#f59e0b", gray: "#9ca3af" };
    const setMarker = (key: string, latlng: [number, number], color = "blue", title?: string, onClick?: () => void) => {
      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng(latlng);
      } else {
        const circle = L.circleMarker(latlng as any, {
          radius: 6,
          color: colorMap[color] || colorMap.blue,
          fillColor: colorMap[color] || colorMap.blue,
          fillOpacity: 1,
          weight: 1,
        });
        circle.addTo(map);
        if (onClick) circle.on("click", onClick);
        if (title) circle.bindTooltip(title, { direction: "top", offset: [0, -8] });
        markersRef.current[key] = circle;
      }
    };

    if (pk) setMarker("pickup", [pk.lat, pk.lng], "blue", pickup, () => onPick?.("pickup", pickup));
    else if (markersRef.current["pickup"]) {
      map.removeLayer(markersRef.current["pickup"]);
      delete markersRef.current["pickup"];
    }

    if (ds) setMarker("destination", [ds.lat, ds.lng], "green", destination, () => onPick?.("destination", destination));
    else if (markersRef.current["destination"]) {
      map.removeLayer(markersRef.current["destination"]);
      delete markersRef.current["destination"];
    }

    if (driverPos) setMarker("driver", [driverPos.lat, driverPos.lng], "yellow", "Driver");
    else if (markersRef.current["driver"]) {
      map.removeLayer(markersRef.current["driver"]);
      delete markersRef.current["driver"];
    }

    // Render multiple drivers if provided
    if (drivers && Array.isArray(drivers)) {
      // remove any previous driver-* markers
      Object.keys(markersRef.current)
        .filter((k) => k.startsWith("driver-"))
        .forEach((k) => {
          try {
            map.removeLayer(markersRef.current[k]);
          } catch {}
          delete markersRef.current[k];
        });

      drivers.forEach((d) => {
        const key = `driver-${d.id}`;
        setMarker(key, [d.lat, d.lng], d.available ? "yellow" : "gray", d.name || "Driver", () => onDriverSelect?.(d.id));
      });
    }

    const bounds = [] as [number, number][];
    if (pk) bounds.push([pk.lat, pk.lng]);
    if (ds) bounds.push([ds.lat, ds.lng]);
    if (driverPos) bounds.push([driverPos.lat, driverPos.lng]);
    if (bounds.length > 0) map.fitBounds(bounds as any, { padding: [50, 50] });
  }, [pickup, destination, driverPos, drivers, onPick, onDriverSelect]);

  return <div ref={ref} className="w-full rounded-2xl h-64 overflow-hidden" />;
}
