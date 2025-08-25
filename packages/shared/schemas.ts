// packages/shared/schemas.ts
import { z } from "zod";

/** ---------- Primitives ---------- */
export const Note = z
  .string()
  .trim()
  .min(1, "Note is required")
  .max(500, "Note must be ≤ 500 characters");

/** UUID or integer id (as string) */
export const IdParam = z
  .string()
  .trim()
  .refine(
    (v) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ||
      /^\d+$/.test(v),
    "Bad id"
  );

/** ---------- Route Schemas ---------- */
export const RunsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  q: z
    .string()
    .trim()
    .transform((v) => (v.length ? v : undefined))
    .optional(),
});

export const CreateRunSchema = z.object({ note: Note });
export const PatchRunSchema = z.object({ note: Note });

/** ---------- Types ---------- */
export type RunsQuery = z.infer<typeof RunsQuerySchema>;
export type CreateRunInput = z.infer<typeof CreateRunSchema>;
export type PatchRunInput = z.infer<typeof PatchRunSchema>;

/** ---------- Legacy aliases (to avoid breaking imports) ---------- */
export const NoteSchema = Note;
export const IdParamSchema = IdParam;