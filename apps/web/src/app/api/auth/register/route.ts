import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name ?? "").trim();
    const email = (body?.email ?? "").trim().toLowerCase();
    const password = body?.password ?? "";
    const role = (body?.role ?? "CLIENT") as "CLIENT" | "DRIVER" | "ADMIN";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!["CLIENT", "DRIVER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
        role,
        clientProfile: role === "CLIENT" ? { create: {} } : undefined,
        driverProfile: role === "DRIVER" ? { create: {} } : undefined,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const accessToken = signAccessToken(user.id);

    return NextResponse.json(
      {
        accessToken,
        user,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("REGISTER error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
