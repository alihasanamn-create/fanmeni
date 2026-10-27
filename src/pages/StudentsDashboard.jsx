// ============================================
// FILE: src/pages/StudentsDashboard.jsx
// PURPOSE: Students with multi-select delete
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useTeams } from "../hooks/useTeams";
import { deleteDocument, batchWrite } from "../firebase/firestore";
import { COLLECTIONS, STUDENT_CATEGORIES } from "../firebase/collections";
import StudentModal from "../components/students/StudentModal";
import StudentsTable from "../components/students/StudentsTable";
import ImportModal from "../components/students/ImportModal";
import { exportStudentsToExcel } from "../utils/excelUtils";

export default function StudentsDashboard() {
  const { students, loading } = useStudents();
  const { teams } = useTeams();

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nextChestNumber = (() => {
    const numbers = students
      .map((s) => parseInt(s.chestNumber))
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return String(max + 1).padStart(3, "0");
  })();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.chestNumber?.toString().includes(search) ||
      s.admissionNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = !filterTeam || s.teamId === filterTeam;
    const matchesCategory = !filterCategory || s.category === filterCategory;
    return matchesSearch && matchesTeam && matchesCategory;
  });

  const stats = {
    total: students.length,
    bidaya: students.filter((s) => s.category === "Bidaya").length,
    thaniya: students.filter((s) => s.category === "Thaniya").length,
    withPhotos: students.filter((s) => s.photoUrl).length,
  };

  const handleExport = () => {
    if (students.length === 0) {
      alert("No students to export!");
      return;
    }
    exportStudentsToExcel(filteredStudents, teams, "fanmeni_students");
  };

  const handleAddNew = () => {
    setEditStudent(null);
    setModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setModalOpen(true);
  };

  const handleDelete = (student) => setDeleteConfirm(student);

  const confirmDelete = async () => {
    if (!deleteConfirm || deleting) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.STUDENTS, deleteConfirm.id);
      setDeleteConfirm(null); // ← Auto-close
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // MULTI-SELECT LOGIC
  // ============================================
  const toggleSelect = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
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
        collectionName: COLLECTIONS.STUDENTS,
        docId: id,
      }));
      await batchWrite(operations);
      setSelectedIds([]);
      setBulkDeleteConfirm(false); // ← Auto-close
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Students
              </h1>
              <p className="text-sm text-gray-500">Manage all festival participants</p>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard label="Total Students" value={stats.total} color="emerald" />
          <StatCard label="Bidaya" value={stats.bidaya} color="blue" />
          <StatCard label="Thaniya" value={stats.thaniya} color="purple" />
          <StatCard label="With Photos" value={stats.withPhotos} color="amber" />
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
                  {selectedIds.length} student{selectedIds.length > 1 ? "s" : ""} selected
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

        {/* Filters + Select All */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, chest#, admission#..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>

            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
              <option value="">All Categories</option>
              {STUDENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredStudents.length} of {students.length}
              </span>
              {(search || filterTeam || filterCategory) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterTeam("");
                    setFilterCategory("");
                  }}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredStudents.length > 0 && (
              <button
                onClick={selectAll}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                {selectedIds.length === filteredStudents.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Select All
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Warning */}
        {teams.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              ⚠️ Create teams first before adding students.{" "}
              <a href="/teams" className="font-semibold underline">
                Go to Teams
              </a>
            </p>
          </div>
        )}

        {/* Table with selection */}
        <StudentsTable
          students={filteredStudents}
          teams={teams}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editStudent={editStudent}
        nextChestNumber={nextChestNumber}
      />

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        teams={teams}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Student?
              </h3>
              <p className="text-gray-600 mb-6">
                Delete <span className="font-semibold">{deleteConfirm.name}</span>?
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
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BULK Delete */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {selectedIds.length} Student{selectedIds.length > 1 ? "s" : ""}?
              </h3>
              <p className="text-gray-600 mb-6">
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

function StatCard({ label, value, color }) {
  const colors = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}