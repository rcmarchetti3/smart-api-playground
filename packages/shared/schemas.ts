import { z } from "zod";

// Shared rules
export const NoteSchema = z
  .string()
  .trim()
  .min(1, "Note is required")
  .max(500, "Note must be ≤ 500 characters");

export const IdParamSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ||
      /^\d+$/.test(v),
    "Bad id"
  );

export const RunsQuerySchema = z.object({
  limit: z
    .string()
    .default("20")
    .transform((s) => Number(s))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .default("0")
    .transform((s) => Number(s))
    .pipe(z.number().int().min(0)),
  q: z.string().trim().max(200).optional().nullable(),
});

export const CreateRunSchema = z.object({ note: NoteSchema });
export const PatchRunSchema = z.object({ note: NoteSchema });