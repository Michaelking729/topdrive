import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { broadcastEvent } from "@/lib/rideStream";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, context: { params: any }) {
  try {
    const user = await requireAuth(req);
    if (user.role !== "DRIVER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await Promise.resolve(context.params);
    const { id } = params as { id: string };

    const body = (await req.json().catch(() => ({}))) as { lat?: number; lng?: number };
    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
    }

    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

    if (!["ACCEPTED", "ARRIVING", "IN_PROGRESS"].includes(ride.status)) {
      return NextResponse.json({ error: "Cannot update location for this ride status" }, { status: 409 });
    }

    // Check driver identity loosely: accept if driverName matches user's name/email/id
    const matchesDriver = [user.name, user.email, user.id].some((v) => v && ride.driverName && ride.driverName === v);
    if (!matchesDriver && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not driver for this ride" }, { status: 403 });
    }

    const updated = await prisma.ride.update({
      where: { id },
      data: { driverLat: Number(body.lat), driverLng: Number(body.lng), driverUpdatedAt: new Date() },
    });

    try {
      broadcastEvent("ride-location", { id: updated.id, driverLat: updated.driverLat, driverLng: updated.driverLng, driverUpdatedAt: updated.driverUpdatedAt });
    } catch {}

    try {
      const { broadcastWS } = await import("@/lib/wsServer");
      broadcastWS({ event: "ride-location", data: { id: updated.id, driverLat: updated.driverLat, driverLng: updated.driverLng, driverUpdatedAt: updated.driverUpdatedAt } });
    } catch {}

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    console.error("PATCH /api/rides/[id]/location error:", e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
