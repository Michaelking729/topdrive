import { NextResponse, NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/rideStream";

function encode(s: string) {
  return new TextEncoder().encode(s);
}

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // initial comment to establish connection
      controller.enqueue(encode(`: connected\n\n`));

      const send = (payload: string) => {
        try {
          controller.enqueue(encode(payload));
        } catch (e) {
          // ignore
        }
      };

      addClient(send);

      // cleanup when client disconnects
      const onAbort = () => {
        removeClient(send);
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
