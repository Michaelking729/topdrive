import { NextResponse, NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/rideStream";
import { requireAuth } from "@/lib/auth";

function encode(s: string) {
  return new TextEncoder().encode(s);
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    // only drivers or admins should subscribe
    if (!["DRIVER", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
