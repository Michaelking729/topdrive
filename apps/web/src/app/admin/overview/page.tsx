import React from "react";

export default async function OverviewPage() {
  const res = await fetch("/api/admin/metrics", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded">Users: {data.usersCount ?? '—'}</div>
        <div className="p-4 border rounded">Drivers: {data.driversCount ?? '—'}</div>
        <div className="p-4 border rounded">Rides: {data.ridesCount ?? '—'}</div>
        <div className="p-4 border rounded">Active: {data.activeRides ?? '—'}</div>
      </div>
      <div className="mt-4 p-4 border rounded">Pending notifications: {data.pendingNotifications ?? '—'}</div>
    </div>
  );
}
