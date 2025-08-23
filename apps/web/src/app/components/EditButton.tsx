"use client";

type EditButtonProps = {
  id: string;
  currentNote: string;
  onEdit: (nextNote: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function EditButton({
  id,
  currentNote,
  onEdit,
  disabled,
}: EditButtonProps) {
  async function onClick() {
    const raw = window.prompt("Edit note:", currentNote);
    if (raw === null) return;                // user cancelled
    const next = raw.trim();
    if (!next || next === currentNote) return;

    // ✅ send the edited note, NOT the id
    await onEdit(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Edit run ${id}`}
      className="rounded-md px-2 py-1 hover:bg-zinc-800/10 disabled:opacity-50"
      title="Edit"
    >
      ✏️
    </button>
  );
}