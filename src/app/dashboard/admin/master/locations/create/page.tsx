import { Metadata } from "next";
import { FormLocations } from "../_ui/form-locations";

export const metadata: Metadata = {
  title: "MaintTrack | Form Lokasi",
};

export default function CreateLocationsPage() {
  return <FormLocations />;
}