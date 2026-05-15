import { Metadata } from "next";
import { Login } from "./_ui/login";

export const metadata: Metadata = {
  title: "MaintTrack | Login",
};

export default function LoginPage() {
  return <Login />;
}
