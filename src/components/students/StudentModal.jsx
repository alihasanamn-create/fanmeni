// ============================================
// FILE: src/components/students/StudentModal.jsx
// PURPOSE: Simplified student modal (no gender/dob/division)
// ============================================

import { useState, useEffect } from "react";
import { X, Upload, User, Hash, Shield, GraduationCap } from "lucide-react";
import { addDocument, updateDocument } from "../../firebase/firestore";
import { COLLECTIONS, STUDENT_CATEGORIES } from "../../firebase/collections";
import {
  compressAndConvertImage,
  validateImage,
} from "../../utils/imageUtils";
import { useTeams } from "../../hooks/useTeams";

export default function StudentModal({
  isOpen,
  onClose,
  editStudent = null,
  nextChestNumber,
}) {
  const { teams } = useTeams();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [student, setStudent] = useState({
    name: "",
    chestNumber: "",
    class: "",
    teamId: "",
    teamName: "",
    category: "Bidaya",
    admissionNumber: "",
    photoUrl: "",
    totalPoints: 0,
  });

  useEffect(() => {
    if (editStudent) {
      setStudent({
        name: editStudent.name || "",
        chestNumber: editStudent.chestNumber || "",
        class: editStudent.class || "",
        teamId: editStudent.teamId || "",
        teamName: editStudent.teamName || "",
        category: editStudent.category || "Bidaya",
        admissionNumber: editStudent.admissionNumber || "",
        photoUrl: editStudent.photoUrl || "",
        totalPoints: editStudent.totalPoints || 0,
      });
    } else {
      setStudent({
        name: "",
        chestNumber: nextChestNumber || "",
        class: "",
        teamId: "",
        teamName: "",
        category: "Bidaya",
        admissionNumber: "",
        photoUrl: "",
        totalPoints: 0,
      });
    }
    setError("");
  }, [editStudent, isOpen, nextChestNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "teamId") {
      const team = teams.find((t) => t.id === value);
      setStudent((prev) => ({
        ...prev,
        teamId: value,
        teamName: team?.name || "",
      }));
    } else {
      setStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file, 3);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await compressAndConvertImage(file, 300, 0.8);
      setStudent((prev) => ({ ...prev, photoUrl: result.base64 }));
    } catch {
      setError("Failed to process image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!student.name.trim()) {
      setError("Student name is required");
      return;
    }
    if (!student.teamId) {
      setError("Please select a team");
      return;
    }

    setSaving(true);

    try {
      let result;
      if (editStudent) {
        result = await updateDocument(
          COLLECTIONS.STUDENTS,
          editStudent.id,
          student
        );
      } else {
        result = await addDocument(COLLECTIONS.STUDENTS, student);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedTeam = teams.find((t) => t.id === student.teamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editStudent ? "Edit Student" : "Add New Student"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Photo + Chest Number */}
          <div className="flex gap-4 items-start">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                ) : student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="w-3.5 h-3.5 inline mr-1" />
                  Chest Number *
                </label>
                <input
                  type="text"
                  name="chestNumber"
                  value={student.chestNumber}
                  onChange={handleChange}
                  placeholder="Auto-generated"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-semibold"
                  required
                />
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-100 transition text-sm font-medium">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={student.name}
              onChange={handleChange}
              placeholder="Enter student's full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          {/* Class + Admission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
                Class
              </label>
              <input
                type="text"
                name="class"
                value={student.class}
                onChange={handleChange}
                placeholder="e.g., 10, +2, Degree"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
              </label>
              <input
                type="text"
                name="admissionNumber"
                value={student.admissionNumber}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-3.5 h-3.5 inline mr-1" />
              Team *
            </label>
            <select
              name="teamId"
              value={student.teamId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              required
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {selectedTeam && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedTeam.color }}
                ></div>
                <span className="text-xs text-gray-600">
                  {selectedTeam.name}
                </span>
              </div>
            )}
          </div>

          {/* Category (Only Bidaya / Thaniya) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STUDENT_CATEGORIES.map((cat) => {
                const isSelected = student.category === cat;
                return (
                  <label
                    key={cat}
                    className={
                      isSelected
                        ? "flex items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer transition font-medium bg-emerald-500 text-white border-emerald-500 shadow-md"
                        : "flex items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer transition font-medium bg-white border-gray-200 hover:bg-gray-50"
                    }
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={isSelected}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {cat}
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : editStudent ? "Update" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}