"use server";

import { createClient } from "@/lib/server";
import { CategorySchema } from "@/schemas/category";
import { FormCategory } from "@/types/categories";
import { FormState } from "@/types/form";

export async function postNewCategory(
  state: FormState<FormCategory>,
  formData: FormData
) {
  const { success, error: validationError } = CategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!success) {
    return {
      status: "error",
      errors: validationError.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error: supabaseError } = await supabase.from("categories").insert({
    name: formData.get("name"),
  });

  if (supabaseError) {
    return {
      status: "error",
      message: supabaseError.message,
    };
  }

  return {
    status: "success",
    message: "Berhasil membuat kategori aset baru",
  };
}
