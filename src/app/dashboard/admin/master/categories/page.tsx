import { Metadata } from "next";
import { AssetsCategories } from "./_ui/categories";

export const metadata: Metadata = {
  title: "MaintTrack | Manajemen Kategori",
};

export default function AssetsCategoriesManagementPage() {
  return <AssetsCategories />;
}
