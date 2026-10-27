
import React from 'react';
// ... existing imports

export default function HomeRiyadha() {
  // ... existing logic
  return (
    <div className="riyadha-home">
      {/* ... existing sections */}
      <section className="toppers-section">
        <h2 className="text-3xl font-black mb-8">Featured Toppers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toppers.map((topper, index) => (
            <div key={topper.id} className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-emerald-500">
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl font-black text-emerald-600">#{index + 1}</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{topper.totalPoints} pts</p>
                  <p className="text-xs text-gray-400 font-medium">Personal: {topper.personalPoints || 0} pts</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <img src={topper.pic} className="w-16 h-16 rounded-full border-2 border-emerald-100" />
                <div>
                  <p className="font-bold text-lg">{topper.name}</p>
                  <p className="text-sm text-gray-500">{topper.teamName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}