import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json(ride, { status: 201 });
}
