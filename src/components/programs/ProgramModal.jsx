// ============================================
// FILE: src/components/programs/ProgramModal.jsx
// PURPOSE: Create/Edit Programs (Supports Individual, Personal Group, Group, & General for ALL Categories)
// ============================================

import { useState, useEffect } from "react";
import { X, Palette, Trophy, Award, Users, Info } from "lucide-react";
import { addDocument, updateDocument } from "../../firebase/firestore";
import { COLLECTIONS, POINTS } from "../../firebase/collections";

const PROGRAM_TYPES = ["Individual", "Personal Group", "Group", "General"];
const CATEGORIES = ["Bidaya", "Thaniya", "General"];

export default function ProgramModal({
  isOpen,
  onClose,
  editProgram = null,
  moduleType = "arts",
  nextCode,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [program, setProgram] = useState({
    code: "",
    name: "",
    category: "Bidaya",
    type: "Individual",
    participantsPerTeam: 1,
    groupsPerTeam: 1,
    candidatesPerGroup: 2,
  });

  const collectionName =
    moduleType === "sports" ? COLLECTIONS.SPORTS : COLLECTIONS.ARTS;
  const moduleLabel = moduleType === "sports" ? "Riyadha" : "Arts";

  useEffect(() => {
    if (editProgram) {
      setProgram({
        code: editProgram.code || "",
        name: editProgram.name || editProgram.program || "",
        category: editProgram.category || "Bidaya",
        type: editProgram.type || "Individual",
        participantsPerTeam:
          editProgram.participantsPerTeam ||
          editProgram.count ||
          1,
        groupsPerTeam: editProgram.groupsPerTeam || 1,
        candidatesPerGroup: editProgram.candidatesPerGroup || 2,
      });
    } else {
      setProgram({
        code: nextCode || "",
        name: "",
        category: "Bidaya",
        type: "Individual",
        participantsPerTeam: 1,
        groupsPerTeam: 1,
        candidatesPerGroup: 2,
      });
    }
    setError("");
  }, [editProgram, isOpen, nextCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgram((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!program.name.trim()) {
      setError("Program name is required");
      return;
    }

    // Validation for Group & Personal Group types
    if (
      (program.type === "Personal Group" || program.type === "Group") &&
      Number(program.candidatesPerGroup) < 2
    ) {
      setError("Groups must have a minimum of 2 candidates");
      return;
    }

    setSaving(true);

    try {
      const typePoints = POINTS[program.type] || { first: 0, second: 0, third: 0, shared: false };

      let participantsPerTeam = 1;
      const groupsPerTeam = Math.max(1, Number(program.groupsPerTeam) || 1);
      const candidatesPerGroup = Math.max(1, Number(program.candidatesPerGroup) || 1);

      if (program.type === "Individual") {
        participantsPerTeam = Math.max(1, Number(program.participantsPerTeam) || 1);
      } else if (program.type === "Personal Group" || program.type === "Group") {
        participantsPerTeam = groupsPerTeam * Math.max(2, candidatesPerGroup);
      } else if (program.type === "General") {
        participantsPerTeam = groupsPerTeam;
      }

      const dataToSave = {
        code: (program.code || "").trim(),
        name: program.name.trim(),
        program: program.name.trim(),
        category: program.category,
        type: program.type,
        participantsPerTeam: Number(participantsPerTeam),
        count: Number(participantsPerTeam),
        groupsPerTeam: Number(groupsPerTeam),
        candidatesPerGroup: program.type === "Individual" ? 1 : Number(candidatesPerGroup),
        moduleType: moduleType,
        points: {
          first: typePoints.first || 0,
          second: typePoints.second || 0,
          third: typePoints.third || 0,
          shared: typePoints.shared || false,
        },
      };

      let result;
      if (editProgram) {
        result = await updateDocument(
          collectionName,
          editProgram.id,
          dataToSave
        );
      } else {
        result = await addDocument(collectionName, dataToSave);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to save program");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isSports = moduleType === "sports";
  const Icon = isSports ? Trophy : Palette;
  const colorClass = isSports
    ? "from-blue-500 to-indigo-600"
    : "from-purple-500 to-pink-600";

  const currentPoints = POINTS[program.type] || {};
  const isIndividual = program.type === "Individual";
  const isPersonalGroup = program.type === "Personal Group";
  const isGroup = program.type === "Group";
  const isGeneral = program.type === "General";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editProgram ? "Edit Program" : "Add Program"}
              </h2>
              <p className="text-xs text-gray-500">{moduleLabel} Module</p>
            </div>
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

          {/* Code + Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code
              </label>
              <input
                type="text"
                name="code"
                value={program.code}
                onChange={handleChange}
                placeholder="001"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                name="name"
                value={program.name}
                onChange={handleChange}
                placeholder="e.g., Arabic Speech"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition font-medium ${
                    program.category === cat
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={program.category === cat}
                    onChange={handleChange}
                    className="hidden"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROGRAM_TYPES.map((t) => (
                <label
                  key={t}
                  className={`flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition font-medium text-sm ${
                    program.type === t
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={program.type === t}
                    onChange={handleChange}
                    className="hidden"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* DYNAMIC INPUTS ACCORDING TO TYPE */}

          {/* INDIVIDUAL */}
          {isIndividual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants per Team
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Number of candidates each team can send)
                </span>
              </label>
              <input
                type="number"
                name="participantsPerTeam"
                value={program.participantsPerTeam}
                onChange={handleChange}
                min="1"
                max="99"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {/* PERSONAL GROUP or GROUP */}
          {(isPersonalGroup || isGroup) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-4 h-4" />
                <span className="font-bold text-sm">
                  {program.type} Configuration
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groups per Team
                  </label>
                  <input
                    type="number"
                    name="groupsPerTeam"
                    value={program.groupsPerTeam}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Number of groups each team enters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidates per Group *
                  </label>
                  <input
                    type="number"
                    name="candidatesPerGroup"
                    value={program.candidatesPerGroup}
                    onChange={handleChange}
                    min="2"
                    max="99"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Minimum 2 candidates
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Total capacity:{" "}
                    <b>
                      {(Number(program.groupsPerTeam) || 1) *
                        (Number(program.candidatesPerGroup) || 2)}{" "}
                      candidates per team
                    </b>{" "}
                    ({program.groupsPerTeam || 1} group(s) ×{" "}
                    {program.candidatesPerGroup || 2} candidates)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL TYPE */}
          {isGeneral && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Award className="w-4 h-4" />
                <span className="font-bold text-sm">General Setup</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groups per Team
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Optional • Default: 1)
                  </span>
                </label>
                <input
                  type="number"
                  name="groupsPerTeam"
                  value={program.groupsPerTeam}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-800">
                {Number(program.groupsPerTeam) > 1 ? (
                  <>
                    <b>Multiple entries:</b> Will auto-name as &quot;Team 1&quot;, &quot;Team 2&quot;, etc.
                  </>
                ) : (
                  <>
                    <b>Single entry per team:</b> Uses team name directly.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Points Preview */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">
                Points for {program.type}
              </h3>
              {currentPoints.shared && (
                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Shared among candidates
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                <div className="text-2xl mb-1">🥇</div>
                <div className="text-xs text-gray-500 mb-1">1st Place</div>
                <div className="text-2xl font-bold text-amber-600">
                  {currentPoints.first || 0}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                <div className="text-2xl mb-1">🥈</div>
                <div className="text-xs text-gray-500 mb-1">2nd Place</div>
                <div className="text-2xl font-bold text-gray-600">
                  {currentPoints.second || 0}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100">
                <div className="text-2xl mb-1">🥉</div>
                <div className="text-xs text-gray-500 mb-1">3rd Place</div>
                <div className="text-2xl font-bold text-orange-600">
                  {currentPoints.third || 0}
                </div>
              </div>
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
            className={`px-6 py-2.5 bg-gradient-to-r ${colorClass} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition`}
          >
            {saving
              ? "Saving..."
              : editProgram
              ? "Update Program"
              : "Add Program"}
          </button>
        </div>
      </div>
    </div>
  );
}