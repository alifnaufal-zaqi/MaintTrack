"use server";

import { supabaseAuthAdminClient } from "@/lib/supabase-admin";
import { ResetPasswordSchema } from "@/schemas/user";
import { FormState } from "@/types/form";
import { ResetPasswordError } from "@/types/users";
import { validateFormData } from "@/utils/validate-data";

export async function resetPassword(
  userId: string | undefined,
  state: FormState<ResetPasswordError>,
  formData: FormData
) {
  if (!userId) {
    return {
      status: "error",
      message: "User id tidak valid",
    };
  }

  const { error, result } = validateFormData(formData, ResetPasswordSchema);

  if (error) {
    return {
      status: "error",
      errors: error,
    };
  }

  if (result.confirmPassword !== result.newPassword) {
    return {
      status: "error",
      message: "Kofirmasi password tidak valid",
    };
  }

  const { error: resetPasswordError } =
    await supabaseAuthAdminClient.auth.admin.updateUserById(userId, {
      password: result.newPassword,
    });

  if (resetPasswordError) {
    return {
      status: "error",
      message: resetPasswordError.message,
    };
  }

  return {
    status: "success",
    message: "Berhasil merubah password pengguna",
  };
}
