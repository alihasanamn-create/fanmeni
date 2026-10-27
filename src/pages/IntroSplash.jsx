import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const INTRO_DURATION = 4200;
const MAX_INTRO_TIME = 35000;

export default function IntroSplash({ nextPath = "/login", pageName = "LOGIN", onComplete }) {
  const navigate = useNavigate();

  useEffect(() => {
    let completed = false;

    const complete = () => {
      if (completed) return;
      completed = true;
      if (onComplete) {
        onComplete();
      } else {
        navigate(nextPath, { replace: true });
      }
    };

    // The intro normally finishes quickly, while the 35-second fallback is a
    // hard safety limit for slow devices/resources. This prevents a stuck TV
    // screen intro from remaining visible indefinitely.
    const timer = window.setTimeout(complete, INTRO_DURATION);
    const safetyTimer = window.setTimeout(complete, MAX_INTRO_TIME);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safetyTimer);
    };
  }, [navigate, nextPath, onComplete]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#002d22] text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(34,197,139,.32),transparent_38%),linear-gradient(145deg,#00553f_0%,#003c2e_45%,#001f18_100%)]" />
      <Aurora className="left-[-12%] top-[20%]" delay={0} />
      <Aurora className="right-[-12%] top-[34%] rotate-[8deg]" delay={0.7} />
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[linear-gradient(to_top,rgba(0,20,15,.95),transparent)]" />
      <BuildingSilhouette />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl rounded-[2.25rem] border border-white/30 bg-white/10 px-7 py-8 shadow-[0_20px_70px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.35)] backdrop-blur-2xl sm:px-12 sm:py-10"
        >
          <div className="mx-auto inline-flex rounded-full border border-emerald-100/30 bg-emerald-100/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-emerald-100 backdrop-blur-md sm:text-xs">
            FANMENI 26
          </div>

          <div className="mt-7 text-[clamp(2.2rem,7vw,5.8rem)] font-black uppercase leading-[0.95] tracking-[0.12em] drop-shadow-[0_0_30px_rgba(255,255,255,.16)]">
            FANMENI
          </div>
          <div className="mt-2 text-[clamp(1rem,2.2vw,1.5rem)] font-black uppercase tracking-[0.3em] text-emerald-100">
            ARTS FEST
          </div>

          <div className="mx-auto mt-7 h-px w-32 bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          <div className="mt-6 inline-flex rounded-2xl border border-white/20 bg-black/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.28em] text-white/90 backdrop-blur-md sm:text-sm">
            {pageName}
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/55 sm:text-xs">
            Illuminating Creativity
          </p>
        </motion.div>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "min(30rem,70vw)", opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.9 }}
          className="mt-8 h-1 overflow-hidden rounded-full bg-white/10"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-200 via-white to-amber-200"
          />
        </motion.div>

        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.35em] text-white/45 sm:text-[10px]">
          Entering {pageName.toLowerCase()}
        </p>
      </div>
    </main>
  );
}

function Aurora({ className, delay }) {
  return (
    <motion.div
      className={`pointer-events-none absolute h-[22vh] w-[58vw] rounded-[50%] border-t-[2px] border-emerald-100/60 blur-[1px] ${className}`}
      animate={{
        x: ["-4%", "8%", "-4%"],
        y: [0, -16, 0],
        opacity: [0.35, 0.8, 0.35],
      }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ boxShadow: "0 -8px 30px rgba(94,234,212,.22)" }}
    />
  );
}

function BuildingSilhouette() {
  return (
    <div className="pointer-events-none absolute inset-x-[7%] bottom-0 h-[28vh] opacity-55">
      <div className="absolute inset-x-0 bottom-0 h-[15vh] rounded-t-[4rem] border border-emerald-200/20 bg-emerald-950/45" />
      <div className="absolute left-[5%] right-[5%] bottom-[10vh] grid grid-cols-10 gap-3">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[11vh] rounded-t-[50%] border border-emerald-100/20 bg-emerald-100/[0.04]" />
        ))}
      </div>
      <div className="absolute left-1/2 bottom-[10vh] h-[16vh] w-[18vw] -translate-x-1/2 rounded-t-[50%] border border-amber-100/20 bg-emerald-900/30" />
    </div>
  );
}
