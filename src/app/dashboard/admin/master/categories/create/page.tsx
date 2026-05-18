import { Metadata } from "next";
import { FormCategories } from "../_ui/form-categories";

export const metadata: Metadata = {
  title: "MaintTrack | Form Kategori",
};

export default function CreateCategoriesPage() {
  return <FormCategories />;
}
