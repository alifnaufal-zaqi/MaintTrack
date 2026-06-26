"use server";

import { supabaseAuthAdminClient } from "@/lib/supabase-admin";

export async function deleteUser(userId: string | undefined) {
  if (!userId) {
    return {
      status: "error",
      message: "User ID tidak valid",
    };
  }

  // Delete from user_profiles first to prevent orphaned records if cascade delete is not set
  const { error: deleteProfileError } = await supabaseAuthAdminClient
    .from("user_profiles")
    .delete()
    .eq("user_id", userId);

  if (deleteProfileError) {
    return {
      status: "error",
      message: deleteProfileError.message,
    };
  }

  // Delete from auth.users using admin client
  const { error: deleteAuthError } =
    await supabaseAuthAdminClient.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    return {
      status: "error",
      message: deleteAuthError.message,
    };
  }

  return {
    status: "success",
    message: "Berhasil menghapus pengguna",
  };
}
