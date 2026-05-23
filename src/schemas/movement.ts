import * as z from "zod";

export const MovementSchema = z.object({
  asset_id: z.string().uuid(),
  from_location_id: z.string().uuid(),
  to_location_id: z.string().uuid(),
  movement_date: z.string().datetime(),
  pic_name: z.string().trim(),
  notes: z.string().optional(),
});