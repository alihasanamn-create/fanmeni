// ============================================
// FILE: src/pages/ProgramsPage.jsx
// PURPOSE: Public listing of all programs
// ============================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Trophy,
  Palette,
  Search,
  BarChart3,
  Radio,
  Home as HomeIcon,
  Filter,
  Users,
  Hash,
  Award,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
} from "lucide-react";
import { usePrograms } from "../hooks/usePrograms";
import { useResults } from "../hooks/useResults";
import { useCandidates } from "../hooks/useCandidates";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";
import { useLiveTracker } from "../hooks/useLiveTracker";

const CATEGORY_TABS = ["All", "Bidaya", "Thaniya", "General"];
const MODULE_TABS = ["All", "Arts", "Sports"];
const TYPE_TABS = ["All", "Individual", "Personal Group", "Group", "General"];

export default function ProgramsPage() {
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { results } = useResults();
  const { candidates } = useCandidates();
  const { teams } = useTeams();
  const { settings } = useSettings();
  const { liveData } = useLiveTracker();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeModule, setActiveModule] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const allPrograms = [
    ...artsPrograms.map((p) => ({ ...p, moduleType: "arts" })),
    ...sportsPrograms.map((p) => ({ ...p, moduleType: "sports" })),
  ];

  const publishedResults = results.filter((r) => r.status !== "draft");
  const publishedProgramIds = new Set(publishedResults.map((r) => r.programId));

  // Filter
  const filteredPrograms = allPrograms.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesModule =
      activeModule === "All" ||
      (activeModule === "Arts" && p.moduleType === "arts") ||
      (activeModule === "Sports" && p.moduleType === "sports");
    const matchesType = activeType === "All" || p.type === activeType;
    const name = p.name || p.program || "";
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toString().includes(search);
    return matchesCategory && matchesModule && matchesType && matchesSearch;
  });

  const hasFilters =
    activeCategory !== "All" ||
    activeModule !== "All" ||
    activeType !== "All" ||
    search;

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveModule("All");
    setActiveType("All");
    setSearch("");
  };

  const stats = {
    total: allPrograms.length,
    arts: artsPrograms.length,
    sports: sportsPrograms.length,
    completed: publishedProgramIds.size,
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
            <ClipboardList className="w-4 h-4" />
            ALL PROGRAMS
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-2">
            Festival Programs
          </h1>
          <p className="text-gray-500 text-lg">
            Explore all arts and sports programs
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Programs" value={stats.total} icon={ClipboardList} />
          <StatCard label="Arts" value={stats.arts} icon={Palette} />
          <StatCard label="Sports" value={stats.sports} icon={Trophy} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} />
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by program name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-4 md:p-5 mb-6 space-y-4">
          {/* Module */}
          <FilterRow
            label="Module"
            options={MODULE_TABS}
            active={activeModule}
            onChange={setActiveModule}
            colorClass="from-emerald-500 to-teal-600"
          />

          {/* Category */}
          <FilterRow
            label="Category"
            options={CATEGORY_TABS}
            active={activeCategory}
            onChange={setActiveCategory}
            colorClass="from-blue-500 to-indigo-600"
          />

          {/* Type */}
          <FilterRow
            label="Type"
            options={TYPE_TABS}
            active={activeType}
            onChange={setActiveType}
            colorClass="from-purple-500 to-pink-600"
          />
        </div>

        {/* Filter Info */}
        {hasFilters && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Filter className="w-4 h-4" />
            <span>
              Showing <b>{filteredPrograms.length}</b> of {allPrograms.length}{" "}
              programs
            </span>
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:underline font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* PROGRAMS */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-emerald-200 p-16 text-center">
            <Sparkles className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-1">
              No programs found
            </p>
            <p className="text-gray-400 text-sm">
              {hasFilters ? "Try different filters" : "No programs added yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPrograms.map((program, idx) => (
                <ProgramRow
                  key={program.id}
                  program={program}
                  candidates={candidates}
                  teams={teams}
                  isPublished={publishedProgramIds.has(program.id)}
                  isExpanded={expandedId === program.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === program.id ? null : program.id
                    )
                  }
                  delay={idx * 0.03}
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
// PROGRAM ROW (Expandable)
// ============================================
function ProgramRow({
  program,
  candidates,
  teams,
  isPublished,
  isExpanded,
  onToggle,
  delay,
}) {
  const isSports = program.moduleType === "sports";
  const Icon = isSports ? Trophy : Palette;

  const iconBg = isSports ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600";
  const gradient = isSports
    ? "from-blue-500 to-indigo-600"
    : "from-purple-500 to-pink-600";

  const categoryColors = {
    Bidaya: "bg-blue-50 text-blue-700",
    Thaniya: "bg-purple-50 text-purple-700",
    General: "bg-amber-50 text-amber-700",
  };
  const catStyle = categoryColors[program.category] || categoryColors.Bidaya;

  // Find candidate assignment
  const candidateData = candidates.find((c) => c.programId === program.id);
  const totalCandidates = candidateData?.totalCandidates || 0;

  const maxPerTeam =
    program.participantsPerTeam || program.count || 1;

  const points = program.points || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      {/* Main Row (Clickable) */}
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50 transition text-left"
      >
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {program.code && (
              <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-gray-500">
                <Hash className="w-3 h-3" />
                {program.code}
              </span>
            )}
            <span
              className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md ${catStyle}`}
            >
              {program.category}
            </span>
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700">
              {program.type}
            </span>
            {isPublished ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-2.5 h-2.5" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-700">
                <Circle className="w-2.5 h-2.5" />
                Pending
              </span>
            )}
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
            {program.name || program.program}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Max {maxPerTeam}/team
            </span>
            {totalCandidates > 0 && (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle className="w-3 h-3" />
                {totalCandidates} assigned
              </span>
            )}
          </div>
        </div>

        {/* Points Mini */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          {points.first > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-amber-600">
              🥇 {points.first}
            </span>
          )}
          {points.second > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-gray-600">
              🥈 {points.second}
            </span>
          )}
          {points.third > 0 && (
            <span className="flex items-center gap-0.5 font-bold text-orange-600">
              🥉 {points.third}
            </span>
          )}
        </div>

        {/* Expand Icon */}
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 p-4 md:p-5 bg-gray-50">
              {/* Program Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Points Info */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-gray-900">
                      Point System
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl">🥇</div>
                      <div className="text-lg font-black text-amber-600">
                        {points.first || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        1st
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl">🥈</div>
                      <div className="text-lg font-black text-gray-600">
                        {points.second || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        2nd
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl">🥉</div>
                      <div className="text-lg font-black text-orange-600">
                        {points.third || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        3rd
                      </div>
                    </div>
                  </div>
                  {points.shared && (
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-md font-medium">
                        Shared among candidates
                      </span>
                    </div>
                  )}
                </div>

                {/* Program Meta */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-gray-900">
                      Program Details
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <MetaRow label="Module" value={isSports ? "Sports" : "Arts"} />
                    <MetaRow label="Category" value={program.category} />
                    <MetaRow label="Type" value={program.type} />
                    <MetaRow
                      label="Participants"
                      value={`${maxPerTeam} per team`}
                    />
                    <MetaRow label="Grade Points" value="A=3 • B=2 • C=1" />
                  </div>
                </div>
              </div>

              {/* Assigned Candidates */}
              {candidateData && Object.keys(candidateData.teamCandidates || {}).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-gray-900">
                      Assigned Candidates ({totalCandidates})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(candidateData.teamCandidates || {}).map(
                      ([teamId, teamStudents]) => {
                        const team = teams.find((t) => t.id === teamId);
                        if (!team) return null;

                        return (
                          <div
                            key={teamId}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                          >
                            {/* Team Header */}
                            <div
                              className="px-3 py-2 flex items-center gap-2"
                              style={{
                                background: `linear-gradient(90deg, ${team.color}15, transparent)`,
                              }}
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                style={{ backgroundColor: team.color }}
                              >
                                <Shield className="w-3 h-3" />
                              </div>
                              <span className="font-bold text-sm text-gray-900">
                                {team.name}
                              </span>
                              <span className="ml-auto text-xs text-gray-500 font-semibold">
                                {teamStudents.length}
                              </span>
                            </div>

                            {/* Students */}
                            <div className="p-2 space-y-1">
                              {teamStudents.map((s, i) => (
                                <Link
                                  key={i}
                                  to={`/student/${s.studentId}`}
                                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition group"
                                >
                                  <span className="w-6 h-6 rounded bg-gray-100 text-[10px] font-mono font-bold text-gray-600 flex items-center justify-center flex-shrink-0">
                                    {s.chestNumber || "—"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800 truncate group-hover:text-emerald-600">
                                    {s.studentName}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* No candidates yet */}
              {(!candidateData || totalCandidates === 0) && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">
                    No candidates assigned yet
                  </p>
                </div>
              )}

              {/* View Result Link */}
              {isPublished && (
                <div className="mt-4 flex justify-center">
                  <Link
                    to={isSports ? "/sports-results" : "/arts-results"}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${gradient} text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-sm`}
                  >
                    <Trophy className="w-4 h-4" />
                    View Result
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// META ROW
// ============================================
function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ============================================
// FILTER ROW
// ============================================
function FilterRow({ label, options, active, onChange, colorClass }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = active === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={
                isActive
                  ? `px-4 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r ${colorClass} text-white shadow-md`
                  : "px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
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
