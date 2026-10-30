// ============================================
// FILE: src/pages/LivePublish.jsx
// PURPOSE: Stage Result Announcer Controller
// ============================================

import { useState, useEffect } from "react";
import {
  Tv,
  Play,
  Eye,
  X,
  Trophy,
  ExternalLink,
  Sparkles,
  Award,
  Crown,
  ChevronRight,
  RotateCcw,
  Search,
  CheckCircle,
} from "lucide-react";
import { useResults } from "../hooks/useResults";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/collections";

export default function LivePublish() {
  const { results, loading: resultsLoading } = useResults();
  const [broadcastState, setBroadcastData] = useState({
    isActive: false,
    resultId: null,
    revealStep: 0, // 0 = Title, 1 = Grades, 2 = 3rd, 3 = 2nd, 4 = 1st
  });
  const [search, setSearch] = useState("");

  // Listen to broadcast state in real-time
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

  // Show the most recently updated published results first.
  // Fall back to other common timestamps when updatedAt is not present.
  const publishedResults = results
    .filter((r) => r.status === "published")
    .sort((a, b) => {
      const getTimestamp = (result) => {
        const value =
          result.updatedAt ??
          result.updated_at ??
          result.publishedAt ??
          result.createdAt ??
          result.created_at ??
          0;

        if (typeof value === "number") return value;
        if (typeof value?.toDate === "function") return value.toDate().getTime();

        const timestamp = new Date(value).getTime();
        return Number.isFinite(timestamp) ? timestamp : 0;
      };

      return getTimestamp(b) - getTimestamp(a);
    });

  const filteredResults = publishedResults.filter(
    (r) =>
      r.programName?.toLowerCase().includes(search.toLowerCase()) ||
      r.programCode?.toLowerCase().includes(search.toLowerCase())
  );

  const activeResult = publishedResults.find(
    (r) => r.id === broadcastState?.resultId
  );

  const updateBroadcast = async (data) => {
    await setDoc(
      doc(db, COLLECTIONS.SETTINGS, "broadcast"),
      {
        ...broadcastState,
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const startAnnounce = (resultId) => {
    updateBroadcast({
      isActive: true,
      resultId: resultId,
      revealStep: 0, // Step 0: Title only
    });
  };

  const stopAnnounce = () => {
    updateBroadcast({
      isActive: false,
      resultId: null,
      revealStep: 0,
    });
  };

  const setStep = (step) => {
    updateBroadcast({ revealStep: step });
  };

  const nextStep = () => {
    if (broadcastState.revealStep < 4) {
      setStep(broadcastState.revealStep + 1);
    }
  };

  const stepLabels = [
    "Program Title Only",
    "Additional Grades",
    "3rd Place 🥉",
    "2nd Place 🥈",
    "1st Place 🥇 (CHAMPION)",
  ];

  if (resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Stage Result Announcer
              </h1>
              <p className="text-sm text-gray-500">
                Reveal program results step-by-step on the Stage TV
              </p>
            </div>
          </div>

          <a
            href="/live"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Open Stage Screen (/live)
          </a>
        </div>

        {/* ACTIVE STAGE CONTROLLER */}
        {broadcastState?.isActive && activeResult ? (
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-emerald-500 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="text-red-400 font-bold tracking-widest text-xs uppercase">
                    ON STAGE TV NOW
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  {activeResult.programCode && `[${activeResult.programCode}] `}
                  {activeResult.programName}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Category: <b className="text-white">{activeResult.category}</b> • Type: <b className="text-white">{activeResult.type}</b>
                </p>
              </div>

              <button
                onClick={stopAnnounce}
                className="px-4 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" /> Stop Announcing
              </button>
            </div>

            {/* CONTROLLER STEPS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Current Reveal Step: {broadcastState.revealStep} / 4
                </span>

                {broadcastState.revealStep < 4 && (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2 text-sm"
                  >
                    <span>Next Reveal Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Step Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <StepButton
                  stepNum={0}
                  label="1. Program Name"
                  currentStep={broadcastState.revealStep}
                  onClick={() => setStep(0)}
                  icon={Tv}
                />
                <StepButton
                  stepNum={1}
                  label="2. Grades"
                  currentStep={broadcastState.revealStep}
                  onClick={() => setStep(1)}
                  icon={Award}
                />
                <StepButton
                  stepNum={2}
                  label="3. 3rd Place 🥉"
                  currentStep={broadcastState.revealStep}
                  onClick={() => setStep(2)}
                  icon={Trophy}
                />
                <StepButton
                  stepNum={3}
                  label="4. 2nd Place 🥈"
                  currentStep={broadcastState.revealStep}
                  onClick={() => setStep(3)}
                  icon={Trophy}
                />
                <StepButton
                  stepNum={4}
                  label="5. 1st Place 🥇"
                  currentStep={broadcastState.revealStep}
                  onClick={() => setStep(4)}
                  icon={Crown}
                  isGold
                />
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>
                  Current Display: <b>{stepLabels[broadcastState.revealStep]}</b>
                </span>
                <button
                  onClick={() => setStep(0)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to Title
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center mb-8">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Ready for Award Ceremony
            </h2>
            <p className="text-gray-500 text-sm">
              Select a published result below to begin dramatic stage announcement.
            </p>
          </div>
        )}

        {/* PUBLISHED RESULTS LIST */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Published Results ({publishedResults.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click &quot;Announce on Stage&quot; to load result onto the Stage TV
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search result..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredResults.map((r) => {
              const isCurrent = broadcastState?.resultId === r.id && broadcastState?.isActive;

              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {r.programCode && (
                        <span className="text-xs font-mono font-bold text-gray-500">
                          #{r.programCode}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                        {r.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-100 text-gray-700">
                        {r.type}
                      </span>
                      <span
                        className={
                          r.moduleType === "sports"
                            ? "text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800"
                            : "text-[10px] px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800"
                        }
                      >
                        {r.moduleType === "sports" ? "Riyadha" : "Arts"}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-gray-900 truncate">
                      {r.programName}
                    </h4>
                  </div>

                  <button
                    onClick={() => startAnnounce(r.id)}
                    className={
                      isCurrent
                        ? "px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow flex items-center gap-2"
                        : "px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"
                    }
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Announcing
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Announce on Stage
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {filteredResults.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No published results match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepButton({ stepNum, label, currentStep, onClick, icon: Icon, isGold }) {
  const isPassed = currentStep >= stepNum;
  const isCurrent = currentStep === stepNum;

  let btnClass = "p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-24 ";

  if (isCurrent) {
    btnClass += isGold
      ? "bg-amber-500 border-amber-400 text-white shadow-lg ring-2 ring-amber-400 scale-105"
      : "bg-emerald-500 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400 scale-105";
  } else if (isPassed) {
    btnClass += "bg-slate-800 border-emerald-500/50 text-emerald-400";
  } else {
    btnClass += "bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-500";
  }

  return (
    <button onClick={onClick} className={btnClass}>
      <div className="flex items-center justify-between w-full">
        <Icon className="w-5 h-5" />
        {isCurrent && <Eye className="w-4 h-4" />}
      </div>
      <span className="font-bold text-xs leading-tight">{label}</span>
    </button>
  );
}