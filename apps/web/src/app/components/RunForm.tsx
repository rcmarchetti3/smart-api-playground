"use client";
import { useState } from "react";

type RunFormProps = {
  onAdd: (note: string) => void | Promise<void>;
  pending?: boolean;
};

export default function RunForm({ onAdd, pending = false }: RunFormProps) {
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = note.trim();
        if (!v || pending) return;
        onAdd(v);
        setNote("");
      }}
      className="mt-4 flex gap-2"
    >
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="note"
        className="flex-1 rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-zinc-900 placeholder-zinc-500 outline-none transition
                   focus:ring-2 focus:ring-emerald-400
                   dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder-zinc-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Adding…" : "Add Run"}
      </button>
    </form>
  );
}
