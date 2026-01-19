import jwt, { SignOptions } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export type Role = "CLIENT" | "DRIVER" | "ADMIN";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES || "15m";

export function signAccessToken(userId: string) {
  if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET missing");
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as SignOptions);
}

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");
  if (!ACCESS_SECRET) throw new Error("UNAUTHORIZED");

  let payload: any;
  try {
    payload = jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  const userId = payload?.sub;
  if (!userId || typeof userId !== "string") throw new Error("UNAUTHORIZED");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, name: true },
  });

  if (!user) throw new Error("UNAUTHORIZED");
  return user; // { id, role, email, name }
}

export function requireRole(user: { role: Role }, roles: Role[]) {
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
}
