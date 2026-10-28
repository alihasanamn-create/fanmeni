// ============================================
// FILE: src/pages/Home.jsx
// PURPOSE: Restructured home with big team scoreboard + latest result
// ============================================

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Palette,
  Award,
  Radio,
  Search,
  BarChart3,
  ClipboardList,
  User,
  Sparkles,
  Tv,
} from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { useResults } from "../hooks/useResults";
import { useSettings } from "../hooks/useSettings";
import { useLiveTracker } from "../hooks/useLiveTracker";
import { usePrograms } from "../hooks/usePrograms";
import TopperSlideshow from "../components/home/TopperSlideshow";

// Accept the category spellings used in older records as well as the
// display names used on the homepage.
const normalizeCategory = (value) => {
  const category = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (["bidaya", "vidhaya", "vidaya"].includes(category)) return "bidaya";
  if (["thaniya", "sanya", "saniya"].includes(category)) return "thaniya";
  return category;
};

export default function Home() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { results } = useResults();
  const { settings } = useSettings();
  const { liveData } = useLiveTracker();
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");

  const [resultIndex, setResultIndex] = useState(0);

  const allPrograms = [...artsPrograms, ...sportsPrograms];
  const publishedResults = results.filter((r) => r.status !== "draft");

  // Sorted teams
  const sortedTeams = [...teams].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  // Ranked students
  const rankedStudents = [...students]
    .filter((s) => (s.totalPoints || 0) > 0)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const topStudents = rankedStudents.slice(0, 10);
  const fanmeniTop5 = rankedStudents.slice(0, 5);

  const bidayaTop5 = [...students]
    .filter((s) => normalizeCategory(s.category) === "bidaya" && (s.totalPoints || 0) > 0)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 5);

  const thaniyaTop5 = [...students]
    .filter((s) => normalizeCategory(s.category) === "thaniya" && (s.totalPoints || 0) > 0)
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 5);

  // Latest results (sorted by updatedAt)
  const latestResults = [...publishedResults]
    .sort((a, b) => {
      const at = a.updatedAt?.toMillis?.() || 0;
      const bt = b.updatedAt?.toMillis?.() || 0;
      return bt - at;
    })
    .slice(0, 10);

  // Auto-rotate result every 8 seconds
  useEffect(() => {
    if (latestResults.length <= 1) return;
    const interval = setInterval(() => {
      setResultIndex((prev) => (prev + 1) % latestResults.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [latestResults.length]);

  const currentResult = latestResults[resultIndex];
  const maxPoints = sortedTeams[0]?.totalPoints || 1;
  const isLive = !!liveData?.currentProgramId;

  // Grand Points use the team's official Arts Fest totalPoints field only.
  // The two breakdowns sum student Arts points by category; Sports Fest data
  // is deliberately not used here. Category aliases handle legacy labels.
  const getCategoryPoints = (teamId, category) =>
    students
      .filter(
        (student) =>
          student.teamId === teamId &&
          normalizeCategory(student.category) === normalizeCategory(category)
      )
      .reduce((sum, student) => sum + (Number(student.totalPoints) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      {/* GLOWING NAVBAR */}
      <Navbar settings={settings} isLive={isLive} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* ============================================
            SECTION 1: BIG TEAM POINTS SCOREBOARD
        ============================================ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                Team Grand Points
              </h2>
              <p className="text-xs text-gray-500">Live standings</p>
            </div>
          </div>

          {sortedTeams.length === 0 ? (
            <EmptyState message="No teams yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedTeams.slice(0, 5).map((team, i) => {
                const percentage = ((team.totalPoints || 0) / maxPoints) * 100;
                const medals = ["🥇", "🥈", "🥉"];
                const isFirst = i === 0;
                const isTop3 = i < 3;

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={
                      isFirst
                        ? "relative overflow-hidden bg-white rounded-3xl shadow-2xl border-4 p-6 md:p-8"
                        : isTop3
                        ? "bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 md:p-6"
                        : "bg-white rounded-2xl shadow-md border border-gray-100 p-4"
                    }
                    style={
                      isFirst
                        ? {
                            borderColor: team.color,
                            background: `linear-gradient(135deg, ${team.color}10, white 50%, ${team.color}05)`,
                          }
                        : {}
                    }
                  >
                    {/* Glowing halo for #1 */}
                    {isFirst && (
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: team.color }}
                      />
                    )}

                    <div className="relative">
                      {/* Header: Medal + Name */}
                      <div className="flex items-center gap-3 mb-4">
                        {isTop3 ? (
                          <span className={isFirst ? "text-5xl" : "text-3xl"}>
                            {medals[i]}
                          </span>
                        ) : (
                          <span className="text-2xl font-black text-gray-400 w-10 text-center">
                            #{i + 1}
                          </span>
                        )}

                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className={
                              isFirst
                                ? "w-14 h-14 rounded-2xl object-cover shadow-md"
                                : "w-12 h-12 rounded-xl object-cover shadow-sm"
                            }
                          />
                        ) : (
                          <div
                            className={
                              isFirst
                                ? "w-14 h-14 rounded-2xl shadow-md"
                                : "w-12 h-12 rounded-xl shadow-sm"
                            }
                            style={{ backgroundColor: team.color }}
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={
                              isFirst
                                ? "font-black text-gray-900 text-2xl md:text-3xl uppercase tracking-wider truncate"
                                : isTop3
                                ? "font-black text-gray-900 text-xl md:text-2xl truncate"
                                : "font-bold text-gray-800 text-lg truncate"
                            }
                          >
                            {team.name}
                          </p>
                          {isFirst && (
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                              🏆 Current Leader
                            </p>
                          )}
                        </div>
                      </div>

                      {/* MEGA POINTS */}
                      <div className="flex items-baseline justify-center gap-2 mb-4">
                        <motion.span
                          key={team.totalPoints}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="font-black leading-none tracking-tighter"
                          style={{
                            color: team.color,
                            fontSize: isFirst
                              ? "clamp(5rem, 12vw, 9rem)"
                              : isTop3
                              ? "clamp(3.5rem, 8vw, 6rem)"
                              : "clamp(2.5rem, 6vw, 4rem)",
                            textShadow: isFirst
                              ? `0 0 30px ${team.color}50, 0 0 60px ${team.color}30`
                              : isTop3
                              ? `0 4px 20px ${team.color}30`
                              : "none",
                            lineHeight: "0.85",
                          }}
                        >
                          {team.totalPoints || 0}
                        </motion.span>
                        <span
                          className={
                            isFirst
                              ? "text-base md:text-lg uppercase font-black tracking-widest text-gray-500"
                              : "text-sm uppercase font-black tracking-widest text-gray-400"
                          }
                        >
                          pts
                        </span>
                      </div>

                      {/* Arts Fest category breakdown only — Sports is excluded */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-center">
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-blue-700">Bidaya Points</p>
                          <p className="text-lg md:text-xl font-black text-blue-800">
                            {getCategoryPoints(team.id, "Bidaya")} <span className="text-[10px] font-bold">pts</span>
                          </p>
                        </div>
                        <div className="rounded-xl bg-purple-50 border border-purple-100 px-3 py-2 text-center">
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-purple-700">Thaniya Points</p>
                          <p className="text-lg md:text-xl font-black text-purple-800">
                            {getCategoryPoints(team.id, "Thaniya")} <span className="text-[10px] font-bold">pts</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        className={
                          isFirst
                            ? "h-4 bg-gray-100 rounded-full overflow-hidden"
                            : "h-3 bg-gray-100 rounded-full overflow-hidden"
                        }
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full relative overflow-hidden"
                          style={{ backgroundColor: team.color }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================
            SECTION 2: LATEST RESULT SLIDER
        ============================================ */}
        {currentResult && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  Latest Results
                </h2>
                <p className="text-xs text-gray-500">
                  Recently published • Auto-rotating {latestResults.length} results
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-5 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentResult.id}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 md:p-6 border-2 border-emerald-200"
                >
                  <div className="mb-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {currentResult.programCode && (
                        <span className="text-2xl md:text-3xl font-black text-gray-300">
                          #{currentResult.programCode}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                        {currentResult.category}
                      </span>
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">
                        {currentResult.type}
                      </span>
                      <span
                        className={
                          currentResult.moduleType === "sports"
                            ? "px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold"
                            : "px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-bold"
                        }
                      >
                        {currentResult.moduleType === "sports"
                          ? "🏆 Riyadha"
                          : "🎨 Arts"}
                      </span>
                    </div>
                    <h4 className="text-2xl md:text-4xl font-black leading-tight text-gray-900">
                      {currentResult.programName}
                    </h4>
                  </div>

                  {/* Podium */}
                  <div className="grid grid-cols-3 gap-3">
                    {["first", "second", "third"].map((pos, i) => {
                      const winners = currentResult.positions?.[pos] || [];
                      const emojis = ["🥇", "🥈", "🥉"];
                      const labels = ["1st", "2nd", "3rd"];
                      const styles = [
                        "bg-amber-50 border-amber-300 text-amber-800",
                        "bg-slate-50 border-slate-300 text-slate-800",
                        "bg-orange-50 border-orange-300 text-orange-800",
                      ];

                      return (
                        <div
                          key={pos}
                          className={`border-2 rounded-2xl p-3 md:p-4 ${styles[i]}`}
                        >
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <div className="text-2xl md:text-3xl">
                              {emojis[i]}
                            </div>
                            <div className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                              {labels[i]}
                            </div>
                          </div>

                          {winners.length > 0 ? (
                            <div className="space-y-2">
                              {winners.slice(0, 2).map((w, idx) => {
                                const team = teams.find(
                                  (t) => t.id === w.teamId
                                );
                                return (
                                  <div key={idx}>
                                    {w.chestNumber && (
                                      <span className="text-[10px] font-mono font-bold text-gray-500 mr-1">
                                        #{w.chestNumber}
                                      </span>
                                    )}
                                    <div className="font-black text-sm md:text-base text-gray-900 leading-tight">
                                      {w.studentName || w.teamName || "—"}
                                    </div>
                                    {team && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <div
                                          className="w-1.5 h-1.5 rounded-full"
                                          style={{ backgroundColor: team.color }}
                                        />
                                        <span className="text-[10px] text-gray-600 font-medium">
                                          {team.name}
                                        </span>
                                      </div>
                                    )}
                                    {w.grade && (
                                      <span className="inline-block mt-1 text-[10px] bg-white px-1.5 py-0.5 rounded font-black shadow-sm">
                                        Grade {w.grade}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs italic">
                              No winner
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              {latestResults.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {latestResults.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setResultIndex(i)}
                      className={
                        i === resultIndex
                          ? "w-8 h-1.5 bg-emerald-500 rounded-full transition-all"
                          : "w-1.5 h-1.5 bg-emerald-200 rounded-full hover:bg-emerald-300 transition-all"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            SECTION 3: TOP 10 PERFORMERS (moved for spacing)
        ============================================ */}
        <div className="mb-8">
          <SectionTitle
            icon={Award}
            title="Top 10 Performers"
            subtitle="Individual points"
          />

          {topStudents.length === 0 ? (
            <EmptyState message="No results yet" />
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topStudents.map((s, i) => {
                  const team = teams.find((t) => t.id === s.teamId);
                  const medals = ["🥇", "🥈", "🥉"];

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/student/${s.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-emerald-50 transition group"
                      >
                        <div className="w-8 text-center flex-shrink-0">
                          {i < 3 ? (
                            <span className="text-xl">{medals[i]}</span>
                          ) : (
                            <span className="text-sm font-bold text-gray-400">
                              {i + 1}
                            </span>
                          )}
                        </div>

                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
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
                            {s.chestNumber && (
                              <span className="font-mono font-semibold">
                                #{s.chestNumber}
                              </span>
                            )}
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

                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-black text-emerald-600">
                            {s.totalPoints || 0}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {rankedStudents.length > 10 && (
                <Link
                  to="/personal-points-public"
                  className="mt-4 block text-center py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition"
                >
                  View Full Rankings ({rankedStudents.length}) →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ============================================
            SECTION 4: TOPPER SLIDESHOWS (3 columns)
        ============================================ */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2"
            >
              🌟 Featured Toppers
            </motion.h2>
            <p className="text-gray-500 text-sm">
              Auto-rotating top 5 performers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopperSlideshow
              title="FANMENI Toppers"
              subtitle="Overall best performers"
              toppers={fanmeniTop5}
              teams={teams}
              accentColor="emerald"
            />
            <TopperSlideshow
              title="Bidaya Toppers"
              subtitle="Junior category leaders"
              toppers={bidayaTop5}
              teams={teams}
              accentColor="blue"
            />
            <TopperSlideshow
              title="Thaniya Toppers"
              subtitle="Senior category leaders"
              toppers={thaniyaTop5}
              teams={teams}
              accentColor="purple"
            />
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <QuickStat label="Teams" value={teams.length} icon={Users} />
          <QuickStat label="Participants" value={students.length} icon={User} />
          <QuickStat
            label="Programs"
            value={allPrograms.length}
            icon={ClipboardList}
          />
          <QuickStat
            label="Results"
            value={publishedResults.length}
            icon={Trophy}
          />
        </div>

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <QuickLink to="/arts-results" title="Arts Results" icon={Palette} />
          <QuickLink to="/sports-results" title="Sports Results" icon={Trophy} />
          <QuickLink to="/team-points" title="Team Points" icon={Users} />
          <QuickLink
            to="/personal-points-public"
            title="Personal Points"
            icon={Award}
          />
          <QuickLink to="/programs" title="Programs" icon={ClipboardList} />
          <QuickLink
            to="/analytics-public"
            title="Analytics"
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4">
          <QuickLink
            to="/students-public"
            title="Find Student"
            icon={Search}
          />
          <QuickLink to="/screen" title="TV Screen" icon={Tv} accent="cyan" />
          <QuickLink to="/live" title="Live" icon={Radio} accent="emerald" />
        </div>

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
// NAVBAR WITH GLOWING TITLE
// ============================================
function Navbar({ settings, isLive }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          {settings.logoUrl ? (
            <motion.img
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(16,185,129,0.3))",
                  "drop-shadow(0 0 20px rgba(16,185,129,0.6))",
                  "drop-shadow(0 0 8px rgba(16,185,129,0.3))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              src={settings.logoUrl}
              alt="Logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-contain shadow-sm border border-emerald-100 bg-white p-1 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-md flex-shrink-0">
              {settings.festivalName?.[0] || "F"}
            </div>
          )}

          <div className="min-w-0">
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 8px rgba(16,185,129,0.3)",
                  "0 0 20px rgba(16,185,129,0.6)",
                  "0 0 8px rgba(16,185,129,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 truncate"
            >
              {settings.festivalName || "FANMENI"}
            </motion.h1>
            {settings.tagline && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span className="truncate">{settings.tagline}</span>
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <NavItem to="/analytics-public" icon={BarChart3} label="Analytics" />
          <NavItem to="/students-public" icon={Search} label="Search" />

          <Link
            to="/live"
            className={
              isLive
                ? "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm font-bold rounded-xl bg-red-500 text-white shadow-md hover:bg-red-600 transition animate-pulse"
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
                <span className="hidden sm:inline">Live</span>
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

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
          {title}
        </h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-emerald-200 p-12 text-center">
      <Sparkles className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
      <p className="text-gray-400 font-medium">{message}</p>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition">
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

function QuickLink({ to, title, icon: Icon, accent }) {
  if (accent === "emerald") {
    return (
      <Link
        to={to}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl transition text-center group text-white"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-2 md:mb-3 transition">
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <p className="font-bold text-sm md:text-base">{title}</p>
      </Link>
    );
  }

  if (accent === "cyan") {
    return (
      <Link
        to={to}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl transition text-center group text-white"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-2 md:mb-3 transition">
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <p className="font-bold text-sm md:text-base">{title}</p>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="bg-white rounded-2xl p-4 md:p-5 border border-emerald-100 shadow-sm hover:shadow-lg hover:border-emerald-400 hover:bg-emerald-50 transition text-center group"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 group-hover:bg-white flex items-center justify-center mx-auto mb-2 md:mb-3 transition text-emerald-600">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <p className="font-bold text-gray-900 group-hover:text-emerald-700 text-sm md:text-base">
        {title}
      </p>
    </Link>
  );
}