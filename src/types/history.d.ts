import { Asset } from "./asset";

export type History = {
  id: string;
  activity_type: "maintenance" | "movement";
  created_at: string;
  asset: Pick<Asset, "name" | "category" | "asset_image_url" | "status_asset">;
};
