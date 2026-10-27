import { Component, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroadcast } from "../hooks/useBroadcast";
import { useResults } from "../hooks/useResults";
import { useSettings } from "../hooks/useSettings";

const BRAND = "#059669";
const TYPE = {
  program: "clamp(1.5rem, 3vw, 3.4rem)",
  winner: "clamp(1rem, 1.65vw, 2rem)",
  team: "clamp(0.8rem, 1.15vw, 1.35rem)",
  label: "clamp(0.52rem, 0.68vw, 0.82rem)",
  small: "clamp(0.48rem, 0.6vw, 0.72rem)",
};

export default function BroadcastScreen() {
  return <StageErrorBoundary><StageScreen /></StageErrorBoundary>;
}

function StageScreen() {
  const { broadcastData, loading, connected } = useBroadcast();
  const { results } = useResults();
  const { settings } = useSettings();
  const activeResult = results.find((r) => r.id === broadcastData?.resultId);
  const step = broadcastData?.isActive ? Number(broadcastData.revealStep ?? 0) : 0;
  const festivalName = settings?.festivalName || "FANMENI 26";
  const primary = settings?.primaryColor || BRAND;

  return <>
    <SuspenseRevealAudio active={Boolean(broadcastData?.isActive && activeResult)} step={step} />
    <LiveShell festivalName={festivalName} primary={primary} logoUrl={settings?.logoUrl}>
      {loading ? <WaitingState connected={connected} /> : (!broadcastData?.isActive || !activeResult) ? <WaitingState connected={connected} idle /> : <>
        <section className="h-[14vh] shrink-0 flex flex-col items-center justify-center text-center">
          <div className="flex justify-center gap-2 mb-1"><Pill>{activeResult.moduleType === "sports" ? "🏆 Riyadha" : "🎨 Arts"}</Pill><Pill>{activeResult.category}</Pill></div>
          <h2 className="font-black leading-none text-white drop-shadow-lg" style={{ fontSize: TYPE.program }}>{activeResult.programName}</h2>
          {activeResult.programCode && <p className="mt-1 font-black tracking-[0.2em] text-emerald-200" style={{ fontSize: TYPE.label }}>{activeResult.programCode}</p>}
        </section>
        <div className="h-[48vh] shrink-0 grid grid-cols-3 gap-[1vw]">
          <PositionBox step={step} revealAt={2} title="3RD POSITION" medal="🥉" winners={activeResult.positions?.third || []} tone="bronze" primary={primary} />
          <PositionBox step={step} revealAt={4} title="1ST POSITION" medal="🥇" winners={activeResult.positions?.first || []} tone="gold" primary={primary} champion />
          <PositionBox step={step} revealAt={3} title="2ND POSITION" medal="🥈" winners={activeResult.positions?.second || []} tone="silver" primary={primary} />
        </div>
        <AnimatePresence>{step >= 1 && (activeResult.additionalGrades?.length || 0) > 0 && <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-[28vh] shrink-0 mt-[1.5vh] rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-sm px-[1vw] py-[1.2vh]">
          <div className="flex items-center justify-between mb-[0.8vh]"><div><h3 className="font-black uppercase tracking-[0.18em] text-white" style={{ fontSize: TYPE.label }}>Grades</h3><p className="text-emerald-100/55 font-semibold" style={{ fontSize: TYPE.small }}>Grades awarded to students</p></div><div className="h-1.5 w-20 rounded-full bg-emerald-300/40" /></div>
          <GradeGrid result={activeResult} primary={primary} />
        </motion.section>}</AnimatePresence>
      </>}
    </LiveShell>
  </>;
}

function LiveShell({ children, festivalName, primary, logoUrl }) {
  return <div className="relative h-screen w-full overflow-hidden bg-[#002d22] text-white font-sans">
    <LiveBackdrop primary={primary} />
    <header className="relative z-20 h-[10vh] px-[2.5vw] pt-[1.5vh] flex items-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/[0.10] px-4 py-2.5 shadow-[0_10px_38px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.34)] backdrop-blur-2xl">
        {logoUrl ? <img src={logoUrl} alt="FANMENI logo" className="h-[5vh] w-[5vh] min-h-8 min-w-8 object-contain rounded-lg" /> : <div className="h-[5vh] w-[5vh] min-h-8 min-w-8 rounded-lg border border-white/20 bg-emerald-300/10 grid place-items-center font-black text-emerald-100">F</div>}
        <div><h1 className="font-black tracking-[0.2em] uppercase text-white" style={{ fontSize: TYPE.label }}>{festivalName}</h1><p className="font-bold tracking-[0.18em] uppercase text-emerald-200" style={{ fontSize: TYPE.small }}>Result Announcer</p></div>
      </div>
    </header>
    <main className="relative z-10 h-[90vh] px-[2.5vw] pb-[2vh] flex flex-col">{children}</main>
  </div>;
}

function WaitingState({ connected, idle = false }) {
  return <div className="relative flex-1 flex items-center justify-center overflow-hidden">
    <motion.div animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.96, 1.04, 0.96] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute h-[38vh] w-[38vh] rounded-full border border-emerald-200/15 bg-emerald-300/5" />
    <div className="relative text-center">
      <div className="mx-auto mb-5 h-14 w-14 rounded-full border border-emerald-200/30 bg-white/10 shadow-[0_0_45px_rgba(52,211,153,.18)] backdrop-blur-xl grid place-items-center"><span className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_18px_rgba(167,243,208,.9)] animate-pulse" /></div>
      <h2 className="font-black tracking-[0.16em] uppercase text-white" style={{ fontSize: TYPE.program }}>{idle ? "LIVE" : connected ? "LIVE" : "CONNECTING"}</h2>
      <p className="mt-3 text-emerald-100/65 font-semibold" style={{ fontSize: TYPE.label }}>{idle ? "Select a programme to reveal its result" : connected ? "Result announcer is ready" : "Waiting for the festival connection…"}</p>
    </div>
  </div>;
}

function LiveBackdrop({ primary }) {
  const dots = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ left: (i * 43) % 100, top: (i * 29) % 100, delay: (i % 8) * 0.45 })), []);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(35,185,133,.25),transparent_36%),linear-gradient(145deg,#00533d_0%,#003c2e_46%,#001f18_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(251,191,36,.09),transparent_24%),radial-gradient(circle_at_85%_40%,rgba(45,212,191,.13),transparent_27%)]" />
    <AuroraRibbon className="left-[-18%] top-[18%]" duration={9} />
    <AuroraRibbon className="right-[-18%] top-[30%] rotate-[8deg]" duration={11} reverse />
    <AuroraRibbon className="left-[-10%] top-[48%] rotate-[-5deg] opacity-50" duration={13} />
    <div className="absolute left-1/2 -translate-x-1/2 top-[-12vh] w-[44vw] h-[44vh] border-x-[2.5vw] border-t-[2.5vw] border-emerald-100/10 rounded-t-[50%]" />
    <CampusForeground />
    <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[linear-gradient(to_top,rgba(0,10,7,.94),transparent)]" />
    <div className="absolute bottom-0 left-0 right-0 h-[8vh] bg-[radial-gradient(ellipse_at_bottom,#0b7658_0%,transparent_70%)] opacity-50" />
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `${primary}66` }} />
    {dots.map((d, i) => <motion.span key={i} className="absolute h-1 w-1 rounded-full bg-emerald-100/35" style={{ left: `${d.left}%`, top: `${d.top}%` }} animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.8, 1.4, 0.8] }} transition={{ duration: 3.5, delay: d.delay, repeat: Infinity }} />)}
  </div>;
}

function CampusForeground() {
  return <div className="absolute inset-x-0 bottom-0 h-[31vh] z-[2] overflow-hidden">
    <div className="absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-black/70 via-emerald-950/40 to-transparent" />
    <div className="absolute left-[2%] right-[2%] bottom-0 h-[24vh] rounded-t-[3rem] border border-amber-100/20 bg-gradient-to-b from-amber-50/90 via-amber-50/80 to-amber-100/75 shadow-[0_-10px_50px_rgba(251,191,36,.12)]">
      <div className="absolute left-[1%] top-0 h-full w-[8%] border-x border-white/35 bg-amber-100/70" />
      <div className="absolute right-[1%] top-0 h-full w-[8%] border-x border-white/35 bg-amber-100/70" />
      <div className="absolute left-1/2 top-[-7vh] h-[10vh] w-[18vw] -translate-x-1/2 rounded-t-[50%] border-[.7vw] border-amber-100 bg-amber-50 shadow-lg" />
      <div className="absolute left-[10%] right-[10%] top-[7vh] grid grid-cols-9 gap-[.5vw]">{Array.from({ length: 9 }, (_, i) => <div key={i} className="h-[10vh] rounded-t-[50%] border-x border-white/30 bg-emerald-950/15" />)}</div>
      <div className="absolute left-[10%] right-[10%] top-[17vh] grid grid-cols-9 gap-[.5vw]">{Array.from({ length: 9 }, (_, i) => <div key={i} className="h-[8vh] border-x border-white/25 bg-amber-900/10" />)}</div>
      <div className="absolute left-[44%] right-[44%] bottom-0 h-[15vh] bg-emerald-950/20 border-x border-white/30" />
      <div className="absolute left-[3%] right-[3%] bottom-0 h-[2vh] bg-emerald-950/30" />
    </div>
    <div className="absolute left-0 right-0 bottom-0 h-[4vh] bg-emerald-950/80" />
  </div>;
}

function AuroraRibbon({ className, duration, reverse }) {
  return <motion.div className={`absolute h-[20vh] w-[70vw] rounded-[50%] border-t-[2px] border-emerald-100/55 blur-[1px] ${className}`} animate={{ x: reverse ? ["8%", "-7%", "8%"] : ["-7%", "8%", "-7%"], y: [0, -18, 0], opacity: [.25, .75, .25] }} transition={{ duration, repeat: Infinity, ease: "easeInOut" }} style={{ boxShadow: "0 -12px 42px rgba(94,234,212,.18)" }} />;
}

function Pill({ children }) { return <span className="rounded-full bg-emerald-300/10 border border-emerald-200/30 px-3 py-1 font-black uppercase tracking-[0.12em] text-emerald-100" style={{ fontSize: TYPE.small }}>{children}</span>; }

function PositionBox({ step, revealAt, title, medal, winners, tone, primary, champion }) {
  const toneClass = tone === "gold" ? "border-amber-200/55 bg-amber-100/[0.09]" : tone === "silver" ? "border-slate-200/40 bg-white/[0.07]" : "border-orange-200/45 bg-orange-100/[0.07]";
  const headerClass = tone === "gold" ? "text-amber-100" : tone === "silver" ? "text-slate-100" : "text-orange-100";
  const visible = winners.slice(0, 4);
  return <AnimatePresence mode="wait">{step >= revealAt && visible.length > 0 ? <motion.section key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`h-full rounded-2xl border ${toneClass} overflow-hidden backdrop-blur-sm flex flex-col ${champion ? "ring-1 ring-amber-200/25" : ""}`}>
    <div className="h-[23%] shrink-0 px-[1vw] flex items-center gap-3 border-b border-white/10"><span className="text-[clamp(1.7rem,3vw,3.3rem)] leading-none">{medal}</span><div><h3 className={`font-black tracking-[0.12em] ${headerClass}`} style={{ fontSize: TYPE.label }}>{title}</h3><p className="text-white/45 font-semibold" style={{ fontSize: TYPE.small }}>{winners.length} student{winners.length !== 1 ? "s" : ""}</p></div></div>
    <div className="flex-1 min-h-0 p-[0.7vw] flex flex-col justify-center gap-[0.6vw]">{visible.map((winner, i) => <WinnerCard key={`${winner.studentId || winner.chestNumber || winner.studentName || i}`} winner={winner} primary={primary} compact={visible.length > 2} />)}</div>
  </motion.section> : <div className="h-full rounded-2xl border border-white/10 bg-white/[0.035] flex items-center justify-center text-white/25 font-bold" style={{ fontSize: TYPE.label }}>Position will appear here</div>}</AnimatePresence>;
}

function WinnerCard({ winner, primary, compact }) {
  const team = winner.teamName || winner.team || "";
  return <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-white/15 bg-white/[0.94] text-slate-950 px-[1vw] py-[0.75vh] shadow-lg flex items-center gap-[0.8vw] min-h-0 flex-1">
    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: primary }} />
    <div className="min-w-0 flex-1"><div className="font-black leading-tight truncate" style={{ fontSize: compact ? "clamp(.8rem,1.25vw,1.45rem)" : TYPE.winner }}>{winner.studentName || winner.teamName || "Unnamed participant"}</div>{team && team !== winner.studentName && <div className="mt-0.5 font-black text-emerald-700 truncate" style={{ fontSize: compact ? "clamp(.62rem,.9vw,1rem)" : TYPE.team }}>{team}</div>}</div>
    <div className="shrink-0 flex gap-1">{winner.chestNumber && <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-500 font-bold" style={{ fontSize: TYPE.small }}>#{winner.chestNumber}</span>}{winner.class && <span className="hidden sm:inline rounded-md bg-slate-100 px-2 py-1 text-slate-500 font-bold" style={{ fontSize: TYPE.small }}>C{winner.class}</span>}</div>
  </motion.div>;
}

function GradeGrid({ result, primary }) {
  const entries = (result.additionalGrades || []).filter((g) => String(g.grade || "").trim());
  if (!entries.length) return null;
  const visible = entries.slice(0, 8);
  return <div className={`h-[20vh] grid ${visible.length <= 2 ? "grid-cols-2" : visible.length <= 4 ? "grid-cols-4" : "grid-cols-4 grid-rows-2"} gap-[0.7vw]`}>
    {visible.map((g, i) => <motion.div key={`${g.studentId || g.studentName || i}-${g.grade}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="rounded-xl border border-emerald-100/20 bg-white text-slate-950 px-[0.8vw] py-[0.7vh] flex items-center gap-[0.7vw] min-w-0 shadow-md">
      <div className="h-[7vh] w-[7vh] min-h-10 min-w-10 shrink-0 rounded-xl flex items-center justify-center bg-emerald-50 border-2 font-black text-2xl md:text-4xl" style={{ borderColor: `${primary}35`, color: primary }}>{g.grade}</div>
      <div className="min-w-0"><div className="font-black leading-tight truncate" style={{ fontSize: "clamp(.75rem,1.15vw,1.3rem)" }}>{g.studentName || g.teamName || "Participant"}</div>{(g.teamName || g.team) && <div className="font-black text-emerald-700 truncate" style={{ fontSize: "clamp(.58rem,.82vw,.95rem)" }}>{g.teamName || g.team}</div>}<div className="text-slate-400 font-semibold truncate" style={{ fontSize: TYPE.small }}>{g.chestNumber ? `Chest ${g.chestNumber}` : "Grade awarded"}</div></div>
    </motion.div>)}
  </div>;
}

function SuspenseRevealAudio({ active, step }) {
  const ctxRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    const shouldPlay = active && step >= 1 && step < 4;
    if (!shouldPlay) {
      if (ctxRef.current) { try { ctxRef.current.close(); } catch {} ctxRef.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    let cancelled = false;
    const start = async () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx || cancelled) return;
        const ctx = new AudioCtx();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume();
        const master = ctx.createGain();
        master.gain.value = 0.035;
        master.connect(ctx.destination);
        const bass = ctx.createOscillator();
        const pad = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        bass.type = "sine"; pad.type = "triangle"; lfo.type = "sine";
        bass.frequency.value = 55; pad.frequency.value = 110; lfo.frequency.value = 0.09; lfoGain.gain.value = 0.012;
        lfo.connect(lfoGain); lfoGain.connect(master.gain);
        bass.connect(master); pad.connect(master);
        bass.start(); pad.start(); lfo.start();
        const notes = [55, 65.41, 73.42, 82.41, 73.42, 65.41];
        let index = 0;
        timerRef.current = setInterval(() => {
          if (!ctxRef.current) return;
          const now = ctx.currentTime;
          bass.frequency.exponentialRampToValueAtTime(notes[index % notes.length], now + 0.35);
          pad.frequency.exponentialRampToValueAtTime(notes[(index + 2) % notes.length] * 2, now + 0.45);
          index += 1;
        }, 900);
      } catch (error) {
        console.warn("[BroadcastScreen] suspense audio unavailable", error);
      }
    };
    start();
    return () => { cancelled = true; if (timerRef.current) clearInterval(timerRef.current); if (ctxRef.current) { try { ctxRef.current.close(); } catch {} ctxRef.current = null; } };
  }, [active, step]);
  return null;
}

class StageErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[BroadcastScreen] reveal failed", error, info?.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="min-h-screen w-full bg-[#002d22] text-white flex items-center justify-center p-8 font-sans"><div className="max-w-2xl text-center"><p className="font-black uppercase tracking-[0.2em] text-emerald-200">Stage reveal failed</p><p className="mt-3 text-white/80 font-semibold break-words">{this.state.error.message || "Unknown error"}</p></div></div>;
  }
}
