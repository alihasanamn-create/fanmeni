// ============================================
// FILE: src/components/layout/Sidebar.jsx
// ============================================

import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Shield, Palette, Trophy, ClipboardList, UserPlus, Radio, Monitor, Download, BarChart3, Settings, KeyRound, FileCheck2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import useAuth from "../../hooks/useAuth";

const ADMIN_MENU = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Students", icon: Users, path: "/students" },
  { title: "Teams", icon: Shield, path: "/teams" },
  { title: "Arts", icon: Palette, path: "/arts" },
  { title: "Riyadha", icon: Trophy, path: "/sports" },
  { title: "Assign Candidates", icon: UserPlus, path: "/candidates" },
  { title: "Captains", icon: KeyRound, path: "/captains" },
  { title: "Candidate Approvals", icon: FileCheck2, path: "/captain-submissions" },
  { title: "Results", icon: ClipboardList, path: "/results" },
  { title: "Live Announcer", icon: Radio, path: "/live-publish" },
  { title: "TV Screen", icon: Monitor, path: "/screen" },
  { title: "Downloads", icon: Download, path: "/pdf" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ collapsed, setCollapsed, onMobileClose, isMobile = false }) {
  const { settings } = useSettings();
  const { profile, isCaptain } = useAuth();
  const logoFallback = settings.festivalName?.[0]?.toUpperCase() || "F";
  const isCollapsed = isMobile ? false : collapsed;
  const sidebarWidth = isCollapsed ? 88 : 280;

  return (
    <div className="h-screen flex flex-col border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300" style={{ width: `${sidebarWidth}px` }}>
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 flex-shrink-0">
        <div className={`flex items-center min-w-0 ${isCollapsed ? "w-full justify-center" : "gap-3"}`}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.festivalName || "Logo"} className="h-11 w-11 rounded-xl object-cover shadow-sm flex-shrink-0" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-lg shadow-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${settings.primaryColor || "#10b981"}, ${settings.secondaryColor || "#0d9488"})` }}>
              {logoFallback}
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{settings.festivalName || "FANMENI"}</h1>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {isCaptain ? `Captain${profile?.teamName ? ` • ${profile.teamName}` : ""}` : (settings.tagline || "Festival Portal")}
              </p>
            </div>
          )}
        </div>
        {isMobile && <button onClick={onMobileClose} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 lg:hidden"><X size={18} /></button>}
        {!isMobile && !isCollapsed && <button onClick={() => setCollapsed(true)} className="hidden lg:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"><ChevronLeft size={18} /></button>}
      </div>

      {!isMobile && isCollapsed && <button onClick={() => setCollapsed(false)} className="hidden lg:flex absolute -right-3 top-6 z-10 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900"><ChevronRight size={14} /></button>}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1.5">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} onClick={onMobileClose}>
                {({ isActive }) => (
                  <div className={`group relative flex h-12 items-center rounded-xl transition-all ${isCollapsed ? "justify-center" : "px-4"} ${isActive ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>
                    {isActive && <span className="absolute left-0 h-8 w-1 rounded-r-full bg-emerald-500" />}
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 text-sm font-semibold truncate">{item.title}</span>}
                    {isCollapsed && <div className="pointer-events-none absolute left-16 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block z-50">{item.title}</div>}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {!isCollapsed && settings.schoolName && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 flex-shrink-0">
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{settings.schoolName}</p>
          {settings.academicYear && <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{settings.academicYear}</p>}
        </div>
      )}
    </div>
  );
}
