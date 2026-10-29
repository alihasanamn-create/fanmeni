// ============================================
// FILE: src/components/results/WinnerRow.jsx
// PURPOSE: Winner row with SMART DROPDOWN (auto-filters used)
// ============================================

import { X, User, Shield, Users, AlertTriangle, Award } from "lucide-react";

export default function WinnerRow({
  winner,
  index,
  onChange,
  onRemove,
  students,
  teams,
  program,
  showGrade,
  usedStudentIds = [],
  usedGroupIds = [],
  candidateData,
}) {
  const isIndividual = program.type === "Individual";
  const isPersonalGroup = program.type === "Personal Group";
  const isGroup = program.type === "Group";
  const isGeneral = program.type === "General";

  const candidatesPerGroup = program.candidatesPerGroup || 1;
  const groupsPerTeam = program.groupsPerTeam || 1;

  // Build list of ASSIGNED students for this program
  const getAssignedStudents = () => {
    if (!candidateData?.teamCandidates) return [];
    const assigned = [];
    Object.entries(candidateData.teamCandidates).forEach(([teamId, teamStudents]) => {
      teamStudents.forEach((s) => {
        assigned.push({ ...s, teamId });
      });
    });
    // Sort by chest number
    return assigned.sort((a, b) => {
      const aNum = parseInt(a.chestNumber) || 999;
      const bNum = parseInt(b.chestNumber) || 999;
      return aNum - bNum;
    });
  };

  const assignedStudents = getAssignedStudents();

  // ============================================
  // NO CANDIDATES ASSIGNED WARNING
  // ============================================
  if (!candidateData && (isIndividual || isPersonalGroup || isGroup)) {
    return (
      <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900 text-sm">No Candidates Assigned</p>
            <p className="text-xs text-red-700 mt-1">
              You must first assign candidates in the{" "}
              <a href="/candidates" className="underline font-bold">
                Candidates page
              </a>{" "}
              before publishing results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // GENERAL: Team + optional group number
  // ============================================
  if (isGeneral) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Award className="w-3.5 h-3.5" />
            Winner #{index + 1}
          </div>
          <button
            onClick={onRemove}
            className="ml-auto w-6 h-6 rounded-lg hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-1 flex items-center justify-center">
            <span className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center font-black text-sm">
              {index + 1}
            </span>
          </div>

          <div className={showGrade ? "col-span-8" : "col-span-11"}>
            <select
              value={winner.groupId || ""}
              onChange={(e) => {
                const selectedGroupId = e.target.value;

                if (!selectedGroupId) {
                  onChange({
                    ...winner,
                    groupId: "",
                    teamId: "",
                    teamName: "",
                    displayName: "",
                    groupNumber: null,
                    studentName: "",
                  });
                  return;
                }

                const [teamId, selectedGroupNum] = selectedGroupId.split("|");
                const groupNum = parseInt(selectedGroupNum, 10) || 1;
                const team = teams.find((t) => String(t.id) === teamId);

                if (!team) {
                  onChange({
                    ...winner,
                    groupId: "",
                    teamId: "",
                    teamName: "",
                    displayName: "",
                    groupNumber: null,
                    studentName: "",
                  });
                  return;
                }

                const displayName =
                  groupsPerTeam > 1 ? `${team.name} ${groupNum}` : team.name;

                onChange({
                  ...winner,
                  groupId: selectedGroupId,
                  teamId: team.id,
                  teamName: team.name,
                  displayName,
                  groupNumber: groupNum,
                  studentName: displayName,
                });
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-sm font-medium"
            >
              <option value="">Select Team</option>
              {teams.flatMap((team) =>
                Array.from({ length: groupsPerTeam }, (_, i) => i + 1)
                  .map((groupNum) => {
                    const groupId = `${team.id}|${groupNum}`;
                    const label = groupsPerTeam > 1 ? `${team.name} ${groupNum}` : team.name;
                    const isUsed =
                      usedGroupIds.some((usedId) => String(usedId) === groupId) &&
                      groupId !== String(winner.groupId || "");

                    // Filter only the exact group that has already been selected.
                    // Other groups belonging to the same team remain available.
                    if (isUsed) return null;

                    return (
                      <option key={groupId} value={groupId}>
                        {label}
                      </option>
                    );
                  })
                  .filter(Boolean)
              )}
            </select>
          </div>

          {showGrade && (
            <div className="col-span-3">
              <select
                value={winner.grade || ""}
                onChange={(e) => onChange({ ...winner, grade: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="">Grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // PERSONAL GROUP or GROUP: Multiple slots
  // ============================================
  if (isPersonalGroup || isGroup) {
    const currentCandidates =
      winner.candidateEntries ||
      Array(candidatesPerGroup).fill({ studentId: "" });

    const updateCandidate = (idx, studentId) => {
      const newCandidates = [...currentCandidates];

      if (!studentId) {
        newCandidates[idx] = { studentId: "" };
      } else {
        const assignedStudent = assignedStudents.find(
          (s) => s.studentId === studentId
        );

        if (!assignedStudent) {
          newCandidates[idx] = { studentId: "", error: "Not found" };
        } else {
          const student = students.find((s) => s.id === studentId);
          if (student) {
            newCandidates[idx] = {
              studentId: student.id,
              studentName: student.name,
              chestNumber: student.chestNumber,
              teamId: student.teamId,
              teamName: student.teamName,
            };
          }
        }
      }

      const validCandidates = newCandidates.filter((c) => c.studentId);
      const teamId = validCandidates[0]?.teamId || "";
      const teamName = validCandidates[0]?.teamName || "";

      onChange({
        ...winner,
        candidateEntries: newCandidates,
        studentIds: validCandidates.map((c) => c.studentId),
        studentNames: validCandidates.map((c) => c.studentName),
        chestNumbers: validCandidates.map((c) => c.chestNumber),
        teamId: teamId,
        teamName: teamName,
        studentName: validCandidates.map((c) => c.studentName).join(", "),
      });
    };

    // Get IDs used in this group (to hide from other slots in same group)
    const currentGroupIds = currentCandidates.map((c) => c.studentId).filter(Boolean);

    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Users className="w-3.5 h-3.5" />
            Group Winner #{index + 1}
            {isPersonalGroup && (
              <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">
                Shared Points
              </span>
            )}
          </div>
          <button
            onClick={onRemove}
            className="ml-auto w-6 h-6 rounded-lg hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-1 flex items-start justify-center pt-2">
            <span className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center font-black text-sm">
              {index + 1}
            </span>
          </div>

          <div className={showGrade ? "col-span-8" : "col-span-11"}>
            <div className="space-y-1.5">
              {currentCandidates.map((cand, idx) => (
                <CandidateSlot
                  key={idx}
                  candidate={cand}
                  onChange={(sid) => updateCandidate(idx, sid)}
                  assignedStudents={assignedStudents}
                  usedStudentIds={usedStudentIds}
                  currentGroupIds={currentGroupIds.filter((id) => id !== cand.studentId)}
                  currentValue={cand.studentId}
                />
              ))}
            </div>
          </div>

          {showGrade && (
            <div className="col-span-3 flex items-start pt-0">
              <select
                value={winner.grade || ""}
                onChange={(e) => onChange({ ...winner, grade: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="">Grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          )}
        </div>

        {winner.teamName && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
            <Shield className="w-3 h-3" />
            Team: <b>{winner.teamName}</b>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // INDIVIDUAL: Smart dropdown (filters used)
  // ============================================
  const handleSelect = (studentId) => {
    if (!studentId) {
      onChange({
        ...winner,
        chestNumber: "",
        studentId: "",
        studentName: "",
        teamId: "",
        teamName: "",
        error: "",
      });
      return;
    }

    const assignedStudent = assignedStudents.find((s) => s.studentId === studentId);
    if (!assignedStudent) return;

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    onChange({
      ...winner,
      chestNumber: student.chestNumber,
      studentId: student.id,
      studentName: student.name,
      teamId: student.teamId,
      teamName: student.teamName,
      error: null,
    });
  };

  const foundStudent = winner.studentId
    ? students.find((s) => s.id === winner.studentId)
    : null;

  // ⚡ Filter out used students (except current)
  const availableStudents = assignedStudents.filter(
    (s) => !usedStudentIds.includes(s.studentId) || s.studentId === winner.studentId
  );

  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 font-medium">
          Winner #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="ml-auto w-6 h-6 rounded-lg hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {/* Smart Dropdown */}
        <div className={showGrade ? "col-span-10" : "col-span-12"}>
          <select
            value={winner.studentId || ""}
            onChange={(e) => handleSelect(e.target.value)}
            className={
              foundStudent
                ? "w-full px-3 py-2.5 border-2 border-emerald-300 bg-emerald-50 rounded-lg outline-none text-sm font-medium"
                : "w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg outline-none text-sm font-medium"
            }
          >
            <option value="">
              -- Select from {availableStudents.length} available --
            </option>
            {availableStudents.map((s) => {
              const team = teams.find((t) => t.id === s.teamId);
              return (
                <option key={s.studentId} value={s.studentId}>
                  {s.chestNumber ? `[${s.chestNumber}] ` : ""}
                  {s.studentName}
                  {team ? ` • ${team.name}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {showGrade && (
          <div className="col-span-2">
            <select
              value={winner.grade || ""}
              onChange={(e) => onChange({ ...winner, grade: e.target.value })}
              className="w-full px-2 py-2.5 border border-gray-200 rounded-lg outline-none bg-white text-sm"
            >
              <option value="">—</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        )}
      </div>

      {/* Show details when selected */}
      {foundStudent && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 flex-wrap">
          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-200 font-mono font-bold">
            #{foundStudent.chestNumber}
          </span>
          {winner.teamName && (
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-200">
              <Shield className="w-3 h-3 text-gray-500" />
              <b>{winner.teamName}</b>
            </span>
          )}
        </div>
      )}

      {/* Hint when no student selected */}
      {!foundStudent && availableStudents.length > 0 && (
        <div className="mt-2 text-[10px] text-gray-500">
          💡 {availableStudents.length} candidate{availableStudents.length > 1 ? "s" : ""} available
          {usedStudentIds.length > 0 && ` (${usedStudentIds.length} already placed)`}
        </div>
      )}

      {availableStudents.length === 0 && (
        <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          All candidates already placed
        </div>
      )}
    </div>
  );
}

// ============================================
// CANDIDATE SLOT for Group/Personal Group
// ============================================
function CandidateSlot({
  candidate,
  onChange,
  assignedStudents,
  usedStudentIds,
  currentGroupIds,
  currentValue,
}) {
  // Filter: not used elsewhere + not in same group + include current
  const availableStudents = assignedStudents.filter(
    (s) =>
      (!usedStudentIds.includes(s.studentId) &&
        !currentGroupIds.includes(s.studentId)) ||
      s.studentId === currentValue
  );

  return (
    <div className="grid grid-cols-12 gap-1.5 items-center">
      <div className="col-span-12">
        <select
          value={candidate.studentId || ""}
          onChange={(e) => onChange(e.target.value)}
          className={
            candidate.studentId
              ? "w-full px-2.5 py-1.5 border border-emerald-300 bg-emerald-50 rounded-md outline-none text-xs font-medium"
              : "w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-md outline-none text-xs font-medium"
          }
        >
          <option value="">-- Select --</option>
          {availableStudents.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.chestNumber ? `[${s.chestNumber}] ` : ""}
              {s.studentName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}