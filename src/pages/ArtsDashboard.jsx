// ============================================
// FILE: src/pages/ArtsDashboard.jsx
// PURPOSE: Arts programs with Import
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Plus, Search, Filter, Upload, Download } from "lucide-react";
import { usePrograms } from "../hooks/usePrograms";
import { deleteDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import ProgramModal from "../components/programs/ProgramModal";
import ProgramCard from "../components/programs/ProgramCard";
import ProgramImportModal from "../components/programs/ProgramImportModal";
import { exportProgramsToExcel } from "../utils/programExcelUtils";

export default function ArtsDashboard() {
  const { programs, loading } = usePrograms("arts");

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const nextCode = (() => {
    const nums = programs
      .map((p) => parseInt(p.code))
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return String(max + 1).padStart(3, "0");
  })();

  const filteredPrograms = programs.filter((p) => {
    const name = p.name || p.program || "";
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toString().includes(search);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesType = !filterType || p.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const stats = {
    total: programs.length,
    bidaya: programs.filter((p) => p.category === "Bidaya").length,
    thaniya: programs.filter((p) => p.category === "Thaniya").length,
    general: programs.filter((p) => p.category === "General").length,
  };

  const handleAddNew = () => {
    setEditProgram(null);
    setModalOpen(true);
  };
  const handleEdit = (p) => {
    setEditProgram(p);
    setModalOpen(true);
  };
  const handleDelete = (p) => setDeleteConfirm(p);

  const confirmDelete = async () => {
    if (!deleteConfirm || deleting) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.ARTS, deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (programs.length === 0) {
      alert("No programs to export!");
      return;
    }
    exportProgramsToExcel(filteredPrograms, "arts_programs", "arts");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Arts Programs</h1>
              <p className="text-sm text-gray-500">Manage all arts programs</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <Plus className="w-5 h-5" />
              Add Program
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard label="Total Programs" value={stats.total} color="purple" />
          <StatCard label="Bidaya" value={stats.bidaya} color="blue" />
          <StatCard label="Thaniya" value={stats.thaniya} color="purple" />
          <StatCard label="General" value={stats.general} color="amber" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="Bidaya">Bidaya</option>
              <option value="Thaniya">Thaniya</option>
              <option value="General">General</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            >
              <option value="">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Personal Group">Personal Group</option>
              <option value="Group">Group</option>
              <option value="General">General</option>
            </select>
          </div>

          {(search || filterCategory || filterType) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredPrograms.length} of {programs.length}
              </span>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterCategory("");
                  setFilterType("");
                }}
                className="text-purple-600 hover:underline font-medium ml-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search || filterCategory || filterType ? "No programs found" : "No programs yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search || filterCategory || filterType
                ? "Try different filters"
                : "Create your first arts program"}
            </p>
            {!search && !filterCategory && !filterType && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition"
              >
                <Plus className="w-4 h-4" />
                Create First Program
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPrograms.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  moduleType="arts"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ProgramModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editProgram={editProgram}
        moduleType="arts"
        nextCode={nextCode}
      />

      <ProgramImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        moduleType="arts"
      />

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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Program?
              </h3>
              <p className="text-gray-600 mb-6">
                Delete <span className="font-semibold">{deleteConfirm.name || deleteConfirm.program}</span>?
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
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
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
    purple: "text-purple-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}