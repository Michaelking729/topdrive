import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user as any, ["ADMIN"]);

    const [users, drivers, clients, rides] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DRIVER" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.ride.count(),
    ]);

    return NextResponse.json({ users, drivers, clients, rides });
  } catch (e: any) {
    const msg = e?.message || "ERROR";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
