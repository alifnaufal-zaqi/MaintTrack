import { createClient } from "@/lib/client";

export async function uploadFileToStorage(file: File, path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("MaintTrack-Assets")
    .upload(`${path}/${file.name}`, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return {
      error: error.message,
      data: null,
    };
  }

  return {
    error: null,
    data,
  };
}
