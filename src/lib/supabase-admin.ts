import { createClient } from "@supabase/supabase-js";

export const supabaseAuthAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SECRET_KEY!
);
