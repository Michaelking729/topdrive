import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/rideStream";
import { broadcastWS, ensureWSS } from "@/lib/wsServer";

export async function GET() {
  const rides = await prisma.ride.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(rides);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    pickup?: string;
    destination?: string;
    city?: string;
    estimate?: number;
    offeredPrice?: number;
  };

  if (!body.pickup || !body.destination || !body.city || !body.estimate) {
    return NextResponse.json(
      { error: "pickup, destination, city, estimate are required" },
      { status: 400 }
    );
  }

  const ride = await prisma.ride.create({
    data: {
      pickup: body.pickup,
      destination: body.destination,
      city: body.city,
      estimate: Number(body.estimate),
      offeredPrice:
        typeof body.offeredPrice === "number" ? Number(body.offeredPrice) : null,
      status: "REQUESTED",
    },
  });

  // Broadcast to connected clients (driver dashboards)
  try {
    broadcastEvent("ride-created", ride);
    try {
      ensureWSS();
      broadcastWS({ event: "ride-created", data: ride });
    } catch {}
  } catch (e) {
    // ignore broadcast errors
  }

  return NextResponse.json(ride, { status: 201 });
}
