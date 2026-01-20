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

export function getAccessTokenTTLSeconds() {
  const s = (process.env.ACCESS_TOKEN_EXPIRES || "15m").trim();
  const last = s[s.length - 1];
  const num = Number(s.slice(0, s.length - 1));
  if (!isNaN(Number(s))) return Number(s);
  if (last === "s") return isNaN(num) ? 900 : num;
  if (last === "m") return isNaN(num) ? 60 * 15 : num * 60;
  if (last === "h") return isNaN(num) ? 60 * 60 * 1 : num * 60 * 60;
  if (last === "d") return isNaN(num) ? 60 * 60 * 24 : num * 60 * 60 * 24;
  // fallback minutes
  return 60 * 15;
}

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  // allow token from cookie named `accessToken`
  let token = headerToken;
  try {
    const cookieVal = (req.cookies && req.cookies.get && req.cookies.get("accessToken")?.value) || "";
    if (!token && cookieVal) token = cookieVal;
  } catch {
    // ignore
  }
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
