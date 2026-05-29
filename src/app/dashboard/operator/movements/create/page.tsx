import { Metadata } from "next";
import { FormMovement } from "../_ui/form-movement";

export const metadata: Metadata = {
  title: "MaintTrack | Form Perpindahan Aaset",
};

export default function FormMovementPage() {
  return <FormMovement />;
}
