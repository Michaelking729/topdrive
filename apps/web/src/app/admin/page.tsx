"use client";

import React, { useEffect, useState } from "react";
import { getAccessToken, getUser, logout } from "@/lib/session";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const token = getAccessToken();
  const me = getUser();

  async function load() {
    setErr(null);
    if (!token) {
      setErr("Not logged in.");
      return;
    }
    try {
      const m = await fetch("/api/admin/metrics", {
        headers: { authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (m?.error) throw new Error(m.error);
      setMetrics(m);

      const u = await fetch("/api/admin/users", {
        headers: { authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (u?.error) throw new Error(u.error);
      setUsers(u.users || []);

      const rs = await fetch("/api/admin/rides", {
        headers: { authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (rs?.error) throw new Error(rs.error);
      setRides(rs.rides || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load admin data");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold">Admin Panel</h1>
            <p className="text-sm text-slate-600">
              {me ? `${me.email || ""} • ${me.role}` : "Guest"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="rounded-xl border px-3 py-2 text-sm font-bold">
              Refresh
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-800">
            {err}
          </div>
        )}

        {metrics && (
          <section className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border p-5">
              <p className="text-xs font-bold text-slate-500">USERS</p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.users}</p>
            </div>
            <div className="rounded-3xl border p-5">
              <p className="text-xs font-bold text-slate-500">CLIENTS</p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.clients}</p>
            </div>
            <div className="rounded-3xl border p-5">
              <p className="text-xs font-bold text-slate-500">DRIVERS</p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.drivers}</p>
            </div>
            <div className="rounded-3xl border p-5">
              <p className="text-xs font-bold text-slate-500">RIDES</p>
              <p className="mt-2 text-3xl font-extrabold">{metrics.rides}</p>
            </div>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border p-5">
            <h2 className="text-xl font-extrabold">Users</h2>
            <div className="mt-3 space-y-2 max-h-[420px] overflow-auto">
              {users.map((u) => (
                <div key={u.id} className="rounded-2xl border p-3">
                  <p className="font-bold">{u.email}</p>
                  <p className="text-sm text-slate-600">
                    {u.role} • {u.name || "No name"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border p-5">
            <h2 className="text-xl font-extrabold">Rides</h2>
            <div className="mt-3 space-y-2 max-h-[420px] overflow-auto">
              {rides.map((r) => (
                <a key={r.id} href={`/ride/${r.id}`} className="block rounded-2xl border p-3 hover:bg-slate-50">
                  <p className="font-bold">
                    {r.pickup} → {r.destination}
                  </p>
                  <p className="text-sm text-slate-600">
                    {r.city} • {r.status}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
