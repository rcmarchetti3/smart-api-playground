// apps/web/src/app/page.tsx
"use client";

import useSWR from "swr";
import DeleteButton from "./components/DeleteButton";
import EditButton from "./components/EditButton";
import RunForm from "./components/RunForm";
import { toast } from "sonner";

type Run = {
  id: number | string;
  created_at: string;
  note: string;
};

type RunsResponse =
  | { ok: true; runs: Run[] }
  | { ok: false; error: string };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const { data, error, mutate, isLoading } = useSWR<RunsResponse>(`${api}/runs`, fetcher);

  // ---------- Optimistic ADD ----------
  const handleAdd = async (note: string) => {
    const optimisticRun: Run = {
      id: Date.now(), // temp id for UI
      created_at: new Date().toISOString(),
      note,
    };

    // Optimistic list update
    await mutate(
      (prev) => {
        const base = (prev && "runs" in prev) ? prev.runs : [];
        return { ok: true, runs: [optimisticRun, ...base] } as RunsResponse;
      },
      { revalidate: false }
    );

    try {
      const res = await fetch(`${api}/runs`, {
        method: "POST",
        body: JSON.stringify({ note }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("POST failed");
      toast.success("Run added successfully!");
      // Revalidate to get the authoritative row from the server
      mutate();
    } catch {
      toast.error("Failed to add run. Reverting…");
      mutate(); // rollback by refetching current truth from server
    }
  };

  // ---------- Optimistic EDIT (instant) ----------
  const handleEdit = async (id: string, nextNote: string) => {
    const current = (data && "runs" in data) ? data : { ok: true, runs: [] as Run[] };

    const optimistic = {
      ok: true,
      runs: current.runs.map((r) => (String(r.id) === id ? { ...r, note: nextNote } : r)),
    } as RunsResponse;

    await mutate(
      async (prev) => {
        // Send PATCH in the background
        const res = await fetch(`${api}/runs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: nextNote }),
        });
        if (!res.ok) throw new Error("PATCH failed");

        // If API returns { ok:true, run }, prefer that;
        // otherwise keep the optimistic note
        let updatedRun: Run | null = null;
        try {
          const body = await res.json();
          updatedRun = body?.run ?? null;
        } catch {
          /* ignore parse errors */
        }

        const prevRuns = (prev && "runs" in prev ? prev.runs : []) as Run[];
        const finalRuns = prevRuns.map((r) =>
          String(r.id) === id ? (updatedRun ?? { ...r, note: nextNote }) : r
        );

        toast.success("Run updated");
        return { ok: true, runs: finalRuns } as RunsResponse;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false, // no extra GET needed; we just populated the cache
      }
    );
  };

  if (error) return <p className="text-red-400">Failed to load</p>;
  if (isLoading) return <p className="text-zinc-400">Loading...</p>;

  const runs: Run[] = (data && "runs" in data ? data.runs : []) ?? [];

  return (
    <main className="container mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold text-emerald-400">Smart API Playground</h1>

      {/* Add a run (client-side; calls handleAdd) */}
      <RunForm api={api} onAdd={handleAdd} />

      {/* Runs list */}
      <h2 className="mt-8 text-xl font-semibold">Run History</h2>

      {runs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-zinc-300 font-medium">No runs yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Add your first run with the form above.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {runs.map((run) => {
            const created = new Date(run.created_at).toLocaleString();
            return (
              <li
                key={String(run.id)}
                className="group animate-fade-in rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-900/80 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex-1 leading-relaxed">
                    <time className="mr-2 align-middle text-sm font-medium text-zinc-400">
                      {created}
                    </time>
                    <span className="align-middle">{run.note}</span>
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-70 transition-opacity duration-150 group-hover:opacity-100">
                    <EditButton
                      id={String(run.id)}
                      currentNote={run.note}
                      onEdit={handleEdit}
                    />
                    <DeleteButton id={String(run.id)} api={api} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}