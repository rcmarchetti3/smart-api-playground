// apps/web/src/app/components/DeleteButton.tsx
"use client";

import { useRouter } from "next/navigation";

export type DeleteButtonProps = {
  id: string;
  api: string;
  /** Optional: let the parent handle optimistic delete */
  onDelete?: () => Promise<void> | void;
  disabled?: boolean;
};

export default function DeleteButton({
  id,
  api,
  onDelete,
  disabled,
}: DeleteButtonProps) {
  const router = useRouter();

  async function handleClick() {
    // If parent supplied an optimistic handler, use it.
    if (onDelete) {
      await onDelete();
      return;
    }

    // Fallback: do the delete here
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
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Delete run ${id}`}
      disabled={disabled}
      className="rounded-md px-2 py-1 hover:bg-zinc-800/50 disabled:opacity-50"
      title="Delete"
    >
      🗑️
    </button>
  );
}