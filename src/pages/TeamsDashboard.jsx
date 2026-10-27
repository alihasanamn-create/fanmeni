// ============================================
// FILE: src/pages/TeamsDashboard.jsx
// PURPOSE: Teams with real-time member count + multi-delete
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Search, Trophy, Users, Trash2, X, CheckSquare, Square } from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { deleteDocument, batchWrite } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import TeamCard from "../components/teams/TeamCard";
import TeamModal from "../components/teams/TeamModal";

export default function TeamsDashboard() {
  const { teams, loading } = useTeams();
  const { students } = useStudents();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ⚡ Enhance teams with real-time member count
  const enhancedTeams = teams.map((team) => ({
    ...team,
    membersCount: students.filter((s) => s.teamId === team.id).length,
  }));

  const filteredTeams = enhancedTeams.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPoints = enhancedTeams.reduce(
    (sum, t) => sum + (t.totalPoints || 0),
    0
  );
  const totalMembers = students.length;

  const handleAddNew = () => {
    setEditTeam(null);
    setModalOpen(true);
  };

  const handleEdit = (team) => {
    setEditTeam(team);
    setModalOpen(true);
  };

  const handleDelete = (team) => {
    setDeleteConfirm(team);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || deleting) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.TEAMS, deleteConfirm.id);
      setDeleteConfirm(null); // ← Auto-close on success
    } catch (err) {
      alert("Error deleting: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // MULTI-SELECT LOGIC
  // ============================================
  const toggleSelect = (teamId) => {
    setSelectedIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredTeams.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeams.map((t) => t.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || deleting) return;
    setDeleting(true);
    try {
      const operations = selectedIds.map((id) => ({
        type: "delete",
        collectionName: COLLECTIONS.TEAMS,
        docId: id,
      }));
      await batchWrite(operations);
      setSelectedIds([]);
      setBulkDeleteConfirm(false); // ← Auto-close on success
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isAllSelected =
    selectedIds.length === filteredTeams.length && filteredTeams.length > 0;
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Teams
              </h1>
              <p className="text-sm text-gray-500">
                Manage festival teams and houses
              </p>
            </div>
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Teams" value={teams.length} icon={Shield} color="emerald" />
          <StatCard label="Total Members" value={totalMembers} icon={Users} color="blue" />
          <StatCard label="Total Points" value={totalPoints} icon={Trophy} color="amber" />
        </div>

        {/* MULTI-SELECT ACTION BAR */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-900">
                  {selectedIds.length} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedIds.length}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Select All */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          {filteredTeams.length > 0 && (
            <button
              onClick={selectAll}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 flex-shrink-0"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span className="hidden md:inline">Select All</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? "No teams found" : "No teams yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? "Try searching with a different keyword"
                : "Create your first team to get started"}
            </p>
            {!search && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition"
              >
                <Plus className="w-4 h-4" />
                Create First Team
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredTeams.map((team, index) => (
                <div key={team.id} className="relative">
                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(team.id);
                    }}
                    className={
                      selectedIds.includes(team.id)
                        ? "absolute top-3 left-3 z-20 w-7 h-7 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center shadow-lg"
                        : "absolute top-3 left-3 z-20 w-7 h-7 bg-white/90 border-2 border-white rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-50 opacity-0 hover:opacity-100 group-hover:opacity-100 transition"
                    }
                    style={selectedIds.includes(team.id) ? { opacity: 1 } : {}}
                  >
                    {selectedIds.includes(team.id) && (
                      <CheckSquare className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Selection overlay */}
                  {selectedIds.includes(team.id) && (
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500 pointer-events-none z-10" />
                  )}

                  <TeamCard
                    team={team}
                    rank={index + 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Team Modal */}
      <TeamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editTeam={editTeam}
      />

      {/* SINGLE Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Team?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Team"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BULK Delete Confirmation */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !deleting && setBulkDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {selectedIds.length} Team{selectedIds.length > 1 ? "s" : ""}?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedIds.length} team{selectedIds.length > 1 ? "s" : ""}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedIds.length}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}