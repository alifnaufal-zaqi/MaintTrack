import * as z from "zod";

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPE = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg",
];

export const AssetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  vendor: z.string().min(1),
  location: z.string().min(1),
  purchasePrice: z.string().min(1),
  purchaseDate: z.string().min(1),
  status_asset: z.string().min(1),
  maintenanceInterval: z.string().min(1),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0)
    .refine((file) => file.size <= MAX_SIZE)
    .refine((file) => ACCEPTED_MIME_TYPE.includes(file.type)),
});
