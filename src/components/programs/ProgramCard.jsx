// ============================================
// FILE: src/components/programs/ProgramCard.jsx
// PURPOSE: Clean program card (simple info only)
// ============================================

import { motion } from "framer-motion";
import { Users, Edit2, Trash2, Palette, Trophy, Award } from "lucide-react";

const CATEGORY_STYLES = {
  Bidaya: "bg-blue-50 text-blue-700 border-blue-200",
  Thaniya: "bg-purple-50 text-purple-700 border-purple-200",
  General: "bg-amber-50 text-amber-700 border-amber-200",
};

const TYPE_STYLES = {
  Individual: "bg-emerald-50 text-emerald-700",
  "Personal Group": "bg-cyan-50 text-cyan-700",
  Group: "bg-indigo-50 text-indigo-700",
  General: "bg-rose-50 text-rose-700",
};

export default function ProgramCard({
  program,
  moduleType,
  onEdit,
  onDelete,
}) {
  const isSports = moduleType === "sports";
  const Icon = isSports ? Trophy : Palette;

  const points = program.points || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {program.code && (
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-emerald-700">
                  {program.code}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                {program.name || program.program}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {isSports ? "Sports" : "Arts"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(program)}
              className="w-8 h-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition text-gray-500"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(program)}
              className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition text-gray-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg border ${
              CATEGORY_STYLES[program.category] || CATEGORY_STYLES.Bidaya
            }`}
          >
            {program.category}
          </span>
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${
              TYPE_STYLES[program.type] || TYPE_STYLES.Individual
            }`}
          >
            {program.type}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
            <Users className="w-3 h-3" />
            {program.participantsPerTeam || program.count || 1} per team
          </span>
        </div>

        {/* Points Row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">🥇 1st</div>
            <div className="text-lg font-bold text-amber-600">
              {points.first || 0}
            </div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-xs text-gray-500 mb-1">🥈 2nd</div>
            <div className="text-lg font-bold text-gray-600">
              {points.second || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">🥉 3rd</div>
            <div className="text-lg font-bold text-orange-600">
              {points.third || 0}
            </div>
          </div>
        </div>

        {points.shared && (
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-cyan-600">
            <Award className="w-3 h-3" />
            <span className="font-medium">Points shared among team</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}