"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  onPick,
}: {
  pickup?: string;
  destination?: string;
  driverPos?: Pos | null;
  onPick?: (k: "pickup" | "destination", t: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) return;
    const map = L.map(ref.current, { center: [6.5, 3.5], zoom: 12, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const pk = pickup ? hashToLatLng(pickup) : null;
    const ds = destination ? hashToLatLng(destination) : null;

    // helper to set marker
    const setMarker = (key: string, latlng: [number, number], color = "blue", title?: string, onClick?: () => void) => {
      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng(latlng);
      } else {
        const el = L.divIcon({ className: `rounded-full w-4 h-4 bg-${color}-500` });
        const m = L.marker(latlng as any, { title: title || key });
        m.addTo(map);
        if (onClick) m.on("click", onClick);
        markersRef.current[key] = m;
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

    const bounds = [] as [number, number][];
    if (pk) bounds.push([pk.lat, pk.lng]);
    if (ds) bounds.push([ds.lat, ds.lng]);
    if (driverPos) bounds.push([driverPos.lat, driverPos.lng]);
    if (bounds.length > 0) map.fitBounds(bounds as any, { padding: [50, 50] });
  }, [pickup, destination, driverPos, onPick]);

  return <div ref={ref} className="w-full rounded-2xl h-64 overflow-hidden" />;
}
