import { Asset } from "./asset";
import { User } from "./users";

export type Maintenance = {
  id: string;
  asset: Pick<Asset, "name" | "asset_image_url" | "id">;
  maintenance_date: string;
  maintenance_type: string;
  created_by: Pick<User, "fullname">;
  cost: number;
  progress_status: string;
  notes: string | null;
  created_at: string;
};

export type MaintenanceError = {
  date?: string[] | undefined;
  type?: string[] | undefined;
  cost?: string[] | undefined;
  notes?: string[] | undefined;
};
