export default function DriverPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Driver View</h1>
      <p className="mt-2 text-sm opacity-80">
        For now this is a placeholder. Next step: persist ride requests so this page can list them.
      </p>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="font-semibold">Next step options</div>
        <ul className="list-disc pl-5 mt-2 text-sm space-y-1 opacity-90">
          <li>Use localStorage to persist requests</li>
          <li>Add API route + in-memory store</li>
          <li>Add Supabase (DB + auth) for real persistence</li>
        </ul>
      </div>

      <a className="underline text-sm mt-6 inline-block" href="/">
        ← Back to Rider View
      </a>
    </main>
  );
}
