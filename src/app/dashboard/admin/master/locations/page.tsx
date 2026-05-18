import { Metadata } from "next";
import { Location } from "./_ui/location";

export const metadata: Metadata = {
  title: "MaintTrack | Lokasi",
};

export default function LocationPage() {
  return <Location />;
}
