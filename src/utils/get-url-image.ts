import { createClient } from "@/lib/client";

export function getUrlImage(path: string) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from("MaintTrack-Assets")
    .getPublicUrl(path);

  return data.publicUrl;
}
