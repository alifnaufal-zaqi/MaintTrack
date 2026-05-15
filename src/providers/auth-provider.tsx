import { createClient } from "@/lib/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Profile } from "@/types/auth";
import { ReactNode, useEffect } from "react";

type AuthStoreProviderProps = {
  children: ReactNode;
  profile: Profile;
};

export default function AuthStoreProvider({
  children,
  profile,
}: AuthStoreProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setProfile(profile);
    });
  }, [profile]);

  return <>{children}</>;
}
