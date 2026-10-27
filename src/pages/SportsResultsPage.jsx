// ============================================
// FILE: src/pages/SportsResultsPage.jsx
// PURPOSE: Public sports results display
// ============================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  BarChart3,
  Radio,
  Home as HomeIcon,
  Award,
  Filter,
  Hash,
  Sparkles,
} from "lucide-react";
import { useResults } from "../hooks/useResults";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";
import { useLiveTracker } from "../hooks/useLiveTracker";

const CATEGORY_TABS = ["All", "Bidaya", "Thaniya", "General"];

export default function SportsResultsPage() {
  const { results, loading } = useResults();
  const { teams } = useTeams();
  const { settings } = useSettings();
  const { liveData } = useLiveTracker();

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Only sports, published (not draft)
  const sportsResults = results.filter(
    (r) => r.moduleType === "sports" && r.status !== "draft"
  );

  const filteredResults = sportsResults.filter((r) => {
    const matchesCategory =
      activeCategory === "All" || r.category === activeCategory;
    const matchesSearch =
      !search ||
      r.programName?.toLowerCase().includes(search.toLowerCase()) ||
      r.programCode?.toString().includes(search);
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    All: sportsResults.length,
    Bidaya: sportsResults.filter((r) => r.category === "Bidaya").length,
    Thaniya: sportsResults.filter((r) => r.category === "Thaniya").length,
    General: sportsResults.filter((r) => r.category === "General").length,
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
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-3"
          >
            <Trophy className="w-4 h-4" />
            SPORTS DEPARTMENT
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2">
            Sports Results
          </h1>
          <p className="text-gray-500 text-lg">
            All published sports program results • Real-time
          </p>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  isActive
                    ? "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
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

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search program by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Filter Info */}
        {(search || activeCategory !== "All") && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Filter className="w-4 h-4" />
            <span>
              Showing <b>{filteredResults.length}</b> of {sportsResults.length}{" "}
              results
            </span>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="text-blue-600 hover:underline font-medium ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* RESULTS */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-blue-200 p-16 text-center">
            <Sparkles className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-1">
              {search || activeCategory !== "All"
                ? "No results found"
                : "No sports results published yet"}
            </p>
            <p className="text-gray-400 text-sm">
              {search || activeCategory !== "All"
                ? "Try different filters"
                : "Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {filteredResults.map((result, idx) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  teams={teams}
                  delay={idx * 0.05}
                />
              ))}
            </AnimatePresence>
          </div>
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
// RESULT CARD
// ============================================
function ResultCard({ result, teams, delay }) {
  const showPositions = result.resultType !== "grades_only";
  const showGrades =
    result.resultType !== "positions_only" &&
    result.additionalGrades?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {result.programCode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                  <Hash className="w-3 h-3" />
                  {result.programCode}
                </span>
              )}
              <span className="inline-flex px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                {result.category}
              </span>
              <span className="inline-flex px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                {result.type}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black leading-tight">
              {result.programName}
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-xl text-xs font-bold">
            <span className="w-2 h-2 bg-white rounded-full" />
            Published
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6">
        {/* POSITIONS */}
        {showPositions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <PositionCard
              emoji="🥇"
              label="1st Place"
              winners={result.positions?.first || []}
              teams={teams}
              gradient="from-amber-400 via-yellow-500 to-orange-500"
              bgLight="bg-amber-50"
              borderColor="border-amber-200"
              textColor="text-amber-700"
            />
            <PositionCard
              emoji="🥈"
              label="2nd Place"
              winners={result.positions?.second || []}
              teams={teams}
              gradient="from-slate-300 via-slate-400 to-slate-500"
              bgLight="bg-slate-50"
              borderColor="border-slate-200"
              textColor="text-slate-700"
            />
            <PositionCard
              emoji="🥉"
              label="3rd Place"
              winners={result.positions?.third || []}
              teams={teams}
              gradient="from-orange-400 via-orange-500 to-red-500"
              bgLight="bg-orange-50"
              borderColor="border-orange-200"
              textColor="text-orange-700"
            />
          </div>
        )}

        {/* GRADES ONLY */}
        {result.resultType === "grades_only" &&
          result.additionalGrades?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Graded Participants
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.additionalGrades.map((g, i) => (
                  <GradeCard key={i} grade={g} teams={teams} />
                ))}
              </div>
            </div>
          )}

        {/* ADDITIONAL GRADES */}
        {showGrades && (
          <div className="pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-700">
                Additional Grades ({result.additionalGrades.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.additionalGrades.map((g, i) => (
                <GradeCard key={i} grade={g} teams={teams} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// POSITION CARD
// ============================================
function PositionCard({
  emoji,
  label,
  winners,
  teams,
  gradient,
  bgLight,
  borderColor,
  textColor,
}) {
  return (
    <div className={`${bgLight} border ${borderColor} rounded-2xl overflow-hidden`}>
      <div className={`bg-gradient-to-r ${gradient} p-3 text-white text-center`}>
        <div className="text-3xl mb-0.5">{emoji}</div>
        <div className="text-xs font-black uppercase tracking-widest">
          {label}
        </div>
      </div>

      <div className="p-3 space-y-2 min-h-[100px]">
        {winners.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs italic">
            No winner
          </div>
        ) : (
          winners.map((w, i) => {
            const team = teams.find((t) => t.id === w.teamId);
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  {w.chestNumber && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-700 font-mono">
                      #{w.chestNumber}
                    </span>
                  )}
                  {w.grade && (
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${textColor} bg-white border border-current`}
                    >
                      Grade {w.grade}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {w.studentName || w.teamName || "—"}
                </p>
                {team && w.studentName !== w.teamName && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium truncate">
                      {team.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================
// GRADE CARD
// ============================================
function GradeCard({ grade, teams, compact = false }) {
  const team = teams.find((t) => t.id === grade.teamId);

  const gradeColors = {
    A: "bg-emerald-100 text-emerald-700 border-emerald-200",
    B: "bg-blue-100 text-blue-700 border-blue-200",
    C: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const gStyle = gradeColors[grade.grade] || gradeColors.C;

  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
          : "flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
      }
    >
      <div
        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-black text-lg ${gStyle} flex-shrink-0`}
      >
        {grade.grade}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          {grade.chestNumber && (
            <span className="text-[10px] font-mono font-bold text-gray-500">
              #{grade.chestNumber}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900 truncate">
          {grade.studentName || grade.teamName || "—"}
        </p>
        {team && (
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-[10px] text-gray-500 truncate">
              {team.name}
            </span>
          </div>
        )}
      </div>
    </div>
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