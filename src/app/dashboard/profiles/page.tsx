import { Metadata } from "next";
import { ProfileUser } from "./_ui/profile";

export const metadata: Metadata = {
  title: "MaintTrack | Profile Pengguna",
};

export default function ProfilePage() {
  return <ProfileUser />;
}
