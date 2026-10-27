// ============================================
// FILE: src/pages/LiveTracker.jsx
// PURPOSE: Public Stage TV Display for Results Announcer
// ============================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Sparkles, Trophy, Award, Crown } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/collections";
import { useResults } from "../hooks/useResults";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";

export default function LiveTracker() {
  const { results } = useResults();
  const { teams } = useTeams();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [broadcastState, setBroadcastData] = useState({
    isActive: false,
    resultId: null,
    revealStep: 0,
  });

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to broadcast control state in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, "broadcast"),
      (snapshot) => {
        if (snapshot.exists()) {
          setBroadcastData(snapshot.data());
        }
      }
    );
    return () => unsub();
  }, []);

  const activeResult = results.find((r) => r.id === broadcastState?.resultId);
  const step = broadcastState?.revealStep || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col relative font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-black z-0" />

      {/* TOP BAR */}
      <header className="relative z-10 p-6 md:p-8 flex justify-between items-center border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-2xl">
              {settings.festivalName?.[0] || "F"}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-wider uppercase text-emerald-400">
              {settings.festivalName || "FANMENI"} STAGE
            </h1>
            <p className="text-xs text-white/50">{settings.tagline || "Official Result Announcement"}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-2xl md:text-3xl font-black font-mono">
            <Clock className="w-6 h-6 text-emerald-400" />
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
          <p className="text-xs text-white/50">{currentTime.toLocaleDateString()}</p>
        </div>
      </header>

      {/* STAGE SCREEN */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-7xl mx-auto w-full">
        {!broadcastState?.isActive || !activeResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Sparkles className="w-20 h-20 text-emerald-500/40 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black text-white/40 tracking-widest uppercase">
              Awaiting Stage Announcement...
            </h2>
            <p className="text-white/20 mt-3 text-lg">Results will be revealed live</p>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* PROGRAM TITLE */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-10"
            >
              <div className="inline-flex gap-3 mb-4">
                <span className="px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                  {activeResult.moduleType === "sports" ? "🏆 Riyadha" : "🎨 Arts"}
                </span>
                <span className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest">
                  {activeResult.category}
                </span>
                <span className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest">
                  {activeResult.type}
                </span>
              </div>

              <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 text-center leading-tight drop-shadow-2xl">
                {activeResult.programCode && (
                  <span className="text-emerald-400 font-mono text-4xl md:text-6xl block mb-2">
                    #{activeResult.programCode}
                  </span>
                )}
                {activeResult.programName}
              </h1>
            </motion.div>

            {/* PODIUM CARDS (REVERSE REVEAL ORDER: 3rd, 2nd, 1st) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center min-h-[320px]">
              {/* 3RD PLACE (Revealed at step >= 2) */}
              <div className="flex justify-center">
                <AnimatePresence>
                  {step >= 2 && activeResult.positions?.third?.length > 0 && (
                    <RevealCard
                      winners={activeResult.positions.third}
                      teams={teams}
                      medal="🥉"
                      label="3rd Place"
                      color="from-orange-800/80 to-red-950/80"
                      borderColor="border-orange-500/50"
                      height="h-[280px]"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 1ST PLACE CHAMPION (Revealed at step >= 4) */}
              <div className="flex justify-center z-20">
                <AnimatePresence>
                  {step >= 4 && activeResult.positions?.first?.length > 0 && (
                    <RevealCard
                      winners={activeResult.positions.first}
                      teams={teams}
                      medal="🥇"
                      label="1st Place Champion"
                      color="from-amber-500 to-yellow-600"
                      borderColor="border-amber-300"
                      height="h-[360px]"
                      isGold
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 2ND PLACE (Revealed at step >= 3) */}
              <div className="flex justify-center">
                <AnimatePresence>
                  {step >= 3 && activeResult.positions?.second?.length > 0 && (
                    <RevealCard
                      winners={activeResult.positions.second}
                      teams={teams}
                      medal="🥈"
                      label="2nd Place"
                      color="from-slate-700/80 to-slate-900/80"
                      borderColor="border-slate-400/50"
                      height="h-[320px]"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ADDITIONAL GRADES (Revealed at step >= 1) */}
            <AnimatePresence>
              {step >= 1 && activeResult.additionalGrades?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 text-center"
                >
                  <p className="text-white/40 font-bold tracking-widest uppercase text-xs mb-3">
                    Additional Grades
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {activeResult.additionalGrades.map((g, i) => {
                      const team = teams.find((t) => t.id === g.teamId);
                      return (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2 text-sm"
                        >
                          <span className="text-emerald-400 font-bold">Grade {g.grade}</span>
                          <span className="text-white font-medium">{g.studentName || g.teamName}</span>
                          {team && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function RevealCard({ winners, teams, medal, label, color, borderColor, height, isGold }) {
  return (
    <motion.div
      initial={{ y: 200, opacity: 0, rotateY: 90 }}
      animate={{ y: 0, opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 1.2 }}
      className={`w-full max-w-[300px] ${height} rounded-t-3xl bg-gradient-to-b ${color} border-2 ${borderColor} p-5 flex flex-col items-center relative shadow-2xl ${
        isGold ? "text-slate-950" : "text-white"
      }`}
    >
      {isGold && (
        <div className="absolute inset-0 bg-yellow-300/30 blur-2xl animate-pulse rounded-t-3xl pointer-events-none" />
      )}

      <div className="text-5xl md:text-6xl mb-1 drop-shadow">{medal}</div>
      <div
        className={`text-xs font-black uppercase tracking-widest mb-4 ${
          isGold ? "text-slate-900" : "text-white/80"
        }`}
      >
        {label}
      </div>

      <div className="w-full space-y-2 overflow-y-auto z-10">
        {winners.map((w, i) => {
          const team = teams.find((t) => t.id === w.teamId);
          return (
            <div
              key={i}
              className={
                isGold
                  ? "bg-white/90 text-slate-900 rounded-xl p-3 shadow text-center"
                  : "bg-black/40 text-white rounded-xl p-3 border border-white/10 text-center"
              }
            >
              {w.chestNumber && (
                <span className="text-[10px] font-mono font-bold opacity-60 block">
                  #{w.chestNumber}
                </span>
              )}
              <h4 className="text-lg font-black leading-tight truncate">
                {w.studentName || w.teamName}
              </h4>

              <div className="flex items-center justify-center gap-2 mt-1">
                {team && (
                  <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-80">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                  </span>
                )}
                {w.grade && (
                  <span className="px-1.5 py-0.5 bg-black/10 rounded text-[10px] font-bold">
                    Grade {w.grade}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}