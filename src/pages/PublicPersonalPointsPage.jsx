// ============================================
// FILE: src/pages/PublicPersonalPointsPage.jsx
// PURPOSE: Public full leaderboard of all students
// ============================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Search,
  BarChart3,
  Radio,
  Home as HomeIcon,
  Trophy,
  Filter,
  User,
  Hash,
  Shield,
  Users,
  Crown,
  Sparkles,
  Medal,
} from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";
import { useLiveTracker } from "../hooks/useLiveTracker";

const CATEGORY_TABS = ["All", "Bidaya", "Thaniya"];

export default function PublicPersonalPointsPage() {
  const { students, loading } = useStudents();
  const { teams } = useTeams();
  const { settings } = useSettings();
  const { liveData } = useLiveTracker();

  const [activeCategory, setActiveCategory] = useState("All");
  const [filterTeam, setFilterTeam] = useState("");
  const [search, setSearch] = useState("");

  // Filter + sort
  const filteredStudents = students
    .filter((s) => (s.totalPoints || 0) > 0) // Only students with points
    .filter((s) => {
      const matchesCategory =
        activeCategory === "All" || s.category === activeCategory;
      const matchesTeam = !filterTeam || s.teamId === filterTeam;
      const matchesSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.chestNumber?.toString().includes(search);
      return matchesCategory && matchesTeam && matchesSearch;
    })
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  // Top 3 champions
  const [champion, runnerUp, secondRunnerUp] = filteredStudents;

  const categoryCounts = {
    All: students.filter((s) => (s.totalPoints || 0) > 0).length,
    Bidaya: students.filter(
      (s) => s.category === "Bidaya" && (s.totalPoints || 0) > 0
    ).length,
    Thaniya: students.filter(
      (s) => s.category === "Thaniya" && (s.totalPoints || 0) > 0
    ).length,
  };

  const hasFilters =
    activeCategory !== "All" || filterTeam || search;

  const clearFilters = () => {
    setActiveCategory("All");
    setFilterTeam("");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      <Navbar settings={settings} isLive={!!liveData?.currentProgramId} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-3"
          >
            <Award className="w-4 h-4" />
            PERSONAL RANKINGS
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-2">
            Personal Points
          </h1>
          <p className="text-gray-500 text-lg">
            Individual leaderboard of all participants
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* TOP 3 CHAMPIONS (Podium) */}
            {champion && (
              <div className="mb-8">
                <PodiumSection
                  champion={champion}
                  runnerUp={runnerUp}
                  secondRunnerUp={secondRunnerUp}
                  teams={teams}
                />
              </div>
            )}

            {/* CATEGORY TABS */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {CATEGORY_TABS.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={
                      isActive
                        ? "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                        : "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                    }
                  >
                    {cat}
                    <span
                      className={
                        isActive
                          ? "px-1.5 py-0.5 bg-white/20 rounded text-xs"
                          : "px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500"
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH + TEAM FILTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or chest number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm text-sm"
                />
              </div>

              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-4 py-2.5 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm text-sm"
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Info */}
            {hasFilters && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                <Filter className="w-4 h-4" />
                <span>
                  Showing <b>{filteredStudents.length}</b> participants
                </span>
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 hover:underline font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* LEADERBOARD LIST */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-emerald-200 p-16 text-center">
                <Sparkles className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium mb-1">
                  {hasFilters
                    ? "No participants found"
                    : "No points earned yet"}
                </p>
                <p className="text-gray-400 text-sm">
                  {hasFilters
                    ? "Try different filters"
                    : "Points will appear as results are published"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-4 md:px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-6 md:col-span-5">Participant</div>
                  <div className="hidden md:block md:col-span-2">Category</div>
                  <div className="hidden md:block md:col-span-2">Team</div>
                  <div className="col-span-5 md:col-span-2 text-right">
                    Points
                  </div>
                </div>

                {/* Rows */}
                <AnimatePresence>
                  {filteredStudents.map((student, idx) => (
                    <LeaderboardRow
                      key={student.id}
                      student={student}
                      rank={idx + 1}
                      teams={teams}
                      delay={idx * 0.02}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <div className="text-center py-8 mt-8">
          <p className="text-xs text-gray-400">
            All data updates in real-time • Powered by{" "}
            {settings.festivalName || "FANMENI"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PODIUM SECTION (Top 3)
// ============================================
function PodiumSection({ champion, runnerUp, secondRunnerUp, teams }) {
  const championTeam = teams.find((t) => t.id === champion?.teamId);
  const runnerUpTeam = teams.find((t) => t.id === runnerUp?.teamId);
  const secondRunnerUpTeam = teams.find(
    (t) => t.id === secondRunnerUp?.teamId
  );

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
          🏆 Top Champions
        </h2>
        <p className="text-sm text-gray-500">The best of the best</p>
      </div>

      {/* CHAMPION BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl shadow-2xl mb-4"
        style={{
          background: `linear-gradient(135deg, ${championTeam?.color || "#10b981"}, ${championTeam?.color || "#10b981"}dd)`,
        }}
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <Link
          to={`/student/${champion.id}`}
          className="relative block p-6 md:p-10 text-white hover:opacity-95 transition"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Photo + Crown */}
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="absolute -top-4 -left-4 w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white z-10"
              >
                <Crown className="w-7 h-7 text-white" />
              </motion.div>

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white/20 backdrop-blur ring-4 ring-white/40 shadow-2xl">
                {champion.photoUrl ? (
                  <img
                    src={champion.photoUrl}
                    alt={champion.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white/70" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                <Trophy className="w-3 h-3" />
                Champion
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
                {champion.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                {champion.chestNumber && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                    <Hash className="w-3 h-3" />
                    {champion.chestNumber}
                  </span>
                )}
                {championTeam && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: championTeam.color }}
                    />
                    {championTeam.name}
                  </span>
                )}
                <span className="inline-flex px-2.5 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                  {champion.category}
                </span>
              </div>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-6xl md:text-7xl font-black leading-none">
                  {champion.totalPoints || 0}
                </span>
                <span className="text-sm uppercase font-bold tracking-widest opacity-90">
                  points
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 2ND + 3RD */}
      {(runnerUp || secondRunnerUp) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {runnerUp && (
            <RunnerUpCard
              student={runnerUp}
              team={runnerUpTeam}
              rank={2}
              medal="🥈"
              delay={0.3}
            />
          )}
          {secondRunnerUp && (
            <RunnerUpCard
              student={secondRunnerUp}
              team={secondRunnerUpTeam}
              rank={3}
              medal="🥉"
              delay={0.4}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// RUNNER-UP CARD (2nd/3rd)
// ============================================
function RunnerUpCard({ student, team, rank, medal, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        to={`/student/${student.id}`}
        className="block bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition"
      >
        {/* Color bar */}
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${team?.color || "#64748b"}, ${team?.color || "#64748b"}dd)`,
          }}
        />

        <div className="p-5 flex items-center gap-4">
          {/* Photo */}
          <div className="relative flex-shrink-0">
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shadow z-10 border-2 border-white">
              <span className="text-lg">{medal}</span>
            </div>
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-1">
              Rank #{rank}
            </div>
            <h3 className="text-lg font-black text-gray-900 truncate mb-1">
              {student.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {student.chestNumber && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-gray-500">
                  <Hash className="w-2.5 h-2.5" />
                  {student.chestNumber}
                </span>
              )}
              {team && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-black"
                style={{ color: team?.color || "#10b981" }}
              >
                {student.totalPoints || 0}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                points
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================
// LEADERBOARD ROW
// ============================================
function LeaderboardRow({ student, rank, teams, delay }) {
  const team = teams.find((t) => t.id === student.teamId);
  const isTop3 = rank <= 3;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay }}
    >
      <Link
        to={`/student/${student.id}`}
        className={
          isTop3
            ? "grid grid-cols-12 gap-3 px-4 md:px-5 py-4 border-b border-gray-100 hover:bg-emerald-50/50 transition items-center group bg-gradient-to-r from-amber-50/30 to-transparent"
            : "grid grid-cols-12 gap-3 px-4 md:px-5 py-4 border-b border-gray-100 hover:bg-emerald-50/50 transition items-center group"
        }
      >
        {/* Rank */}
        <div className="col-span-1 text-center">
          {isTop3 ? (
            <span className="text-2xl">{medals[rank - 1]}</span>
          ) : (
            <span className="text-lg font-bold text-gray-400">
              #{rank}
            </span>
          )}
        </div>

        {/* Participant (Photo + Name + Chest) */}
        <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 truncate group-hover:text-emerald-600">
              {student.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              {student.chestNumber && (
                <span className="font-mono font-semibold">
                  #{student.chestNumber}
                </span>
              )}
              {/* Mobile: show team here */}
              <div className="md:hidden flex items-center gap-1">
                {team && (
                  <>
                    <span>•</span>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="truncate">{team.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category (desktop) */}
        <div className="hidden md:block md:col-span-2">
          <span
            className={
              student.category === "Bidaya"
                ? "inline-flex px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700"
                : "inline-flex px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-700"
            }
          >
            {student.category}
          </span>
        </div>

        {/* Team (desktop) */}
        <div className="hidden md:flex md:col-span-2 items-center gap-2 min-w-0">
          {team && (
            <>
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {team.name}
              </span>
            </>
          )}
        </div>

        {/* Points */}
        <div className="col-span-5 md:col-span-2 text-right">
          <p
            className="text-2xl font-black leading-none"
            style={{ color: team?.color || "#10b981" }}
          >
            {student.totalPoints || 0}
          </p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-0.5">
            points
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================
// NAVBAR
// ============================================
function Navbar({ settings, isLive }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-11 h-11 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
              {settings.festivalName?.[0] || "F"}
            </div>
          )}
          <div>
            <h1 className="font-black text-gray-900">
              {settings.festivalName || "FANMENI"}
            </h1>
            {settings.tagline && (
              <p className="text-xs text-gray-500">{settings.tagline}</p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <NavItem to="/" icon={HomeIcon} label="Home" />
          <NavItem to="/analytics-public" icon={BarChart3} label="Analytics" />
          <NavItem to="/students-public" icon={Search} label="Search" />
          <Link
            to="/live"
            className={
              isLive
                ? "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm font-bold rounded-xl bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                : "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg transition"
            }
          >
            {isLive ? (
              <>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">Live Screen</span>
                <span className="sm:hidden">Live</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}