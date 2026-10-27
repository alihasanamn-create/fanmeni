import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { UserPlus, Shield, Save, Trash2, User, CheckCircle, AlertCircle, Search, Palette, Trophy, FileUp, FileSpreadsheet } from "lucide-react";
import { usePrograms } from "../hooks/usePrograms";
import { useCandidates } from "../hooks/useCandidates";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import useAuth from "../hooks/useAuth";
import { setDocument, deleteDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { syncStudentPrograms } from "../utils/candidateSync";
import { getProgrammeLimit, getPersonalLimit, getProgrammeDivision } from "../constants/programmeLimits";

const CATEGORY_TABS = ["Bidaya", "Thaniya", "General"];
const PROGRAM_TYPES_ALL = ["Individual", "Personal Group", "Group", "General"];

const normalize = (value) => String(value || "").trim().toLowerCase();
const normalizeCategory = (program) => program?.category || program?.programCategory || program?.studentCategory || "";
const categoryMatches = (program, category) => normalize(normalizeCategory(program)) === normalize(category);
const studentCategoryMatches = (student, category) => category === "General" || normalize(student?.category) === normalize(category);
const getTeamName = (team) => team?.name || team?.teamName || team?.title || team?.displayName || "";

export default function CandidatesDashboard() {
  const { profile, isCaptain, isAdmin } = useAuth();
  const [moduleType, setModuleType] = useState("arts");
  const [activeCategory, setActiveCategory] = useState("Bidaya");
  const [activeType, setActiveType] = useState("Individual");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [slotsByTeam, setSlotsByTeam] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [excelImportMode, setExcelImportMode] = useState("merge");
  const [importingExcel, setImportingExcel] = useState(false);

  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { candidates } = useCandidates();
  const { teams } = useTeams();
  const { students } = useStudents();

  const currentPrograms = moduleType === "arts" ? artsPrograms : sportsPrograms;

  // Resolve the captain's live team by ID first, then by saved team name.
  // This prevents stale captain team IDs from blocking the shared dashboard.
  const captainTeam = useMemo(() => {
    if (!isCaptain) return null;
    const storedTeamId = normalize(profile?.teamId);
    const storedTeamName = normalize(profile?.teamName || profile?.team);

    if (storedTeamId) {
      const byId = teams.find((team) => normalize(team.id) === storedTeamId);
      if (byId) return byId;
    }

    if (storedTeamName) {
      const byName = teams.find((team) => normalize(getTeamName(team)) === storedTeamName);
      if (byName) return byName;
    }

    return null;
  }, [teams, isCaptain, profile?.teamId, profile?.teamName, profile?.team]);

  const captainTeamId = captainTeam?.id || "";

  const visibleTeams = useMemo(() => {
    if (!isCaptain) return teams;
    return captainTeam ? [captainTeam] : [];
  }, [teams, isCaptain, captainTeam]);

  const visibleStudents = useMemo(() => {
    if (!isCaptain) return students;
    if (!captainTeamId) return [];
    return students.filter((student) => student.teamId === captainTeamId);
  }, [students, isCaptain, captainTeamId]);

  useEffect(() => {
    setSelectedProgramId("");
  }, [moduleType, activeCategory, activeType]);

  const filteredPrograms = currentPrograms.filter((p) => categoryMatches(p, activeCategory) && normalize(p.type) === normalize(activeType));
  const currentProgram = currentPrograms.find((p) => p.id === selectedProgramId);
  const maxSlots = getSlotCount(currentProgram);
  const programmeLimit = getProgrammeLimit(currentProgram?.code);
  const programmeDivision = getProgrammeDivision(currentProgram?.code);
  const personalLimit = getPersonalLimit(activeCategory, currentProgram?.code);

  const existingCandidate = candidates.find((c) => c.programId === selectedProgramId);

  useEffect(() => {
    if (!selectedProgramId) {
      setSlotsByTeam({});
      return;
    }
    const initial = {};
    visibleTeams.forEach((team) => {
      const savedTeamCandidates = existingCandidate?.teamCandidates?.[team.id] || [];
      const slots = [];
      for (let i = 0; i < maxSlots; i++) slots.push(savedTeamCandidates[i] || { chestNumber: "" });
      initial[team.id] = slots;
    });
    setSlotsByTeam(initial);
    setMessage({ type: "", text: "" });
  }, [selectedProgramId, visibleTeams, maxSlots, existingCandidate?.id, existingCandidate?.teamCandidates]);

  const getExistingTeamCount = (teamId) => {
    const participantCount = Number(existingCandidate?.teamCandidates?.[teamId]?.length || 0);
    const assignedCount = visibleStudents.filter((student) => student.teamId === teamId && Array.isArray(student.assignedPrograms) && student.assignedPrograms.some((p) => p.programId === selectedProgramId)).length;
    return Math.max(participantCount, assignedCount);
  };

  const getStudentUsage = (student, category, division) => {
    if (!student) return 0;
    const assigned = Array.isArray(student.assignedPrograms) ? student.assignedPrograms : [];
    return assigned.filter((p) => {
      const pCategory = p.category || (String(p.code || p.programCode || "").toUpperCase().startsWith("B") ? "Bidaya" : String(p.code || p.programCode || "").toUpperCase().startsWith("T") ? "Thaniya" : "");
      return normalize(pCategory) === normalize(category) && getProgrammeDivision(p.code || p.programCode) === division;
    }).length;
  };

  const handleChestInput = (teamId, slotIndex, chestNumber) => {
    setSlotsByTeam((prev) => {
      const teamSlots = [...(prev[teamId] || [])];
      if (!chestNumber.trim()) {
        teamSlots[slotIndex] = { chestNumber: "" };
      } else {
        const student = visibleStudents.find((s) => s.chestNumber?.toString() === chestNumber.toString().trim());
        if (!student) {
          teamSlots[slotIndex] = { chestNumber, error: "Student not found in your team" };
        } else if (student.teamId !== teamId) {
          teamSlots[slotIndex] = { chestNumber, error: "Student belongs to another team" };
        } else if (!studentCategoryMatches(student, activeCategory)) {
          teamSlots[slotIndex] = { chestNumber, error: `Student is ${student.category || "unknown"} category` };
        } else {
          const alreadyInTeam = teamSlots.some((s, i) => i !== slotIndex && s.studentId === student.id);
          if (alreadyInTeam) {
            teamSlots[slotIndex] = { chestNumber, error: "Already added in another slot" };
          } else {
            const used = getStudentUsage(student, activeCategory, programmeDivision);
            if (personalLimit !== Infinity && used >= personalLimit && !student.assignedPrograms?.some((p) => p.programId === selectedProgramId)) {
              teamSlots[slotIndex] = { chestNumber, error: `Personal ${programmeDivision} limit reached (${used}/${personalLimit})` };
            } else {
              teamSlots[slotIndex] = { chestNumber, studentId: student.id, studentName: student.name, class: student.class, admissionNumber: student.admissionNumber };
            }
          }
        }
      }
      return { ...prev, [teamId]: teamSlots };
    });
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!currentProgram) {
      setMessage({ type: "error", text: "Select a programme before importing Excel." });
      return;
    }

    setImportingExcel(true);
    setMessage({ type: "", text: "" });
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
      if (!rows.length) throw new Error("The Excel sheet is empty.");

      const cleanKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const findValue = (row, names) => {
        const key = Object.keys(row).find((candidate) => names.includes(cleanKey(candidate)));
        return key ? String(row[key] || "").trim() : "";
      };
      const chestNames = ["chestnumber", "chestno", "chest", "chestnum", "number"];
      const teamNames = ["team", "teamname", "teamid"];
      const firstRowKeys = Object.keys(rows[0] || {});
      const hasChestHeader = firstRowKeys.some((key) => chestNames.includes(cleanKey(key)));
      const dataRows = rows.filter((row) => Object.values(row).some((value) => String(value || "").trim()));
      const imported = {};
      let skipped = 0;

      for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
        const row = dataRows[rowIndex];
        const chestNumber = (hasChestHeader
          ? findValue(row, chestNames)
          : String(row[firstRowKeys[0]] || "")).trim();
        if (!chestNumber) { skipped++; continue; }

        const teamValue = findValue(row, teamNames);
        let team = null;
        if (isCaptain) {
          team = captainTeam;
        } else if (teamValue) {
          team = visibleTeams.find((item) =>
            normalize(item.id) === normalize(teamValue) ||
            normalize(getTeamName(item)) === normalize(teamValue)
          );
        } else if (visibleTeams.length === 1) {
          team = visibleTeams[0];
        }
        if (!team) {
          skipped++;
          continue;
        }

        const student = visibleStudents.find((item) =>
          String(item.chestNumber ?? "").trim() === chestNumber
        );
        if (!student || student.teamId !== team.id || !studentCategoryMatches(student, activeCategory)) {
          skipped++;
          continue;
        }

        const slots = imported[team.id] || (
          excelImportMode === "merge" ? [...(slotsByTeam[team.id] || [])] : []
        );
        if (slots.some((slot) => slot.studentId === student.id)) { skipped++; imported[team.id] = slots; continue; }

        const emptyIndex = slots.findIndex((slot) => !slot.studentId && !slot.chestNumber);
        const newSlot = {
          chestNumber,
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          admissionNumber: student.admissionNumber,
        };
        if (emptyIndex >= 0) slots[emptyIndex] = newSlot;
        else if (slots.length < maxSlots) slots.push(newSlot);
        else { skipped++; imported[team.id] = slots; continue; }

        imported[team.id] = slots;
      }

      if (!Object.keys(imported).length || !Object.values(imported).some((slots) => slots.some((slot) => slot.studentId))) {
        throw new Error("No valid candidates were imported. Check chest numbers, category, and team names.");
      }

      setSlotsByTeam((previous) => {
        const next = excelImportMode === "replace"
          ? Object.fromEntries(visibleTeams.map((team) => [team.id, Array.from({ length: maxSlots }, () => ({ chestNumber: "" }))]))
          : { ...previous };
        Object.entries(imported).forEach(([teamId, slots]) => {
          const padded = [...slots];
          while (padded.length < maxSlots) padded.push({ chestNumber: "" });
          next[teamId] = padded.slice(0, maxSlots);
        });
        return next;
      });
      setMessage({
        type: skipped ? "error" : "success",
        text: `Imported candidates into the form. ${skipped} row(s) skipped. Review the assignments, then click Save Candidates.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: `Excel import failed: ${error.message}` });
    } finally {
      setImportingExcel(false);
    }
  };

  const handleSave = async () => {
    if (!currentProgram) return;
    setMessage({ type: "", text: "" });
    const teamCandidates = {};
    let totalCount = 0;
    let hasError = false;

    Object.entries(slotsByTeam).forEach(([teamId, slots]) => {
      const validSlots = slots.filter((s) => s.studentId);
      const errorSlots = slots.filter((s) => s.chestNumber && s.error);
      if (errorSlots.length > 0) hasError = true;
      if (validSlots.length > 0) {
        teamCandidates[teamId] = validSlots.map((s) => ({ studentId: s.studentId, studentName: s.studentName, chestNumber: s.chestNumber, class: s.class, admissionNumber: s.admissionNumber }));
        totalCount += validSlots.length;
      }
    });

    if (isCaptain && !captainTeamId) {
      setMessage({ type: "error", text: "Your assigned team could not be resolved. Please ask an admin to re-save your captain team assignment." });
      return;
    }
    if (isCaptain && Object.keys(teamCandidates).some((teamId) => teamId !== captainTeamId)) {
      setMessage({ type: "error", text: "You can only assign candidates from your own team." });
      return;
    }
    if (hasError) {
      setMessage({ type: "error", text: "Please fix invalid chest numbers before saving" });
      return;
    }
    if (totalCount === 0) {
      setMessage({ type: "error", text: "Please add at least one candidate" });
      return;
    }

    if (programmeLimit !== Infinity) {
      for (const teamId of Object.keys(teamCandidates)) {
        const existingCount = getExistingTeamCount(teamId);
        if (existingCount + teamCandidates[teamId].length > programmeLimit) {
          const team = visibleTeams.find((t) => t.id === teamId);
          setMessage({ type: "error", text: `${getTeamName(team) || "Team"}: ${currentProgram.code || currentProgram.name} allows only ${programmeLimit} candidates per team. Current: ${existingCount}.` });
          setSaving(false);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const docId = existingCandidate?.id || currentProgram.id;
      const captainAssignments = isCaptain ? (teamCandidates[captainTeamId] || []) : null;
      const data = {
        programId: currentProgram.id,
        programName: currentProgram.name || currentProgram.program,
        programCode: currentProgram.code,
        category: normalizeCategory(currentProgram),
        type: currentProgram.type,
        moduleType: currentProgram.moduleType || moduleType,
        teamCandidates: isCaptain ? { [captainTeamId]: captainAssignments } : teamCandidates,
        totalCandidates: isCaptain ? captainAssignments.length : totalCount,
        groupsPerTeam: currentProgram.groupsPerTeam || 1,
        candidatesPerGroup: currentProgram.candidatesPerGroup || 1,
      };

      if (isCaptain && existingCandidate?.teamCandidates) {
        data.teamCandidates = { ...existingCandidate.teamCandidates, [captainTeamId]: captainAssignments };
        data.totalCandidates = Object.values(data.teamCandidates).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
      }

      const result = await setDocument(COLLECTIONS.PARTICIPANTS, docId, data);
      if (result.success) {
        await syncStudentPrograms();
        setMessage({ type: "success", text: isCaptain ? `✅ ${captainAssignments.length} candidate(s) assigned for admin review!` : `✅ ${totalCount} candidate(s) assigned & profiles updated!` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!existingCandidate) {
      setSlotsByTeam({});
      return;
    }
    if (isCaptain) {
      setMessage({ type: "error", text: "Captains cannot clear candidate assignments. Submit the required candidates and ask admin to make changes if needed." });
      return;
    }
    if (!confirm("Delete all candidate assignments for this program?")) return;
    await deleteDocument(COLLECTIONS.PARTICIPANTS, existingCandidate.id);
    await syncStudentPrograms();
    setSelectedProgramId("");
    setMessage({ type: "success", text: "Cleared successfully" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const isProgramAssigned = (programId) => candidates.some((c) => c.programId === programId);
  const moduleLabel = moduleType === "arts" ? "Arts" : "Riyadha";
  const moduleGradient = moduleType === "arts" ? "from-purple-500 to-pink-600" : "from-blue-500 to-indigo-600";
  const currentTeamCount = isCaptain && captainTeamId ? getExistingTeamCount(captainTeamId) : null;
  const selectedCount = isCaptain && captainTeamId ? (slotsByTeam[captainTeamId] || []).filter((s) => s.studentId).length : null;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${moduleGradient}`}><UserPlus className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assign Candidates</h1><p className="text-sm text-gray-500">{isCaptain ? `Assign your team's existing students to Arts and Riyadha programmes.` : "Assign students to programs by Category & Type"}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setModuleType("arts")} className={moduleType === "arts" ? "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl" : "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-white border-2 border-gray-200 text-gray-700"}><Palette className="w-6 h-6" /><div className="text-left"><div>Arts</div><div className="text-[10px] font-medium opacity-80">{artsPrograms.length} programs</div></div></button>
          <button onClick={() => setModuleType("sports")} className={moduleType === "sports" ? "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl" : "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-white border-2 border-gray-200 text-gray-700"}><Trophy className="w-6 h-6" /><div className="text-left"><div>Riyadha</div><div className="text-[10px] font-medium opacity-80">{sportsPrograms.length} programs</div></div></button>
        </div>

        {isCaptain && <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><b>Team:</b> {getTeamName(captainTeam) || profile?.teamName || "Your assigned team"} · Only your team's students can be assigned.</div>}

        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          {CATEGORY_TABS.map((cat) => <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? `px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r ${moduleGradient} text-white shadow-md` : "px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"}>{cat}</button>)}
        </div>

        {message.text && <div className={message.type === "success" ? "mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm font-medium" : "mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2 text-sm font-medium"}>{message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message.text}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label><div className="grid grid-cols-2 gap-2">{PROGRAM_TYPES_ALL.map((t) => <button key={t} onClick={() => setActiveType(t)} className={activeType === t ? `px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r ${moduleGradient} text-white` : "px-3 py-2 rounded-lg font-medium text-sm bg-gray-50 text-gray-700 border border-gray-200"}>{t}</button>)}</div></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label><div className="flex gap-2"><select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white font-medium"><option value="">-- Select {moduleLabel} Program ({filteredPrograms.length} available) --</option>{filteredPrograms.map((p) => <option key={p.id} value={p.id}>{p.code && `[${p.code}] `}{p.name || p.program}{isProgramAssigned(p.id) ? "  ✓" : ""}</option>)}</select>{currentProgram?.code && <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-700 flex items-center">{currentProgram.code}</div>}</div></div>
          </div>

          {currentProgram && <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">📚 {normalizeCategory(currentProgram) || activeCategory}</span><span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">👥 {currentProgram.type}</span><span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">🎯 {programmeLimit === Infinity ? "Unlimited" : `${currentTeamCount ?? 0}/${programmeLimit}`} team candidates</span>{isCaptain && <span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg font-medium">Personal {programmeDivision}: {personalLimit === Infinity ? "Unlimited" : `${personalLimit} max`}</span>}<span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg font-medium">{maxSlots} assignment slot{maxSlots > 1 ? "s" : ""}</span></div>}
          {currentProgram && (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-gray-800"><FileSpreadsheet className="h-5 w-5 text-emerald-700" /> Excel candidate import</div>
                  <p className="mt-1 text-xs text-gray-600">Use columns <b>Chest Number</b> and, when importing multiple teams, <b>Team</b>. Import fills this form only; click Save Candidates to save.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={excelImportMode} onChange={(e) => setExcelImportMode(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                    <option value="merge">Merge with existing entries</option>
                    <option value="replace">Replace entries in form</option>
                  </select>
                  <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white ${importingExcel ? "opacity-60" : ""}`}>
                    <FileUp className="h-4 w-4" /> {importingExcel ? "Importing…" : "Import Excel"}
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} disabled={importingExcel} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {currentProgram ? <>
          {visibleTeams.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><p className="text-gray-500">No assigned team found for this captain.</p></div> : <div className="space-y-4">{visibleTeams.map((team) => <motion.div key={team.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="px-5 py-3 flex items-center gap-3" style={{ background: `linear-gradient(90deg, ${team.color || "#10b981"}15, transparent)` }}><div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: team.color || "#10b981" }}><Shield className="w-4 h-4" /></div><div className="flex-1"><h3 className="font-bold text-gray-900">{getTeamName(team)}</h3>{isCaptain && <p className="text-xs text-gray-500">Your team only</p>}</div><div className="text-sm text-gray-500 font-medium">{(slotsByTeam[team.id] || []).filter((s) => s.studentId).length} / {maxSlots}</div></div><div className="p-5 space-y-3">{(slotsByTeam[team.id] || []).map((slot, idx) => <SlotRow key={idx} slotNumber={idx + 1} slot={slot} onChange={(chest) => handleChestInput(team.id, idx, chest)} program={currentProgram} />)}</div></motion.div>)}</div>}
          <div className="mt-6 flex justify-end gap-3">{existingCandidate && !isCaptain && <button onClick={handleClearAll} className="px-5 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl flex items-center gap-2"><Trash2 className="w-4 h-4" />Clear All</button>}<button onClick={handleSave} disabled={saving || (isCaptain && selectedCount === 0)} className={`px-8 py-3 bg-gradient-to-r ${moduleGradient} text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2`}><Save className="w-5 h-5" />{saving ? "Saving..." : isCaptain ? "Submit Candidates" : "Save Candidates"}</button></div>
        </> : <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center"><Search className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">Select a {moduleLabel.toLowerCase()} program above to assign candidates</p><p className="text-sm text-gray-400 mt-1">Module: <b>{moduleLabel}</b> • Category: <b>{activeCategory}</b> • Type: <b>{activeType}</b></p></div>}
      </div>
    </div>
  );
}

function getSlotCount(program) {
  if (!program) return 1;
  if (program.type === "Personal Group" || program.type === "Group") return (Number(program.groupsPerTeam) || 1) * (Number(program.candidatesPerGroup) || 1);
  if (program.type === "General") return Number(program.groupsPerTeam) || 1;
  return Number(program.participantsPerTeam) || Number(program.count) || 1;
}

function SlotRow({ slotNumber, slot, onChange, program }) {
  const hasValue = !!slot.chestNumber; const isValid = !!slot.studentId; const hasError = hasValue && slot.error;
  const inputClass = `w-full px-3 py-2 border rounded-lg outline-none text-center font-mono font-bold text-sm ${hasError ? "border-red-300 bg-red-50 text-red-700" : isValid ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-800"}`;
  let slotLabel = `Slot ${slotNumber}`;
  if (program?.type === "Personal Group" || program?.type === "Group") { const perGroup = Number(program.candidatesPerGroup) || 1; slotLabel = `Group ${Math.floor((slotNumber - 1) / perGroup) + 1} • Member ${((slotNumber - 1) % perGroup) + 1}`; }
  else if (program?.type === "General" && Number(program.groupsPerTeam) > 1) slotLabel = `Entry ${slotNumber}`;
  return <div className="grid grid-cols-12 gap-3 items-center"><div className="col-span-2 md:col-span-1 flex items-center justify-center"><span className="w-8 h-8 bg-gray-100 text-gray-600 font-bold rounded-lg flex items-center justify-center text-xs">{slotNumber}</span></div><div className="col-span-3"><input type="text" placeholder="Chest #" value={slot.chestNumber || ""} onChange={(e) => onChange(e.target.value)} className={inputClass} /></div><div className="col-span-4 md:col-span-5"><div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm min-h-[38px] flex items-center gap-2">{isValid ? <><User className="w-3.5 h-3.5 text-emerald-600" /><span className="font-medium text-gray-800 truncate">{slot.studentName}</span></> : hasError ? <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 text-xs truncate">{slot.error}</span></> : <span className="text-gray-400 text-xs">Auto-filled name</span>}</div></div><div className="col-span-3"><div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs min-h-[38px] flex items-center">{isValid ? <div className="truncate text-gray-600">{slot.class && <span className="font-medium">Class {slot.class}</span>}{slot.admissionNumber && <span className="ml-2 text-gray-400">#{slot.admissionNumber}</span>}</div> : <span className="text-gray-400 text-[10px] truncate">{slotLabel}</span>}</div></div></div>;
}