"use client";

import { useMemo, useState } from "react";

type RideRequest = {
  id: string;
  pickup: string;
  destination: string;
  estimate: number;
  status: "REQUESTED";
  createdAt: string;
};

function estimateFare(pickup: string, destination: string) {
  const base = 800; // NGN example
  const variable = (pickup.length + destination.length) * 25;
  return Math.max(900, base + variable);
}

export default function Home() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [requests, setRequests] = useState<RideRequest[]>([]);

  const estimate = useMemo(() => {
    if (!pickup || !destination) return null;
    return estimateFare(pickup, destination);
  }, [pickup, destination]);

  const canRequest = pickup.trim().length > 2 && destination.trim().length > 2;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">TOP DRIVE</h1>
      <p className="text-sm opacity-80 mt-1">
        Prototype (web first → mobile later)
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border p-5">
        <div>
          <label className="text-sm font-medium">Pickup</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g. Ikeja"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Destination</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g. Victoria Island"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="rounded-2xl bg-gray-50 border p-4">
          <div className="text-sm font-medium">Estimated Fare</div>
          <div className="text-2xl font-bold mt-1">
            {estimate ? `₦${estimate.toLocaleString()}` : "—"}
          </div>
          <div className="text-xs opacity-70 mt-1">
            (Mock estimate for now)
          </div>
        </div>

        <button
          disabled={!canRequest}
          className="w-full rounded-2xl bg-black text-white py-3 disabled:opacity-40"
          onClick={() => {
            const est = estimateFare(pickup, destination);
            const newReq: RideRequest = {
              id: crypto.randomUUID(),
              pickup,
              destination,
              estimate: est,
              status: "REQUESTED",
              createdAt: new Date().toISOString(),
            };
            setRequests((r) => [newReq, ...r]);
          }}
        >
          Request Ride
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Recent Requests (local)</h2>
          <a className="underline text-sm" href="/driver">
            Go to Driver View →
          </a>
        </div>

        <div className="mt-3 space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm opacity-70">No requests yet.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="rounded-2xl border p-4">
                <div className="font-semibold">
                  {r.pickup} → {r.destination}
                </div>
                <div className="text-sm opacity-80 mt-1">
                  Fare: ₦{r.estimate.toLocaleString()} • Status: {r.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
