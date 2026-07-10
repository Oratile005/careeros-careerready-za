import {
  LayoutDashboard,
  FileText,
  Mic,
  Compass,
  Languages,
  MessageSquareText,
  Trophy,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { to: string; label: string; short: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", short: "Apply", icon: FileText },
  { to: "/interview", label: "Interview Simulator", short: "Interview", icon: Mic },
  { to: "/opportunities", label: "Opportunities", short: "Jobs", icon: Compass },
  { to: "/translator", label: "Workplace Translator", short: "Decode", icon: Languages },
  { to: "/coach", label: "AI Career Coach", short: "Coach", icon: MessageSquareText },
  { to: "/profile", label: "Profile & XP", short: "Profile", icon: Trophy },
  { to: "/settings", label: "Settings", short: "Settings", icon: Settings },
];

// Bottom nav shows a focused subset on mobile.
export const MOBILE_NAV: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[5],
  NAV_ITEMS[6],
];
