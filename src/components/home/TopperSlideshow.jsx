// ============================================
// FILE: src/components/home/TopperSlideshow.jsx
// PURPOSE: Top 5 toppers card flip slideshow (photo-side layout)
// ============================================

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, User, Award, Sparkles, Hash, Shield } from "lucide-react";

export default function TopperSlideshow({
  title,
  subtitle,
  toppers,
  teams,
  accentColor = "emerald",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (toppers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % toppers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [toppers.length]);

  const accents = {
    emerald: {
      grad: "from-emerald-500 via-teal-500 to-cyan-600",
      light: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      ring: "ring-emerald-400",
      dot: "bg-emerald-500",
    },
    blue: {
      grad: "from-blue-500 via-indigo-500 to-purple-600",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      ring: "ring-blue-400",
      dot: "bg-blue-500",
    },
    purple: {
      grad: "from-purple-500 via-pink-500 to-rose-600",
      light: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      ring: "ring-purple-400",
      dot: "bg-purple-500",
    },
  };

  const c = accents[accentColor] || accents.emerald;

  if (toppers.length === 0) {
    return (
      <div>
        <SectionHeader title={title} subtitle={subtitle} colorClass={c} />
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No toppers yet</p>
        </div>
      </div>
    );
  }

  const topper = toppers[currentIndex];
  const rank = currentIndex + 1;
  const team = teams.find((t) => t.id === topper.teamId);
  const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];

  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} colorClass={c} />

      {/* MAIN FLIP CARD */}
      <div className="relative h-[280px] sm:h-[300px] md:h-[320px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Link
              to={`/student/${topper.id}`}
              className="block h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group"
            >
              {/* Top accent bar */}
              <div className={`h-2 bg-gradient-to-r ${c.grad}`} />

              <div className="h-[calc(100%-8px)] flex p-5 md:p-6">
                {/* LEFT: Photo + Rank */}
                <div className="flex flex-col items-center justify-center w-2/5 pr-4 border-r border-gray-100">
                  <div className="relative">
                    {/* Rank badge */}
                    <div
                      className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} text-white text-sm font-black flex items-center justify-center shadow-lg z-10 border-2 border-white`}
                    >
                      {rank}
                    </div>

                    {/* Photo */}
                    <div
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gray-100 ring-2 ${c.ring} ring-offset-2 shadow-lg`}
                    >
                      {topper.photoUrl ? (
                        <img
                          src={topper.photoUrl}
                          alt={topper.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medal */}
                  <div className="text-3xl mt-3">
                    {medals[rank - 1] || "🏅"}
                  </div>

                  {/* Rank label */}
                  <div
                    className={`mt-1 text-xs font-bold uppercase tracking-widest ${c.text}`}
                  >
                    Rank #{rank}
                  </div>
                </div>

                {/* RIGHT: Info + Points */}
                <div className="flex-1 flex flex-col justify-between pl-5 min-w-0">
                  {/* Top: Student info */}
                  <div className="min-w-0">
                    {/* Chest + Team */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {topper.chestNumber && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 ${c.light} rounded-md text-[10px] font-bold ${c.text}`}
                        >
                          <Hash className="w-2.5 h-2.5" />
                          {topper.chestNumber}
                        </span>
                      )}
                      {team && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold text-gray-700">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight mb-1 truncate group-hover:text-emerald-600 transition">
                      {topper.name}
                    </h3>

                    {/* Category */}
                    {topper.category && (
                      <p className="text-xs text-gray-500 font-medium">
                        {topper.category} Category
                      </p>
                    )}
                  </div>

                  {/* Bottom: Points highlight */}
                  <div className={`${c.light} rounded-2xl p-3.5 relative overflow-hidden`}>
                    <div
                      className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 bg-gradient-to-br ${c.grad}`}
                    />
                    <div className="relative">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl md:text-5xl font-black ${c.text} leading-none`}
                        >
                          {topper.totalPoints || 0}
                        </span>
                        <span className="text-2xl">🏆</span>
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">
                        Total Points
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DOTS INDICATOR */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {toppers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={
              i === currentIndex
                ? `w-8 h-2 ${c.dot} rounded-full transition-all`
                : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-all"
            }
          />
        ))}
      </div>

      {/* MINI CARDS ROW */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {toppers.map((s, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(i)}
              className={
                isActive
                  ? `bg-white rounded-xl p-2 border-2 ${c.border} shadow-md transition-all`
                  : "bg-white rounded-xl p-2 border border-gray-100 hover:border-gray-200 transition-all opacity-60 hover:opacity-100"
              }
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-1.5 relative">
                {s.photoUrl ? (
                  <img
                    src={s.photoUrl}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                {/* Rank badge on mini card */}
                <div className="absolute top-1 left-1 w-5 h-5 bg-white/95 rounded-md text-[9px] font-black text-gray-700 flex items-center justify-center shadow-sm">
                  {i + 1}
                </div>
              </div>
              <div className="text-[9px] font-bold text-gray-500 truncate">
                #{s.chestNumber || "—"}
              </div>
              <div
                className={`text-sm font-black ${
                  isActive ? c.text : "text-gray-800"
                }`}
              >
                {s.totalPoints || 0}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SECTION HEADER
// ============================================
function SectionHeader({ title, subtitle, colorClass }) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.light} ${colorClass.text}`}
      >
        <Trophy className="w-5 h-5" />
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