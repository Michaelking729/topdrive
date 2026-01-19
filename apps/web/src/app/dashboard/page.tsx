"use client";

import React, { useEffect, useState } from "react";
import { getAccessToken, getUser, logout } from "@/lib/session";

export default function ClientDashboard() {
  const [rides, setRides] = useState<any[]>([]);
  const [wallet, setWallet] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 });
  const token = getAccessToken();
  const user = getUser();

  async function load() {
    try {
      setErr(null);
      if (!token) {
        setErr("Not logged in. Please login.");
        return;
      }

      const ridesData = await fetch("/api/rides", {
        headers: { authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      
      const walletData = await fetch("/api/wallet", {
        headers: { authorization: `Bearer ${token}` },
      }).then((r) => r.json()).catch(() => ({ balance: 0 }));

      const rides = Array.isArray(ridesData.rides) ? ridesData.rides : [];
      setRides(rides);
      setWallet(walletData.balance || 0);
      
      setStats({
        total: rides.length,
        completed: rides.filter((r: any) => r.status === "COMPLETED").length,
        active: rides.filter((r: any) => !["COMPLETED", "CANCELLED"].includes(r.status)).length,
      });
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = rides.find((r) => !["COMPLETED", "CANCELLED"].includes(r.status));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              🚗 TOP DRIVE
            </h1>
            <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={load}
              className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="rounded-full bg-slate-800 text-white px-4 py-2 font-bold hover:bg-slate-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {err && (
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 text-rose-800 font-semibold">
            ⚠️ {err}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 hover:shadow-lg transition transform hover:scale-105">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Rides</p>
            <p className="mt-2 text-4xl font-black text-blue-900">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 hover:shadow-lg transition transform hover:scale-105">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
            <p className="mt-2 text-4xl font-black text-emerald-900">{stats.completed}</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 hover:shadow-lg transition transform hover:scale-105">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Active Rides</p>
            <p className="mt-2 text-4xl font-black text-amber-900">{stats.active}</p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 hover:shadow-lg transition transform hover:scale-105">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">Wallet Balance</p>
            <p className="mt-2 text-3xl font-black text-purple-900">₦{wallet.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Ride Section */}
        {active && (
          <div className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50 p-6 shadow-xl hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-cyan-900">🎯 Active Ride</h2>
              <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full font-bold text-sm animate-pulse">
                {active.status}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase">Pickup</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{active.pickup}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase">Destination</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{active.destination}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white/60 p-4 border border-cyan-200">
                <p className="text-sm font-bold text-slate-600">City</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{active.city}</p>
              </div>
              <div className="rounded-xl bg-white/60 p-4 border border-cyan-200">
                <p className="text-sm font-bold text-slate-600">Estimate</p>
                <p className="text-lg font-bold text-slate-900 mt-1">₦{active.estimate.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white/60 p-4 border border-cyan-200">
                <p className="text-sm font-bold text-slate-600">Driver</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{active.driverName || "Waiting..."}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href={`/ride/${active.id}`}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 text-center hover:shadow-lg transition transform hover:scale-105"
              >
                📍 Track Ride
              </a>
              <button className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 hover:shadow-lg transition transform hover:scale-105">
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Request New Ride CTA */}
        <div className="rounded-3xl border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-8 text-center hover:shadow-lg transition">
          <p className="text-3xl">🚀</p>
          <h3 className="text-2xl font-black text-purple-900 mt-2">Ready for a ride?</h3>
          <p className="text-slate-600 mt-1">Request a new ride and get there faster</p>
          <a
            href="/request"
            className="inline-block mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-6 py-3 hover:shadow-lg transition transform hover:scale-105"
          >
            Request Ride Now
          </a>
        </div>

        {/* Recent Rides */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">📋 Recent Rides</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-600">Loading...</div>
          ) : rides.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-600">
              No rides yet. Request your first ride!
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rides.slice(0, 12).map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      {ride.pickup} → {ride.destination}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(ride.createdAt).toLocaleDateString()} • ₦{ride.offeredPrice || ride.estimate}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      ride.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : ride.status === "CANCELLED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ride.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
