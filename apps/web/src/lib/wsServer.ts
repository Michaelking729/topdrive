import { WebSocketServer } from "ws";

const PORT = Number(process.env.WS_PORT || 4001);

let wss: WebSocketServer | null = null;

export function ensureWSS() {
  if (wss) return wss;
  wss = new WebSocketServer({ port: PORT });
  wss.on("connection", (ws) => {
    try {
      ws.send(JSON.stringify({ event: "connected", data: { time: Date.now() } }));
    } catch {}
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
