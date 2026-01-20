import { NextResponse, NextRequest } from "next/server";
import { broadcastDrivers } from "@/lib/driversStream";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/rideStream";

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
      // persist location history
      await prisma.driverLocation.create({ data: { driverId: user.id, lat: body.lat, lng: body.lng } });
    } catch (e) {
      // ignore persistence errors
    }

    try {
      broadcastDrivers("driver-location", payload);
    } catch (e) {
      // ignore
    }

    // Update any active rides assigned to this driver (best-effort): update ride.driverLat/driverLng
    try {
      // consider rides where driverName matches user.name/email/id
      const matches = await prisma.ride.findMany({ where: { status: { in: ["ACCEPTED", "ARRIVING", "IN_PROGRESS"] } } });
      for (const r of matches) {
        const matchesDriver = [user.name, user.email, user.id].some((v) => v && r.driverName && r.driverName === v);
        if (matchesDriver) {
          const updated = await prisma.ride.update({ where: { id: r.id }, data: { driverLat: Number(body.lat), driverLng: Number(body.lng), driverUpdatedAt: new Date() } });
          try {
            broadcastEvent("ride-location", { id: updated.id, driverLat: updated.driverLat, driverLng: updated.driverLng, driverUpdatedAt: updated.driverUpdatedAt });
          } catch {}
          try {
            const { broadcastWS } = await import("@/lib/wsServer");
            broadcastWS({ event: "ride-location", data: { id: updated.id, driverLat: updated.driverLat, driverLng: updated.driverLng, driverUpdatedAt: updated.driverUpdatedAt } });
          } catch {}
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
