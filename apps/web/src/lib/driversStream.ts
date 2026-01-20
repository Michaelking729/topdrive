const clients = new Set<(payload: string) => void>();

export function addDriverClient(send: (payload: string) => void) {
  clients.add(send);
}

export function removeDriverClient(send: (payload: string) => void) {
  clients.delete(send);
}

export function broadcastDrivers(eventName: string, data: any) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const send of Array.from(clients)) {
    try {
      send(payload);
    } catch (e) {
      // ignore
    }
  }
}

export function driverClientCount() {
  return clients.size;
}
