"use client";

import React, { useEffect, useMemo, useState } from "react";

type Pos = { lat: number; lng: number };

function hashToLatLng(s: string): Pos {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  const lat = 6 + ((h % 1000) / 1000) * 0.3; // around some city area
  const lng = 3 + (((h >> 2) % 1000) / 1000) * 0.3;
  return { lat, lng };
}

export default function MapMock({
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
  onPick?: (kind: "pickup" | "destination", text: string) => void;
  onDriverSelect?: (id: string) => void;
}) {
  const pk = useMemo(() => (pickup ? hashToLatLng(pickup) : null), [pickup]);
  const ds = useMemo(() => (destination ? hashToLatLng(destination) : null), [destination]);

  const center = useMemo(() => {
    if (pk && ds) return { lat: (pk.lat + ds.lat) / 2, lng: (pk.lng + ds.lng) / 2 };
    if (pk) return pk;
    if (ds) return ds;
    return { lat: 6.5, lng: 3.5 };
  }, [pk, ds]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white shadow-md">
      <div className="relative h-64 bg-gradient-to-b from-sky-50 to-white">
        <div className="absolute left-2 top-2 text-xs text-slate-500">Map (mock)</div>

        {/* center marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-2 w-2 rounded-full bg-slate-300/60" />
        </div>

        {pk && (
          <div
            onClick={() => onPick?.("pickup", pickup!)}
            className="absolute bg-white/90 rounded-full p-1 shadow-md cursor-pointer"
            style={{ left: `${((pk.lng - center.lng) * 200 + 50).toFixed(2)}%`, top: `${((pk.lat - center.lat) * -200 + 50).toFixed(2)}%` }}
            title={pickup}
          >
            <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
          </div>
        )}

        {ds && (
          <div
            onClick={() => onPick?.("destination", destination!)}
            className="absolute bg-white/90 rounded-full p-1 shadow-md cursor-pointer"
            style={{ left: `${((ds.lng - center.lng) * 200 + 50).toFixed(2)}%`, top: `${((ds.lat - center.lat) * -200 + 50).toFixed(2)}%` }}
            title={destination}
          >
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
        )}

        {driverPos && (
          <div
            className="absolute bg-white/90 rounded-full p-1 shadow-xl"
            style={{ left: `${((driverPos.lng - center.lng) * 200 + 50).toFixed(2)}%`, top: `${((driverPos.lat - center.lat) * -200 + 50).toFixed(2)}%` }}
            title={`Driver`}
          >
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-bounce" />
          </div>
        )}

        {/* multiple drivers */}
        {drivers && drivers.map((d) => (
          <div
            key={d.id}
            onClick={() => onDriverSelect?.(d.id)}
            className="absolute bg-white/90 rounded-full p-1 shadow-xl cursor-pointer"
            style={{ left: `${((d.lng - center.lng) * 200 + 50).toFixed(2)}%`, top: `${((d.lat - center.lat) * -200 + 50).toFixed(2)}%` }}
            title={d.name || 'Driver'}
          >
            <div className={`h-3 w-3 rounded-full ${d.available ? 'bg-yellow-400 animate-bounce' : 'bg-gray-400'}`} />
          </div>
        ))}
      </div>
      <div className="p-3 text-xs text-slate-600">
        Centered near {center.lat.toFixed(3)}, {center.lng.toFixed(3)} — Click pins to populate inputs.
      </div>
    </div>
  );
}
