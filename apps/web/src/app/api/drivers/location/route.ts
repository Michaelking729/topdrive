import { NextResponse, NextRequest } from "next/server";
import { broadcastDrivers } from "@/lib/driversStream";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    lat?: number;
    lng?: number;
    available?: boolean;
  };

  if (!body.id || typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "id, lat, lng required" }, { status: 400 });
  }

  const payload = { id: body.id, lat: body.lat, lng: body.lng, available: !!body.available, ts: Date.now() };

  try {
    broadcastDrivers("driver-location", payload);
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
