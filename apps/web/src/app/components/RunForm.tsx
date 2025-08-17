// apps/web/src/app/components/RunForm.tsx
"use client";

import { useState } from "react";

type Props = {
  onAdd: (note: string) => Promise<void> | void;
};

export default function RunForm({ onAdd }: Props) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    try {
      await onAdd(note.trim());
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 flex gap-3">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note..."
        className="
          w-full rounded-xl border px-4 py-3 outline-none
          border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400
          focus:border-transparent focus:ring-2 focus:ring-emerald-400
          dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500
        "
      />
      <button
        type="submit"
        disabled={busy}
        className="
          rounded-xl px-4 py-3 font-medium text-white shadow-sm transition-colors
          bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
          dark:bg-emerald-500 dark:hover:bg-emerald-600
        "
      >
        Add
      </button>
    </form>
  );
}