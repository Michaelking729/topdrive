"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CLIENT" | "DRIVER">("CLIENT");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Registration failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(true);
      if (data.user.role === "DRIVER") {
        setTimeout(() => window.location.href = "/driver", 1500);
      } else {
        setTimeout(() => window.location.href = "/dashboard", 1500);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Registration error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl border border-white/20 p-8 shadow-2xl bg-white/10 backdrop-blur-xl">
          <div className="text-center mb-2">
            <h1 className="text-4xl font-black text-white drop-shadow-lg">TOP DRIVE</h1>
            <p className="text-white/80 text-sm mt-1">Join the revolution</p>
          </div>

          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-400 bg-emerald-400/20 p-4 text-emerald-300 font-semibold text-center animate-pulse">
              ✓ Welcome! Redirecting...
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-2xl border border-rose-400 bg-rose-400/20 p-4 text-rose-300 font-semibold text-center">
              ✗ {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition backdrop-blur"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition backdrop-blur"
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <select
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition backdrop-blur appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value as "CLIENT" | "DRIVER")}
              >
                <option value="CLIENT" className="bg-slate-900 text-white">👤 I'm a Rider</option>
                <option value="DRIVER" className="bg-slate-900 text-white">🚗 I'm a Driver</option>
              </select>
              <div className="absolute right-4 top-3 text-white/50 pointer-events-none">▼</div>
            </div>

            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 transition backdrop-blur"
                placeholder="Password (min 6 chars)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black py-3 disabled:opacity-60 hover:shadow-lg hover:shadow-pink-500/50 transition transform hover:scale-105 active:scale-95"
            >
              {busy ? "🔄 Creating Account..." : "✨ Get Started"}
            </button>
          </form>

          <p className="text-center text-white/70 text-sm mt-6">
            Already registered?{" "}
            <a className="font-bold text-white hover:text-pink-200 underline transition" href="/login">
              Sign In
            </a>
          </p>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          By registering, you agree to our Terms of Service
        </p>
      </div>
    </main>
  );
}
