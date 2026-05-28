import type { Metadata } from "next";

import { FormMaintenance } from "../_ui/form-maintenance";

export const metadata: Metadata = {
  title: "MaintTrack | Create Maintenance",
};

export default function CreateMaintenancePage() {
  return <FormMaintenance />;
}
