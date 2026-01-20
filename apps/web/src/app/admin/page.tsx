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
