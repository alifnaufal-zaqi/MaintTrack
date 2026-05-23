import * as z from "zod";

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPE = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg",
];

export const VendorSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim(),
  address: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
  logo: z
    .instanceof(File)
    .refine((file) => file.size > 0)
    .refine((file) => file.size <= MAX_SIZE)
    .refine((file) => ACCEPTED_MIME_TYPE.includes(file.type)),
});
