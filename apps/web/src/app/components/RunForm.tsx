"use client";

import { useRouter } from "next/navigation";

export default function RunForm({ api }: { api: string }) {
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent navigation to JSON
    const form = e.currentTarget;
    const data = new FormData(form);
    const note = String(data.get("note") ?? "").trim();
    if (!note) return;

    const res = await fetch(`${api}/runs`, {
      method: "POST",
      body: new URLSearchParams({ note }), // urlencoded matches your API
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`Create failed (${res.status}) ${msg}`);
      return;
    }

    form.reset();
    router.refresh(); // reloads server data for the list
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
      <input
        name="note"
        placeholder="note"
        required
        maxLength={500}
        data-gramm="false"
        style={{ marginRight: 8, padding: 4 }}
      />
      <button type="submit" style={{ padding: "4px 8px" }}>
        Add Run
      </button>
    </form>
  );
}