// apps/web/src/app/page.tsx

type Run = {
  id: number;
  created_at: string;        // ISO timestamp from API
  note: string | null;
};

type RunsResponse = {
  runs: Run[];
};

// The page component is async so we can fetch data server-side
export default async function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  // Fetch the runs list from the backend API
  const res = await fetch(`${api}/runs`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load runs: ${res.status}`);
  }
  const data: RunsResponse = await res.json();

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Smart API Playground</h1>

      {/* Form to add a new run */}
      <form action={`${api}/runs`} method="post" style={{ marginBottom: 24 }}>
        <input
          name="note"
          placeholder="note"
          style={{ marginRight: 8, padding: 4 }}
        />
        <button formMethod="post" style={{ padding: "4px 8px" }}>
          Add Run
        </button>
      </form>

      {/* Display the runs list */}
      <h2>Run History</h2>
      {data.runs?.length ? (
        <ul>
          {data.runs.map((run) => (
            <li key={run.id}>
              {new Date(run.created_at).toLocaleString()} — {run.note ?? "—"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No runs yet. Add one above!</p>
      )}
    </main>
  );
}