import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function requireAuth(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "");

  if (!token) throw new Error("Not authenticated");

  try {
    const secret = process.env.JWT_SECRET || "secret";
    const verified = jwt.verify(token, secret) as any;
    return verified.sub as string;
  } catch {
    throw new Error("Invalid token");
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new Error("User not found");

    // Get completed rides for earnings (using driverName, not driverId)
    const completedRides = await prisma.ride.findMany({
      where: { driverName: user.email, status: "COMPLETED" },
      select: { offeredPrice: true, estimate: true },
    });

    const totalEarnings = completedRides.reduce((acc, ride) => acc + (ride.offeredPrice || ride.estimate), 0);

    // Get ride count
    const rideCount = await prisma.ride.count({
      where: { driverName: user.email },
    });

    return NextResponse.json({
      balance: totalEarnings,
      totalEarnings,
      completedRides: completedRides.length,
      totalRides: rideCount,
      currency: "₦",
    });
  } catch (e: any) {
    console.error("WALLET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();
    const action = body?.action;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new Error("User not found");

    if (action === "withdraw") {
      const amount = body?.amount ?? 0;
      if (amount <= 0) throw new Error("Invalid amount");

      // Get current balance using driverName
      const rides = await prisma.ride.findMany({
        where: { driverName: user.email, status: "COMPLETED" },
        select: { offeredPrice: true, estimate: true },
      });
      const balance = rides.reduce((acc, r) => acc + (r.offeredPrice || r.estimate), 0);

      if (amount > balance) throw new Error("Insufficient balance");

      // In real app, process withdrawal to bank account
      return NextResponse.json({
        success: true,
        message: `₦${amount.toLocaleString()} withdrawn successfully`,
        newBalance: balance - amount,
        transactionId: `WTH-${Date.now()}`,
      });
    }

    throw new Error("Invalid action");
  } catch (e: any) {
    console.error("WALLET action error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
