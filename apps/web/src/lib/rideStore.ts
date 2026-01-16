"use client";

import type { RideRequest, RideStatus } from "../../../../packages/shared/ride";
import { STORAGE_KEY } from "../../../../packages/shared/ride";


/**
 * Load rides from localStorage (safe + defensive).
 */
export function loadRides(): RideRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RideRequest[];
  } catch {
    return [];
  }
}

/**
 * Save rides to localStorage.
 */
export function saveRides(rides: RideRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

/**
 * Subscribe to changes (storage events across tabs/windows).
 */
export function subscribeToRideChanges(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Helper: simple fare estimate for now (later: distance/time from map).
 */
export function estimateFare(pickup: string, destination: string) {
  const base = 900;
  const variable = (pickup.length + destination.length) * 25;
  return Math.max(1200, base + variable);
}

/**
 * Create a ride request.
 */
export function createRide(input: { pickup: string; destination: string; offeredPrice?: number }) {
  const now = new Date().toISOString();
  const ride: RideRequest = {
    id: crypto.randomUUID(),
    pickup: input.pickup.trim(),
    destination: input.destination.trim(),
    estimate: estimateFare(input.pickup, input.destination),
    offeredPrice: input.offeredPrice,
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
    city: "Ijebu-Ode",
  };

  const rides = loadRides();
  saveRides([ride, ...rides]);
  return ride;
}

/**
 * Update ride status and optional driver assignment.
 */
export function updateRide(rideId: string, patch: Partial<RideRequest>) {
  const rides = loadRides();
  const updated = rides.map((r) => {
    if (r.id !== rideId) return r;
    return { ...r, ...patch, updatedAt: new Date().toISOString() };
  });
  saveRides(updated);
}

/**
 * Convenience: change status with guard rails.
 */
export function setRideStatus(rideId: string, status: RideStatus) {
  updateRide(rideId, { status });
}
