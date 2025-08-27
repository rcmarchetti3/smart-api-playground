"use client";

import useSWRInfinite from "swr/infinite";
import { useMemo, useState } from "react";
import DeleteButton from "./components/DeleteButton";
import EditButton from "./components/EditButton";
import RunForm from "./components/RunForm";
import { toast } from "sonner";
import Card from "./components/Card";


/* Types */
type Run = { id: string; created_at: string; note: string };

type RunsOk = { ok: true; runs: Run[] };
type RunsErr = { ok: false; error: string };
type RunsPage = RunsOk | RunsErr;

/* Type guards */
const isOkPage = (p: RunsPage | undefined | null): p is RunsOk =>
  !!p && "ok" in p && p.ok === true;

/* Fetcher */
const fetcher = async (url: string): Promise<RunsPage> => {
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
};

const PAGE_SIZE = 20;

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [q, setQ] = useState("");

  const getKey = (index: number, prev: RunsPage | null) => {
    // Stop if previous page was ok AND shorter than a full page (no more)
    if (isOkPage(prev) && prev.runs.length < PAGE_SIZE) return null;

    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(index * PAGE_SIZE));
    if (q.trim()) params.set("q", q.trim());
    return `${api}/runs?${params.toString()}`;
  };

  const {
    data,
    error,
    size,
    setSize,
    mutate,
    isLoading,
  } = useSWRInfinite<RunsPage>(getKey, fetcher, { revalidateOnFocus: false });

  const pages: RunsPage[] = data ?? [];

  const flatRuns: Run[] = useMemo(() => {
    const okPages = pages.filter(isOkPage);
    return okPages.flatMap((p) => p.runs);
  }, [pages]);

  const isEmpty = flatRuns.length === 0 && !isLoading && !error;

  // Compute “has more” from the last page length (without any casts)
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : undefined;
  const lastLen = isOkPage(lastPage) ? lastPage.runs.length : 0;
  const hasMore = lastLen === PAGE_SIZE;

  /* -------- Optimistic handlers (work across pages) -------- */
  async function handleAdd(note: string) {
    const optimistic: Run = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      note,
    };

    await mutate((prev?: RunsPage[]) => {
      if (!prev || prev.length === 0) return [{ ok: true, runs: [optimistic] } satisfies RunsOk];
      const first = prev[0];
      if (!isOkPage(first)) return prev;
      const updatedFirst: RunsOk = { ok: true, runs: [optimistic, ...first.runs] };
      return [updatedFirst, ...prev.slice(1)];
    }, false);

    try {
      const res = await fetch(`${api}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error();
      toast.success("Run added");
      await mutate(); // revalidate all pages
    } catch {
      toast.error("Failed to add");
      await mutate();
    }
  }

  async function handleEdit(id: string, nextNote: string) {
    await mutate((prev?: RunsPage[]) => {
      if (!prev) return prev;
      return prev.map((page) =>
        isOkPage(page)
          ? ({ ok: true, runs: page.runs.map((r) => (r.id === id ? { ...r, note: nextNote } : r)) } as RunsOk)
          : page
      );
    }, false);

    try {
      const res = await fetch(`${api}/runs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: nextNote }),
      });
      if (!res.ok) throw new Error();
      await mutate();
    } catch {
      toast.error("Failed to save edit");
      await mutate();
    }
  }

  async function handleDelete(id: string) {
    await mutate((prev?: RunsPage[]) => {
      if (!prev) return prev;
      return prev.map((page) =>
        isOkPage(page)
          ? ({ ok: true, runs: page.runs.filter((r) => r.id !== id) } as RunsOk)
          : page
      );
    }, false);

    try {
      const res = await fetch(`${api}/runs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await mutate();
    } catch {
      toast.error("Failed to delete");
      await mutate();
    }
  }

  /* ----------------- UI ----------------- */
  if (error) return <p className="text-red-400">Failed to load</p>;

  return (
    <main className="container mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold text-emerald-400">Smart API Playground</h1>

      {/* Search */}
      <div className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            // reset to first page when search changes
            setSize(1);
            mutate(); // optional nudge; SWR usually refetches because key changed
          }}
          placeholder="Search notes…"
          className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-zinc-900 placeholder-zinc-500 outline-none transition
                     focus:ring-2 focus:ring-emerald-400
                     dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Add a run */}
      <RunForm onAdd={handleAdd} />

      <h2 className="mt-8 text-xl font-semibold">Run History</h2>

      {isLoading && pages.length === 0 ? (
        <p className="text-zinc-400 mt-4">Loading…</p>
      ) : isEmpty ? (
        <div
  className="
    mt-6 rounded-2xl border 
    border-zinc-300 bg-zinc-50 p-10 text-center
    dark:border-zinc-800 dark:bg-zinc-900/40
  "
>
  <div
    className="
      mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full
      border border-zinc-300 bg-zinc-100
      dark:border-zinc-800 dark:bg-zinc-900/60
    "
  >
    <span className="text-2xl">📝</span>
  </div>
  <p className="text-zinc-700 font-medium dark:text-zinc-300">No runs yet</p>
  <p className="text-zinc-500 text-sm mt-1 dark:text-zinc-500">
    Add your first run with the form above.
  </p>
</div>
      ) : (
        <>
         <ul className="mt-4 space-y-3">
  {flatRuns.map((run) => {
    const created = new Date(run.created_at).toLocaleString();
    return (
      <li key={run.id}>
        <Card className="group animate-fade-in p-4 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex-1 leading-relaxed">
              <time className="mr-2 align-middle text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {created}
              </time>
              <span className="align-middle">{run.note}</span>
            </span>

            <div className="flex gap-1 opacity-70 transition-opacity duration-150 group-hover:opacity-100">
              <EditButton
                id={run.id}
                currentNote={run.note}
                onEdit={(next) => handleEdit(run.id, next)}
              />
              <DeleteButton
                id={run.id}
                api={api}
                onDelete={() => handleDelete(run.id)}
              />
            </div>
          </div>
        </Card>
      </li>
    );
  })}
</ul>

          {/* Load more */}
          <div className="mt-6 flex justify-center">
            {hasMore ? (
              <button
                onClick={() => setSize(size + 1)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Load more
              </button>
            ) : (
              <p className="text-zinc-500 text-sm">No more runs</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}