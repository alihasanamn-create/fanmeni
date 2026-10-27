// ============================================
// FILE: src/pages/PublicAnalyticsPage.jsx
// PURPOSE: Public-facing analytics page
// ============================================

import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  Shield,
  Trophy,
  ClipboardList,
  Award,
  Palette,
  Sparkles,
  Home,
  User,
  Search,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics } from "../hooks/useAnalytics";
import { useSettings } from "../hooks/useSettings";

export default function PublicAnalyticsPage() {
  const { analytics, loading } = useAnalytics();
  const { settings } = useSettings();

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const {
    overview,
    teamLeaderboard,
    topStudents,
    categoryStats,
    moduleBreakdown,
    typeBreakdown,
    gradeStats,
    teamStudents,
    positionCounts,
  } = analytics;

  const gradeData = [
    { name: "Grade A", value: gradeStats.A, fill: "#10b981" },
    { name: "Grade B", value: gradeStats.B, fill: "#3b82f6" },
    { name: "Grade C", value: gradeStats.C, fill: "#f59e0b" },
  ];

  const positionData = [
    { name: "🥇 1st Place", value: positionCounts.first, fill: "#f59e0b" },
    { name: "🥈 2nd Place", value: positionCounts.second, fill: "#94a3b8" },
    { name: "🥉 3rd Place", value: positionCounts.third, fill: "#f97316" },
  ];

  const totalAwards =
    positionCounts.first + positionCounts.second + positionCounts.third;
  const totalGrades = gradeStats.A + gradeStats.B + gradeStats.C;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Public Navbar */}
      <PublicNavbar settings={settings} />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Hero Section */}
        <div className="text-center mb-10 mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Live Analytics
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3">
            Festival Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time statistics and performance metrics of{" "}
            <span className="font-bold text-emerald-600">
              {settings.festivalName || "our festival"}
            </span>
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Participants"
            value={overview.totalStudents}
            icon={Users}
            color="emerald"
          />
          <StatCard
            label="Teams"
            value={overview.totalTeams}
            icon={Shield}
            color="blue"
          />
          <StatCard
            label="Programs"
            value={overview.totalPrograms}
            icon={ClipboardList}
            color="purple"
          />
          <StatCard
            label="Results Out"
            value={overview.totalResults}
            icon={Trophy}
            color="amber"
          />
        </div>

        {/* Progress Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 md:p-10 shadow-2xl mb-8 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  Festival Progress
                </span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-3">
                {overview.completionRate}%
              </h2>
              <p className="text-xl text-white/90">
                {overview.totalResults} of {overview.totalPrograms} programs
                completed
              </p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur shadow-inner">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${overview.completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm text-white/70 font-medium">
                <span>Start</span>
                <span>Halfway</span>
                <span>Finish</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* TEAM LEADERBOARD (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">
                  Team Standings
                </h3>
                <p className="text-sm text-gray-500">Current rankings</p>
              </div>
            </div>

            {teamLeaderboard.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No teams yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamLeaderboard}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      angle={-15}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="points" radius={[10, 10, 0, 0]}>
                      {teamLeaderboard.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed rankings */}
                <div className="mt-6 space-y-2">
                  {teamLeaderboard.map((team, i) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={team.id}
                        className="flex items-center gap-4 p-4 rounded-2xl transition"
                        style={{
                          background: `linear-gradient(90deg, ${team.color}10, transparent)`,
                        }}
                      >
                        <div className="w-10 text-center">
                          {i < 3 ? (
                            <span className="text-2xl">{medals[i]}</span>
                          ) : (
                            <span className="text-lg font-bold text-gray-400">
                              #{i + 1}
                            </span>
                          )}
                        </div>
                        <div
                          className="w-4 h-12 rounded-full shadow-sm"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate text-lg">
                            {team.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {team.studentsCount} participants
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-gray-900">
                            {team.points}
                          </p>
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            points
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* TOP STUDENTS */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">
                  Top Stars
                </h3>
                <p className="text-sm text-gray-500">Best performers</p>
              </div>
            </div>

            {topStudents.length === 0 ? (
              <p className="text-gray-400 text-center py-12 text-sm">
                No results published yet
              </p>
            ) : (
              <div className="space-y-2">
                {topStudents.map((s, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <Link
                      key={s.id}
                      to={`/student/${s.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition group"
                    >
                      <div className="w-10 text-center">
                        {i < 3 ? (
                          <span className="text-2xl">{medals[i]}</span>
                        ) : (
                          <span className="text-sm font-bold text-gray-400">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                        {s.photoUrl ? (
                          <img
                            src={s.photoUrl}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-600">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.teamColor }}
                          />
                          <span className="truncate">{s.teamName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">
                          {s.points}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          pts
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Search Students CTA */}
            <Link
              to="/students-public"
              className="mt-6 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition"
            >
              <Search className="w-4 h-4" />
              Find Your Profile
            </Link>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Grade Distribution */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Grades Awarded</h3>
            </div>

            {totalGrades === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                No grades assigned yet
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={gradeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {gradeData.map((g) => (
                    <div key={g.name} className="text-center">
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: g.fill }}
                      />
                      <p className="text-xs text-gray-500">{g.name.replace("Grade ", "")}</p>
                      <p className="font-bold text-gray-900">{g.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Awards Given */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">Awards Given</h3>
            </div>

            {totalAwards === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                No positions awarded yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={positionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {positionData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Program Types */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Program Types</h3>
            </div>

            {typeBreakdown.every((t) => t.count === 0) ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                No programs added yet
              </p>
            ) : (
              <div className="space-y-4 mt-2">
                {typeBreakdown.map((t, i) => {
                  const colors = ["#10b981", "#06b6d4", "#6366f1", "#ec4899"];
                  const max = Math.max(...typeBreakdown.map((x) => x.count));
                  const percentage = max > 0 ? (t.count / max) * 100 : 0;

                  return (
                    <div key={t.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {t.name}
                        </span>
                        <span className="text-sm font-black text-gray-900">
                          {t.count}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors[i],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Arts vs Sports */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-black text-gray-900 text-xl">
                Arts vs Sports
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {moduleBreakdown.map((m) => (
                <div
                  key={m.name}
                  className="p-5 rounded-2xl border-2 relative overflow-hidden"
                  style={{
                    borderColor: `${m.color}30`,
                    background: `${m.color}08`,
                  }}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                    style={{ backgroundColor: m.color }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      {m.name === "Arts" ? (
                        <Palette className="w-5 h-5" style={{ color: m.color }} />
                      ) : (
                        <Trophy className="w-5 h-5" style={{ color: m.color }} />
                      )}
                      <span className="font-bold text-lg" style={{ color: m.color }}>
                        {m.name}
                      </span>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">
                      {m.programs}
                    </div>
                    <div className="text-xs text-gray-500 mb-4 uppercase font-semibold tracking-wider">
                      Programs
                    </div>
                    <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">✅ Published</span>
                        <span className="font-black text-emerald-600">
                          {m.published}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">⏳ Pending</span>
                        <span className="font-black text-amber-600">
                          {m.pending}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-black text-gray-900 text-xl">
                Category Overview
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const colors = {
                  Bidaya: { bg: "bg-blue-50", text: "text-blue-700", dot: "#3b82f6" },
                  Thaniya: { bg: "bg-purple-50", text: "text-purple-700", dot: "#a855f7" },
                  General: { bg: "bg-amber-50", text: "text-amber-700", dot: "#f59e0b" },
                };
                const c = colors[cat];
                const progress = stats.programs
                  ? Math.round((stats.published / stats.programs) * 100)
                  : 0;

                return (
                  <div
                    key={cat}
                    className={`p-4 rounded-2xl border-2 border-transparent ${c.bg}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.dot }}
                        />
                        <h4 className={`font-bold text-lg ${c.text}`}>{cat}</h4>
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {progress}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Participants
                        </p>
                        <p className="text-xl font-black text-gray-900">
                          {stats.students}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Programs
                        </p>
                        <p className="text-xl font-black text-gray-900">
                          {stats.programs}
                        </p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Results
                        </p>
                        <p className="text-xl font-black text-emerald-600">
                          {stats.published}
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: c.dot,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Distribution */}
        {teamStudents.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-black text-gray-900 text-xl">
                Team Participation
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamStudents}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="bidaya"
                  stackId="a"
                  fill="#3b82f6"
                  name="Bidaya (Junior)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="thaniya"
                  stackId="a"
                  fill="#a855f7"
                  name="Thaniya (Senior)"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-3">
            All data updates in real-time
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/live"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Watch Live
            </Link>
            <Link
              to="/students-public"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition"
            >
              <Search className="w-4 h-4" />
              Find Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PUBLIC NAVBAR
// ============================================
function PublicNavbar({ settings }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
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
            <p className="text-xs text-gray-500">
              {settings.tagline || "Festival Portal"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" icon={Home} label="Home" />
          <NavLink to="/analytics-public" icon={BarChart3} label="Analytics" active />
          <NavLink to="/live" icon={Trophy} label="Live" />
        </div>
      </div>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={
        active
          ? "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-lg"
          : "flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
      }
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50",
    blue: "from-blue-500 to-indigo-600 text-blue-600 bg-blue-50",
    purple: "from-purple-500 to-pink-600 text-purple-600 bg-purple-50",
    amber: "from-amber-500 to-orange-600 text-amber-600 bg-amber-50",
  };
  const parts = colors[color].split(" ");
  const textColor = parts[2];
  const bgColor = parts[3];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <div
          className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
      <p className="text-4xl font-black text-gray-900">{value}</p>
    </div>
  );
}