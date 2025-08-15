"use client";
import { useRouter } from "next/navigation";

export type DeleteButtonProps = {
  id: string;           // <- keep 'id'
  api: string;
  onOptimisticDelete?: (id: string) => void; // optional, if you added optimistic UI
};

export default function DeleteButton({ id, api, onOptimisticDelete }: DeleteButtonProps) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this run?")) return;

    // (Optional) optimistic
    onOptimisticDelete?.(id);

    const res = await fetch(`${api}/runs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(`Delete failed (${res.status}) ${await res.text().catch(() => "")}`);
      router.refresh(); // rollback if needed
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