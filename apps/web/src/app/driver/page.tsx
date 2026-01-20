"use client";

import React, { useEffect, useState } from "react";
import { getAccessToken, getUser, logout } from "@/lib/session";

export default function DriverPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [busyRideId, setBusyRideId] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const token = getAccessToken();
  const user = getUser();

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      if (!token) {
        setErr("Not logged in");
        return;
      }

      // Load rides
      const ridesRes = await fetch("/api/rides", {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then((r) => r.json());
      setRides(ridesRes || ridesRes.rides || []);

      // Load wallet
      const walletRes = await fetch("/api/wallet", {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      }).then((r) => r.json());
      setWallet(walletRes);
    } catch (e: any) {
      setErr(e?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // initial load
    load();

    // Poll frequently when online, otherwise poll slowly so drivers see new requests
    const startPolling = (ms: number) => {
      if (interval) clearInterval(interval);
      interval = setInterval(load, ms);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    if (isOnline) startPolling(2000);
    else startPolling(5000);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Listen to SSE stream for immediate updates
  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`/api/rides/stream`);
    es.addEventListener("ride-created", (ev: any) => {
      try {
        const data = JSON.parse(ev.data);
        setRides((cur) => [data, ...cur.filter((r) => r.id !== data.id)].slice(0, 50));
      } catch {}
    });
    es.addEventListener("ride-updated", (ev: any) => {
      try {
        const data = JSON.parse(ev.data);
        setRides((cur) => [data, ...cur.filter((r) => r.id !== data.id)].slice(0, 50));
      } catch {}
    });
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Additionally connect to WebSocket server (if available)
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const host = window.location.hostname;
      ws = new WebSocket(`ws://${host}:${process.env.NEXT_PUBLIC_WS_PORT || 4001}`);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.event && msg?.data) {
            const data = msg.data;
            setRides((cur) => [data, ...cur.filter((r) => r.id !== data.id)].slice(0, 50));
          }
        } catch {}
      };
      ws.onclose = () => {
        ws = null;
      };
    } catch {}
    return () => {
      try {
        ws?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function acceptRide(rideId: string, driverName: string) {
    setBusyRideId(rideId);
    try {
      // prefer a readable driver name
      const nameToSend = driverName || (user?.name || user?.email || "Driver");
      const res = await fetch(`/api/rides/${rideId}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverName: nameToSend }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to accept ride");
      }
      await load();
      window.location.href = `/ride/${rideId}`;
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyRideId(null);
    }
  }

  async function updateStatus(rideId: string, nextStatus: string) {
    setBusyRideId(rideId);
    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyRideId(null);
    }
  }

  async function withdraw() {
    if (!wallet?.balance || wallet.balance <= 0) {
      setErr("Insufficient balance to withdraw");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "withdraw", amount: wallet.balance }),
      });
      if (!res.ok) throw new Error("Withdrawal failed");
      const data = await res.json();
      setErr(null);
      alert("✅ " + data.message);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setWithdrawing(false);
    }
  }

  const requested = rides.filter((r) => r.status === "REQUESTED");
  const active = rides.filter((r) => !["REQUESTED", "COMPLETED", "CANCELLED"].includes(r.status));
  const completed = rides.filter((r) => r.status === "COMPLETED");

  const getNextStatus = (status: string) => {
    if (status === "ACCEPTED") return "ARRIVING";
    if (status === "ARRIVING") return "IN_PROGRESS";
    if (status === "IN_PROGRESS") return "COMPLETED";
    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              🚗 DRIVER HUB
            </h1>
            <p className="text-xs text-gray-300 mt-1">{user?.name || "Driver"}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsOnline(!isOnline)} className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${isOnline ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}>
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </button>
            <button onClick={() => { logout(); window.location.href = "/login"; }} className="rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 text-sm font-bold hover:shadow-lg transition-all">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {err && <div className="rounded-2xl border-l-4 border-red-500 bg-red-500/20 p-4 text-red-200 font-semibold backdrop-blur animate-pulse">⚠️ {err}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">💳 Wallet</h2>
              <span className="text-4xl animate-bounce">💰</span>
            </div>
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="text-5xl font-black mt-2">₦{wallet?.balance?.toLocaleString() || "0"}</p>
            <p className="text-sm opacity-70 mt-2">{wallet?.completedRides || 0} rides completed</p>
            <button onClick={withdraw} disabled={withdrawing || !wallet?.balance} className="mt-6 w-full rounded-xl bg-white text-purple-600 font-bold py-3 hover:bg-gray-100 disabled:opacity-50">
              {withdrawing ? "Processing..." : "Withdraw Funds"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Available</p>
              <p className="text-3xl font-black mt-2">{requested.length}</p>
              <p className="text-xs opacity-70 mt-1">Requests</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Active</p>
              <p className="text-3xl font-black mt-2">{active.length}</p>
              <p className="text-xs opacity-70 mt-1">Trips</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Completed</p>
              <p className="text-3xl font-black mt-2">{completed.length}</p>
              <p className="text-xs opacity-70 mt-1">Rides</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white mb-4">📍 Available Requests</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-300 animate-pulse">Loading rides...</div>
            ) : requested.length === 0 ? (
              <div className="rounded-2xl p-8 bg-gray-800/50 border border-gray-700 text-center text-gray-300">
                <p className="text-lg font-semibold">No requests available</p>
              </div>
            ) : (
              requested.map((ride) => (
                <div key={ride.id} className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/80 to-gray-900 border-l-4 border-blue-500 shadow-xl hover:scale-102 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-black text-white">{ride.pickup}</p>
                      <p className="text-sm text-gray-300 mt-1">📍 {ride.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-emerald-400">₦{ride.estimate}</p>
                      <p className="text-xs text-gray-400 mt-1">Fare</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">📍 {ride.city}</p>
                  <div className="flex gap-3">
                    <a href={`/ride/${ride.id}`} className="flex-1 rounded-xl bg-gray-700 text-white font-bold py-2 text-center hover:bg-gray-600">Details</a>
                    <button onClick={() => acceptRide(ride.id, user?.id || "")} disabled={busyRideId === ride.id} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-2 disabled:opacity-50">
                      {busyRideId === ride.id ? "Accepting..." : "✅ Accept"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {active.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">🚕 Active Trips</h2>
            <div className="space-y-4">
              {active.map((ride) => {
                const nextStatus = getNextStatus(ride.status);
                return (
                  <div key={ride.id} className="rounded-2xl p-6 bg-gradient-to-br from-amber-800/60 to-orange-900/60 border-l-4 border-yellow-500 shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-black text-white">{ride.status}</p>
                        <p className="text-sm text-gray-300 mt-1">{ride.pickup} → {ride.destination}</p>
                      </div>
                      <p className="text-2xl font-black text-yellow-400">₦{ride.estimate}</p>
                    </div>
                    <div className="flex gap-3">
                      <a href={`/ride/${ride.id}`} className="flex-1 rounded-xl bg-gray-700 text-white font-bold py-2 text-center hover:bg-gray-600">📍 Track</a>
                      {nextStatus && (
                        <button onClick={() => updateStatus(ride.id, nextStatus)} disabled={busyRideId === ride.id} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-2 disabled:opacity-50">
                          {busyRideId === ride.id ? "Updating..." : `→ ${nextStatus}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
