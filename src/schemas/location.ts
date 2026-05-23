import * as z from "zod";

export const LocationSchema = z.object({
  name: z.string().min(1).trim(),
  type: z.string().min(1).trim(),
  description: z.string().min(1).trim(),
});
