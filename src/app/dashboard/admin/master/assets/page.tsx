import { Metadata } from "next";
import { ListAssetsPage } from "./_ui/asset";

export const metadata: Metadata = {
  title: "MaintTrack | List Asset",
};

export default function AssetsManagementPage() {
  return <ListAssetsPage />;
}
