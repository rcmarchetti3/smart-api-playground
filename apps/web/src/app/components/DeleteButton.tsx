"use client";
import { useRouter } from "next/navigation";

type DeleteButtonProps = {
  id: number; // change from string to number
  api: string;
};

export default function DeleteButton({ id, api }: DeleteButtonProps) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this run?")) return;
    const res = await fetch(`${api}/runs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert(`Delete failed (${res.status}) ${msg}`);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={onDelete} aria-label={`Delete run ${id}`}>
      🗑️
    </button>
  );
}