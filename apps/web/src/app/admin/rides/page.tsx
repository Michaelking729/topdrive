import React from "react";

export default async function RidesPage() {
  const res = await fetch('/api/admin/rides', { cache: 'no-store' });
  const rides = await res.json().catch(() => []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Rides</h2>
      <div className="space-y-2">
        {rides.map((r: any) => (
          <div key={r.id} className="p-3 border rounded">
            <div className="font-medium">{r.id} — {r.status}</div>
            <div className="text-sm">From: {r.pickupAddress ?? '—'} → To: {r.dropoffAddress ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
