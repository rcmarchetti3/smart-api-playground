"use client";

import { useState } from "react";
import { z } from "zod";

const NoteSchema = z.object({
  note: z.string().trim().min(1, "Required").max(500, "Max 500 chars"),
});

type Props = {
  onAdd: (note: string) => Promise<void> | void;
};

export default function RunForm({ onAdd }: Props) {
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const parsed = NoteSchema.safeParse({ note });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid");
      return;
    }

    try {
      setSubmitting(true);
      await onAdd(parsed.data.note);
      setNote("");
    } catch {
      setErr("Failed to add. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <div className="flex-1">
        <label htmlFor="note" className="sr-only">Note</label>
        <input
          id="note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="note"
          aria-invalid={!!err}
          aria-describedby={err ? "note-error" : undefined}
          disabled={submitting}
          className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-zinc-900 placeholder-zinc-500 outline-none transition
                     focus:ring-2 focus:ring-emerald-400
                     dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        {err && (
          <p id="note-error" className="mt-1 text-sm text-red-400">{err}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Add Run"}
      </button>
    </form>
  );
}