import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/rideStream";

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
        // deliver any queued driver notifications from DB
        try {
          const pending = await prisma.driverNotification.findMany({ where: { driverId: user.id, delivered: false } });
          for (const n of pending) {
            try {
              ws.send(JSON.stringify({ event: "driver-ping", data: { rideId: n.rideId, message: n.message, from: null } }));
              await prisma.driverNotification.update({ where: { id: n.id }, data: { delivered: true, deliveredAt: new Date() } });
            } catch (e) {}
          }
        } catch (e) {}
        // handle incoming messages from driver clients
        ws.on("message", async (raw) => {
          try {
            const msg = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(raw.toString());
            if (!msg || !msg.event) return;

            // Accept ride via websocket for low-latency matching
            if (msg.event === "accept-ride" && msg.data && msg.data.rideId) {
              const rideId = msg.data.rideId as string;
              const driverName = (msg.data.driverName as string) || (user.name || user.email || "Driver");

              // atomic update: only accept if still REQUESTED
              const updated = await prisma.ride.updateMany({ where: { id: rideId, status: "REQUESTED" }, data: { status: "ACCEPTED", driverName } });
              if (updated.count === 0) {
                // fetch current state and notify requester
                const exists = await prisma.ride.findUnique({ where: { id: rideId } });
                // broadcast ride-updated so clients refresh
                if (exists) {
                  broadcastEvent("ride-updated", exists);
                  try {
                    broadcastWS({ event: "ride-updated", data: exists });
                  } catch {}
                }
                return;
              }

              const ride = await prisma.ride.findUnique({ where: { id: rideId } });
              if (ride) {
                broadcastEvent("ride-updated", ride);
                try {
                  broadcastWS({ event: "ride-updated", data: ride });
                } catch {}
              }
            }
          } catch (e) {
            // ignore malformed messages
          }
        });
      } catch {}
    } catch (e) {
      try {
        ws.close();
      } catch {}
    }
  });

  return wss;
}

export function broadcastWS(msg: any, targetUserId?: string) {
  try {
    ensureWSS();
    const data = JSON.stringify(msg);
    wss!.clients.forEach((c: any) => {
      try {
        if (c.readyState !== 1) return;
        if (targetUserId) {
          const uid = (c as any).user?.id;
          if (!uid || uid !== targetUserId) return;
        }
        c.send(data);
      } catch (e) {
        // ignore send errors per-client
      }
    });
  } catch (e) {
    // ignore
  }
}

export function wssCount() {
  return wss ? wss.clients.size : 0;
}

export function isUserConnected(userId: string) {
  try {
    ensureWSS();
    for (const c of Array.from(wss!.clients) as any[]) {
      if ((c as any).user && (c as any).user.id === userId && c.readyState === 1) return true;
    }
  } catch (e) {}
  return false;
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
        // deliver pending notifications
        try {
          const pending = await prisma.driverNotification.findMany({ where: { driverId: user.id, delivered: false } });
          for (const n of pending) {
            try {
              ws.send(JSON.stringify({ event: "driver-ping", data: { rideId: n.rideId, message: n.message, from: null } }));
              await prisma.driverNotification.update({ where: { id: n.id }, data: { delivered: true, deliveredAt: new Date() } });
            } catch (e) {}
          }
        } catch (e) {}
      } catch {}
    } catch (e) {
      try {
        ws.close();
      } catch {}
    }
  });

  return wss;
}
