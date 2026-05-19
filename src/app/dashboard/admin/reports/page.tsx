import { Metadata } from "next";
import { AssetsReports } from "./_ui/reports";

export const metadata: Metadata = {
  title: "MaintTrack | Laporan Analitik Aset",
};

export default function AssetsReportsManagementPage() {
  return <AssetsReports />;
}
