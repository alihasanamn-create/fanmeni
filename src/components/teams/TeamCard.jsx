// ============================================
// FILE: src/components/teams/TeamCard.jsx
// PURPOSE: Individual team card display
// ============================================

import { motion } from "framer-motion";
import { Shield, Users, Trophy, Edit2, Trash2, Crown } from "lucide-react";

export default function TeamCard({ team, rank, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Header with team color */}
      <div
        className="relative h-24 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${team.color}, ${team.color}dd)`,
        }}
      >
        {/* Rank Badge */}
        {rank <= 3 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-gray-900">
              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={() => onEdit(team)}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white transition shadow-sm"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => onDelete(team)}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-8 w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: team.color }}
            >
              <Shield className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-12 pb-5 px-5 text-center">
        <h3 className="text-lg font-bold text-gray-900 truncate">
          {team.name}
        </h3>
        {team.shortName && (
          <span
            className="inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-md text-white"
            style={{ backgroundColor: team.color }}
          >
            {team.shortName}
          </span>
        )}

        {/* Captain */}
        {team.captain && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-gray-600">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{team.captain}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Members</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {team.membersCount || 0}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Points</span>
            </div>
            <p className="text-lg font-bold" style={{ color: team.color }}>
              {team.totalPoints || 0}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}