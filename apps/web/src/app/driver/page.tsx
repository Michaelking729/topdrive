"use client";

import React, { useEffect, useMemo, useState } from "react";
import { acceptRide, getRides, setRideStatus, type Ride, type RideStatus } from "@/lib/api";

const TOKEN_KEY = "accessToken"; // change if your login uses a different key

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function statusLabel(s: Ride["status"]) {
  if (s === "REQUESTED") return "Requested";
  if (s === "ACCEPTED") return "Accepted";
  if (s === "ARRIVING") return "Arriving";
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "COMPLETED") return "Completed";
  if (s === "CANCELLED") return "Cancelled";
  return s;
}

function pill(status: Ride["status"]) {
  switch (status) {
    case "REQUESTED":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "ACCEPTED":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100";
    case "ARRIVING":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-100";
    case "IN_PROGRESS":
      return "bg-slate-900 text-white ring-1 ring-slate-900/20";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-100";
  }
}

function nextStatus(current: RideStatus): RideStatus | null {
  if (current === "ACCEPTED") return "ARRIVING";
  if (current === "ARRIVING") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "COMPLETED";
  return null;
}

export default function DriverPage() {
  const [token, setToken] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyRideId, setBusyRideId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load token + user info
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY) || "";
    setToken(t);

    // If your app stores user JSON, we can grab driverId from there
    // Example: localStorage.setItem("user", JSON.stringify({ id, role }))
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.id) setDriverId(String(parsed.id));
      }
    } catch {
      // ignore
    }
  }, []);

  async function load(activeToken?: string) {
    try {
      setErr(null);
      setLoading(true);

      const t = activeToken ?? token;
      if (!t) {
        setRides([]);
        setErr("You are not logged in. Please login as a DRIVER.");
        return;
      }

      const data = await getRides();
      setRides(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load rides");
    } finally {
      setLoading(false);
    }
  }

  // Load when token becomes available
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto refresh every 8s (nice for driver)
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => load(token), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const requested = useMemo(
    () => rides.filter((r) => r.status === "REQUESTED"),
    [rides]
  );
  const active = useMemo(
    () => rides.filter((r) => r.status !== "REQUESTED" && r.status !== "COMPLETED" && r.status !== "CANCELLED"),
    [rides]
  );
  const recentDone = useMemo(
    () => rides.filter((r) => r.status === "COMPLETED").slice(0, 10),
    [rides]
  );

  async function onAccept(ride: Ride) {
    if (!token) {
      setErr("You are not logged in. Please login again.");
      return;
    }
    if (!driverId) {
      setErr("Driver ID not found. Please login again (user data missing).");
      return;
    }

    setBusyRideId(ride.id);
    setErr(null);

    try {
      await acceptRide(ride.id, driverId);
      setToast("Ride accepted ✅");
      await load(token);
      window.location.href = `/ride/${ride.id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to accept ride");
    } finally {
      setBusyRideId(null);
    }
  }

  async function onAdvanceStatus(ride: Ride) {
    if (!token) {
      setErr("You are not logged in. Please login again.");
      return;
    }

    const ns = nextStatus(ride.status);
    if (!ns) return;

    setBusyRideId(ride.id);
    setErr(null);

    try {
      await setRideStatus(ride.id, ns);
      setToast(`Status updated → ${statusLabel(ns)} ✅`);
      await load(token);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update status");
    } finally {
      setBusyRideId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-48 -left-24 h-[420px] w-[420px] rounded-full bg-teal-200/35 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-[460px] w-[460px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.05)_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-sm" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                  TOP DRIVE — Driver Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">
                  Accept rides • Update trip status • Track earnings
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => load(token)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 z-30 -translate-x-1/2">
          <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-lg">
            {toast}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        {err && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800 font-semibold">
            {err}
          </div>
        )}

        {/* Quick stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
            <p className="text-xs font-bold tracking-wider text-slate-500">REQUESTS</p>
            <p className="mt-2 text-3xl font-extrabold">{requested.length}</p>
            <p className="mt-1 text-sm text-slate-600">Available to accept now</p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
            <p className="text-xs font-bold tracking-wider text-slate-500">ACTIVE</p>
            <p className="mt-2 text-3xl font-extrabold">{active.length}</p>
            <p className="mt-1 text-sm text-slate-600">Accepted / In progress</p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
            <p className="text-xs font-bold tracking-wider text-slate-500">RECENT COMPLETED</p>
            <p className="mt-2 text-3xl font-extrabold">{recentDone.length}</p>
            <p className="mt-1 text-sm text-slate-600">Last 10 completed rides</p>
          </div>
        </section>

        {/* Requests */}
        <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 sm:p-7 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold">Available Requests</h2>
              <p className="text-sm text-slate-600">Accept a request to start.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              </>
            ) : requested.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                <p className="font-extrabold">No requests right now</p>
                <p className="mt-1 text-sm text-slate-600">Keep this page open. It refreshes automatically.</p>
              </div>
            ) : (
              requested.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 hover:shadow-[0_10px_20px_rgba(2,6,23,0.06)] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 break-words">
                        {r.pickup} → {r.destination}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        City: <span className="font-semibold">{r.city}</span> • Fare:{" "}
                        <span className="font-semibold">{formatMoney(r.estimate)}</span>
                      </p>
                    </div>

                    <span
                      className={
                        "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold " + pill(r.status)
                      }
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={`/ride/${r.id}`}
                      className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                    >
                      View →
                    </a>

                    <button
                      onClick={() => onAccept(r)}
                      disabled={busyRideId === r.id}
                      className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95 disabled:opacity-60"
                    >
                      {busyRideId === r.id ? "Accepting…" : "Accept Ride"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Active rides */}
        <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 sm:p-7 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
          <h2 className="text-xl sm:text-2xl font-extrabold">My Active Trips</h2>
          <p className="text-sm text-slate-600 mt-1">Advance status as you move.</p>

          <div className="mt-4 space-y-3">
            {active.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                <p className="font-extrabold">No active trips</p>
                <p className="mt-1 text-sm text-slate-600">Accept a request to begin.</p>
              </div>
            ) : (
              active.map((r) => {
                const ns = nextStatus(r.status);
                return (
                  <div key={r.id} className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold">{r.pickup} → {r.destination}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Fare: <span className="font-semibold">{formatMoney(r.estimate)}</span>
                        </p>
                      </div>

                      <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-extrabold " + pill(r.status)}>
                        {statusLabel(r.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={`/ride/${r.id}`}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold hover:bg-slate-50"
                      >
                        Track →
                      </a>

                      {ns ? (
                        <button
                          onClick={() => onAdvanceStatus(r)}
                          disabled={busyRideId === r.id}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {busyRideId === r.id ? "Updating…" : `Mark as ${statusLabel(ns)}`}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-600 font-semibold">No next action</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
