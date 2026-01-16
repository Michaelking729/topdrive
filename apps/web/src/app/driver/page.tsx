"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ride, RideStatus } from "@/lib/api";
import { getRides, updateRide } from "@/lib/api";

function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₦${Math.round(n)}`;
  }
}

function statusLabel(s: RideStatus) {
  switch (s) {
    case "REQUESTED":
      return "Requested";
    case "ACCEPTED":
      return "Accepted";
    case "ARRIVING":
      return "Arriving";
    case "IN_PROGRESS":
      return "In Trip";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return s;
  }
}

function statusPillClass(s: RideStatus) {
  // soft premium colors (no Tailwind required)
  switch (s) {
    case "REQUESTED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "ACCEPTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ARRIVING":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "COMPLETED":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function DriverPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    try {
      setErr(null);
      const data = await getRides();
      // IMPORTANT: normalize dates (keep as string but ensure stable)
      setRides(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  const requested = useMemo(
    () => rides.filter((r) => r.status === "REQUESTED"),
    [rides]
  );
  const active = useMemo(
    () =>
      rides.filter((r) =>
        ["ACCEPTED", "ARRIVING", "IN_PROGRESS"].includes(r.status)
      ),
    [rides]
  );
  const recent = useMemo(
    () => rides.filter((r) => ["COMPLETED", "CANCELLED"].includes(r.status)),
    [rides]
  );

  async function acceptRide(id: string) {
    try {
      setBusyId(id);
      setErr(null);

      // use a default driver name for now (later we add auth/profile)
      await updateRide(id, { status: "ACCEPTED", driverName: "TOP DRIVE Driver" });

      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to accept ride");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(37,99,235,0.10), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(59,130,246,0.10), transparent 55%), #ffffff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 56px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 999,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.18)",
                color: "#1d4ed8",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#2563eb",
                  display: "inline-block",
                }}
              />
              Ijebu-Ode • Driver Console
            </div>

            <h1 style={{ margin: "10px 0 6px", fontSize: 28, lineHeight: 1.15 }}>
              TOP DRIVE — Driver Dashboard
            </h1>
            <p style={{ margin: 0, color: "#475569", maxWidth: 720 }}>
              See new ride requests, accept trips, and manage your active rides. Updates
              automatically every few seconds.
            </p>
          </div>

          <button
            onClick={refresh}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(2,6,23,0.10)",
              background: "#fff",
              boxShadow: "0 10px 25px rgba(2,6,23,0.06)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {err && (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(244,63,94,0.30)",
              background: "rgba(244,63,94,0.06)",
              color: "#9f1239",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            {err}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              border: "1px solid rgba(2,6,23,0.08)",
              background: "#fff",
              boxShadow: "0 16px 40px rgba(2,6,23,0.06)",
            }}
          >
            Loading rides…
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {/* Quick stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <StatCard label="New Requests" value={requested.length} />
              <StatCard label="Active Rides" value={active.length} />
              <StatCard label="Completed/Cancelled" value={recent.length} />
            </div>

            {/* Requested */}
            <Section
              title="New Requests"
              subtitle="Trips waiting for a driver"
              emptyText="No new requests yet. Create one on /request and it will appear here."
            >
              <div style={{ display: "grid", gap: 12 }}>
                {requested.map((r) => (
                  <RideCard
                    key={r.id}
                    ride={r}
                    primaryAction={{
                      label: busyId === r.id ? "Accepting…" : "Accept Ride",
                      onClick: () => acceptRide(r.id),
                      disabled: busyId !== null,
                    }}
                  />
                ))}
              </div>
            </Section>

            {/* Active */}
            <Section
              title="Active"
              subtitle="Accepted or in-progress rides"
              emptyText="No active rides."
            >
              <div style={{ display: "grid", gap: 12 }}>
                {active.map((r) => (
                  <RideCard key={r.id} ride={r} />
                ))}
              </div>
            </Section>

            {/* Recent */}
            <Section
              title="Recent"
              subtitle="Completed or cancelled trips"
              emptyText="No completed rides yet."
            >
              <div style={{ display: "grid", gap: 12 }}>
                {recent.slice(0, 8).map((r) => (
                  <RideCard key={r.id} ride={r} />
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        border: "1px solid rgba(2,6,23,0.08)",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 16px 40px rgba(2,6,23,0.06)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  emptyText,
  children,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  // detect empty children by rendering wrapper; simplest: show emptyText if no cards
  // caller passes list; we handle emptiness by checking for "No rides" outside is harder,
  // so we do a small trick:
  const asAny = children as any;
  const isEmpty =
    asAny?.props?.children?.length === 0 ||
    (Array.isArray(asAny?.props?.children) && asAny.props.children.length === 0);

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(2,6,23,0.08)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 55px rgba(2,6,23,0.07)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {isEmpty ? (
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px dashed rgba(2,6,23,0.15)",
              color: "#64748b",
              background: "rgba(2,6,23,0.02)",
              fontWeight: 600,
            }}
          >
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function RideCard({
  ride,
  primaryAction,
}: {
  ride: Ride;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
}) {
  const when = new Date(ride.createdAt).toLocaleString();

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 18,
        border: "1px solid rgba(2,6,23,0.08)",
        background: "#fff",
        boxShadow: "0 12px 35px rgba(2,6,23,0.06)",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          className=""
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(2,6,23,0.10)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#2563eb",
              display: "inline-block",
            }}
          />
          {ride.city || "Ijebu-Ode"}
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid",
            fontSize: 12,
            fontWeight: 800,
          }}
          className={statusPillClass(ride.status)}
        >
          {statusLabel(ride.status)}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <Row label="Pickup" value={ride.pickup} />
        <Row label="Destination" value={ride.destination} />
        <Row
          label="Estimate"
          value={formatMoney(ride.estimate)}
          right={
            ride.offeredPrice != null
              ? `Offer: ${formatMoney(ride.offeredPrice)}`
              : undefined
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 2,
        }}
      >
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>
          Created: {when}
          {ride.driverName ? ` • Driver: ${ride.driverName}` : ""}
        </div>

        {primaryAction ? (
          <button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(37,99,235,0.25)",
              background: primaryAction.disabled ? "#e2e8f0" : "#2563eb",
              color: primaryAction.disabled ? "#475569" : "#fff",
              fontWeight: 900,
              cursor: primaryAction.disabled ? "not-allowed" : "pointer",
              minWidth: 140,
            }}
          >
            {primaryAction.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  right,
}: {
  label: string;
  value: string;
  right?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "92px 1fr",
        gap: 10,
        alignItems: "baseline",
      }}
    >
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 900 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800, color: "#0f172a" }}>
        {value}
        {right ? (
          <span style={{ marginLeft: 10, color: "#1d4ed8", fontWeight: 900 }}>
            • {right}
          </span>
        ) : null}
      </div>
    </div>
  );
}
