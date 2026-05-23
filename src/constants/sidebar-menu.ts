import {
  LayoutDashboard,
  Database,
  Users,
  Laptop,
  MapPin,
  Handshake,
  Tag,
  Wrench,
  Repeat,
  FileBarChart,
  History,
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
      title: "Data Maintenance",
      icon: Wrench,
      href: "/dashboard/admin/maintenance",
    },

    {
      title: "Data Movement",
      icon: Repeat,
      href: "/dashboard/admin/movements",
    },

    {
      title: "Pengguna",
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      title: "Laporan",
      icon: FileBarChart,
      href: "/dashboard/admin/reports",
    },
  ],

  // Operator Menu
  operator: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/operator",
    },

    {
      title: "Data Aset",
      icon: Laptop,
      href: "/dashboard/operator/assets",
    },

    {
      title: "Data Maintenance",
      icon: Wrench,
      href: "/dashboard/operator/maintenance",
    },

    {
      title: "Data Movement",
      icon: Repeat,
      href: "/dashboard/operator/movements",
    },

    {
      title: "History",
      icon: History,
      href: "/dashboard/operator/history",
    },
  ],
};
