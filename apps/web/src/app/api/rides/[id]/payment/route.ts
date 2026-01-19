import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: any }
) {
  try {
    const user = await requireAuth(req);
    const params = await Promise.resolve(context.params);
    const { id } = params as { id: string };
    const body = (await req.json().catch(() => ({}))) as {
      amount?: number;
      provider?: string;
    };

    const amount = body.amount || 0;
    const provider = body.provider || "mock";

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Check ride exists and is COMPLETED
    const ride = await prisma.ride.findUnique({
      where: { id },
      select: { id: true, status: true, estimate: true, offeredPrice: true },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Ride must be completed before payment" },
        { status: 409 }
      );
    }

    // Mock charge success (in real app, integrate Stripe/Paystack)
    return NextResponse.json({
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount,
      provider,
      status: "charged",
      message: `Mock ${provider} charge of ₦${amount.toLocaleString()} processed`,
    });
  } catch (e: any) {
    console.error("POST /api/rides/[id]/payment crashed:", e);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
