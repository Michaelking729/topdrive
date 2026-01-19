import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/auth";

const testAccounts = [
  {
    name: "Administrator",
    email: "admin@topdrive.com",
    password: "Admin@123",
    role: "ADMIN" as const,
  },
  {
    name: "John Driver",
    email: "driver@topdrive.com",
    password: "Driver@123",
    role: "DRIVER" as const,
  },
  {
    name: "Jane Client",
    email: "client@topdrive.com",
    password: "Client@123",
    role: "CLIENT" as const,
  },
];

export async function POST(req: NextRequest) {
  try {
    const results = [];

    for (const account of testAccounts) {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: account.email },
      });

      if (existing) {
        results.push({
          email: account.email,
          status: "skipped",
          message: "Already exists",
        });
        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 10);

      const user = await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          passwordHash,
          role: account.role,
          clientProfile: account.role === "CLIENT" ? { create: {} } : undefined,
          driverProfile: account.role === "DRIVER" ? { create: {} } : undefined,
        },
        select: { id: true, email: true, name: true, role: true },
      });

      const accessToken = signAccessToken(user.id);

      results.push({
        email: account.email,
        status: "created",
        message: `${account.name} (${account.role})`,
        accessToken,
        user,
      });
    }

    return NextResponse.json({
      message: "Test accounts seeded successfully",
      accounts: results,
      testCredentials: [
        {
          role: "ADMIN",
          email: "admin@topdrive.com",
          password: "Admin@123",
          url: "http://localhost:3000/admin",
        },
        {
          role: "DRIVER",
          email: "driver@topdrive.com",
          password: "Driver@123",
          url: "http://localhost:3000/driver",
        },
        {
          role: "CLIENT",
          email: "client@topdrive.com",
          password: "Client@123",
          url: "http://localhost:3000/dashboard",
        },
      ],
    });
  } catch (e: any) {
    console.error("SEED error:", e);
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 });
  }
}
