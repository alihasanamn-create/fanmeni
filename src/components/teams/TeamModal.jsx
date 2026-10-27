// ============================================
// FILE: src/components/teams/TeamModal.jsx
// PURPOSE: Modal for adding/editing teams
// ============================================

import { useState, useEffect } from "react";
import { X, Upload, Shield, Image as ImageIcon } from "lucide-react";
import {
  addDocument,
  updateDocument,
} from "../../firebase/firestore";
import { COLLECTIONS } from "../../firebase/collections";
import {
  compressAndConvertImage,
  validateImage,
} from "../../utils/imageUtils";

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
];

export default function TeamModal({ isOpen, onClose, editTeam = null }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [team, setTeam] = useState({
    name: "",
    shortName: "",
    color: "#3b82f6",
    captain: "",
    viceCaptain: "",
    logoUrl: "",
    totalPoints: 0,
    membersCount: 0,
  });

  useEffect(() => {
    if (editTeam) {
      setTeam({
        name: editTeam.name || "",
        shortName: editTeam.shortName || "",
        color: editTeam.color || "#3b82f6",
        captain: editTeam.captain || "",
        viceCaptain: editTeam.viceCaptain || "",
        logoUrl: editTeam.logoUrl || "",
        totalPoints: editTeam.totalPoints || 0,
        membersCount: editTeam.membersCount || 0,
      });
    } else {
      setTeam({
        name: "",
        shortName: "",
        color: "#3b82f6",
        captain: "",
        viceCaptain: "",
        logoUrl: "",
        totalPoints: 0,
        membersCount: 0,
      });
    }
    setError("");
  }, [editTeam, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
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
      const result = await compressAndConvertImage(file, 300, 0.85);
      setTeam((prev) => ({ ...prev, logoUrl: result.base64 }));
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

    if (!team.name.trim()) {
      setError("Team name is required");
      return;
    }

    setSaving(true);

    try {
      let result;
      if (editTeam) {
        result = await updateDocument(
          COLLECTIONS.TEAMS,
          editTeam.id,
          team
        );
      } else {
        result = await addDocument(COLLECTIONS.TEAMS, team);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: team.color }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editTeam ? "Edit Team" : "Create New Team"}
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

          {/* Logo Upload */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div
                className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white"
                style={{ backgroundColor: team.color }}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt="Team Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Shield className="w-10 h-10 text-white" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Logo (Optional)
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl cursor-pointer hover:bg-emerald-100 transition font-medium text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Choose Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {team.logoUrl && (
                <button
                  type="button"
                  onClick={() => setTeam((prev) => ({ ...prev, logoUrl: "" }))}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-gray-500 mt-2">Max 3MB</p>
            </div>
          </div>

          {/* Team Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={team.name}
                onChange={handleChange}
                placeholder="e.g., Blue House"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Name
              </label>
              <input
                type="text"
                name="shortName"
                value={team.shortName}
                onChange={handleChange}
                placeholder="e.g., BLU"
                maxLength="5"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none uppercase"
              />
            </div>
          </div>

          {/* Captain & Vice Captain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captain
              </label>
              <input
                type="text"
                name="captain"
                value={team.captain}
                onChange={handleChange}
                placeholder="Captain name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vice Captain
              </label>
              <input
                type="text"
                name="viceCaptain"
                value={team.viceCaptain}
                onChange={handleChange}
                placeholder="Vice captain name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Team Color
            </label>

            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setTeam((prev) => ({ ...prev, color: c.value }))}
                  className={`w-10 h-10 rounded-xl shadow-sm hover:scale-110 transition-transform ${
                    team.color === c.value
                      ? "ring-2 ring-offset-2 ring-gray-900"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Custom Color */}
            <div className="flex gap-3 items-center">
              <input
                type="color"
                name="color"
                value={team.color}
                onChange={handleChange}
                className="w-16 h-11 rounded-xl cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                name="color"
                value={team.color}
                onChange={handleChange}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-sm"
              />
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
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
          >
            {saving ? "Saving..." : editTeam ? "Update Team" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
}