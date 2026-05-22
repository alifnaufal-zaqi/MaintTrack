import { Metadata } from "next";
import { AssetsUsers } from "./_ui/users";

export const metadata: Metadata = {
  title: "MaintTrack | Manajemen Pengguna",
};

export default function AssetsUsersManagementPage() {
  return <AssetsUsers />;
}
