import * as z from "zod";

export const MaintenanceSchema = z.object({
  date: z.string().min(1).trim(),
  type: z.string().min(1).trim(),
  cost: z.string().min(1).trim(),
  notes: z.string().optional(),
});
