import { Metadata } from "next";
import { Notifications } from "./_ui/notifications";

export const metadata: Metadata = {
  title: "MaintTrack | Notifications",
};

export default function NotificationsPage() {
  return <Notifications />;
}
