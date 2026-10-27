import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Shield,
  Save,
  Trash2,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Palette,
  Trophy,
  FileUp,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { usePrograms } from "../hooks/usePrograms";
import { useCandidates } from "../hooks/useCandidates";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import useAuth from "../hooks/useAuth";
import { setDocument, deleteDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { syncStudentPrograms } from "../utils/candidateSync";
import {
  getProgrammeLimit,
  getPersonalLimit,
  getProgrammeDivision,
} from "../constants/programmeLimits";

const CATEGORY_TABS = ["Bidaya", "Thaniya", "General"];
const PROGRAM_TYPES_ALL = [
  "Individual",
  "Personal Group",
  "Group",
  "General",
];

const normalize = (value) => String(value || "").trim().toLowerCase();

const normalizeCategory = (program) =>
  program?.category ||
  program?.programCategory ||
  program?.studentCategory ||
  "";

const categoryMatches = (program, category) =>
  normalize(normalizeCategory(program)) === normalize(category);

const studentCategoryMatches = (student, category) =>
  category === "General" ||
  normalize(student?.category) === normalize(category);

const getTeamName = (team) =>
  team?.name || team?.teamName || team?.title || team?.displayName || "";

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
  const [bulkImportingExcel, setBulkImportingExcel] = useState(false);

  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { candidates } = useCandidates();
  const { teams } = useTeams();
  const { students } = useStudents();

  const currentPrograms =
    moduleType === "arts" ? artsPrograms : sportsPrograms;

  const captainTeam = useMemo(() => {
    if (!isCaptain) return null;

    const storedTeamId = normalize(profile?.teamId);
    const storedTeamName = normalize(profile?.teamName || profile?.team);

    if (storedTeamId) {
      const byId = teams.find(
        (team) => normalize(team.id) === storedTeamId
      );

      if (byId) return byId;
    }

    if (storedTeamName) {
      const byName = teams.find(
        (team) => normalize(getTeamName(team)) === storedTeamName
      );

      if (byName) return byName;
    }

    return null;
  }, [
    teams,
    isCaptain,
    profile?.teamId,
    profile?.teamName,
    profile?.team,
  ]);

  const captainTeamId = captainTeam?.id || "";

  const visibleTeams = useMemo(() => {
    if (!isCaptain) return teams;
    return captainTeam ? [captainTeam] : [];
  }, [teams, isCaptain, captainTeam]);

  const visibleStudents = useMemo(() => {
    if (!isCaptain) return students;
    if (!captainTeamId) return [];

    return students.filter(
      (student) => student.teamId === captainTeamId
    );
  }, [students, isCaptain, captainTeamId]);

  useEffect(() => {
    setSelectedProgramId("");
  }, [moduleType, activeCategory, activeType]);

  const filteredPrograms = currentPrograms.filter(
    (program) =>
      categoryMatches(program, activeCategory) &&
      normalize(program.type) === normalize(activeType)
  );

  const currentProgram = currentPrograms.find(
    (program) => program.id === selectedProgramId
  );

  const maxSlots = getSlotCount(currentProgram);
  const programmeLimit = getProgrammeLimit(currentProgram?.code);
  const programmeDivision = getProgrammeDivision(currentProgram?.code);
  const personalLimit = getPersonalLimit(
    activeCategory,
    currentProgram?.code
  );

  const existingCandidate = candidates.find(
    (candidate) => candidate.programId === selectedProgramId
  );

  useEffect(() => {
    if (!selectedProgramId) {
      setSlotsByTeam({});
      return;
    }

    const initial = {};

    visibleTeams.forEach((team) => {
      const savedTeamCandidates =
        existingCandidate?.teamCandidates?.[team.id] || [];

      const slots = [];

      for (let i = 0; i < maxSlots; i++) {
        slots.push(savedTeamCandidates[i] || { chestNumber: "" });
      }

      initial[team.id] = slots;
    });

    setSlotsByTeam(initial);
    setMessage({ type: "", text: "" });
  }, [
    selectedProgramId,
    visibleTeams,
    maxSlots,
    existingCandidate?.id,
    existingCandidate?.teamCandidates,
  ]);

  const getExistingTeamCount = (teamId) => {
    const participantCount = Number(
      existingCandidate?.teamCandidates?.[teamId]?.length || 0
    );

    const assignedCount = visibleStudents.filter(
      (student) =>
        student.teamId === teamId &&
        Array.isArray(student.assignedPrograms) &&
        student.assignedPrograms.some(
          (program) => program.programId === selectedProgramId
        )
    ).length;

    return Math.max(participantCount, assignedCount);
  };

  const getStudentUsage = (student, category, division) => {
    if (!student) return 0;

    const assigned = Array.isArray(student.assignedPrograms)
      ? student.assignedPrograms
      : [];

    return assigned.filter((program) => {
      const code = String(
        program.code || program.programCode || ""
      ).toUpperCase();

      const programCategory =
        program.category ||
        (code.startsWith("B")
          ? "Bidaya"
          : code.startsWith("T")
            ? "Thaniya"
            : "");

      return (
        normalize(programCategory) === normalize(category) &&
        getProgrammeDivision(program.code || program.programCode) ===
          division
      );
    }).length;
  };

  const handleChestInput = (teamId, slotIndex, chestNumber) => {
    setSlotsByTeam((previous) => {
      const teamSlots = [...(previous[teamId] || [])];

      if (!chestNumber.trim()) {
        teamSlots[slotIndex] = { chestNumber: "" };
      } else {
        const student = visibleStudents.find(
          (item) =>
            item.chestNumber?.toString() === chestNumber.toString().trim()
        );

        if (!student) {
          teamSlots[slotIndex] = {
            chestNumber,
            error: "Student not found in your team",
          };
        } else if (student.teamId !== teamId) {
          teamSlots[slotIndex] = {
            chestNumber,
            error: "Student belongs to another team",
          };
        } else if (!studentCategoryMatches(student, activeCategory)) {
          teamSlots[slotIndex] = {
            chestNumber,
            error: `Student is ${student.category || "unknown"} category`,
          };
        } else {
          const alreadyInTeam = teamSlots.some(
            (slot, index) =>
              index !== slotIndex && slot.studentId === student.id
          );

          if (alreadyInTeam) {
            teamSlots[slotIndex] = {
              chestNumber,
              error: "Already added in another slot",
            };
          } else {
            const used = getStudentUsage(
              student,
              activeCategory,
              programmeDivision
            );

            if (
              personalLimit !== Infinity &&
              used >= personalLimit &&
              !student.assignedPrograms?.some(
                (program) => program.programId === selectedProgramId
              )
            ) {
              teamSlots[slotIndex] = {
                chestNumber,
                error: `Personal ${programmeDivision} limit reached (${used}/${personalLimit})`,
              };
            } else {
              teamSlots[slotIndex] = {
                chestNumber,
                studentId: student.id,
                studentName: student.name,
                class: student.class,
                admissionNumber: student.admissionNumber,
              };
            }
          }
        }
      }

      return { ...previous, [teamId]: teamSlots };
    });
  };

  // Download the Excel template for bulk candidate assignment.
  const downloadBulkCandidatesTemplate = () => {
    const rows = [
      {
        "Program Code": "B001",
        "Team Name": "Al Hambra",
        "Chest Number": "101",
      },
      {
        "Program Code": "T002",
        "Team Name": "Samarra",
        "Chest Number": "102",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Candidate Assignments"
    );

    XLSX.writeFile(
      workbook,
      "Fanmeni_Bulk_Candidates_Template.xlsx"
    );
  };

  // Admin-only import: one spreadsheet can contain multiple programmes.
  const handleBulkCandidatesExcelImport = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!isAdmin) {
      setMessage({
        type: "error",
        text: "Only admins can use bulk candidate import.",
      });
      return;
    }

    setBulkImportingExcel(true);
    setMessage({ type: "", text: "" });

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        throw new Error("The spreadsheet is empty.");
      }

      const normalizeHeader = (header) =>
        normalize(header).replace(/[_-]+/g, " ");

      const getCell = (row, names) => {
        const keys = Object.keys(row);

        const key = keys.find((item) =>
          names.includes(normalizeHeader(item))
        );

        return key ? String(row[key] ?? "").trim() : "";
      };

      const requiredHeaders = [
        "program code",
        "team name",
        "chest number",
      ];

      const headers = Object.keys(rows[0]).map(normalizeHeader);

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length) {
        throw new Error(
          `Missing required column(s): ${missingHeaders.join(", ")}. Download the template for the correct format.`
        );
      }

      const allPrograms = [
        ...(artsPrograms || []),
        ...(sportsPrograms || []),
      ];

      const programByCode = new Map();

      allPrograms.forEach((program) => {
        const code = normalize(program.code);

        if (code) {
          programByCode.set(code, program);
        }
      });

      const teamByName = new Map();

      (teams || []).forEach((team) => {
        const name = normalize(getTeamName(team));

        if (name) {
          teamByName.set(name, team);
        }
      });

      const studentByChest = new Map();

      (students || []).forEach((student) => {
        const chest = normalize(student.chestNumber);

        if (chest) {
          studentByChest.set(chest, student);
        }
      });

      const errors = [];
      const grouped = new Map();
      const seenRows = new Set();

      rows.forEach((row, index) => {
        const line = index + 2;

        const programCode = getCell(row, [
          "program code",
          "programcode",
          "code",
        ]).toUpperCase();

        const teamName = getCell(row, [
          "team name",
          "team",
          "teamname",
        ]);

        const chestNumber = getCell(row, [
          "chest number",
          "chest no",
          "chest #",
          "chestnumber",
        ]);

        if (!programCode && !teamName && !chestNumber) {
          return;
        }

        if (!programCode || !teamName || !chestNumber) {
          errors.push(
            `Row ${line}: Program Code, Team Name, and Chest Number are all required.`
          );
          return;
        }

        const program = programByCode.get(normalize(programCode));
        const team = teamByName.get(normalize(teamName));
        const student = studentByChest.get(normalize(chestNumber));

        if (!program) {
          errors.push(
            `Row ${line}: programme code "${programCode}" was not found.`
          );
          return;
        }

        if (!team) {
          errors.push(
            `Row ${line}: team "${teamName}" was not found.`
          );
          return;
        }

        if (!student) {
          errors.push(
            `Row ${line}: chest number "${chestNumber}" was not found.`
          );
          return;
        }

        if (student.teamId !== team.id) {
          errors.push(
            `Row ${line}: student ${chestNumber} does not belong to team "${teamName}".`
          );
          return;
        }

        const programCategory = normalizeCategory(program) || "General";

        if (!studentCategoryMatches(student, programCategory)) {
          errors.push(
            `Row ${line}: student ${chestNumber} is in ${student.category || "unknown"} category, but ${program.code} is ${normalizeCategory(program)}.`
          );
          return;
        }

        const rowKey = `${program.id}::${team.id}::${student.id}`;

        if (seenRows.has(rowKey)) {
          errors.push(
            `Row ${line}: student ${chestNumber} is duplicated for ${program.code} / ${teamName}.`
          );
          return;
        }

        seenRows.add(rowKey);

        if (!grouped.has(program.id)) {
          grouped.set(program.id, {
            program,
            teams: new Map(),
          });
        }

        const group = grouped.get(program.id);

        if (!group.teams.has(team.id)) {
          group.teams.set(team.id, []);
        }

        group.teams.get(team.id).push({
          studentId: student.id,
          studentName: student.name,
          chestNumber: String(
            student.chestNumber ?? chestNumber
          ).trim(),
          class: student.class,
          admissionNumber: student.admissionNumber,
        });
      });

      if (!grouped.size && !errors.length) {
        throw new Error("No valid assignment rows were found.");
      }

      if (errors.length) {
        const preview = errors.slice(0, 8).join(" ");

        throw new Error(
          `${errors.length} validation error(s). Nothing was saved. ${preview}${errors.length > 8 ? " See the spreadsheet for remaining errors." : ""}`
        );
      }

      // Validate all incoming assignments before writing any documents.
      for (const { program, teams: teamMap } of grouped.values()) {
        const existing = (candidates || []).find(
          (candidate) => candidate.programId === program.id
        );

        const limit = getProgrammeLimit(program.code);

        for (const [teamId, incoming] of teamMap.entries()) {
          const previous =
            existing?.teamCandidates?.[teamId] || [];

          const merged =
            excelImportMode === "replace"
              ? incoming
              : [
                  ...previous,
                  ...incoming.filter(
                    (item) =>
                      !previous.some(
                        (saved) => saved.studentId === item.studentId
                      )
                  ),
                ];

          const team = teams.find((item) => item.id === teamId);

          if (limit !== Infinity && merged.length > limit) {
            throw new Error(
              `${getTeamName(team) || "Team"} exceeds the ${limit}-candidate limit for ${program.code}. Nothing was saved.`
            );
          }

          const division = getProgrammeDivision(program.code);
          const category = normalizeCategory(program);

          for (const item of incoming) {
            const student = students.find(
              (entry) => entry.id === item.studentId
            );

            const alreadyAssignedToProgram = previous.some(
              (saved) => saved.studentId === item.studentId
            );

            if (student && !alreadyAssignedToProgram) {
              const usage = getStudentUsage(
                student,
                category,
                division
              );

              const personalLimitForStudent = getPersonalLimit(
                category,
                program.code
              );

              if (
                personalLimitForStudent !== Infinity &&
                usage >= personalLimitForStudent
              ) {
                throw new Error(
                  `Student chest ${item.chestNumber} has reached the personal ${division} limit (${usage}/${personalLimitForStudent}). Nothing was saved.`
                );
              }
            }
          }
        }
      }

      // Save each programme while preserving assignments for other teams.
      for (const { program, teams: teamMap } of grouped.values()) {
        const existing = (candidates || []).find(
          (candidate) => candidate.programId === program.id
        );

        const teamCandidates = {
          ...(existing?.teamCandidates || {}),
        };

        for (const [teamId, incoming] of teamMap.entries()) {
          const previous =
            existing?.teamCandidates?.[teamId] || [];

          teamCandidates[teamId] =
            excelImportMode === "replace"
              ? incoming
              : [
                  ...previous,
                  ...incoming.filter(
                    (item) =>
                      !previous.some(
                        (saved) => saved.studentId === item.studentId
                      )
                  ),
                ];
        }

        const totalCandidates = Object.values(teamCandidates).reduce(
          (sum, list) =>
            sum + (Array.isArray(list) ? list.length : 0),
          0
        );

        const data = {
          programId: program.id,
          programName: program.name || program.program,
          programCode: program.code,
          category: normalizeCategory(program),
          type: program.type,
          moduleType:
            program.moduleType ||
            ((sportsPrograms || []).some(
              (item) => item.id === program.id
            )
              ? "sports"
              : "arts"),
          teamCandidates,
          totalCandidates,
          groupsPerTeam: program.groupsPerTeam || 1,
          candidatesPerGroup: program.candidatesPerGroup || 1,
        };

        const result = await setDocument(
          COLLECTIONS.PARTICIPANTS,
          existing?.id || program.id,
          data
        );

        if (!result?.success) {
          throw new Error(
            result?.error || `Could not save programme ${program.code}.`
          );
        }
      }

      await syncStudentPrograms();

      setMessage({
        type: "success",
        text: `Imported assignments for ${grouped.size} programme(s). Mode: ${excelImportMode === "merge" ? "Merge" : "Replace"}. Student profiles synced.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Excel import failed.",
      });
    } finally {
      setBulkImportingExcel(false);
    }
  };

  const handleSave = async () => {
    if (!currentProgram) return;

    setMessage({ type: "", text: "" });

    const teamCandidates = {};
    let totalCount = 0;
    let hasError = false;

    Object.entries(slotsByTeam).forEach(([teamId, slots]) => {
      const validSlots = slots.filter((slot) => slot.studentId);
      const errorSlots = slots.filter(
        (slot) => slot.chestNumber && slot.error
      );

      if (errorSlots.length > 0) {
        hasError = true;
      }

      if (validSlots.length > 0) {
        teamCandidates[teamId] = validSlots.map((slot) => ({
          studentId: slot.studentId,
          studentName: slot.studentName,
          chestNumber: slot.chestNumber,
          class: slot.class,
          admissionNumber: slot.admissionNumber,
        }));

        totalCount += validSlots.length;
      }
    });

    if (isCaptain && !captainTeamId) {
      setMessage({
        type: "error",
        text: "Your assigned team could not be resolved. Please ask an admin to re-save your captain team assignment.",
      });
      return;
    }

    if (
      isCaptain &&
      Object.keys(teamCandidates).some(
        (teamId) => teamId !== captainTeamId
      )
    ) {
      setMessage({
        type: "error",
        text: "You can only assign candidates from your own team.",
      });
      return;
    }

    if (hasError) {
      setMessage({
        type: "error",
        text: "Please fix invalid chest numbers before saving",
      });
      return;
    }

    if (totalCount === 0) {
      setMessage({
        type: "error",
        text: "Please add at least one candidate",
      });
      return;
    }

    if (programmeLimit !== Infinity) {
      for (const teamId of Object.keys(teamCandidates)) {
        const existingCount = getExistingTeamCount(teamId);

        if (
          existingCount + teamCandidates[teamId].length >
          programmeLimit
        ) {
          const team = visibleTeams.find(
            (item) => item.id === teamId
          );

          setMessage({
            type: "error",
            text: `${getTeamName(team) || "Team"}: ${currentProgram.code || currentProgram.name} allows only ${programmeLimit} candidates per team. Current: ${existingCount}.`,
          });

          setSaving(false);
          return;
        }
      }
    }

    setSaving(true);

    try {
      const docId = existingCandidate?.id || currentProgram.id;

      const captainAssignments = isCaptain
        ? teamCandidates[captainTeamId] || []
        : null;

      const data = {
        programId: currentProgram.id,
        programName: currentProgram.name || currentProgram.program,
        programCode: currentProgram.code,
        category: normalizeCategory(currentProgram),
        type: currentProgram.type,
        moduleType: currentProgram.moduleType || moduleType,
        teamCandidates: isCaptain
          ? { [captainTeamId]: captainAssignments }
          : teamCandidates,
        totalCandidates: isCaptain
          ? captainAssignments.length
          : totalCount,
        groupsPerTeam: currentProgram.groupsPerTeam || 1,
        candidatesPerGroup: currentProgram.candidatesPerGroup || 1,
      };

      if (isCaptain && existingCandidate?.teamCandidates) {
        data.teamCandidates = {
          ...existingCandidate.teamCandidates,
          [captainTeamId]: captainAssignments,
        };

        data.totalCandidates = Object.values(
          data.teamCandidates
        ).reduce(
          (sum, list) =>
            sum + (Array.isArray(list) ? list.length : 0),
          0
        );
      }

      const result = await setDocument(
        COLLECTIONS.PARTICIPANTS,
        docId,
        data
      );

      if (result.success) {
        await syncStudentPrograms();

        setMessage({
          type: "success",
          text: isCaptain
            ? `✅ ${captainAssignments.length} candidate(s) assigned for admin review!`
            : `✅ ${totalCount} candidate(s) assigned & profiles updated!`,
        });

        setTimeout(
          () => setMessage({ type: "", text: "" }),
          3000
        );
      } else {
        setMessage({
          type: "error",
          text: result.error,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
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
      setMessage({
        type: "error",
        text: "Captains cannot clear candidate assignments. Submit the required candidates and ask admin to make changes if needed.",
      });
      return;
    }

    if (
      !confirm(
        "Delete all candidate assignments for this program?"
      )
    ) {
      return;
    }

    await deleteDocument(
      COLLECTIONS.PARTICIPANTS,
      existingCandidate.id
    );

    await syncStudentPrograms();

    setSelectedProgramId("");

    setMessage({
      type: "success",
      text: "Cleared successfully",
    });

    setTimeout(
      () => setMessage({ type: "", text: "" }),
      3000
    );
  };

  const isProgramAssigned = (programId) =>
    candidates.some((candidate) => candidate.programId === programId);

  const moduleLabel = moduleType === "arts" ? "Arts" : "Riyadha";

  const moduleGradient =
    moduleType === "arts"
      ? "from-purple-500 to-pink-600"
      : "from-blue-500 to-indigo-600";

  const currentTeamCount =
    isCaptain && captainTeamId
      ? getExistingTeamCount(captainTeamId)
      : null;

  const selectedCount =
    isCaptain && captainTeamId
      ? (slotsByTeam[captainTeamId] || []).filter(
          (slot) => slot.studentId
        ).length
      : null;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${moduleGradient}`}
          >
            <UserPlus className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Assign Candidates
            </h1>

            <p className="text-sm text-gray-500">
              {isCaptain
                ? "Assign your team's existing students to Arts and Riyadha programmes."
                : "Assign students to programs by Category & Type"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setModuleType("arts")}
            className={
              moduleType === "arts"
                ? "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl"
                : "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-white border-2 border-gray-200 text-gray-700"
            }
          >
            <Palette className="w-6 h-6" />
            <div className="text-left">
              <div>Arts</div>
              <div className="text-[10px] font-medium opacity-80">
                {artsPrograms.length} programs
              </div>
            </div>
          </button>

          <button
            onClick={() => setModuleType("sports")}
            className={
              moduleType === "sports"
                ? "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl"
                : "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black bg-white border-2 border-gray-200 text-gray-700"
            }
          >
            <Trophy className="w-6 h-6" />
            <div className="text-left">
              <div>Riyadha</div>
              <div className="text-[10px] font-medium opacity-80">
                {sportsPrograms.length} programs
              </div>
            </div>
          </button>
        </div>

        {isCaptain && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <b>Team:</b>{" "}
            {getTeamName(captainTeam) ||
              profile?.teamName ||
              "Your assigned team"}{" "}
            · Only your team's students can be assigned.
          </div>
        )}

        {isAdmin && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                <FileSpreadsheet className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900">
                  Bulk candidate assignment (Admin)
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Import one Excel sheet to assign students to multiple Arts
                  and Riyadha programmes.
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Required columns: <b>Program Code</b>,{" "}
                  <b>Team Name</b>, <b>Chest Number</b>. Use one row per
                  student-programme assignment.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={downloadBulkCandidatesTemplate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download Excel Template
                  </button>

                  <label
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 ${
                      bulkImportingExcel
                        ? "pointer-events-none opacity-60"
                        : ""
                    }`}
                  >
                    <FileUp className="h-4 w-4" />
                    {bulkImportingExcel
                      ? "Importing..."
                      : "Import Excel Sheet"}

                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleBulkCandidatesExcelImport}
                      disabled={bulkImportingExcel}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                      Import mode:
                    </span>

                    <select
                      value={excelImportMode}
                      onChange={(event) =>
                        setExcelImportMode(event.target.value)
                      }
                      disabled={bulkImportingExcel}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="merge">Merge (keep existing)</option>
                      <option value="replace">Replace listed teams</option>
                    </select>
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  The whole sheet is validated before saving. Replace mode
                  replaces assignments only for teams included in the sheet;
                  other teams are preserved.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          {CATEGORY_TABS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? `px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r ${moduleGradient} text-white shadow-md`
                  : "px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
              }
            >
              {category}
            </button>
          ))}
        </div>

        {message.text && (
          <div
            className={
              message.type === "success"
                ? "mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm font-medium"
                : "mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2 text-sm font-medium"
            }
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Type
              </label>

              <div className="grid grid-cols-2 gap-2">
                {PROGRAM_TYPES_ALL.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={
                      activeType === type
                        ? `px-3 py-2 rounded-lg font-medium text-sm bg-gradient-to-r ${moduleGradient} text-white`
                        : "px-3 py-2 rounded-lg font-medium text-sm bg-gray-50 text-gray-700 border border-gray-200"
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedProgramId}
                  onChange={(event) =>
                    setSelectedProgramId(event.target.value)
                  }
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                >
                  <option value="">
                    -- Select {moduleLabel} Program ({filteredPrograms.length}{" "}
                    available) --
                  </option>

                  {filteredPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.code && `[${program.code}] `}
                      {program.name || program.program}
                      {isProgramAssigned(program.id) ? "  ✓" : ""}
                    </option>
                  ))}
                </select>

                {currentProgram?.code && (
                  <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-700 flex items-center">
                    {currentProgram.code}
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentProgram && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                📚 {normalizeCategory(currentProgram) || activeCategory}
              </span>

              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                👥 {currentProgram.type}
              </span>

              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">
                🎯{" "}
                {programmeLimit === Infinity
                  ? "Unlimited"
                  : `${currentTeamCount ?? 0}/${programmeLimit}`}{" "}
                team candidates
              </span>

              {isCaptain && (
                <span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg font-medium">
                  Personal {programmeDivision}:{" "}
                  {personalLimit === Infinity
                    ? "Unlimited"
                    : `${personalLimit} max`}
                </span>
              )}

              <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg font-medium">
                {maxSlots} assignment slot{maxSlots > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {currentProgram ? (
          <>
            {visibleTeams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500">
                  No assigned team found for this captain.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div
                      className="px-5 py-3 flex items-center gap-3"
                      style={{
                        background: `linear-gradient(90deg, ${
                          team.color || "#10b981"
                        }15, transparent)`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                        style={{
                          backgroundColor: team.color || "#10b981",
                        }}
                      >
                        <Shield className="w-4 h-4" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {getTeamName(team)}
                        </h3>

                        {isCaptain && (
                          <p className="text-xs text-gray-500">
                            Your team only
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 font-medium">
                        {(slotsByTeam[team.id] || []).filter(
                          (slot) => slot.studentId
                        ).length}{" "}
                        / {maxSlots}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      {(slotsByTeam[team.id] || []).map((slot, index) => (
                        <SlotRow
                          key={index}
                          slotNumber={index + 1}
                          slot={slot}
                          onChange={(chestNumber) =>
                            handleChestInput(
                              team.id,
                              index,
                              chestNumber
                            )
                          }
                          program={currentProgram}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              {existingCandidate && !isCaptain && (
                <button
                  onClick={handleClearAll}
                  className="px-5 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || (isCaptain && selectedCount === 0)}
                className={`px-8 py-3 bg-gradient-to-r ${moduleGradient} text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2`}
              >
                <Save className="w-5 h-5" />
                {saving
                  ? "Saving..."
                  : isCaptain
                    ? "Submit Candidates"
                    : "Save Candidates"}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <p className="text-gray-500 font-medium">
              Select a {moduleLabel.toLowerCase()} program above to assign
              candidates
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Module: <b>{moduleLabel}</b> • Category: <b>{activeCategory}</b>{" "}
              • Type: <b>{activeType}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getSlotCount(program) {
  if (!program) return 1;

  if (
    program.type === "Personal Group" ||
    program.type === "Group"
  ) {
    return (
      (Number(program.groupsPerTeam) || 1) *
      (Number(program.candidatesPerGroup) || 1)
    );
  }

  if (program.type === "General") {
    return Number(program.groupsPerTeam) || 1;
  }

  return (
    Number(program.participantsPerTeam) ||
    Number(program.count) ||
    1
  );
}

function SlotRow({ slotNumber, slot, onChange, program }) {
  const hasValue = !!slot.chestNumber;
  const isValid = !!slot.studentId;
  const hasError = hasValue && slot.error;

  const inputClass = `w-full px-3 py-2 border rounded-lg outline-none text-center font-mono font-bold text-sm ${
    hasError
      ? "border-red-300 bg-red-50 text-red-700"
      : isValid
        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
        : "border-gray-200 bg-white text-gray-800"
  }`;

  let slotLabel = `Slot ${slotNumber}`;

  if (
    program?.type === "Personal Group" ||
    program?.type === "Group"
  ) {
    const perGroup = Number(program.candidatesPerGroup) || 1;

    slotLabel = `Group ${Math.floor(
      (slotNumber - 1) / perGroup
    ) + 1} • Member ${((slotNumber - 1) % perGroup) + 1}`;
  } else if (
    program?.type === "General" &&
    Number(program.groupsPerTeam) > 1
  ) {
    slotLabel = `Entry ${slotNumber}`;
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <div className="col-span-2 md:col-span-1 flex items-center justify-center">
        <span className="w-8 h-8 bg-gray-100 text-gray-600 font-bold rounded-lg flex items-center justify-center text-xs">
          {slotNumber}
        </span>
      </div>

      <div className="col-span-3">
        <input
          type="text"
          placeholder="Chest #"
          value={slot.chestNumber || ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="col-span-4 md:col-span-5">
        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm min-h-[38px] flex items-center gap-2">
          {isValid ? (
            <>
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-gray-800 truncate">
                {slot.studentName}
              </span>
            </>
          ) : hasError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-600 text-xs truncate">
                {slot.error}
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-xs">
              Auto-filled name
            </span>
          )}
        </div>
      </div>

      <div className="col-span-3">
        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-xs min-h-[38px] flex items-center">
          {isValid ? (
            <div className="truncate text-gray-600">
              {slot.class && (
                <span className="font-medium">
                  Class {slot.class}
                </span>
              )}

              {slot.admissionNumber && (
                <span className="ml-2 text-gray-400">
                  #{slot.admissionNumber}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-[10px] truncate">
              {slotLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}