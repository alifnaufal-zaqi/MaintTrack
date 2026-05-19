import { Metadata } from "next";
import { FormUsers } from "../_ui/form-users";

export const metadata: Metadata = {
  title: "MaintTrack | Form Pengguna",
};

export default function CreateUsersPage() {
  return <FormUsers />;
}
