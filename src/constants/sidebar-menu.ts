import {
  LayoutDashboard,
  Database,
  Users,
  Laptop,
  MapPin,
  Handshake,
  Tag,
  FileBarChart,
} from "lucide-react";

type SidebarSubMenuItem = {
  title: string;
  icon: any;
  href: string;
};

type SidebarMenuItem = {
  title: string;
  icon: any;
  href?: string;
  sub?: SidebarSubMenuItem[];
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
      title: "Pengguna",
      icon: Users,
      href: "/dashboard/admin/users",
    },

    // MENU BARU
    {
      title: "Laporan",
      icon: FileBarChart,
      href: "/dashboard/admin/reports",
    },
  ],

  operator: [],
};
