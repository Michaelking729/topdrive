"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getRides, type Ride } from "@/lib/api";
import { getAccessToken, getUser, logout } from "@/lib/session";

function statusLabel(s: Ride["status"]) {
  return s.replaceAll("_", " ");
}

export default function ClientDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = getAccessToken();
  const user = getUser();

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      if (!token) {
        setErr("Not logged in. Please login.");
        setRides([]);
        return;
      }
      const data = await getRides();
      setRides(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () =>
      rides.find(
        (r) => r.status !== "COMPLETED" && r.status !== "CANCELLED"
      ),
    [rides]
  );

  const recent = useMemo(() => rides.slice(0, 12), [rides]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold">Client Dashboard</h1>
            <p className="text-sm text-slate-600">
              {user ? `${user.email || ""} • ${user.role}` : "Guest"}
            </p>
          </div>
          <div className="flex gap-2">
            <a className="rounded-xl border px-3 py-2 text-sm font-bold" href="/request">
              Request Ride
            </a>
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

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border p-5">
            <p className="text-xs font-bold text-slate-500">TOTAL RIDES</p>
            <p className="mt-2 text-3xl font-extrabold">{rides.length}</p>
          </div>
          <div className="rounded-3xl border p-5">
            <p className="text-xs font-bold text-slate-500">ACTIVE</p>
            <p className="mt-2 text-3xl font-extrabold">
              {active ? "1" : "0"}
            </p>
          </div>
          <div className="rounded-3xl border p-5">
            <p className="text-xs font-bold text-slate-500">PAYMENTS</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Mock provider (add Stripe/Paystack later)
            </p>
          </div>
        </section>

        <section className="rounded-3xl border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Active Ride</h2>
            <button
              onClick={load}
              className="rounded-xl border px-3 py-2 text-sm font-bold"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-4 h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : !active ? (
            <div className="mt-4 text-slate-600">
              No active ride.{" "}
              <a className="font-bold underline" href="/request">
                Request a ride →
              </a>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-extrabold break-words">
                  {active.pickup} → {active.destination}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Status: <span className="font-semibold">{statusLabel(active.status)}</span>
                </p>
              </div>
              <a
                href={`/ride/${active.id}`}
                className="shrink-0 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-extrabold"
              >
                Track →
              </a>
            </div>
          )}
        </section>

        <section className="rounded-3xl border p-5">
          <h2 className="text-xl font-extrabold">Recent Rides</h2>
          <div className="mt-4 space-y-2">
            {recent.length === 0 ? (
              <p className="text-slate-600">No rides yet.</p>
            ) : (
              recent.map((r) => (
                <a
                  key={r.id}
                  href={`/ride/${r.id}`}
                  className="block rounded-2xl border p-4 hover:bg-slate-50"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold break-words">
                        {r.pickup} → {r.destination}
                      </p>
                      <p className="text-sm text-slate-600">
                        {r.city} • {statusLabel(r.status)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      #{r.id.slice(0, 6)}
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
