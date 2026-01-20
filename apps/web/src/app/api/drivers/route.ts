import { NextResponse } from "next/server";

type Pos = { lat: number; lng: number };

function hashToLatLng(s: string): Pos {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  const lat = 6 + ((h % 1000) / 1000) * 0.3;
  const lng = 3 + (((h >> 2) % 1000) / 1000) * 0.3;
  return { lat, lng };
}

export async function GET() {
  // Mock drivers for demo / MVP. Replace with real provider positions later.
  const names = ["Ayo", "Bisi", "Chike", "Dami", "Efe", "Fola"];
  const drivers = names.map((n, i) => {
    const pos = hashToLatLng(n + i.toString());
    return {
      id: `drv-${i}`,
      name: `${n} ${i}`,
      lat: pos.lat + (Math.random() - 0.5) * 0.02,
      lng: pos.lng + (Math.random() - 0.5) * 0.02,
      available: Math.random() > 0.2,
    };
  });

  return NextResponse.json(drivers);
}
