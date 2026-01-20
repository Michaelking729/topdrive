import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (user.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const profile = await prisma.driverProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (user.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = (await req.json().catch(() => ({}))) as { vehicle?: string; plate?: string; isVerified?: boolean };
    const updated = await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: { vehicle: body.vehicle ?? undefined, plate: body.plate ?? undefined, isVerified: body.isVerified ?? undefined },
      create: { userId: user.id, vehicle: body.vehicle ?? undefined, plate: body.plate ?? undefined, isVerified: body.isVerified ?? false },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
