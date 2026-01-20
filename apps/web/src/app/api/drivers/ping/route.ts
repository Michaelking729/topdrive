import { NextResponse, NextRequest } from "next/server";
import { broadcastWS, isUserConnected } from "@/lib/wsServer";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// simple in-memory rate limiter per requester
const rateMap = new Map<string, { windowStart: number; count: number }>();
const MAX_PER_MIN = 5;

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

    // rate limit per requester id
    const now = Date.now();
    const key = `ping:${user.id}`;
    const st = rateMap.get(key) || { windowStart: now, count: 0 };
    if (now - st.windowStart > 60_000) {
      st.windowStart = now;
      st.count = 0;
    }
    st.count += 1;
    rateMap.set(key, st);
    if (st.count > MAX_PER_MIN) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      // target the driver specifically
      broadcastWS({ event: "driver-ping", data: { driverId: body.driverId, rideId: body.rideId, message: body.message || "A rider requested you", from: { id: user.id, name: user.name } } }, body.driverId);

      // if driver not connected, persist notification for later delivery
      const connected = isUserConnected(body.driverId);
      if (!connected) {
        try {
          await prisma.driverNotification.create({ data: { driverId: body.driverId, rideId: body.rideId, message: body.message || "A rider requested you" } });
        } catch (e) {
          // ignore persistence errors
        }
      }
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
