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
} from "../ui/sidebar";
import { Profile } from "@/types/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronRight, EllipsisVertical } from "lucide-react";

export default function AppSidebar({ profile }: { profile: Profile }) {
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
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
