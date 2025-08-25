import { z } from "zod";

// Shared rules
export const NoteSchema = z
  .string()
  .trim()
  .min(1, "Note is required")
  .max(500, "Note must be ≤ 500 characters");

const uuidRE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const IdParamSchema = z
  .string()
  .trim()
  .refine(
    (v: string) => uuidRE.test(v) || /^\d+$/.test(v),
    "Bad id"
  );

export const RunsQuerySchema = z.object({
  // if you prefer to accept strings from query and coerce to numbers:
  limit: z
    .string()
    .default("20")
    .transform((s: string) => Number(s))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .default("0")
    .transform((s: string) => Number(s))
    .pipe(z.number().int().min(0)),
  q: z.string().trim().max(200).optional().nullable(),
});

export const CreateRunSchema = z.object({ note: NoteSchema });
export const PatchRunSchema = z.object({ note: NoteSchema });

// (Optional) exported types
export type CreateRunInput = z.infer<typeof CreateRunSchema>;
export type PatchRunInput  = z.infer<typeof PatchRunSchema>;
export type RunsQuery      = z.infer<typeof RunsQuerySchema>;