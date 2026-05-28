import { Metadata } from "next";
import { DetailAsset } from "../_ui/detail-asset";

export const metadata: Metadata = {
  title: "MaintTrack | Detail Aset",
};

export default async function DetailAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAsset id={id} />;
}
