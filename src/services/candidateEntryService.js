
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import {
  getProgrammeLimit,
  getProgrammeDivision,
  getPersonalLimit,
} from "../constants/programmeLimits";

const entriesRef = collection(db, COLLECTIONS.CANDIDATE_ENTRIES);
const studentsRef = collection(db, COLLECTIONS.STUDENTS);

export async function getTeamProgrammeEntries(teamId, programmeId) {
  const q = query(entriesRef, where("teamId", "==", teamId), where("programmeId", "==", programmeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTeamEntries(teamId) {
  const q = query(entriesRef, where("teamId", "==", teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getTeamStudents(teamId) {
  const q = query(studentsRef, where("teamId", "==", teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function programmeCategory(programme) {
  return String(programme?.category || programme?.programCategory || programme?.studentCategory || "").trim();
}

function normaliseAssignedProgram(program) {
  return {
    programId: program?.programId || program?.programmeId || "",
    programCode: String(program?.programCode || program?.programmeCode || program?.code || "").toUpperCase(),
    category: String(program?.category || "").trim(),
  };
}

function buildStudentProgramSets(teamStudents, entries) {
  const map = new Map();
  teamStudents.forEach((student) => {
    const set = new Map();
    (student.assignedPrograms || []).forEach((program) => {
      const item = normaliseAssignedProgram(program);
      if (item.programId) set.set(item.programId, item);
    });
    map.set(student.id, set);
  });
  entries.filter((entry) => (entry.status || "submitted") !== "rejected").forEach((entry) => {
    const item = normaliseAssignedProgram(entry);
    if (!item.programId) return;
    (entry.studentIds || []).forEach((studentId) => {
      if (!map.has(studentId)) return;
      map.get(studentId).set(item.programId, item);
    });
  });
  return map;
}

function countDivisionPrograms(programMap, category, division) {
  let count = 0;
  for (const item of programMap.values()) {
    if (String(item.category || "").trim() !== category) continue;
    if (getProgrammeDivision(item.programCode) === division) count += 1;
  }
  return count;
}

export async function submitCandidateEntry({ captainId, captainName, teamId, teamName, module, programme, students }) {
  if (!captainId || !teamId || !programme?.id) throw new Error("Missing captain, team, or programme information.");
  if (!Array.isArray(students) || students.length === 0) throw new Error("Select at least one candidate.");

  const uniqueIds = new Set(students.map((student) => student.id));
  if (uniqueIds.size !== students.length) throw new Error("A candidate cannot be selected more than once.");

  const teamStudents = await getTeamStudents(teamId);
  const teamStudentIds = new Set(teamStudents.map((student) => student.id));
  if (students.some((student) => !teamStudentIds.has(student.id))) throw new Error("Only students from your own team can be assigned.");

  const allTeamEntries = await getTeamEntries(teamId);
  const activeEntries = allTeamEntries.filter((entry) => (entry.status || "submitted") !== "rejected");

  const teamProgrammeIds = new Set();
  activeEntries.filter((entry) => entry.programmeId === programme.id).forEach((entry) => (entry.studentIds || []).forEach((id) => teamProgrammeIds.add(id)));
  teamStudents.forEach((student) => {
    (student.assignedPrograms || []).forEach((assigned) => {
      if ((assigned.programId || assigned.programmeId) === programme.id) teamProgrammeIds.add(student.id);
    });
  });

  const newCandidateIds = students.map((student) => student.id);
  if (newCandidateIds.some((id) => teamProgrammeIds.has(id))) throw new Error("One or more selected candidates are already assigned to this programme.");

  const limit = getProgrammeLimit(programme.code);
  const totalAfterSubmission = teamProgrammeIds.size + students.length;
  if (limit !== Infinity && totalAfterSubmission > limit) throw new Error(`Max ${limit} candidates allowed per team. ${Math.max(0, limit - teamProgrammeIds.size)} slot(s) remain.`);

  const category = programmeCategory(programme);
  const division = getProgrammeDivision(programme.code);
  const personalLimit = getPersonalLimit(category, programme.code);
  const studentProgramSets = buildStudentProgramSets(teamStudents, activeEntries);

  if (personalLimit !== Infinity && division) {
    for (const student of students) {
      const programSet = studentProgramSets.get(student.id) || new Map();
      const alreadyHasProgram = programSet.has(programme.id);
      const currentCount = countDivisionPrograms(programSet, category, division);
      const projectedCount = currentCount + (alreadyHasProgram ? 0 : 1);
      if (projectedCount > personalLimit) throw new Error(`${student.name || student.studentName || "This student"} has reached the ${category} ${division === "stage" ? "stage" : "non-stage"} limit of ${personalLimit}.`);
    }
  }

  return addDoc(entriesRef, {
    captainId, captainName, teamId, teamName: teamName || "", module: module || "",
    programmeId: programme.id, programmeName: programme.name || programme.title || "",
    programmeCode: String(programme.code || "").toUpperCase(), category, type: programme.type || "",
    studentIds: newCandidateIds, students: students.map((s) => ({ id: s.id, name: s.name || s.studentName || "", chestNumber: s.chestNumber || "" })),
    status: "submitted", createdAt: serverTimestamp(),
  });
}

export async function deleteCandidateEntry(entryId) {
  const docRef = doc(db, COLLECTIONS.CANDIDATE_ENTRIES, entryId);
  return await deleteDoc(docRef);
}
