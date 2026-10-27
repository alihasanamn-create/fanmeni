// ============================================
// FILE: src/components/results/ResultCard.jsx
// PURPOSE: Display published/draft result card
// ============================================

import { motion } from "framer-motion";
import { Edit2, Trash2, Award, Palette, Trophy, FileText } from "lucide-react";

const CATEGORY_STYLES = {
  Bidaya: "bg-blue-50 text-blue-700",
  Thaniya: "bg-purple-50 text-purple-700",
  General: "bg-amber-50 text-amber-700",
};

export default function ResultCard({ result, onEdit, onDelete }) {
  const isSports = result.moduleType === "sports";
  const Icon = isSports ? Trophy : Palette;
  const isDraft = result.status === "draft";

  const totalWinners =
    (result.positions?.first?.length || 0) +
    (result.positions?.second?.length || 0) +
    (result.positions?.third?.length || 0);

  const showPositions = result.resultType !== "grades_only";

  const cardBorder = isDraft ? "border-amber-300" : "border-gray-100";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${cardBorder}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {result.programCode && (
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-700">
                  {result.programCode}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 leading-tight truncate">
                {result.programName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{result.type}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(result)}
              className="w-8 h-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition text-gray-500"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(result)}
              className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition text-gray-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${
              CATEGORY_STYLES[result.category] || CATEGORY_STYLES.Bidaya
            }`}
          >
            {result.category}
          </span>

          {isDraft ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700">
              <FileText className="w-3 h-3" />
              Draft
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700">
              ✓ Published
            </span>
          )}

          {result.resultType && (
            <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
              {result.resultType === "position_grade" && "Position + Grade"}
              {result.resultType === "positions_only" && "Positions Only"}
              {result.resultType === "grades_only" && "Grades Only"}
            </span>
          )}
        </div>

        {showPositions && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            {["first", "second", "third"].map((pos) => {
              const winners = result.positions?.[pos] || [];
              if (winners.length === 0) return null;

              const emoji = pos === "first" ? "🥇" : pos === "second" ? "🥈" : "🥉";

              return (
                <div key={pos} className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{emoji}</span>
                  <div className="flex-1 text-sm">
                    {winners.map((w, i) => (
                      <div key={i} className="text-gray-700">
                        {w.chestNumber && (
                          <span className="text-xs font-mono text-gray-500 mr-1">
                            [{w.chestNumber}]
                          </span>
                        )}
                        <span className="font-medium">
                          {w.studentName || w.teamName || "—"}
                        </span>
                        {w.grade && (
                          <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded font-semibold">
                            {w.grade}
                          </span>
                        )}
                        {w.teamName && w.studentName !== w.teamName && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({w.teamName})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {totalWinners === 0 && (
              <p className="text-sm text-gray-400 italic">No winners set</p>
            )}
          </div>
        )}

        {result.additionalGrades?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
            <Award className="w-3 h-3" />
            <span>
              {result.additionalGrades.length}{" "}
              {result.resultType === "grades_only" ? "grade(s)" : "additional grade(s)"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}