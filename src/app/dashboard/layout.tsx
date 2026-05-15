import AppSidebar from "@/components/commons/app-sidebar";
import { DarkModeToggle } from "@/components/commons/dark-mode-toggle";
import DashboardBreadcrumb from "@/components/commons/dashboard-breadcrumb";
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
    fullname: profileData.fullname,
    address: profileData.address,
    phoneNumber: profileData.phone_number,
    photoProfileUrl: profileData.photo_profile_url,
    role: profileData.role,
  };

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DashboardBreadcrumb />
          </div>
          <div className="px-4">
            <DarkModeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col items-start gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
