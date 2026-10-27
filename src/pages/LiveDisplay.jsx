import React, { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';

export default function LiveDisplay() {
  const [currentRankings, setCurrentRankings] = useState([]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 overflow-hidden relative">
      <audio id="celebration-music" src="/assets/audio/win.mp3" preload="auto" />
      
      <header className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          LIVE RANKINGS
        </h1>
        <p className="text-slate-400 mt-2">Real-time updated champion leaderboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {currentRankings.map((item, index) => {
          const rank = index + 1;
          const isFirst = rank === 1;
          return (
            <div 
              key={item.id} 
              className={`p-8 rounded-3xl transition-all duration-700 transform ${
                isFirst 
                ? "bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-500 border-4 border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.6)] scale-110 z-10 text-slate-900" 
                : "bg-slate-800 border border-slate-700 text-white"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={item.pic} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                  <div className="absolute -top-2 -right-2 bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-black shadow-md">
                    {rank}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black truncate">{item.name}</h3>
                  <p className="text-lg opacity-80 truncate">{item.teamName}</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm uppercase font-bold opacity-60">Total Points</p>
                <p className="text-6xl font-black">{item.points}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}