import { Metadata } from "next";
import { Vendors } from "./_ui/vendor";

export const metadata: Metadata = {
  title: "MaintTrack | Vendor",
};

export default function VendorPage() {
  return <Vendors />;
}
