"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RunForm({ api }: { api: string }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = note.trim();
    if (!trimmed) return setError("Please enter a note.");

    setBusy(true);
    try {
      const res = await fetch(`${api}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmed }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setNote("");
      router.refresh(); // re-fetches server-rendered list
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
      <input
        name="note"
        placeholder="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ marginRight: 8, padding: 4 }}
      />
      <button disabled={busy} style={{ padding: "4px 8px" }}>
        {busy ? "Saving..." : "Add Run"}
      </button>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
    </form>
  );
}