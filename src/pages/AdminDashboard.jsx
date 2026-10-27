// ============================================
// FILE: src/pages/AdminDashboard.jsx
// PURPOSE: Mobile-responsive admin dashboard
// ============================================

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  ClipboardList,
  Trophy,
  Activity,
  ArrowRight,
  TrendingUp,
  Medal,
  Calendar,
  Bell,
  Palette,
  UserPlus,
  Radio,
  BarChart3,
  Settings,
  Download,
} from "lucide-react";

import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { usePrograms } from "../hooks/usePrograms";
import { useResults } from "../hooks/useResults";
import { useCandidates } from "../hooks/useCandidates";
import { useSettings } from "../hooks/useSettings";

export default function AdminDashboard() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { results } = useResults();
  const { candidates } = useCandidates();
  const { settings } = useSettings();

  const allPrograms = [...artsPrograms, ...sportsPrograms];
  const publishedResults = results.filter((r) => r.status !== "draft");
  const publishedProgramIds = new Set(publishedResults.map((r) => r.programId));

  const completionPercentage = allPrograms.length
    ? Math.round((publishedProgramIds.size / allPrograms.length) * 100)
    : 0;

  let daysRemaining = 0;
  if (settings.endDate) {
    const end = new Date(settings.endDate);
    const now = new Date();
    daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  const assignedProgramIds = new Set(candidates.map((c) => c.programId));
  const pendingResults = [...assignedProgramIds].filter(
    (id) => !publishedProgramIds.has(id)
  ).length;

  const leaderboard = [...teams]
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 5);

  const champion = leaderboard[0];

  const recentActivity = [...publishedResults]
    .sort((a, b) => {
      const at = a.updatedAt?.toMillis?.() || 0;
      const bt = b.updatedAt?.toMillis?.() || 0;
      return bt - at;
    })
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      text: `Result published for ${r.programName}`,
      subtext: r.category,
    }));

  const maxPoints = leaderboard[0]?.totalPoints || 1;

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to {settings.festivalName || "FANMENI"} • Live overview
        </p>
      </div>

      {/* STATS GRID - Responsive 2x2 on mobile, 4 cols on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <StatCard
          title="Students"
          value={students.length}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Teams"
          value={teams.length}
          icon={Shield}
          color="blue"
        />
        <StatCard
          title="Programs"
          value={allPrograms.length}
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Completed"
          value={publishedResults.length}
          icon={Trophy}
          color="green"
        />
      </motion.div>

      {/* QUICK ACTIONS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <Link
            to="/students"
            className="px-3 py-2.5 bg-emerald-600 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-emerald-700 transition text-center"
          >
            Add Student
          </Link>
          <Link
            to="/arts"
            className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center"
          >
            Add Program
          </Link>
          <Link
            to="/results"
            className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center"
          >
            Publish Results
          </Link>
          <Link
            to="/live-publish"
            className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center"
          >
            Live Publish
          </Link>
        </div>
      </div>

      {/* FESTIVAL PROGRESS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Festival Progress
        </h3>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
              Completed Programs
            </span>
            <span className="text-xs md:text-sm font-bold">
              {publishedResults.length} / {allPrograms.length}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <ProgressBox
            icon={TrendingUp}
            value={`${completionPercentage}%`}
            label="Complete"
            color="text-emerald-600"
          />
          <ProgressBox
            icon={Calendar}
            value={daysRemaining > 0 ? daysRemaining : "—"}
            label={daysRemaining > 0 ? "Days Left" : "Set date"}
            color="text-blue-600"
          />
          <ProgressBox
            icon={Bell}
            value={pendingResults}
            label="Pending"
            color="text-amber-600"
          />
        </div>
      </div>

      {/* LEADERBOARD + ACTIVITY - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
              Team Leaderboard
            </h3>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No teams yet
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((team, index) => {
                const percentage = ((team.totalPoints || 0) / maxPoints) * 100;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={team.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {index < 3 ? (
                          <span className="text-base">{medals[index]}</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">
                            #{index + 1}
                          </span>
                        )}
                        <div
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {team.name}
                        </span>
                      </div>
                      <span
                        className="font-black text-sm"
                        style={{ color: team.color }}
                      >
                        {team.totalPoints || 0}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No activity yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-gray-500">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CHAMPION CARD */}
      {champion && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-sm p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Medal className="w-7 h-7 md:w-8 md:h-8 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider">
                Current Champion
              </p>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white truncate">
                {champion.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leading with {champion.totalPoints || 0} Points
              </p>
            </div>
            <Link
              to="/team-points"
              className="hidden sm:flex px-4 py-2 bg-yellow-500 text-white text-sm font-bold rounded-xl hover:bg-yellow-600 transition flex-shrink-0"
            >
              View All
            </Link>
          </div>
        </div>
      )}

      {/* QUICK NAVIGATION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          <QuickNav to="/teams" label="Teams" icon={Shield} color="bg-blue-500" />
          <QuickNav to="/students" label="Students" icon={Users} color="bg-emerald-500" />
          <QuickNav to="/candidates" label="Candidates" icon={UserPlus} color="bg-purple-500" />
          <QuickNav to="/results" label="Results" icon={Trophy} color="bg-amber-500" />
          <QuickNav to="/live-publish" label="Live" icon={Radio} color="bg-red-500" />
          <QuickNav to="/analytics" label="Analytics" icon={BarChart3} color="bg-cyan-500" />
          <QuickNav to="/pdf" label="Downloads" icon={Download} color="bg-orange-500" />
          <QuickNav to="/settings" label="Settings" icon={Settings} color="bg-slate-500" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs md:text-sm text-gray-500 font-medium truncate">
          {title}
        </p>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

// ============================================
// PROGRESS BOX
// ============================================
function ProgressBox({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center p-2.5 md:p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
      <Icon className={`w-4 h-4 md:w-5 md:h-5 mx-auto mb-1 ${color}`} />
      <p className="text-base md:text-lg font-black text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-[9px] md:text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ============================================
// QUICK NAV
// ============================================
function QuickNav({ to, label, icon: Icon, color }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center p-2.5 md:p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-300 transition"
    >
      <div
        className={`w-8 h-8 md:w-10 md:h-10 ${color} rounded-lg flex items-center justify-center mb-1.5 group-hover:scale-110 transition`}
      >
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <span className="text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}