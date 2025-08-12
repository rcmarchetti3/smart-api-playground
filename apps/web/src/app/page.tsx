// apps/web/src/app/page.tsx
import DeleteButton from "./components/DeleteButton";

// Types that mirror the API
type Run = {
  id: number;
  created_at: string; // ISO string from Postgres
  note: string;
};

type RunsResponse =
  | { ok: true; runs: Run[] }
  | { ok: false; error: string };

// Server component
export default async function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  let data: RunsResponse = { ok: true, runs: [] };

  try {
    const res = await fetch(`${api}/runs`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    data = (await res.json()) as RunsResponse;
  } catch (err) {
    data = { ok: false, error: (err as Error).message };
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Smart API Playground</h1>

      {/* Add a run */}
      <form action={`${api}/runs`} method="post" style={{ marginBottom: 24 }}>
        <input
          name="note"
          placeholder="note"
          required
          maxLength={500}
          data-gramm="false"
          style={{ marginRight: 8, padding: 4 }}
        />
        <button formMethod="post" style={{ padding: "4px 8px" }}>
          Add Run
        </button>
      </form>

      {/* Runs list */}
      <h2>Run History</h2>
      {!data.ok ? (
        <p style={{ color: "crimson" }}>Failed to load: {data.error}</p>
      ) : data.runs.length > 0 ? (
        <ul>
          {data.runs.map((run: Run) => (
            <li
              key={run.id}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ flex: 1 }}>
                {new Date(run.created_at).toLocaleString()} — {run.note}
              </span>
             <DeleteButton id={run.id} api={api} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No runs yet. Add one above!</p>
      )}
    </main>
  );
}