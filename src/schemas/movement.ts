import * as z from "zod";

export const MovementSchema = z.object({
  fromLocation: z.string().min(1).trim(),
  toLocation: z.string().min(1).trim(),
  notes: z.string().optional(),
});
