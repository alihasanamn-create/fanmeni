import {
  LayoutDashboard,
  Users,
  Shield,
  Palette,
  Trophy,
  ClipboardList,
  Radio,
  Tv,
  Download,
  BarChart3,
  Settings,
} from "lucide-react";

const sidebarMenu = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    path: "/students",
    icon: Users,
  },
  {
    title: "Teams",
    path: "/teams",
    icon: Shield,
  },
  {
    title: "Arts",
    path: "/arts",
    icon: Palette,
  },
  {
    title: "Sports",
    path: "/sports",
    icon: Trophy,
  },
  {
    title: "Results",
    path: "/results",
    icon: ClipboardList,
  },
  {
    title: "Live Publish",
    path: "/live-publish",
    icon: Radio,
  },
  {
    title: "Live Tracker",
    path: "/live",
    icon: Tv,
  },
  {
    title: "Downloads",
    path: "/pdf",
    icon: Download,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default sidebarMenu;