"use client";

import React, { useEffect, useState } from "react";
import { getAccessToken, getUser, logout } from "@/lib/session";

export default function AdminPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "users" | "rides" | "analytics">("overview");
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("ALL");
  const [rideFilter, setRideFilter] = useState("ALL");

  const token = getAccessToken();
  const me = getUser();

  async function load() {
    setErr(null);
    if (!token) {
      setErr("Not logged in.");
      return;
    }
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = userFilter === "ALL" ? users : users.filter((u) => u.role === userFilter);
  const filteredRides = rideFilter === "ALL" ? rides : rides.filter((r) => r.status === rideFilter);

  const completedRevenue = rides.filter((r) => r.status === "COMPLETED").reduce((acc, r) => acc + (r.offeredPrice || r.estimate), 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚙️ ADMIN PANEL
            </h1>
            <p className="text-xs text-gray-300 mt-1">{me?.email} • Super Admin</p>
          </div>
          <button onClick={() => { logout(); window.location.href = "/login"; }} className="rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-2 text-sm font-bold hover:shadow-lg transition-all">
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {err && <div className="rounded-2xl border-l-4 border-red-500 bg-red-500/20 p-4 text-red-200 font-semibold animate-pulse">⚠️ {err}</div>}

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Total Users</p>
              <p className="text-4xl font-black mt-2">{metrics.users}</p>
              <p className="text-xs opacity-70 mt-1">All roles</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Clients</p>
              <p className="text-4xl font-black mt-2">{metrics.clients}</p>
              <p className="text-xs opacity-70 mt-1">Riders</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Drivers</p>
              <p className="text-4xl font-black mt-2">{metrics.drivers}</p>
              <p className="text-xs opacity-70 mt-1">Active</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Total Rides</p>
              <p className="text-4xl font-black mt-2">{metrics.rides}</p>
              <p className="text-xs opacity-70 mt-1">All time</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-xl hover:scale-105 transition-all">
              <p className="text-sm font-semibold opacity-80">Revenue</p>
              <p className="text-3xl font-black mt-2">₦{completedRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-1">Completed rides</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-900/50 p-2 rounded-xl border border-gray-700 backdrop-blur">
          {["overview", "users", "rides", "analytics"].map((t) => (
            <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded-lg font-bold transition-all ${tab === t ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-gray-300 hover:text-white"}`}>
              {t === "overview" && "📊 Overview"}{t === "users" && "👥 Users"}{t === "rides" && "🚗 Rides"}{t === "analytics" && "📈 Analytics"}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["ALL", "CLIENT", "DRIVER", "ADMIN"].map((f) => (
                <button key={f} onClick={() => setUserFilter(f)} className={`px-4 py-2 rounded-lg font-bold transition-all ${userFilter === f ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center text-gray-300 animate-pulse py-8">Loading users...</div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-white">{u.name || "User"}</p>
                        <p className="text-sm text-gray-400 mt-1">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${u.role === "ADMIN" ? "text-pink-400" : u.role === "DRIVER" ? "text-orange-400" : "text-blue-400"}`}>
                          {u.role}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Rides Tab */}
        {tab === "rides" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["ALL", "REQUESTED", "ACCEPTED", "ARRIVING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((f) => (
                <button key={f} onClick={() => setRideFilter(f)} className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${rideFilter === f ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center text-gray-300 animate-pulse py-8">Loading rides...</div>
              ) : (
                filteredRides.map((r) => (
                  <div key={r.id} className="rounded-xl p-4 bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-white">{r.pickup} → {r.destination}</p>
                        <p className="text-sm text-gray-400 mt-1">{r.city} • {r.driverName || "Unassigned"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-emerald-400">₦{r.estimate}</p>
                        <p className={`text-xs font-bold mt-1 ${r.status === "COMPLETED" ? "text-green-400" : r.status === "CANCELLED" ? "text-red-400" : "text-yellow-400"}`}>{r.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 bg-gray-800/50 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Ride Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Rides:</span>
                  <span className="font-bold text-white">{rides.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completed:</span>
                  <span className="font-bold text-green-400">{rides.filter((r) => r.status === "COMPLETED").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending:</span>
                  <span className="font-bold text-yellow-400">{rides.filter((r) => r.status === "REQUESTED").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cancelled:</span>
                  <span className="font-bold text-red-400">{rides.filter((r) => r.status === "CANCELLED").length}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-gray-800/50 border border-gray-700">
              <h3 className="font-bold text-white mb-4">User Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Users:</span>
                  <span className="font-bold text-white">{users.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Clients:</span>
                  <span className="font-bold text-blue-400">{users.filter((u) => u.role === "CLIENT").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Drivers:</span>
                  <span className="font-bold text-orange-400">{users.filter((u) => u.role === "DRIVER").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Admins:</span>
                  <span className="font-bold text-pink-400">{users.filter((u) => u.role === "ADMIN").length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl p-6 bg-gray-800/50 border border-gray-700">
              <h3 className="font-bold text-white mb-4">System Status</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Status:</span>
                  <span className="font-bold text-green-400">🟢 Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database:</span>
                  <span className="font-bold text-green-400">🟢 Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Status:</span>
                  <span className="font-bold text-green-400">🟢 Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="font-bold text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-700 to-indigo-800 border border-purple-600">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <button onClick={load} className="w-full rounded-lg bg-white text-purple-600 font-bold py-2 hover:bg-gray-100 transition-all">
                🔄 Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
