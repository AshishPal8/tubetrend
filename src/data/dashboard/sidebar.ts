import { LayoutDashboard, Tag, FileText, Settings } from "lucide-react";

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Categories",
    icon: Tag,
    href: "/dashboard/categories",
  },
  {
    label: "Blogs",
    icon: FileText,
    href: "/dashboard/blogs",
  },
  {
    label: "Stories",
    icon: FileText,
    href: "/dashboard/stories",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];
