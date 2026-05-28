import { Metadata } from "next";
import { ListAssetsPage_Operator } from "./_ui/asset";

export const metadata: Metadata = {
  title: "MaintTrack | List Asset",
};

export default function AssetsManagementPage() {
  return <ListAssetsPage_Operator />;
}
