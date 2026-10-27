// ============================================
// FILE: src/pages/ScreenPage.jsx
// PURPOSE: FANMENI TV Screen - live animated variable scorecards
// ============================================

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Palette,
  User,
  Crown,
  Sparkles,
  Clock,
  Calendar,
  Award,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
} from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { useResults } from "../hooks/useResults";
import { useSettings } from "../hooks/useSettings";

const SLIDE_DURATION = 10000;

export default function ScreenPage() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { results } = useResults();
  const { settings } = useSettings();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [topperIndex, setTopperIndex] = useState(0);
  const [resultIndex, setResultIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const artsRanking = useMemo(
    () => [...teams].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)),
    [teams]
  );

  const riyadhaRanking = useMemo(
    () => [...teams].sort((a, b) => (b.sportsPoints || 0) - (a.sportsPoints || 0)),
    [teams]
  );

  const featuredToppers = useMemo(
    () =>
      [...students]
        .filter((s) => (s.totalPoints || 0) > 0)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 5),
    [students]
  );

  const top10 = useMemo(
    () =>
      [...students]
        .filter((s) => (s.totalPoints || 0) > 0)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 10),
    [students]
  );

  const latestResults = useMemo(
    () =>
      [...results]
        .filter((r) => r.status !== "draft")
        .sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() || 0;
          const bt = b.updatedAt?.toMillis?.() || 0;
          return bt - at;
        })
        .slice(0, 10),
    [results]
  );

  const slides = [
    { id: "arts", label: "Arts" },
    { id: "riyadha", label: "Riyadha" },
    { id: "topper", label: "Topper" },
    { id: "top10", label: "Top 10" },
    { id: "result", label: "Result" },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  useEffect(() => {
    if (featuredToppers.length <= 1) return;
    const interval = setInterval(() => {
      setTopperIndex((prev) => (prev + 1) % featuredToppers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredToppers.length]);

  useEffect(() => {
    if (latestResults.length <= 1) return;
    const interval = setInterval(() => {
      setResultIndex((prev) => (prev + 1) % latestResults.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [latestResults.length]);

  const maxArts = Math.max(1, ...artsRanking.map((team) => team.totalPoints || 0));
  const maxRiyadha = Math.max(1, ...riyadhaRanking.map((team) => team.sportsPoints || 0));

  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-200 overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-0 w-[420px] h-[420px] bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.65),transparent_55%)] pointer-events-none" />

      <header className="bg-white/85 backdrop-blur-xl border-b border-emerald-200/80 shadow-sm px-4 py-2 relative z-30 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {settings.logoUrl ? (
              <motion.img
                animate={{ filter: ["drop-shadow(0 0 8px rgba(16,185,129,0.35))", "drop-shadow(0 0 20px rgba(16,185,129,0.65))", "drop-shadow(0 0 8px rgba(16,185,129,0.35))"] }}
                transition={{ duration: 3, repeat: Infinity }}
                src={settings.logoUrl}
                alt="Logo"
                className="w-9 h-9 rounded-lg object-contain shadow border border-emerald-100 bg-white p-1 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-black shadow flex-shrink-0">
                {settings.festivalName?.[0] || "F"}
              </div>
            )}
            <div className="min-w-0">
              <motion.h1
                animate={{ textShadow: ["0 0 8px rgba(16,185,129,0.35)", "0 0 20px rgba(16,185,129,0.65)", "0 0 8px rgba(16,185,129,0.35)"] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-lg md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 leading-none truncate"
              >
                {settings.festivalName || "FANMENI"}
              </motion.h1>
              <p className="text-[9px] text-gray-500 flex items-center gap-1">
                <Sparkles className="w-2 h-2 text-emerald-500" />
                {settings.tagline || "Live Results Portal"}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1 text-base md:text-xl font-black font-mono text-gray-900 leading-none">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </div>
            <div className="text-[9px] text-gray-500 flex items-center justify-end gap-1 mt-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {currentTime.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden z-10">
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <SlideContainer key="arts">
              <SlideHeader icon={Palette} title="ARTS" subtitle="FANMENI TEAM POINTS" gradient="from-fuchsia-500 to-purple-600" />
              <ScoreboardMeta label="LIVE ARTS SCORECARD" />
              <TeamPointsSlide teams={artsRanking} maxPoints={maxArts} pointsKey="totalPoints" />
            </SlideContainer>
          )}

          {currentSlide === 1 && (
            <SlideContainer key="riyadha">
              <SlideHeader icon={Trophy} title="RIYADHA" subtitle="FANMENI TEAM POINTS" gradient="from-blue-500 to-indigo-600" />
              <ScoreboardMeta label="LIVE RIYADHA SCORECARD" />
              <TeamPointsSlide teams={riyadhaRanking} maxPoints={maxRiyadha} pointsKey="sportsPoints" />
            </SlideContainer>
          )}

          {currentSlide === 2 && (
            <SlideContainer key="topper">
              <SlideHeader icon={Crown} title="TOP PERFORMER" subtitle="FEATURED STAR" gradient="from-amber-500 to-orange-600" />
              <TopperSlide topper={featuredToppers[topperIndex]} index={topperIndex} total={featuredToppers.length} teams={teams} />
            </SlideContainer>
          )}

          {currentSlide === 3 && (
            <SlideContainer key="top10">
              <SlideHeader icon={Award} title="TOP 10" subtitle="INDIVIDUAL RANKINGS" gradient="from-emerald-500 to-teal-600" />
              <Top10Slide top10={top10} teams={teams} />
            </SlideContainer>
          )}

          {currentSlide === 4 && latestResults[resultIndex] && (
            <SlideContainer key="result">
              <SlideHeader icon={Trophy} title="LATEST RESULT" subtitle={`${resultIndex + 1} OF ${latestResults.length}`} gradient="from-orange-500 to-red-600" />
              <ResultSlide result={latestResults[resultIndex]} teams={teams} />
            </SlideContainer>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border-t border-emerald-200 shadow-sm py-1.5 px-3 relative z-30 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2">
          <motion.button onClick={goToPrev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow flex items-center justify-center transition flex-shrink-0" aria-label="Previous slide">
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 flex-wrap">
            {slides.map((slide, i) => (
              <button key={slide.id} onClick={() => goToSlide(i)} className={i === currentSlide ? "flex items-center gap-1 px-2 md:px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md font-bold text-[10px] md:text-xs shadow transition-all" : "flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 text-gray-600 rounded-md font-medium text-[10px] md:text-xs hover:bg-gray-200 transition"}>
                <span className="opacity-70">{i + 1}</span>
                <span className="hidden md:inline">{slide.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <motion.button onClick={() => setIsPlaying(!isPlaying)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={isPlaying ? "w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow flex items-center justify-center transition" : "w-9 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow flex items-center justify-center transition animate-pulse"} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>
            <motion.button onClick={goToNext} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow flex items-center justify-center transition" aria-label="Next slide">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {isPlaying && (
          <div className="mt-1 max-w-[1800px] mx-auto">
            <div className="h-0.5 bg-emerald-100 rounded-full overflow-hidden">
              <motion.div key={currentSlide} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SlideContainer({ children }) {
  return (
    <motion.div initial={{ opacity: 0, x: 70 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -70 }} transition={{ duration: 0.45, ease: "easeOut" }} className="absolute inset-0 flex flex-col p-3 md:p-5 overflow-hidden">
      {children}
    </motion.div>
  );
}

function SlideHeader({ icon: Icon, title, subtitle, gradient }) {
  return (
    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-2.5 mb-1.5 flex-shrink-0">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.18em] font-bold mt-0.5">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function ScoreboardMeta({ label }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2 md:mb-3 flex-shrink-0">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/65 border border-white/80 backdrop-blur px-2.5 py-1 shadow-sm">
        <motion.span animate={{ opacity: [1, 0.35, 1], scale: [1, 0.85, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
        <Radio className="w-3 h-3 text-emerald-600" />
        <span className="text-[9px] md:text-[10px] font-black tracking-[0.16em] text-emerald-800">{label}</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <TrendingUp className="w-3 h-3" /> Live updates · rankings animate automatically
      </div>
    </div>
  );
}

function TeamPointsSlide({ teams, maxPoints, pointsKey }) {
  const visibleTeams = teams.slice(0, 6);

  if (!visibleTeams.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white px-8 py-6 shadow-xl text-center">
          <Trophy className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-xl font-black text-gray-400">No team points yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4 auto-rows-fr overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {visibleTeams.map((team, i) => (
          <VariableScoreCard key={team.id} team={team} rank={i + 1} maxPoints={maxPoints} pointsKey={pointsKey} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function VariableScoreCard({ team, rank, maxPoints, pointsKey }) {
  const points = Number(team[pointsKey] || 0);
  const previousPoints = useRef(points);
  const [flash, setFlash] = useState(false);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const change = points - previousPoints.current;
    if (change !== 0) {
      setDelta(change);
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1300);
      previousPoints.current = points;
      return () => clearTimeout(timer);
    }
    previousPoints.current = points;
  }, [points]);

  const percentage = Math.min(100, Math.max(0, (points / maxPoints) * 100));
  const isFirst = rank === 1;
  const isTopThree = rank <= 3;
  const teamColor = team.color || "#10b981";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.92, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -18 }}
      transition={{ type: "spring", stiffness: 170, damping: 19 }}
      className={`relative min-h-0 overflow-hidden rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-xl shadow-lg md:shadow-xl border ${isFirst ? "border-4" : "border-2 border-white/80"}`}
      style={isFirst ? { borderColor: teamColor } : undefined}
    >
      <motion.div animate={{ opacity: isFirst ? [0.12, 0.26, 0.12] : 0.08 }} transition={{ duration: 2.8, repeat: Infinity }} className="absolute -top-24 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: teamColor }} />

      <div className="relative h-full min-h-0 p-2.5 sm:p-3.5 md:p-4 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
          <div className={`shrink-0 flex items-center justify-center rounded-xl ${isFirst ? "w-10 h-10 md:w-12 md:h-12" : "w-9 h-9 md:w-11 md:h-11"} bg-gray-50 shadow-sm border border-white`}>
            <span className={`${isFirst ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>{["🥇", "🥈", "🥉"][rank - 1] || `#${rank}`}</span>
          </div>

          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className={`${isFirst ? "w-12 h-12 md:w-16 md:h-16" : "w-10 h-10 md:w-14 md:h-14"} rounded-xl md:rounded-2xl object-contain bg-white p-1.5 shadow-md border border-gray-100 shrink-0`} />
          ) : (
            <div className={`${isFirst ? "w-12 h-12 md:w-16 md:h-16" : "w-10 h-10 md:w-14 md:h-14"} rounded-xl md:rounded-2xl shadow-md shrink-0`} style={{ backgroundColor: teamColor }} />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <motion.h3 layout="position" className={`font-black text-gray-900 uppercase tracking-tight leading-[0.95] truncate ${isFirst ? "text-[clamp(1.35rem,3vw,2.7rem)]" : "text-[clamp(1.15rem,2.5vw,2.25rem)]"}`}>
                {team.name || "Unnamed Team"}
              </motion.h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {isFirst && <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Current Leader</span>}
              {!isFirst && <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Rank #{rank}</span>}
              {flash && (
                <motion.span initial={{ opacity: 0, y: 5, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] md:text-[9px] font-black text-emerald-700">
                  {delta > 0 ? `+${delta}` : delta} LIVE
                </motion.span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 mt-2 md:mt-3 min-h-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <AnimatedNumber value={points} color={teamColor} emphasized={isFirst || isTopThree} />
              <span className={`${isFirst ? "text-[10px] md:text-sm" : "text-[9px] md:text-xs"} uppercase tracking-[0.18em] font-black text-gray-400`}>PTS</span>
            </div>
            <div className="mt-2 md:mt-3 h-2 md:h-2.5 rounded-full bg-gray-100 overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.1, ease: "easeOut" }} className="h-full rounded-full relative overflow-hidden" style={{ backgroundColor: teamColor }}>
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-18deg]" />
              </motion.div>
            </div>
          </div>

          <div className="shrink-0 text-right pb-0.5">
            <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">Live tally</div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <motion.span animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamColor }} />
              <span className="text-[9px] md:text-[10px] font-black text-gray-500">UPDATING</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function AnimatedNumber({ value, color, emphasized }) {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef(null);
  const startRef = useRef(value);

  useEffect(() => {
    const start = startRef.current;
    const end = value;
    const duration = 700;
    const startTime = performance.now();

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    startRef.current = end;

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <motion.span key={`${value}-${emphasized}`} initial={{ scale: 1 }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.45 }} className="font-black leading-none tracking-[-0.06em]" style={{ color, fontSize: emphasized ? "clamp(2.6rem, 7vw, 6.4rem)" : "clamp(2rem, 5vw, 4.2rem)", textShadow: emphasized ? `0 0 22px ${color}45` : `0 3px 16px ${color}30` }}>
      {displayValue}
    </motion.span>
  );
}

function TopperSlide({ topper, index, total, teams }) {
  if (!topper) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-2xl text-gray-400">No toppers yet</p></div>;
  }

  const team = teams.find((t) => t.id === topper.teamId);

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
      <AnimatePresence mode="wait">
        <motion.div key={topper.id} initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.82, opacity: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-4xl w-full">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg mb-3 text-sm">
            <Crown className="w-3 h-3 md:w-4 md:h-4" />
            <span className="font-black">RANK #{index + 1} OF {total}</span>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-white ring-4 ring-amber-400 shadow-2xl flex-shrink-0">
              {topper.photoUrl ? <img src={topper.photoUrl} alt={topper.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><User className="w-12 h-12 md:w-16 md:h-16 text-gray-400" /></div>}
            </div>
            <div className="text-left">
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-none mb-2">{topper.name}</h3>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {topper.chestNumber && <span className="bg-white px-2 py-0.5 rounded-md font-mono font-black text-gray-700 shadow text-xs md:text-sm">#{topper.chestNumber}</span>}
                {team && <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md font-black text-gray-700 shadow text-xs md:text-sm"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />{team.name}</span>}
                {topper.category && <span className="bg-white px-2 py-0.5 rounded-md font-black text-gray-700 shadow text-xs md:text-sm">{topper.category}</span>}
              </div>
            </div>
          </div>

          <div className="inline-flex items-baseline gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-2xl shadow-2xl">
            <span className="font-black leading-none" style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{topper.totalPoints || 0}</span>
            <span className="text-sm md:text-lg uppercase font-black tracking-widest opacity-90">pts</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Top10Slide({ top10, teams }) {
  return (
    <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
      <div className="grid grid-cols-5 gap-1.5 md:gap-3">
        {top10.map((s, i) => {
          const team = teams.find((t) => t.id === s.teamId);
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <motion.div key={s.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-md p-1.5 md:p-2 text-center flex flex-col items-center">
              <div className="flex-shrink-0">{i < 3 ? <span className="text-lg md:text-2xl leading-none">{medals[i]}</span> : <span className="text-[10px] md:text-sm font-black text-gray-400 leading-none">#{i + 1}</span>}</div>
              <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden bg-gray-100 shadow ring-1 ring-white my-1 flex-shrink-0">
                {s.photoUrl ? <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 md:w-6 md:h-6 text-gray-400" /></div>}
              </div>
              <p className="text-[9px] md:text-xs font-black text-gray-900 truncate w-full leading-tight px-0.5">{s.name}</p>
              {team && <div className="flex items-center justify-center gap-0.5 w-full min-w-0 my-0.5"><div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} /><span className="text-[7px] md:text-[10px] text-gray-500 truncate">{team.name}</span></div>}
              <div className="text-base md:text-2xl lg:text-3xl font-black leading-none flex-shrink-0 mt-0.5" style={{ color: team?.color || "#10b981" }}>{s.totalPoints || 0}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ResultSlide({ result, teams }) {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden min-h-0">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-3 md:mb-4">
          <div className="flex items-center justify-center flex-wrap gap-1.5 mb-1.5">
            {result.programCode && <span className="text-xl md:text-3xl font-black text-gray-300">#{result.programCode}</span>}
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">{result.category}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">{result.type}</span>
            <span className={result.moduleType === "sports" ? "px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold" : "px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-bold"}>{result.moduleType === "sports" ? "🏆 Riyadha" : "🎨 Arts"}</span>
          </div>
          <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">{result.programName}</h3>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {["first", "second", "third"].map((pos, i) => {
            const winners = result.positions?.[pos] || [];
            const emojis = ["🥇", "🥈", "🥉"];
            const labels = ["1st", "2nd", "3rd"];
            const styles = ["bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-400", "bg-gradient-to-br from-slate-100 to-gray-100 border-slate-400", "bg-gradient-to-br from-orange-100 to-red-100 border-orange-400"];
            return (
              <motion.div key={pos} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className={`border-2 rounded-xl p-2 md:p-3 shadow-lg ${styles[i]}`}>
                <div className="text-center mb-2"><div className="flex items-center justify-center gap-1.5"><div className="text-2xl md:text-3xl">{emojis[i]}</div><div className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-700">{labels[i]}</div></div></div>
                {winners.length > 0 ? (
                  <div className="space-y-1.5">
                    {winners.slice(0, 2).map((w, idx) => {
                      const team = teams.find((t) => t.id === w.teamId);
                      return (
                        <div key={idx} className="text-center bg-white/60 rounded-lg p-1.5">
                          {w.chestNumber && <div className="text-[9px] md:text-[10px] font-mono font-bold text-gray-500">#{w.chestNumber}</div>}
                          <div className="font-black text-xs md:text-sm text-gray-900 leading-tight truncate">{w.studentName || w.teamName || "—"}</div>
                          {team && <div className="flex items-center justify-center gap-1 mt-0.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} /><span className="text-[9px] md:text-[10px] text-gray-600 font-medium truncate">{team.name}</span></div>}
                          {w.grade && <span className="inline-block mt-1 text-[9px] md:text-[10px] bg-white px-1.5 py-0.5 rounded font-black shadow-sm">{w.grade}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center text-gray-400 italic py-2 text-xs">No winner</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
