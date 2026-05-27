"use server";

import { createClient } from "@/lib/server";
import { supabaseAuthAdminClient } from "@/lib/supabase-admin";
import { ProfileSchema } from "@/schemas/profile";
import { ProfileError } from "@/types/auth";
import { FormState } from "@/types/form";
import { validateFormData } from "@/utils/validate-data";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  userId: string | undefined,
  state: FormState<ProfileError>,
  formData: FormData
) {
  if (!userId) {
    return {
      status: "error",
      message: "User id tidak valid",
    };
  }

  const supabase = await createClient();

  const { error: validationError, result } = validateFormData(
    formData,
    ProfileSchema
  );

  if (validationError) {
    return {
      status: "error",
      errors: validationError,
    };
  }

  const { error: updateEmailError } =
    await supabaseAuthAdminClient.auth.admin.updateUserById(userId, {
      email: result.email,
    });

  if (updateEmailError) {
    return {
      status: "error",
      message: updateEmailError.message,
    };
  }

  const { error: updateProfileError } = await supabase
    .from("user_profiles")
    .update({ email: result.email })
    .eq("user_id", userId);

  if (updateProfileError) {
    return {
      status: "error",
      message: updateProfileError.message,
    };
  }

  revalidatePath("/", "layout");

  return {
    status: "success",
    message: "Berhasil mengubah profile",
  };
}
