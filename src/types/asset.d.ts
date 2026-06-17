import { Category } from "./categories";
import { Location } from "./locations";
import { Vendor } from "./vendor";

export type Asset = {
  id: string;
  name: string;
  category: Pick<Category, "id" | "name">;
  vendor: Pick<Vendor, "id" | "name">;
  current_location: Pick<Location, "id" | "name">;
  purchase_price: number;
  purchase_date: string;
  qr_tag: string;
  next_maintenance_date: string;
  status_asset: "active" | "maintenance" | "nonactive" | "overdue" | string;
  created_at: string;
  maintenance_interval: number;
  last_maintenance_date: string;
  asset_image_url: string;
  asset_image_path: string;
};

export type FormAsset = {
  name?: Asset["name"][];
  category?: Category["name"][];
  vendor?: Vendor["name"][];
  location?: Location["name"][];
  purchasePrice?: string[];
  purchaseDate?: string[];
  status_asset?: string[];
  maintenanceInterval?: string[];
  image?: string[];
};

type MutationAsset = Omit<
  Asset,
  | "category"
  | "vendor"
  | "current_location"
  | "id"
  | "created_at"
  | "last_maintenance_date"
> & {
  category_id: Asset["category"]["id"];
  vendor_id: Asset["vendor"]["id"];
  current_location_id: Asset["current_location"]["id"];
  asset_image_path: string;
};

type AssetPreview = Pick<
  Asset,
  | "id"
  | "name"
  | "category"
  | "vendor"
  | "current_location"
  | "status_asset"
  | "asset_image_url"
  | "asset_image_path"
> & {
  qr_tag: string;
};

type AssetPreviewEditable = AssetPreview &
  Pick<Asset, "purchase_price" | "purchase_date" | "maintenance_interval">;
