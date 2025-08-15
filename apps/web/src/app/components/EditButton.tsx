"use client";
import { useState } from "react";

type EditButtonProps = {
  id: string;
  currentNote: string;
  onEdit: (id: string, nextNote: string) => void | Promise<void>;
};

export default function EditButton({ id, currentNote, onEdit }: EditButtonProps) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(currentNote);

  const start = () => {
    setNote(currentNote);
    setEditing(true);
  };

  const save = () => {
    // fire & forget (don’t wait for network)
    onEdit(id, note);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return editing ? (
    <div className="flex items-center gap-1">
      <input
        className="rounded bg-zinc-800 px-2 py-1 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="rounded bg-emerald-600 px-2 py-1 text-sm" onClick={save} aria-label="Save">
        💾
      </button>
      <button className="rounded bg-zinc-700 px-2 py-1 text-sm" onClick={cancel} aria-label="Cancel">
        ✖
      </button>
    </div>
  ) : (
    <button className="rounded px-2 py-1 text-sm hover:bg-zinc-800" onClick={start} aria-label="Edit">
      ✏️
    </button>
  );
}