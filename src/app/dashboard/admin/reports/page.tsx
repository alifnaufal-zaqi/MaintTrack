import { Metadata } from "next";
import { Reports } from "./_ui/reports";

export const metadata: Metadata = {
  title: "MaintTrack | Laporan",
};

export default function ReportsPage() {
  return <Reports />;
}
