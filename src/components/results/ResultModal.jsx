// ============================================
// FILE: src/components/results/ResultModal.jsx
// PURPOSE: Result modal with all program type support
// ============================================

import { useState, useEffect } from "react";
import {
  X, Trophy, Plus, Award, ChevronRight, FileText, Send, Users, AlertTriangle,
} from "lucide-react";
import { addDocument, updateDocument } from "../../firebase/firestore";
import { COLLECTIONS, POINTS } from "../../firebase/collections";
import { recalculateAll } from "../../utils/pointsCalculator";
import { useTeams } from "../../hooks/useTeams";
import { useStudents } from "../../hooks/useStudents";
import { useCandidates } from "../../hooks/useCandidates";
import WinnerRow from "./WinnerRow";

const RESULT_TYPES = [
  { value: "position_grade", label: "Position + Grade", desc: "Winners with positions and grades", icon: "🏆" },
  { value: "positions_only", label: "Positions Only", desc: "Only 1st, 2nd, 3rd (no grades)", icon: "🥇" },
  { value: "grades_only", label: "Grades Only", desc: "Only grade list (no positions)", icon: "📝" },
];

const POSITIONS = [
  { key: "first", label: "First Position", emoji: "🥇" },
  { key: "second", label: "Second Position", emoji: "🥈" },
  { key: "third", label: "Third Position", emoji: "🥉" },
];

function emptyWinner(program) {
  const base = {
    chestNumber: "",
    studentId: "",
    studentName: "",
    teamId: "",
    teamName: "",
    grade: "",
  };

  if (program?.type === "Personal Group" || program?.type === "Group") {
    return {
      ...base,
      candidateEntries: Array(program.candidatesPerGroup || 1).fill({ chestNumber: "" }),
      studentIds: [],
      studentNames: [],
      chestNumbers: [],
    };
  }

  if (program?.type === "General") {
    return {
      ...base,
      groupId: "",
      displayName: "",
      groupNumber: 1,
    };
  }

  return base;
}

export default function ResultModal({
  isOpen, onClose, program, moduleType = "arts", editResult = null,
}) {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { candidates } = useCandidates();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  // The confirm-publish flag is written below but not read yet - the confirmation
  // dialog it was meant to gate still renders off `warning`.
  // eslint-disable-next-line no-unused-vars
  const [confirmPublish, setConfirmPublish] = useState(false);

  const [resultType, setResultType] = useState("position_grade");
  const [positions, setPositions] = useState({ first: [], second: [], third: [] });
  const [additionalGrades, setAdditionalGrades] = useState([]);

  useEffect(() => {
    if (editResult) {
      setResultType(editResult.resultType || "position_grade");
      setPositions({
        first: editResult.positions?.first || [],
        second: editResult.positions?.second || [],
        third: editResult.positions?.third || [],
      });
      setAdditionalGrades(editResult.additionalGrades || []);
    } else if (program) {
      setResultType("position_grade");
      setPositions({
        first: [emptyWinner(program)],
        second: [emptyWinner(program)],
        third: [emptyWinner(program)],
      });
      setAdditionalGrades([]);
    }
    setError("");
    setWarning("");
    setConfirmPublish(false);
  }, [editResult, isOpen, program]);

  if (!isOpen || !program) return null;

  const programPoints = program.points || POINTS[program.type] || {};
  const showPositions = resultType !== "grades_only";
  const showGrades = resultType !== "positions_only";

  const candidateData = candidates.find((c) => c.programId === program.id);

  const getAllUsedStudentIds = () => {
    const used = [];
    ["first", "second", "third"].forEach((key) => {
      positions[key].forEach((w) => {
        if (w.studentId) used.push(w.studentId);
        if (w.studentIds) used.push(...w.studentIds);
      });
    });
    return used;
  };

  const getAllUsedGroupIds = () => {
    const used = [];
    ["first", "second", "third"].forEach((key) => {
      positions[key].forEach((w) => {
        if (w.groupId) used.push(w.groupId);
      });
    });
    return used;
  };

  const updateWinner = (positionKey, index, newData) => {
    setPositions((prev) => {
      const copy = { ...prev };
      const newList = [...copy[positionKey]];
      newList[index] = newData;
      copy[positionKey] = newList;
      return copy;
    });
  };

  const addWinner = (positionKey) => {
    setPositions((prev) => ({
      ...prev,
      [positionKey]: [...prev[positionKey], emptyWinner(program)],
    }));
  };

  const removeWinner = (positionKey, index) => {
    setPositions((prev) => ({
      ...prev,
      [positionKey]: prev[positionKey].filter((_, i) => i !== index),
    }));
  };

  const addGrade = () => setAdditionalGrades([...additionalGrades, emptyWinner(program)]);
  const updateGrade = (index, newData) => {
    const newList = [...additionalGrades];
    newList[index] = newData;
    setAdditionalGrades(newList);
  };
  const removeGrade = (index) => setAdditionalGrades(additionalGrades.filter((_, i) => i !== index));

  const isWinnerValid = (w) => {
    if (program.type === "Personal Group" || program.type === "Group") {
      return w.studentIds && w.studentIds.length > 0;
    }
    if (program.type === "General") {
      return !!w.groupId;
    }
    return !!w.studentId;
  };

  const handleSave = async (status, force = false) => {
    setError("");
    setWarning("");

    const hasErrors = ["first", "second", "third"].some((key) =>
      positions[key].some(
        (w) => w.error || (w.candidateEntries && w.candidateEntries.some((c) => c.error))
      )
    );

    if (hasErrors) {
      setError("Please fix errors before saving (duplicate/invalid entries)");
      return;
    }

    const cleanPositions = {
      first: showPositions ? positions.first.filter(isWinnerValid) : [],
      second: showPositions ? positions.second.filter(isWinnerValid) : [],
      third: showPositions ? positions.third.filter(isWinnerValid) : [],
    };

    const cleanGrades = additionalGrades.filter(
      (g) => isWinnerValid(g) && g.grade
    );

    if (status === "published") {
      const totalWinners =
        cleanPositions.first.length + cleanPositions.second.length + cleanPositions.third.length;

      if (resultType === "grades_only") {
        if (cleanGrades.length === 0) {
          setError("Please add at least one grade");
          return;
        }
      } else {
        // Warning: no valid winners in any position
        if (totalWinners === 0) {
          if (!force) {
            setWarning("⚠️ No valid winners in any position. Publishing an empty result. Are you sure?");
            setConfirmPublish(true);
            return;
          }
        }

        // Warning: has some positions but missing 1st/2nd/3rd
        if (totalWinners > 0 && cleanPositions.first.length === 0) {
          if (!force) {
            setWarning("⚠️ No 1st place winner. This is unusual for a competition. Continue?");
            setConfirmPublish(true);
            return;
          }
        }
      }
    }

    setSaving(true);

    try {
      const data = {
        programId: program.id,
        programName: program.name || program.program,
        programCode: program.code,
        category: program.category,
        type: program.type,
        moduleType: moduleType,
        resultType: resultType,
        positions: cleanPositions,
        additionalGrades: cleanGrades,
        status: status,
        published: status === "published",
        groupsPerTeam: program.groupsPerTeam || 1,
        candidatesPerGroup: program.candidatesPerGroup || 1,
      };

      let result;
      if (editResult) {
        result = await updateDocument(COLLECTIONS.RESULTS, editResult.id, data);
      } else {
        result = await addDocument(COLLECTIONS.RESULTS, data);
      }

      if (result.success) {
        if (status === "published") {
          await recalculateAll();
        }
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setConfirmPublish(false);
    }
  };

  const isPersonalGroup = program.type === "Personal Group";
  const isGroup = program.type === "Group";
  const isGeneral = program.type === "General";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editResult ? "Edit Result" : "Add Result"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5 truncate">
                {program.code && <span className="font-mono font-semibold">{program.code}</span>}
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{program.name || program.program}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3 text-sm flex-wrap">
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-medium">
              📚 {program.category}
            </span>
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-medium">
              {isPersonalGroup || isGroup ? <Users className="w-4 h-4 inline" /> : "👥"} {program.type}
            </span>
            {(isPersonalGroup || isGroup) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                {program.candidatesPerGroup} candidates × {program.groupsPerTeam} group(s)
              </span>
            )}
            {isGeneral && program.groupsPerTeam > 1 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                Max {program.groupsPerTeam} groups per team
              </span>
            )}
            <div className="ml-auto flex items-center gap-3 text-xs">
              <span>🥇 <b>{programPoints.first || 0}</b></span>
              <span>🥈 <b>{programPoints.second || 0}</b></span>
              <span>🥉 <b>{programPoints.third || 0}</b></span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {warning && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-300">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Warning</p>
                    <p className="text-sm mt-1">{warning}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setWarning(""); setConfirmPublish(false); }}
                    className="px-4 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave("published", true)}
                    className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600"
                  >
                    Publish Anyway
                  </button>
                </div>
              </div>
            )}

            {/* Result Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Result Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {RESULT_TYPES.map((rt) => {
                  const isSelected = resultType === rt.value;
                  return (
                    <label
                      key={rt.value}
                      className={
                        isSelected
                          ? "flex flex-col p-3 border-2 rounded-xl cursor-pointer border-emerald-500 bg-emerald-50"
                          : "flex flex-col p-3 border-2 rounded-xl cursor-pointer border-gray-200 bg-white hover:border-gray-300"
                      }
                    >
                      <input
                        type="radio" name="resultType" value={rt.value}
                        checked={isSelected}
                        onChange={(e) => setResultType(e.target.value)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{rt.icon}</span>
                        <span className="font-semibold text-sm text-gray-900">{rt.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{rt.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Positions */}
            {showPositions &&
              POSITIONS.map((pos) => {
                const usedStudentIds = getAllUsedStudentIds();
                const usedGroupIds = getAllUsedGroupIds();

                return (
                  <div key={pos.key} className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">{pos.emoji}</span>
                        {pos.label}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {positions[pos.key].map((winner, index) => (
                        <WinnerRow
                          key={index}
                          winner={winner}
                          index={index}
                          onChange={(newData) => updateWinner(pos.key, index, newData)}
                          onRemove={() => removeWinner(pos.key, index)}
                          students={students}
                          teams={teams}
                          program={program}
                          showGrade={showGrades}
                          usedStudentIds={usedStudentIds.filter((id) =>
                            program.type === "Individual" ? id !== winner.studentId : true
                          )}
                          usedGroupIds={usedGroupIds.filter((id) => id !== winner.groupId)}
                          candidateData={candidateData}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => addWinner(pos.key)}
                      className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Winner (Tie)
                    </button>
                  </div>
                );
              })}

            {/* Additional Grades */}
            {showGrades && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      {resultType === "grades_only" ? "Grades" : "Additional Grades"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {resultType === "grades_only"
                        ? "Add all graded participants"
                        : "Extra grades for other participants (not top 3)"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {additionalGrades.map((item, index) => (
                    <WinnerRow
                      key={index}
                      winner={item}
                      index={index}
                      onChange={(newData) => updateGrade(index, newData)}
                      onRemove={() => removeGrade(index)}
                      students={students}
                      teams={teams}
                      program={program}
                      showGrade={true}
                      candidateData={candidateData}
                    />
                  ))}
                </div>

                <button
                  onClick={addGrade}
                  className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Grade
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100">
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}