import type { Metadata } from "next";

import { Maintenance } from "./_ui/maintenance";

export const metadata: Metadata = {
  title: "MaintTrack | Maintenance",
};

export default function MaintenancePage() {
  return <Maintenance />;
}
