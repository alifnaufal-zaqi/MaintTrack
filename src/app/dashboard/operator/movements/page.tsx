import { Metadata } from "next";
import { AssetMovement } from "./_ui/movement";

export const metadata: Metadata = {
  title: "MaintTrack | Perpindahan Aset",
};

export default function AssetMovementPage() {
  return <AssetMovement />;
}
