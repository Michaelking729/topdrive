import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rides = await prisma.ride.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rides);
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user as any, ["ADMIN"]);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const rides = await prisma.ride.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ rides });
  } catch (e: any) {
    const msg = e?.message || "ERROR";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
