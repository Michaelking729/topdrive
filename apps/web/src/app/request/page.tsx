"use client";

import { useEffect, useMemo, useState } from "react";
import { createRide, getRides, type Ride } from "@/lib/api";

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

function statusPillClasses(status: Ride["status"]) {
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

// Simple MVP “distance-based” estimate (placeholder until Maps).
// You can tune these numbers to match Ijebu-Ode pricing.
function estimateFromRoute(pickup: string, destination: string) {
  const base = 800; // base fare
  const len = (pickup.trim().length + destination.trim().length) || 1;
  const complexity = Math.min(1200, Math.round(len * 18)); // text proxy
  const total = base + complexity;

  // Round to nearest 25
  return Math.round(total / 25) * 25;
}

export default function RequestPage() {
  const CITY = "Ijebu-Ode";

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const estimate = useMemo(
    () => estimateFromRoute(pickup, destination),
    [pickup, destination]
  );

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const data = await getRides();
      setRides(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const recent = useMemo(() => rides.slice(0, 10), [rides]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const p = pickup.trim();
    const d = destination.trim();

    if (!p || !d) {
      setErr("Pickup and destination are required.");
      return;
    }

    setBusy(true);
    try {
      const ride = await createRide({
        pickup: p,
        destination: d,
        estimate,
        city: CITY,
      });

      setPickup("");
      setDestination("");
      setToast("Request sent ✅ Waiting for driver…");

      await load();

      // Go to tracking page (NOT driver page)
      window.location.href = `/ride/${ride.id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create ride");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-48 -left-24 h-[420px] w-[420px] rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-[460px] w-[460px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.05)_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                  TOP DRIVE — Request Ride
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">
                  Location: <span className="font-semibold">{CITY}</span> • Driver will accept soon
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={load}
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

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: form */}
        <section className="space-y-5">
          {err && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800 font-semibold">
              {err}
            </div>
          )}

          <div className="rounded-3xl border border-slate-200/70 bg-white/85 backdrop-blur p-5 sm:p-7 shadow-[0_18px_55px_rgba(2,6,23,0.07)]">
            <p className="text-xs font-bold tracking-wider text-blue-700">
              QUICK REQUEST • AUTO PRICING
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Book a ride in{" "}
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                {CITY}
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Price is calculated from route distance (MVP). You can’t manually set price.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-700">Pickup</label>
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="e.g. Oke-Aje market"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Destination</label>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. TASUED"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">Estimated fare</p>
                  <p className="text-xl font-extrabold">{formatMoney(estimate)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    (Auto-calculated — will be replaced with Maps distance next)
                  </p>
                </div>

                <button
                  disabled={busy}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white font-extrabold shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:opacity-95 disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Request Ride"}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-slate-700">
                <p className="font-extrabold">What happens next?</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-600">
                  <li>Your request is sent to available drivers in {CITY}.</li>
                  <li>You’ll be redirected to a tracking page to watch status updates.</li>
                  <li>Once accepted, you’ll see the driver name and trip progress.</li>
                </ul>
              </div>
            </form>
          </div>
        </section>

        {/* Right: recent */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 backdrop-blur p-5 sm:p-7 shadow-[0_18px_55px_rgba(2,6,23,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold">Recent requests</h3>
                <p className="text-sm text-slate-600">
                  Tap Track to see driver updates
                </p>
              </div>
              <button
                onClick={load}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <>
                  <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                </>
              ) : recent.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                  <p className="font-extrabold">No rides yet</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Create your first request and it will appear here.
                  </p>
                </div>
              ) : (
                recent.map((r) => (
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
                          Fare: <span className="font-semibold">{formatMoney(r.estimate)}</span>
                        </p>
                      </div>

                      <span
                        className={
                          "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold " +
                          statusPillClasses(r.status)
                        }
                      >
                        {statusLabel(r.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">
                        {r.driverName ? `Driver: ${r.driverName}` : "Waiting for driver…"}
                      </p>

                      <a
                        href={`/ride/${r.id}`}
                        className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                      >
                        Track →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
