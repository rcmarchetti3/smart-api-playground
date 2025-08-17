"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type EditButtonProps = {
  id: string;
  currentNote: string;
  /** If provided, do optimistic edit in parent */
  onEdit?: (id: string, nextNote: string) => Promise<void> | void;
  /** Fallback base URL if no onEdit handler is passed */
  api?: string;
  disabled?: boolean;
};

export default function EditButton({
  id,
  currentNote,
  onEdit,
  api,
  disabled,
}: EditButtonProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentNote);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    const note = value.trim();
    if (!note) return;

    setBusy(true);
    try {
      if (onEdit) {
        await onEdit(id, note);
      } else {
        if (!api) {
          console.error("EditButton: missing `api` when no `onEdit` is provided");
        } else {
          const res = await fetch(`${api}/runs/${String(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note }),
          });
          if (!res.ok) throw new Error("edit failed");
          router.refresh();
        }
      }
      setEditing(false);
    } catch  {
      alert("Edit failed");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:text-amber-400 disabled:opacity-50"
        disabled={disabled}
        aria-label={`Edit run ${id}`}
      >
        ✏️
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={busy}
      />
      <button
        className="rounded-md bg-emerald-600 px-2 py-1 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
        onClick={save}
        disabled={busy}
      >
        Save
      </button>
      <button
        className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
        onClick={() => {
          setValue(currentNote);
          setEditing(false);
        }}
        disabled={busy}
      >
        Cancel
      </button>
    </div>
  );
}