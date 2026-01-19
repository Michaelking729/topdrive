"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Login failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "DRIVER") window.location.href = "/driver";
      else if (data.user.role === "ADMIN") window.location.href = "/admin";
      else window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message ?? "Login error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 p-6 shadow-sm bg-white">
        <h1 className="text-2xl font-extrabold">Login</h1>
        <p className="text-sm text-slate-600 mt-1">Access your dashboard.</p>

        {err && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-800 font-semibold">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={busy}
            className="w-full rounded-2xl bg-slate-900 text-white font-extrabold py-3 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-4">
          New here?{" "}
          <a className="font-bold underline" href="/register">
            Create account
          </a>
        </p>
      </div>
    </main>
  );
}
