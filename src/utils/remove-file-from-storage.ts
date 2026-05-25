import { createClient } from "@/lib/client";

export async function removeFileFromStorage(...path: string[]) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("MaintTrack-Assets")
    .remove(path);

  if (error) {
    return false;
  }

  return true;
}
