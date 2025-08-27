// apps/web/src/app/components/RunForm.tsx
"use client";

import { useId, useState } from "react";
import { NoteSchema } from "shared/schemas";

type Props = {
  onAdd: (note: string) => Promise<void> | void;
};

export default function RunForm({ onAdd }: Props) {
  const inputId = useId();
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = NoteSchema.safeParse(note);
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      await onAdd(parsed.data);
      setNote("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2">
      <div className="flex-1">
        <label htmlFor={inputId} className="sr-only">Note</label>
        <input
          id={inputId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="note"
          className={`w-full rounded-lg border px-3 py-2 outline-none transition
            border-zinc-300 bg-white/80 text-zinc-900 placeholder-zinc-500
            focus:ring-2 focus:ring-emerald-400
            dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder-zinc-500
            ${err ? "border-red-400 focus:ring-red-400" : ""}`}
          disabled={submitting}
        />
        {err && (
          <p className="mt-1 text-sm text-red-500">{err}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-500 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add Run"}
      </button>
    </form>
  );
}