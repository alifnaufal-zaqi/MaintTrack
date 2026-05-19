import { Metadata } from "next";

import { FormVendor } from "../_ui/form-vendor";

export const metadata: Metadata = {
  title: "MaintTrack | Form Vendor",
};

export default function CreateVendorPage() {
  return <FormVendor />;
}