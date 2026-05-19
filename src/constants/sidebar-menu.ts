import {
  Database,
  Handshake,
  Laptop,
  LayoutDashboard,
  MapPin,
  Tag,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SidebarMenuItem = {
  title: string;
  icon: LucideIcon;
  href?: string;
  sub?: SidebarMenuItem[];
};

type SidebarMenu = {
  admin: SidebarMenuItem[];
  operator: SidebarMenuItem[];
};

export const SIDEBAR_MENU: SidebarMenu = {
  admin: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
    },
    {
      title: "Data Master",
      icon: Database,
      sub: [
        {
          title: "Data Aset",
          icon: Laptop,
          href: "/dashboard/admin/master/assets",
        },
        {
          title: "Data Lokasi",
          icon: MapPin,
          href: "/dashboard/admin/master/locations",
        },
        {
          title: "Data Vendor",
          icon: Handshake,
          href: "/dashboard/admin/master/vendors",
        },
        {
          title: "Data Kategori",
          icon: Tag,
          href: "/dashboard/admin/master/categories",
        },
      ],
    },
    {
      title: "Data Movements",
      icon: Package,
      href: "/dashboard/admin/movements",
    }
  ],
  operator: [],
};
