"use client";

import { SIDEBAR_MENU } from "@/constants/sidebar-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";
import { Profile } from "@/types/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronRight, EllipsisVertical, LogOut, User } from "lucide-react";
import { logout } from "@/app/actions/logout";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppSidebar({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    setProfile(profile);
  }, [profile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="flex flex-col items-start justify-center h-20"
            size={"lg"}
          >
            <h1 className="text-xl font-bold text-primary">MaintTrack</h1>
            <p className="text-md text-muted-foreground">
              Manajemen Aset Perusahaan
            </p>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {SIDEBAR_MENU[profile.role].map((menu) => (
                <SidebarMenuItem key={menu.title}>
                  {menu.sub ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          size="lg"
                          tooltip={{ children: menu.title }}
                          className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        >
                          <menu.icon className="size-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {menu.title}
                          </span>
                          <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {menu.sub.map((subMenu) => (
                            <SidebarMenuSubItem key={subMenu.title}>
                              <SidebarMenuSubButton size="md" asChild>
                                <Link href={subMenu.href!}>
                                  <subMenu.icon />
                                  <span>{subMenu.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      size="lg"
                      tooltip={{ children: menu.title }}
                      className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                      asChild
                    >
                      <Link href={menu.href!}>
                        <menu.icon className="size-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {menu.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size={"lg"}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={profile.photoProfileUrl}
                      alt={profile.fullname}
                    />
                    <AvatarFallback className="rounded-lg">
                      {profile.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <h4 className="truncate font-medium">{profile.fullname}</h4>
                    <p className="text-muted-foreground truncate text-xs capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={profile.photoProfileUrl}
                        alt={profile.fullname}
                      />
                      <AvatarFallback className="rounded-lg">
                        {profile.fullname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <h4 className="truncate font-medium">
                        {profile.fullname}
                      </h4>
                      <p className="text-muted-foreground truncate text-xs capitalize">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profiles")}
                  >
                    <User />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => logout()}
                  >
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
