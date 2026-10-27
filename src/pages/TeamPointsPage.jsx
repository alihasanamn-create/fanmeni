// ============================================
// FILE: src/pages/TeamPointsPage.jsx
// PURPOSE: Public team standings / grand total
// ============================================

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  BarChart3,
  Search,
  Radio,
  Shield,
  Crown,
  TrendingUp,
  Award,
  Home as HomeIcon,
} from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { useResults } from "../hooks/useResults";
import { useSettings } from "../hooks/useSettings";
import { useLiveTracker } from "../hooks/useLiveTracker";

export default function TeamPointsPage() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { results } = useResults();
  const { settings } = useSettings();
  const { liveData } = useLiveTracker();

  const publishedResults = results.filter((r) => r.status !== "draft");

  // Sort teams by points
  const sortedTeams = [...teams].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  const champion = sortedTeams[0];
  const runnerUp = sortedTeams[1];
  const secondRunnerUp = sortedTeams[2];

  const maxPoints = champion?.totalPoints || 1;
  const totalAllPoints = sortedTeams.reduce(
    (sum, t) => sum + (t.totalPoints || 0),
    0
  );

  // Get team stats
  const getTeamStats = (teamId) => {
    const teamStudents = students.filter((s) => s.teamId === teamId);
    const bidayaCount = teamStudents.filter((s) => s.category === "Bidaya").length;
    const thaniyaCount = teamStudents.filter((s) => s.category === "Thaniya").length;

    // Count wins for this team
    let firstPlaces = 0;
    let secondPlaces = 0;
    let thirdPlaces = 0;

    publishedResults.forEach((r) => {
      (r.positions?.first || []).forEach((w) => {
        if (w.teamId === teamId) firstPlaces++;
      });
      (r.positions?.second || []).forEach((w) => {
        if (w.teamId === teamId) secondPlaces++;
      });
      (r.positions?.third || []).forEach((w) => {
        if (w.teamId === teamId) thirdPlaces++;
      });
    });

    return {
      totalStudents: teamStudents.length,
      bidaya: bidayaCount,
      thaniya: thaniyaCount,
      firstPlaces,
      secondPlaces,
      thirdPlaces,
    };
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
            <Trophy className="w-4 h-4" />
            LIVE STANDINGS
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-2">
            Team Grand Points
          </h1>
          <p className="text-gray-500 text-lg">
            Overall standings updated in real-time
          </p>
        </div>

        {sortedTeams.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-emerald-200 p-16 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">
              No teams available yet
            </p>
          </div>
        ) : (
          <>
            {/* CHAMPION PODIUM (if we have at least 1 team with points) */}
            {champion && (champion.totalPoints || 0) > 0 && (
              <div className="mb-10">
                {/* Champion Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl shadow-2xl mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${champion.color}, ${champion.color}dd)`,
                  }}
                >
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                  <div className="relative p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* RIYADHA CHAMPION (Sports — Separate) */}
{sortedTeams.length > 0 && (
  <div className="mt-8">
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
        <Trophy className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900">
          Riyadha Champion
        </h2>
        <p className="text-xs text-gray-500">Sports standings (separate from Grand Total)</p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      {[...teams]
        .sort((a, b) => (b.sportsPoints || 0) - (a.sportsPoints || 0))
        .map((team, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          const maxSports = teams.reduce(
            (max, t) => Math.max(max, t.sportsPoints || 0),
            1
          );
          const percentage =
            ((team.sportsPoints || 0) / maxSports) * 100;

          return (
            <div
              key={team.id}
              className={
                i === teams.length - 1
                  ? "p-4 md:p-5"
                  : "p-4 md:p-5 border-b border-gray-100"
              }
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-2xl">{medals[i]}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: team.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {team.name}
                  </p>
                </div>
                <p
                  className="text-2xl font-black"
                  style={{ color: team.color }}
                >
                  {team.sportsPoints || 0}
                </p>
              </div>
              <div className="h-2 bg-blue-50 rounded-full overflow-hidden ml-14">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: team.color,
                  }}
                />
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}
                      {/* Trophy + Rank */}
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center shadow-inner"
                        >
                          <Crown className="w-14 h-14 md:w-16 md:h-16 text-yellow-300" />
                        </motion.div>

                        {champion.logoUrl && (
                          <img
                            src={champion.logoUrl}
                            alt={champion.name}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-xl border-4 border-white/30"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-90 mb-1">
                          🥇 Current Leader
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-2">
                          {champion.name}
                        </h2>
                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                          <span className="text-6xl md:text-7xl font-black">
                            {champion.totalPoints || 0}
                          </span>
                          <span className="text-sm uppercase font-bold tracking-widest opacity-90">
                            points
                          </span>
                        </div>
                      </div>

                      {/* Lead margin */}
                      {runnerUp && (
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center min-w-[120px]">
                          <div className="text-xs uppercase font-bold tracking-widest opacity-90 mb-1">
                            Lead by
                          </div>
                          <div className="text-3xl font-black">
                            +
                            {(champion.totalPoints || 0) -
                              (runnerUp.totalPoints || 0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* 2nd + 3rd */}
                {(runnerUp || secondRunnerUp) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {runnerUp && (
                      <PodiumCard
                        team={runnerUp}
                        rank={2}
                        medal="🥈"
                        maxPoints={maxPoints}
                        delay={0.3}
                      />
                    )}
                    {secondRunnerUp && (
                      <PodiumCard
                        team={secondRunnerUp}
                        rank={3}
                        medal="🥉"
                        maxPoints={maxPoints}
                        delay={0.4}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FULL TABLE */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                    Full Rankings
                  </h2>
                  <p className="text-xs text-gray-500">
                    All teams with statistics
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
                {sortedTeams.map((team, i) => {
                  const stats = getTeamStats(team.id);
                  const percentage =
                    ((team.totalPoints || 0) / maxPoints) * 100;
                  const medals = ["🥇", "🥈", "🥉"];
                  const isLast = i === sortedTeams.length - 1;

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={
                        isLast
                          ? "p-5 md:p-6"
                          : "p-5 md:p-6 border-b border-gray-100"
                      }
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 text-center flex-shrink-0">
                          {i < 3 ? (
                            <span className="text-3xl">{medals[i]}</span>
                          ) : (
                            <span className="text-xl font-bold text-gray-400">
                              #{i + 1}
                            </span>
                          )}
                        </div>

                        {/* Logo */}
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-14 h-14 rounded-2xl object-cover shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-2xl flex-shrink-0 shadow-md flex items-center justify-center"
                            style={{ backgroundColor: team.color }}
                          >
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {/* Name + Stats */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-black text-gray-900 truncate mb-1">
                            {team.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold">
                              <Users className="w-3 h-3" />
                              {stats.totalStudents}
                            </span>
                            {stats.firstPlaces > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold">
                                🥇 {stats.firstPlaces}
                              </span>
                            )}
                            {stats.secondPlaces > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-50 text-gray-700 rounded-md font-semibold">
                                🥈 {stats.secondPlaces}
                              </span>
                            )}
                            {stats.thirdPlaces > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md font-semibold">
                                🥉 {stats.thirdPlaces}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right flex-shrink-0">
                          <p
                            className="text-3xl md:text-4xl font-black"
                            style={{ color: team.color }}
                          >
                            {team.totalPoints || 0}
                          </p>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                            points
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 ml-16">
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full relative overflow-hidden"
                            style={{ backgroundColor: team.color }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* SUMMARY STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
              <SummaryCard
                label="Total Teams"
                value={teams.length}
                icon={Shield}
              />
              <SummaryCard
                label="Total Points"
                value={totalAllPoints}
                icon={Award}
              />
              <SummaryCard
                label="Programs Done"
                value={publishedResults.length}
                icon={Trophy}
              />
              <SummaryCard
                label="Participants"
                value={students.length}
                icon={Users}
              />
            </div>
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
// PODIUM CARD (2nd/3rd)
// ============================================
function PodiumCard({ team, rank, medal, maxPoints, delay }) {
  const percentage = ((team.totalPoints || 0) / maxPoints) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Top color bar */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${team.color}, ${team.color}dd)`,
        }}
      />

      <div className="p-5 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{medal}</div>

          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-14 h-14 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl shadow-md flex items-center justify-center"
              style={{ backgroundColor: team.color }}
            >
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase font-bold tracking-widest text-gray-500">
              Rank #{rank}
            </p>
            <h3 className="text-lg font-black text-gray-900 truncate">
              {team.name}
            </h3>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-4xl font-black"
            style={{ color: team.color }}
          >
            {team.totalPoints || 0}
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-gray-400">
            points
          </span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: delay + 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: team.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SUMMARY CARD
// ============================================
function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition">
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