"use server";

import { LoginSchema } from "@/schemas/login";
import { FormState } from "@/types/form";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AuthError } from "@/types/auth";

export async function login(state: FormState<AuthError>, formData: FormData) {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", data.user?.id)
    .single();

  if (profile) {
    const cookieStore = await cookies();
    cookieStore.set("profile", JSON.stringify(profile), {
      httpOnly: true,
      path: "/dashboard",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/", "layout");

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/operator");
}
