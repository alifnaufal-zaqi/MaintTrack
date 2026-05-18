"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function logout() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    await supabase.auth.signOut();
    cookieStore.delete("profiles");
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Logout failed: ", error);
  }

  redirect("/auth/login");
}
