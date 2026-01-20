import { NextResponse, NextRequest } from "next/server";
import { broadcastDrivers } from "@/lib/driversStream";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    // only drivers should POST their location
    if (!user || user.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      lat?: number;
      lng?: number;
      available?: boolean;
    };

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }

    const payload = { id: user.id, lat: body.lat, lng: body.lng, available: !!body.available, ts: Date.now() };

    try {
      broadcastDrivers("driver-location", payload);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
