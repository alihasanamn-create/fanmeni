import { Menu, LogOut, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { logout } from "../../services/authService";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { profile, isCaptain } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {isCaptain ? "Captain Dashboard" : "FANMENI Dashboard"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {isCaptain ? (profile?.teamName || "Assigned team") : (profile?.name || "Administrator")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isCaptain && (
          <button onClick={() => navigate("/captains")} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            <UserPlus size={16} />
            Activate Account
          </button>
        )}
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
