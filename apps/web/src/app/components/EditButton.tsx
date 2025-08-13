"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditButton({ id, api, currentNote }: { id: number; api: string; currentNote: string }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(currentNote);
  const router = useRouter();

  async function onSave() {
    const res = await fetch(`${api}/runs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`Edit failed (${res.status}) ${msg}`);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return editing ? (
    <span>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        style={{ marginRight: 8 }}
      />
      <button onClick={onSave}>💾</button>
      <button onClick={() => setEditing(false)}>❌</button>
    </span>
  ) : (
    <button onClick={() => setEditing(true)}>✏️</button>
  );
}