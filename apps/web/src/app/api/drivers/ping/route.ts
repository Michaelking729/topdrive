import { NextResponse, NextRequest } from "next/server";
import { broadcastWS } from "@/lib/wsServer";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    driverId?: string;
    rideId?: string;
    message?: string;
  };

  if (!body.driverId || !body.rideId) {
    return NextResponse.json({ error: "driverId and rideId required" }, { status: 400 });
  }

  try {
    broadcastWS({ event: "driver-ping", data: { driverId: body.driverId, rideId: body.rideId, message: body.message || "A rider requested you" } });
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
