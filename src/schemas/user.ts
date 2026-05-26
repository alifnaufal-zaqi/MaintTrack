import * as z from "zod";

export const UserSchema = z.object({
  fullname: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone_number: z.string().trim().min(1, "Nomor kontak wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.string(),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
});
