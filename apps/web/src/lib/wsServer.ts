import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const PORT = Number(process.env.WS_PORT || 4001);
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";

let wss: WebSocketServer | null = null;

function parseCookies(cookieHeader?: string) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const p of parts) {
    const kv = p.split("=");
    const k = kv.shift()?.trim();
    const v = kv.join("=").trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function ensureWSS() {
  if (wss) return wss;
  wss = new WebSocketServer({ port: PORT });

  wss.on("connection", async (ws, req) => {
    try {
      // Authenticate connection: prefer cookie `accessToken`, fallback to `?token=` query
      const headerCookie = (req && (req as any).headers && (req as any).headers.cookie) || "";
      const cookies = parseCookies(headerCookie as string);
      let token = cookies["accessToken"];
      if (!token) {
        // try query param
        try {
          const url = new URL((req as any).url || "", `http://${(req as any).headers.host || 'localhost'}`);
          token = url.searchParams.get("token") || undefined;
        } catch {}
      }

      if (!token || !ACCESS_SECRET) {
        try {
          ws.close(1008, "Unauthorized");
        } catch {}
        return;
      }

      let payload: any;
      try {
        payload = jwt.verify(token, ACCESS_SECRET);
      } catch {
        try {
          ws.close(1008, "Invalid token");
        } catch {}
        return;
      }

      const userId = payload?.sub;
      if (!userId) {
        try {
          ws.close(1008, "Invalid token payload");
        } catch {}
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, name: true, email: true } });
      if (!user || !["DRIVER", "ADMIN"].includes(user.role)) {
        try {
          ws.close(1008, "Forbidden");
        } catch {}
        return;
      }

      // attach user info to socket
      try {
        (ws as any).user = user;
        ws.send(JSON.stringify({ event: "connected", data: { time: Date.now(), user: { id: user.id, role: user.role } } }));
      } catch {}
    } catch (e) {
      try {
        ws.close();
      } catch {}
    }
  });

  return wss;
}

export function broadcastWS(msg: any) {
  try {
    ensureWSS();
    const data = JSON.stringify(msg);
    wss!.clients.forEach((c) => {
      if (c.readyState === 1) c.send(data);
    });
  } catch (e) {
    // ignore
  }
}

export function wssCount() {
  return wss ? wss.clients.size : 0;
}

export function attachWSSToServer(server: any, path = "/ws") {
  if (wss) return wss;
  wss = new WebSocketServer({ server, path });

  wss.on("connection", async (ws, req) => {
    try {
      // reuse the same auth logic as ensureWSS
      const headerCookie = (req && (req as any).headers && (req as any).headers.cookie) || "";
      const cookies = parseCookies(headerCookie as string);
      let token = cookies["accessToken"];
      if (!token) {
        try {
          const url = new URL((req as any).url || "", `http://${(req as any).headers.host || 'localhost'}`);
          token = url.searchParams.get("token") || undefined;
        } catch {}
      }

      if (!token || !ACCESS_SECRET) {
        try {
          ws.close(1008, "Unauthorized");
        } catch {}
        return;
      }

      let payload: any;
      try {
        payload = jwt.verify(token, ACCESS_SECRET);
      } catch {
        try {
          ws.close(1008, "Invalid token");
        } catch {}
        return;
      }

      const userId = payload?.sub;
      if (!userId) {
        try {
          ws.close(1008, "Invalid token payload");
        } catch {}
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, name: true, email: true } });
      if (!user || !["DRIVER", "ADMIN"].includes(user.role)) {
        try {
          ws.close(1008, "Forbidden");
        } catch {}
        return;
      }

      try {
        (ws as any).user = user;
        ws.send(JSON.stringify({ event: "connected", data: { time: Date.now(), user: { id: user.id, role: user.role } } }));
      } catch {}
    } catch (e) {
      try {
        ws.close();
      } catch {}
    }
  });

  return wss;
}
