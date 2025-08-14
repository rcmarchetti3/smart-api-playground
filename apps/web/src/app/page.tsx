// apps/web/src/app/page.tsx
import DeleteButton from "./components/DeleteButton";
import RunForm from "./components/RunForm";
import EditButton from "./components/EditButton";

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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Smart API Playground</h1>

        {/* Add a run */}
        <section className="mt-6">
          <RunForm api={api} />
        </section>

        {/* Runs list */}
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-medium text-zinc-200">Run History</h2>

          {!data.ok ? (
            <div
              role="alert"
              className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
            >
              Failed to load: {data.error}
            </div>
          ) : data.runs.length > 0 ? (
            <ul className="divide-y divide-zinc-800/80 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
              {data.runs.map((run: Run) => (
                <li
                  key={run.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/60"
                >
                  <span className="flex-1 text-zinc-200">
                    <span className="mr-2 font-mono text-zinc-400">
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                    — {run.note}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <EditButton id={run.id} api={api} currentNote={run.note} />
                    <DeleteButton id={run.id} api={api} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300">
              No runs yet. Add one above!
            </p>
          )}
        </section>
      </div>
    </main>
  );
}