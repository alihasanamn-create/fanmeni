// ============================================
// FILE: src/pages/BroadcastQueue.jsx
// PURPOSE: Admin controller for dramatic result reveals
// ============================================

import { useState } from "react";
import { Tv, Play, Eye, X, Trophy, Award, Crown, ExternalLink, Sparkles } from "lucide-react";
import { useResults } from "../hooks/useResults";
import { useBroadcast } from "../hooks/useBroadcast";
import { setDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export default function BroadcastQueue() {
  const { results } = useResults();
  const { broadcastData } = useBroadcast();
  const [search, setSearch] = useState("");

  const publishedResults = results.filter((r) => r.status === "published");

  const filteredResults = publishedResults.filter(
    (r) =>
      r.programName?.toLowerCase().includes(search.toLowerCase()) ||
      r.programCode?.toLowerCase().includes(search.toLowerCase())
  );

  const updateBroadcast = async (data) => {
    await setDocument(COLLECTIONS.SETTINGS, "broadcast", {
      ...broadcastData,
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  const startBroadcast = (resultId) => {
    updateBroadcast({
      isActive: true,
      resultId: resultId,
      revealStep: 0, // Start with just title
    });
  };

  const stopBroadcast = () => {
    updateBroadcast({
      isActive: false,
      resultId: null,
      revealStep: 0,
    });
  };

  const setRevealStep = (step) => {
    updateBroadcast({ revealStep: step });
  };

  // Get active result details
  const activeResult = publishedResults.find(
    (r) => r.id === broadcastData?.resultId
  );

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Award Ceremony Controller
              </h1>
              <p className="text-gray-500">Dramatically reveal results on TV</p>
            </div>
          </div>
          <a href="/live" target="_blank" rel="noopener noreferrer" className="...">
  <ExternalLink className="w-4 h-4" />
  Open Live Screen
</a>
        </div>

        {/* ACTIVE BROADCAST CONTROL PANEL */}
        {broadcastData?.isActive && activeResult ? (
          <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border-4 border-indigo-500 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-bold tracking-widest text-sm uppercase">
                    Live on Screen
                  </span>
                </div>
                <h2 className="text-4xl font-black text-white">
                  {activeResult.programName}
                </h2>
                <p className="text-gray-400 mt-1">
                  {activeResult.category} • {activeResult.type}
                </p>
              </div>
              <button
                onClick={stopBroadcast}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition flex items-center gap-2"
              >
                <X className="w-5 h-5" /> Stop Reveal
              </button>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-gray-400 font-bold mb-4 uppercase tracking-widest text-sm">
                Click to Reveal on TV:
              </h3>
              
              <div className="flex flex-col gap-3">
                <RevealButton
                  label="1. Show Program Title Only"
                  isActive={broadcastData.revealStep >= 0}
                  onClick={() => setRevealStep(0)}
                  icon={Tv}
                />
                
                {activeResult.additionalGrades?.length > 0 && (
                  <RevealButton
                    label={`2. Reveal Grades (${activeResult.additionalGrades.length})`}
                    isActive={broadcastData.revealStep >= 1}
                    onClick={() => setRevealStep(1)}
                    icon={Award}
                  />
                )}
                
                {activeResult.positions?.third?.length > 0 && (
                  <RevealButton
                    label="3. Reveal 3rd Place 🥉"
                    isActive={broadcastData.revealStep >= 2}
                    onClick={() => setRevealStep(2)}
                    icon={Trophy}
                    color="hover:border-orange-500 hover:text-orange-400"
                    activeColor="bg-orange-500/20 border-orange-500 text-orange-400"
                  />
                )}

                {activeResult.positions?.second?.length > 0 && (
                  <RevealButton
                    label="4. Reveal 2nd Place 🥈"
                    isActive={broadcastData.revealStep >= 3}
                    onClick={() => setRevealStep(3)}
                    icon={Trophy}
                    color="hover:border-gray-300 hover:text-gray-300"
                    activeColor="bg-gray-500/20 border-gray-400 text-gray-300"
                  />
                )}

                {activeResult.positions?.first?.length > 0 && (
                  <RevealButton
                    label="5. Reveal 1st Place 🥇 (CHAMPION!)"
                    isActive={broadcastData.revealStep >= 4}
                    onClick={() => setRevealStep(4)}
                    icon={Crown}
                    color="hover:border-yellow-400 hover:text-yellow-400"
                    activeColor="bg-yellow-500/20 border-yellow-400 text-yellow-400"
                    isGold
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center mb-8">
            <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900">No Active Broadcast</h2>
            <p className="text-gray-500">Select a result below to start the ceremony.</p>
          </div>
        )}

        {/* LIST OF PUBLISHED RESULTS TO BROADCAST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Ready to Broadcast</h3>
            <input
              type="text"
              placeholder="Search results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-3">
            {filteredResults.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition ${
                  broadcastData?.resultId === r.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      r.moduleType === 'sports' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {r.moduleType === 'sports' ? 'Riyadha' : 'Arts'}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{r.category}</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">{r.programName}</h4>
                </div>
                
                <button
                  onClick={() => startBroadcast(r.id)}
                  disabled={broadcastData?.isActive && broadcastData?.resultId === r.id}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {broadcastData?.resultId === r.id ? "Broadcasting" : "Start Reveal"}
                </button>
              </div>
            ))}
            
            {filteredResults.length === 0 && (
              <p className="text-center text-gray-500 py-6">No published results found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RevealButton({ label, isActive, onClick, icon: Icon, color = "hover:border-indigo-500 hover:text-indigo-400", activeColor = "bg-indigo-500/20 border-indigo-500 text-indigo-400", isGold }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
        isActive
          ? activeColor
          : `border-gray-700 text-gray-400 bg-gray-800/50 ${color}`
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={isActive && isGold ? "animate-bounce" : ""} />
        <span className="font-bold text-lg">{label}</span>
      </div>
      {isActive && <Eye className="w-5 h-5" />}
    </button>
  );
}