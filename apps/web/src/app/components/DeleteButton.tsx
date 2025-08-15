// apps/web/src/app/components/DeleteButton.tsx
"use client";

type DeleteButtonProps = { onDelete: () => void; disabled?: boolean };

export default function DeleteButton({ onDelete, disabled }: DeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={disabled}
      aria-label="Delete run"
      className="rounded-md bg-zinc-700 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:opacity-50"
      title="Delete"
    >
      🗑️
    </button>
  );
}