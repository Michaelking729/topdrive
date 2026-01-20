import { NextResponse, NextRequest } from "next/server";
import { broadcastWS } from "@/lib/wsServer";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    // only clients or admins can ping drivers
    if (!user || (user.role !== "CLIENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      driverId?: string;
      rideId?: string;
      message?: string;
    };

    if (!body.driverId || !body.rideId) {
      return NextResponse.json({ error: "driverId and rideId required" }, { status: 400 });
    }

    try {
      // target the driver specifically
      broadcastWS({ event: "driver-ping", data: { driverId: body.driverId, rideId: body.rideId, message: body.message || "A rider requested you", from: { id: user.id, name: user.name } } }, body.driverId);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
