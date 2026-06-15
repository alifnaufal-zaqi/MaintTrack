import { Asset } from "./asset";
import { Category } from "./categories";
import { Movement } from "./movements";
import { User } from "./users";
import { Vendor } from "./vendor";

export type History = {
  id: string;
  activity_type: "maintenance" | "movement";
  created_at: string;
  asset: Pick<Asset, "name" | "category" | "asset_image_url" | "status_asset">;
};

export type ExportMaintenanceReport = {
  id: string;
  asset: Pick<Asset, "name" | "status_asset"> & {
    vendor: Pick<Vendor, "name">;
  } & { category: Pick<Category, "name"> };
  cost: number;
  maintenance_date: string;
  maintenance_type: string;
  progress_status: string;
  pic: Pick<User, "fullname">;
};

export type ExportMovementReport = {
  id: string;
  asset: ExportMaintenanceReport["asset"];
  from_location: Movement["from_location"];
  to_location: Movement["to_location"];
  movement_date: string;
  pic: ExportMaintenanceReport["pic"];
};
