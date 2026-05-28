import * as z from "zod";

export const UserSchema = z.object({
  fullname: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(16, "Password maksimal 16 karakter"),
  role: z.string(),
});

export const ResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password minimal 8 karakter")
    .max(16, "Password maksimal 16 karakter"),
  confirmPassword: z
    .string()
    .min(6, "Password minimal 8 karakter")
    .max(16, "Password maksimal 16 karakter"),
});
