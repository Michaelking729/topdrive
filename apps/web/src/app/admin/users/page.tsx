import React from "react";

export default async function UsersPage() {
  const res = await fetch('/api/admin/users', { cache: 'no-store' });
  const users = await res.json().catch(() => []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="space-y-2">
        {users.map((u: any) => (
          <div key={u.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-medium">{u.name ?? u.email}</div>
              <div className="text-sm text-muted">{u.email}</div>
            </div>
            <div className="text-sm">Role: {u.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
