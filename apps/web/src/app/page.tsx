// apps/web/src/app/page.tsx
"use client";

import useSWR from "swr";
import DeleteButton from "./components/DeleteButton";
import EditButton from "./components/EditButton";
import RunForm from "./components/RunForm";
import ThemeToggle from "./components/ThemeToggle";
import { toast } from "sonner";

/* Types */
type Run = { id: number | string; created_at: string; note: string };
type RunsOk = { ok: true; runs: Run[] };
type RunsErr = { ok: false; error: string };
type RunsResponse = RunsOk | RunsErr;

/* Fetcher */
const fetcher = async (url: string): Promise<RunsResponse> => {
  const res = await fetch(url);
  return res.json();
};

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const { data, error, mutate, isLoading } = useSWR<RunsResponse>(`${api}/runs`, fetcher);

  /* Optimistic add */
  const handleAdd = async (note: string) => {
    const temp: Run = { id: Date.now(), created_at: new Date().toISOString(), note };

    await mutate((prev) => {
      if (!prev || !("runs" in prev)) return { ok: true, runs: [temp] } as RunsOk;
      return { ok: true, runs: [temp, ...prev.runs] } as RunsOk;
    }, false);

    try {
      const res = await fetch(`${api}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("add failed");
      toast.success("Run added");
      await mutate();
    } catch {
      toast.error("Failed to add");
      await mutate();
    }
  };

  /* Optimistic edit */
  const handleEdit = async (id: string, nextNote: string) => {
    const key = String(id);

    await mutate((prev) => {
      if (!prev || !("runs" in prev)) return prev;
      return {
        ok: true,
        runs: prev.runs.map((r) => (String(r.id) === key ? { ...r, note: nextNote } : r)),
      } as RunsOk;
    }, false);

    try {
      const res = await fetch(`${api}/runs/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: nextNote }),
      });
      if (!res.ok) throw new Error("edit failed");
      await mutate();
    } catch {
      await mutate();
    }
  };

  /* Optimistic delete */
  const handleDelete = async (id: string) => {
    const key = String(id);

    await mutate((prev) => {
      if (!prev || !("runs" in prev)) return prev;
      return { ok: true, runs: prev.runs.filter((r) => String(r.id) !== key) } as RunsOk;
    }, false);

    try {
      const res = await fetch(`${api}/runs/${key}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      await mutate();
    } catch {
      await mutate();
    }
  };

  if (error) return <p className="text-red-500">Failed to load</p>;
  if (isLoading || !data) return <p className="text-zinc-500">Loading...</p>;

  const runs = "runs" in data ? data.runs : [];

  return (
    <main className="container mx-auto max-w-2xl p-6">
      <ThemeToggle />

      <h1 className="text-3xl font-bold text-emerald-500">Smart API Playground</h1>

      <RunForm onAdd={handleAdd} />

      <h2 className="mt-8 text-xl font-semibold">Run History</h2>

      {runs.length === 0 ? (
        <div
          className="
            mt-6 rounded-2xl border p-10 text-center
            border-zinc-200 bg-white
            dark:border-zinc-800 dark:bg-zinc-900/40
          "
        >
          <div
            className="
              mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border
              border-zinc-200 bg-zinc-50
              dark:border-zinc-800 dark:bg-zinc-900/60
            "
          >
            <span className="text-2xl">📝</span>
          </div>
          <p className="font-medium text-zinc-700 dark:text-zinc-300">No runs yet</p>
          <p className="mt-1 text-sm text-zinc-500">Add your first run with the form above.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {runs.map((run) => {
            const created = new Date(run.created_at).toLocaleString();
            return (
              <li
                key={String(run.id)}
                className="
                  group animate-fade-in rounded-xl border p-4 shadow-sm transition-all duration-200
                  border-zinc-200 bg-white hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md
                  dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex-1 leading-relaxed">
                    <time className="mr-2 align-middle text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {created}
                    </time>
                    <span className="align-middle text-zinc-900 dark:text-zinc-100">{run.note}</span>
                  </span>

                  <div className="flex gap-1 opacity-70 transition-opacity duration-150 group-hover:opacity-100">
                    <EditButton
                      id={String(run.id)}
                      api={api}
                      currentNote={run.note}
                      onEdit={(next) => handleEdit(String(run.id), next)}
                      disabled={false}
                    />
                    <DeleteButton
                      id={String(run.id)}
                      api={api}
                      onDelete={() => handleDelete(String(run.id))}
                      disabled={false}
                    />
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