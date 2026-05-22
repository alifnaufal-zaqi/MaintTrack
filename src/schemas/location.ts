import * as z from "zod";

export const LocationSchema = z.object({
  name: z.string().trim(),
  type: z.string().trim(),
  description: z.string().trim(),
});