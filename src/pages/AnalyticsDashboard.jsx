// ============================================
// FILE: src/pages/AnalyticsDashboard.jsx
// PURPOSE: Analytics dashboard with charts & insights
// ============================================

import {
  BarChart3,
  Users,
  Shield,
  Trophy,
  ClipboardList,
  TrendingUp,
  Award,
  Palette,
  Target,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useAnalytics } from "../hooks/useAnalytics";

export default function AnalyticsDashboard() {
  const { analytics, loading } = useAnalytics();

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
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
    { name: "🥇 1st", value: positionCounts.first, fill: "#f59e0b" },
    { name: "🥈 2nd", value: positionCounts.second, fill: "#94a3b8" },
    { name: "🥉 3rd", value: positionCounts.third, fill: "#f97316" },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">
              Real-time insights and festival performance
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Students"
            value={overview.totalStudents}
            icon={Users}
            color="emerald"
          />
          <StatCard
            label="Total Teams"
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
            label="Published Results"
            value={overview.totalResults}
            icon={Trophy}
            color="amber"
          />
        </div>

        {/* Completion Progress */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 shadow-xl mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  Festival Progress
                </span>
              </div>
              <h2 className="text-4xl font-black mb-2">
                {overview.completionRate}%
              </h2>
              <p className="text-white/80">
                {overview.totalResults} of {overview.totalPrograms} programs
                completed
              </p>
              {overview.pendingResults > 0 && (
                <p className="text-white/70 text-sm mt-1">
                  ⏳ {overview.pendingResults} pending • 📝 {overview.draftResults}{" "}
                  drafts
                </p>
              )}
            </div>

            <div className="w-full md:w-96">
              <div className="h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${overview.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/70">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* TEAM LEADERBOARD (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900 text-lg">
                Team Leaderboard
              </h3>
            </div>

            {teamLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No teams yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={teamLeaderboard}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                      {teamLeaderboard.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed rankings */}
                <div className="mt-4 space-y-2">
                  {teamLeaderboard.map((team, i) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={team.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                      >
                        <div className="w-8 text-center font-bold">
                          {i < 3 ? medals[i] : `#${i + 1}`}
                        </div>
                        <div
                          className="w-3 h-8 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {team.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {team.studentsCount} students
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900">
                            {team.points}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* TOP STUDENTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-lg">
                Top Performers
              </h3>
            </div>

            {topStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
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
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-8 text-center font-bold text-sm">
                        {i < 3 ? medals[i] : `${i + 1}`}
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.teamColor }}
                          />
                          <span className="truncate">{s.teamName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">
                          {s.points}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Grade Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Grade Distribution
            </h3>

            {gradeStats.A + gradeStats.B + gradeStats.C === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                No grades assigned yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={(entry) => entry.value > 0 ? entry.value : ""}
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Position Awards */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              Awards Given
            </h3>

            {positionCounts.first + positionCounts.second + positionCounts.third === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
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
                    tick={{ fontSize: 14 }}
                    width={70}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Program Types
            </h3>

            {typeBreakdown.every((t) => t.count === 0) ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                No programs added yet
              </p>
            ) : (
              <div className="space-y-3">
                {typeBreakdown.map((t, i) => {
                  const colors = ["#10b981", "#06b6d4", "#6366f1", "#ec4899"];
                  const max = Math.max(...typeBreakdown.map((x) => x.count));
                  const percentage = max > 0 ? (t.count / max) * 100 : 0;

                  return (
                    <div key={t.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {t.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {t.count}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Arts vs Sports */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Arts vs Sports
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {moduleBreakdown.map((m) => (
                <div
                  key={m.name}
                  className="p-4 rounded-xl border-2"
                  style={{ borderColor: `${m.color}30`, background: `${m.color}08` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {m.name === "Arts" ? (
                      <Palette className="w-4 h-4" style={{ color: m.color }} />
                    ) : (
                      <Trophy className="w-4 h-4" style={{ color: m.color }} />
                    )}
                    <span className="font-bold" style={{ color: m.color }}>
                      {m.name}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {m.programs}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Total Programs
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Published:</span>
                      <span className="font-semibold text-emerald-600">
                        {m.published}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-semibold text-amber-600">
                        {m.pending}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </h3>

            <div className="space-y-4">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const colors = {
                  Bidaya: "blue",
                  Thaniya: "purple",
                  General: "amber",
                };
                const color = colors[cat];
                const bgClass = `bg-${color}-50 border-${color}-200`;
                const textClass = `text-${color}-700`;

                return (
                  <div
                    key={cat}
                    className={`p-4 rounded-xl border ${bgClass}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${textClass}`}>{cat}</h4>
                      <span className="text-xs font-medium text-gray-500">
                        {stats.published}/{stats.programs} done
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">Students</p>
                        <p className="text-lg font-bold text-gray-900">
                          {stats.students}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">Programs</p>
                        <p className="text-lg font-bold text-gray-900">
                          {stats.programs}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-500">Results</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {stats.published}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Students Distribution */}
        {teamStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Team Student Distribution
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={teamStudents}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
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
                  name="Bidaya"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="thaniya"
                  stackId="a"
                  fill="#a855f7"
                  name="Thaniya"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}