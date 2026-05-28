import { Metadata } from "next";

import { MaintenanceOperator } from "./_ui/maintenance";

export const metadata: Metadata = {
  title: "MaintTrack | Maintenance",
};

export default function MaintenancePage() {
  return <MaintenanceOperator />;
}
