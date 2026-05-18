import * as z from "zod";

export const CategorySchema = z.object({
  name: z.string().trim(),
});
