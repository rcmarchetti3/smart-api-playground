// apps/web/src/app/components/RunForm.tsx
"use client";
import { useState } from "react";

export default function RunForm({ onAdd }: { api: string; onAdd: (note: string) => void }) {
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!note.trim()) return;
        onAdd(note.trim());
        setNote("");
      }}
      className="mt-6 flex gap-2"
    >
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note…"
        className="flex-1 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2 text-sm
                   placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none
                   focus:ring-2 focus:ring-emerald-500/20"
      />
      <button
        type="submit"
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950
                   hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                   active:translate-y-[1px] transition"
      >
        Add
      </button>
    </form>
  );
}