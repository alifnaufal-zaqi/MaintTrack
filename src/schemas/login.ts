import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ error: "Email tidak valid" }).trim(),
  password: z
    .string()
    .min(8, { error: "Password harus memiliki minimal 8 karakter" })
    .max(16, { error: "Password tidak boleh melebihi 16 karakter" })
    .trim(),
});
