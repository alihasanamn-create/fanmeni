// ============================================
// FILE: src/pages/ResultsDashboard.jsx
// PURPOSE: NEW Results dashboard with module switcher
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Trophy,
  Palette,
  Search,
  CheckCircle,
  Circle,
  FileText,
} from "lucide-react";
import { usePrograms } from "../hooks/usePrograms";
import { useResults } from "../hooks/useResults";
import { deleteDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { recalculateAll } from "../utils/pointsCalculator";
import ResultModal from "../components/results/ResultModal";
import ResultCard from "../components/results/ResultCard";

export default function ResultsDashboard() {
  const [moduleType, setModuleType] = useState("arts");
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { results, loading } = useResults();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editResult, setEditResult] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const currentPrograms = moduleType === "arts" ? artsPrograms : sportsPrograms;
  const moduleResults = results.filter((r) => r.moduleType === moduleType);

  const publishedProgramIds = new Set(
    moduleResults.filter((r) => r.status !== "draft").map((r) => r.programId)
  );
  const draftProgramIds = new Set(
    moduleResults.filter((r) => r.status === "draft").map((r) => r.programId)
  );

  const filteredPrograms = currentPrograms.filter((p) => {
    const name = p.name || p.program || "";
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toString().includes(search);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: currentPrograms.length,
    published: publishedProgramIds.size,
    draft: draftProgramIds.size,
    pending: currentPrograms.length - publishedProgramIds.size - draftProgramIds.size,
  };

  const handleOpenModal = (program, existingResult = null) => {
    setSelectedProgram(program);
    setEditResult(existingResult);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProgram(null);
    setEditResult(null);
  };

  const handleEditResult = (result) => {
    const program = currentPrograms.find((p) => p.id === result.programId);
    if (program) {
      handleOpenModal(program, result);
    } else {
      alert("Program not found — it may have been deleted");
    }
  };

  const handleDeleteResult = (result) => setDeleteConfirm(result);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteDocument(COLLECTIONS.RESULTS, deleteConfirm.id);
    await recalculateAll();
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
            <p className="text-gray-500">Publish and manage program results</p>
          </div>
        </div>

        {/* Module Switcher */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setModuleType("arts")}
            className={
              moduleType === "arts"
                ? "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                : "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }
          >
            <Palette className="w-5 h-5" />
            Arts
          </button>
          <button
            onClick={() => setModuleType("sports")}
            className={
              moduleType === "sports"
                ? "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }
          >
            <Trophy className="w-5 h-5" />
            Sports
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Programs" value={stats.total} color="gray" />
          <StatCard label="Published" value={stats.published} color="emerald" />
          <StatCard label="Draft" value={stats.draft} color="amber" />
          <StatCard label="Pending" value={stats.pending} color="red" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="Bidaya">Bidaya</option>
              <option value="Thaniya">Thaniya</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Programs List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Programs — Click to Enter Result
          </h2>

          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500">
                No programs found. Create programs first in Arts or Sports.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPrograms.map((p) => {
                const isPublished = publishedProgramIds.has(p.id);
                const isDraft = draftProgramIds.has(p.id);
                const existing = moduleResults.find((r) => r.programId === p.id);

                let btnClass =
                  "text-left p-4 rounded-xl border transition-all hover:shadow-md ";
                if (isPublished) {
                  btnClass += "bg-emerald-50 border-emerald-200 hover:border-emerald-400";
                } else if (isDraft) {
                  btnClass += "bg-amber-50 border-amber-200 hover:border-amber-400";
                } else {
                  btnClass += "bg-white border-gray-200 hover:border-emerald-500";
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => handleOpenModal(p, existing)}
                    className={btnClass}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {p.code && (
                            <span className="text-xs font-mono font-bold text-gray-500">
                              {p.code}
                            </span>
                          )}
                          <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {p.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {p.name || p.program}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{p.type}</p>
                      </div>
                      {isPublished ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : isDraft ? (
                        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Published Results */}
        {moduleResults.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              All Results ({moduleResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {moduleResults.map((r) => (
                  <ResultCard
                    key={r.id}
                    result={r}
                    onEdit={handleEditResult}
                    onDelete={handleDeleteResult}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {selectedProgram && (
        <ResultModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          program={selectedProgram}
          moduleType={moduleType}
          editResult={editResult}
        />
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Result?
              </h3>
              <p className="text-gray-600 mb-6">
                Delete result for{" "}
                <span className="font-semibold">{deleteConfirm.programName}</span>?
                Team points will be recalculated.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    gray: "text-gray-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-500",
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}