// ============================================
// FILE: src/components/layout/AdminLayout.jsx
// PURPOSE: Fully responsive admin layout
// ============================================

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer when the route changes. Adjusting state during render
  // (instead of in an effect) avoids committing an extra render with the stale value.
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR - Slides in from left */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          collapsed={false}
          setCollapsed={() => {}}
          onMobileClose={() => setMobileOpen(false)}
          isMobile={true}
        />
      </aside>

      {/* DESKTOP SIDEBAR - Always visible on large screens */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={false}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`
          flex flex-col min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}