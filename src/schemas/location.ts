import * as z from "zod";

export const LocationSchema = z.object({
  name: z.string().trim(),
});