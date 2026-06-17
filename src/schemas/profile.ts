import * as z from "zod";

export const ProfileSchema = z.object({
  fullname: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().max(15).trim().optional(),
  address: z.string().trim().optional(),
});
