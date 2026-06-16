import AppSidebar from "@/components/commons/app-sidebar";
import { DarkModeToggle } from "@/components/commons/dark-mode-toggle";
import DashboardBreadcrumb from "@/components/commons/dashboard-breadcrumb";
import { NotificationAlert } from "@/components/commons/notification-alert";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Profile } from "@/types/auth";
import { cookies } from "next/headers";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookiesStore = await cookies();
  const profileData = JSON.parse(cookiesStore.get("profile")?.value ?? "{}");

  const profile: Profile = {
    id: profileData.id,
    userId: profileData.user_id,
    fullname: profileData.fullname,
    email: profileData.email,
    address: profileData.address,
    phoneNumber: profileData.phone_number,
    photoProfileUrl: profileData.photo_profile_url,
    photoProfilePath: profileData.photo_profile_path,
    role: profileData.role,
    createdAt: profileData.created_at,
  };

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />

      <SidebarInset className="overflow-x-hidden">
        <header className="flex justify-between h-16 shrink-0 items-center px-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="h-4" />
            <DashboardBreadcrumb />
          </div>

          <div className="flex items-center gap-2">
            <NotificationAlert />
            <DarkModeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col items-start gap-4 p-4 pt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
