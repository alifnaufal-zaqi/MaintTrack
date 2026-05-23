import { Metadata } from "next";
import { Movements } from "./_ui/movements";

export const metadata: Metadata = {
  title: "MaintTrack | Movements",
};

export default function MovementsPage() {
  return <Movements />;
}
