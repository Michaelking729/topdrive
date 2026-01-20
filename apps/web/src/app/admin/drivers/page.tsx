import React from "react";

export default async function DriversPage() {
  const res = await fetch('/api/admin/drivers', { cache: 'no-store' });
  const drivers = await res.json().catch(() => []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Drivers</h2>
      <div className="space-y-2">
        {drivers.map((d: any) => (
          <div key={d.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-muted">{d.vehicle ?? '—'} • {d.phone ?? ''}</div>
            </div>
            <div className="text-sm">Trips: {d.trips ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
