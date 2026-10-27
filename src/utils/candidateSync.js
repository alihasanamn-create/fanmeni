// ============================================
// FANMENI - Candidate → student profile sync
// ============================================

import { getAllDocuments, batchWrite, getDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { auth } from "../firebase/config";

const normalizeTeamName = (name = "") => String(name || "").trim().toLowerCase();
const getTeamName = (team = {}) => team.name || team.teamName || team.title || team.displayName || "";

/** Resolve the captain's real current team ID, including legacy team-name records. */
const resolveCaptainTeamId = async (captainData, teams) => {
  const storedTeamId = captainData?.teamId || null;
  const storedTeamName = captainData?.teamName || captainData?.team || "";

  if (storedTeamId) {
    const byId = teams.find((team) => team.id === storedTeamId);
    if (byId) {
      const liveName = getTeamName(byId);
      if (!storedTeamName || normalizeTeamName(liveName) === normalizeTeamName(storedTeamName)) {
        return byId.id;
      }
    }
  }

  if (!storedTeamName) return null;
  const byName = teams.find(
    (team) => normalizeTeamName(getTeamName(team)) === normalizeTeamName(storedTeamName)
  );
  return byName?.id || null;
};

/**
 * Rebuild assignedPrograms for students after candidate assignment changes.
 * Admins sync every student. Captains sync only students belonging to their
 * resolved team, so candidate editing never becomes a general student edit.
 */
export const syncStudentPrograms = async () => {
  try {
    const [candidatesRes, studentsRes, teamsRes] = await Promise.all([
      getAllDocuments(COLLECTIONS.PARTICIPANTS),
      getAllDocuments(COLLECTIONS.STUDENTS),
      getAllDocuments(COLLECTIONS.TEAMS),
    ]);

    if (!candidatesRes.success || !studentsRes.success || !teamsRes.success) {
      return { success: false, error: "Failed to load data" };
    }

    const candidates = candidatesRes.data;
    const students = studentsRes.data;
    const teams = teamsRes.data;

    let captainTeamId = null;
    if (auth.currentUser?.uid) {
      const captainRes = await getDocument(COLLECTIONS.CAPTAINS, auth.currentUser.uid);
      if (captainRes.success && captainRes.data?.role === "captain" && captainRes.data?.active !== false) {
        captainTeamId = await resolveCaptainTeamId(captainRes.data, teams);
      }
    }

    const studentPrograms = {};
    students.forEach((student) => {
      if (!captainTeamId || student.teamId === captainTeamId) {
        studentPrograms[student.id] = [];
      }
    });

    candidates.forEach((assignment) => {
      const programInfo = {
        programId: assignment.programId,
        programName: assignment.programName,
        programCode: assignment.programCode,
        category: assignment.category,
        type: assignment.type,
        moduleType: assignment.moduleType,
      };

      Object.entries(assignment.teamCandidates || {}).forEach(([teamId, teamStudents]) => {
        if (captainTeamId && teamId !== captainTeamId) return;
        (teamStudents || []).forEach((entry) => {
          if (entry.studentId && Object.prototype.hasOwnProperty.call(studentPrograms, entry.studentId)) {
            studentPrograms[entry.studentId].push(programInfo);
          }
        });
      });
    });

    const operations = Object.entries(studentPrograms).map(([studentId, programs]) => ({
      type: "update",
      collectionName: COLLECTIONS.STUDENTS,
      docId: studentId,
      data: { assignedPrograms: programs, programsCount: programs.length },
    }));

    if (operations.length > 0) {
      const result = await batchWrite(operations);
      if (!result.success) return result;
    }

    return { success: true, totalStudents: operations.length };
  } catch (error) {
    console.error("Student program sync error:", error);
    return { success: false, error: error.message };
  }
};
