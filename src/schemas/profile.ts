import * as z from "zod";

export const ProfileSchema = z.object({
  fullname: z.string().min(1).trim(),
  email: z.string().min(1).trim(),
  phone: z.string().min(1).max(15).trim(),
  address: z.string().min(1).trim(),
});
