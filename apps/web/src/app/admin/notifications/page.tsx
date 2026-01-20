import React from "react";

export default async function NotificationsPage() {
  const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
  const notes = await res.json().catch(() => []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-2">
        {notes.map((n: any) => (
          <div key={n.id} className="p-3 border rounded">
            <div className="font-medium">To: {n.driverId} — {n.rideId}</div>
            <div className="text-sm">{n.message}</div>
            <div className="text-xs text-muted">Delivered: {n.delivered ? 'yes' : 'no'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
