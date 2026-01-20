import Link from "next/link";

export default function AdminIndex() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/overview" className="p-4 border rounded hover:shadow">Overview & Metrics</Link>
        <Link href="/admin/drivers" className="p-4 border rounded hover:shadow">Drivers</Link>
        <Link href="/admin/rides" className="p-4 border rounded hover:shadow">Rides</Link>
        <Link href="/admin/users" className="p-4 border rounded hover:shadow">Users</Link>
        <Link href="/admin/notifications" className="p-4 border rounded hover:shadow">Notifications</Link>
        <Link href="/admin/map" className="p-4 border rounded hover:shadow">Live Map</Link>
      </div>
    </div>
  );
}
