import { z } from "zod";

export const NoteSchema = z.object({
  note: z.string().trim().min(1, "note required").max(500),
});

export const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().max(200).optional(),
});