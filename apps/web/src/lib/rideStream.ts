const clients = new Set<(payload: string) => void>();

export function addClient(send: (payload: string) => void) {
  clients.add(send);
}

export function removeClient(send: (payload: string) => void) {
  clients.delete(send);
}

export function broadcastEvent(eventName: string, data: any) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const send of Array.from(clients)) {
    try {
      send(payload);
    } catch (e) {
      // ignore client errors
    }
  }
}

export function clientCount() {
  return clients.size;
}
