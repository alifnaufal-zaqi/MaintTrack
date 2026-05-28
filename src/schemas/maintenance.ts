import * as z from "zod";

export const MaintenanceSchema = z.object({
  asset_name: z.string().trim(),
  maintenance_date: z.string(),
  maintenance_type: z.string().trim(),
  pic: z.string().trim(),
  progress_status: z.string().trim(),
  description: z.string().optional(),
});
