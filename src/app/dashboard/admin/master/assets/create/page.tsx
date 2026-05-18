import { Metadata } from "next";
import { FormCreateAsset } from "../_ui/form-asset";

export const metadata: Metadata = {
  title: "MaintTrack | Form Buat Aset",
};

export default function CreateAssetPage() {
  return <FormCreateAsset />;
}
