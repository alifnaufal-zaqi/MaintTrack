import AppSidebar from "@/components/commons/app-sidebar";
import { DarkModeToggle } from "@/components/commons/dark-mode-toggle";
import DashboardBreadcrumb from "@/components/commons/dashboard-breadcrumb";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Profile } from "@/types/auth";

import { Bell } from "lucide-react";

import { cookies } from "next/headers";
import Link from "next/link";
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
        {/* Header */}
        <header className="flex justify-between h-16 shrink-0 items-center px-4 border-b bg-background">
          {/* Left */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 cursor-pointer" />

            <Separator orientation="vertical" className="h-4" />

            <DashboardBreadcrumb />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notification */}
            <Link href="/dashboard/operator/notifications">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />

                {/* Badge merah */}
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </Link>

            {/* Dark Mode */}
            <DarkModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-start gap-4 p-4 pt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
