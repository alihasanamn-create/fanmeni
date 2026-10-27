// ============================================
// FILE: src/utils/pointsCalculator.js
// PURPOSE: Separate Arts vs Sports points calculation
//
// RULES:
// - Arts points → Team Grand Total → FANMENI Champion
// - Sports points → Riyadha Total → Riyadha Champion
// - Sports does NOT count in Grand Total or FANMENI Topper
// - Personal Points: arts only = FANMENI Topper
// - Personal Points: sports only = separate Riyadha ranking
// ============================================

import { POINTS, COLLECTIONS } from "../firebase/collections";
import { getAllDocuments, batchWrite } from "../firebase/firestore";

// Get position points (0 if grades_only)
const getPositionPoints = (result, position) => {
  if (result.resultType === "grades_only") return 0;
  const type = result.type || "Individual";
  const typePoints = POINTS[type] || {};
  return typePoints[position] || 0;
};

// Get grade points (0 if positions_only)
const getGradePoints = (result, grade) => {
  if (result.resultType === "positions_only") return 0;
  return POINTS.grades[grade] || 0;
};

// ============================================
// RECALCULATE ALL TEAM POINTS
// artsPoints = only arts results (Grand Total)
// sportsPoints = only sports results (Riyadha)
// totalPoints = artsPoints ONLY (FANMENI Champion)
// ============================================
export const recalculateAllTeamPoints = async () => {
  try {
    const [resultsRes, teamsRes] = await Promise.all([
      getAllDocuments(COLLECTIONS.RESULTS),
      getAllDocuments(COLLECTIONS.TEAMS),
    ]);

    if (!resultsRes.success || !teamsRes.success) {
      return { success: false, error: "Failed to load data" };
    }

    const results = resultsRes.data;
    const teams = teamsRes.data;

    // Initialize both counters for each team
    const artsPoints = {};
    const sportsPoints = {};
    teams.forEach((t) => {
      artsPoints[t.id] = 0;
      sportsPoints[t.id] = 0;
    });

    results.forEach((result) => {
      // Skip drafts
      if (result.status === "draft") return;

      const type = result.type || "Individual";
      const isPersonalGroup = type === "Personal Group";
      const isArts = result.moduleType === "arts";
      const isSports = result.moduleType === "sports";

      // Choose which counter to update
      const pointsMap = isArts ? artsPoints : isSports ? sportsPoints : null;
      if (!pointsMap) return;

      ["first", "second", "third"].forEach((position) => {
        const winners = result.positions?.[position] || [];

        winners.forEach((winner) => {
          const posPts = getPositionPoints(result, position);
          const gradePts = getGradePoints(result, winner.grade);
          const totalPts = posPts + gradePts;

          // PERSONAL GROUP: team gets total once (shared among candidates)
          if (isPersonalGroup && winner.studentIds?.length > 0) {
            const teamId = winner.teamId;
            if (teamId && Object.prototype.hasOwnProperty.call(pointsMap, teamId)) {
              pointsMap[teamId] += totalPts;
            }
          }
          // INDIVIDUAL / GROUP / GENERAL
          else {
            const teamId = winner.teamId;
            if (teamId && Object.prototype.hasOwnProperty.call(pointsMap, teamId)) {
              pointsMap[teamId] += totalPts;
            }
          }
        });
      });

      // Additional grades
      (result.additionalGrades || []).forEach((item) => {
        const teamId = item.teamId;
        if (!teamId || !Object.prototype.hasOwnProperty.call(pointsMap, teamId)) return;
        pointsMap[teamId] += getGradePoints(result, item.grade);
      });
    });

    // Build batch update
    // totalPoints = artsPoints ONLY (not arts + sports)
    const operations = teams.map((team) => ({
      type: "update",
      collectionName: COLLECTIONS.TEAMS,
      docId: team.id,
      data: {
        artsPoints: Math.round((artsPoints[team.id] || 0) * 100) / 100,
        sportsPoints: Math.round((sportsPoints[team.id] || 0) * 100) / 100,
        totalPoints: Math.round((artsPoints[team.id] || 0) * 100) / 100,
      },
    }));

    if (operations.length > 0) await batchWrite(operations);

    return { success: true, artsPoints, sportsPoints };
  } catch (error) {
    console.error("Team points error:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// RECALCULATE ALL STUDENT POINTS
// artsPersonalPoints = only arts (FANMENI Topper)
// sportsPersonalPoints = only sports (Riyadha ranking)
// totalPoints = artsPersonalPoints ONLY
// ============================================
export const recalculateAllStudentPoints = async () => {
  try {
    const [resultsRes, studentsRes] = await Promise.all([
      getAllDocuments(COLLECTIONS.RESULTS),
      getAllDocuments(COLLECTIONS.STUDENTS),
    ]);

    if (!resultsRes.success || !studentsRes.success) {
      return { success: false, error: "Failed to load data" };
    }

    const results = resultsRes.data.filter((r) => r.status !== "draft");
    const students = studentsRes.data;

    // Initialize both counters
    const artsPoints = {};
    const sportsPoints = {};
    students.forEach((s) => {
      artsPoints[s.id] = 0;
      sportsPoints[s.id] = 0;
    });

    results.forEach((result) => {
      const type = result.type || "Individual";
      const isPersonalGroup = type === "Personal Group";
      const isArts = result.moduleType === "arts";
      const isSports = result.moduleType === "sports";

      const pointsMap = isArts ? artsPoints : isSports ? sportsPoints : null;
      if (!pointsMap) return;

      ["first", "second", "third"].forEach((position) => {
        const winners = result.positions?.[position] || [];

        winners.forEach((winner) => {
          const posPts = getPositionPoints(result, position);
          const gradePts = getGradePoints(result, winner.grade);
          const totalPts = posPts + gradePts;

          // INDIVIDUAL: student gets full points
          if (type === "Individual" && winner.studentId) {
            if (Object.prototype.hasOwnProperty.call(pointsMap, winner.studentId)) {
              pointsMap[winner.studentId] += totalPts;
            }
          }

          // PERSONAL GROUP: shared (total ÷ candidates)
          if (isPersonalGroup && winner.studentIds?.length > 0) {
            const sharedPts = totalPts / winner.studentIds.length;
            winner.studentIds.forEach((sid) => {
              if (Object.prototype.hasOwnProperty.call(pointsMap, sid)) {
                pointsMap[sid] += sharedPts;
              }
            });
          }

          // Group / General: only team gets points, not students
        });
      });

      // Additional grades
      (result.additionalGrades || []).forEach((item) => {
        if (item.studentId && Object.prototype.hasOwnProperty.call(pointsMap, item.studentId)) {
          pointsMap[item.studentId] += getGradePoints(result, item.grade);
        }
      });
    });

    // Build batch update
    // totalPoints = artsPersonalPoints ONLY
    const operations = students.map((student) => ({
      type: "update",
      collectionName: COLLECTIONS.STUDENTS,
      docId: student.id,
      data: {
        artsPersonalPoints:
          Math.round((artsPoints[student.id] || 0) * 100) / 100,
        sportsPersonalPoints:
          Math.round((sportsPoints[student.id] || 0) * 100) / 100,
        totalPoints:
          Math.round((artsPoints[student.id] || 0) * 100) / 100,
      },
    }));

    if (operations.length > 0) await batchWrite(operations);

    return { success: true, artsPoints, sportsPoints };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// RECALCULATE ALL
// ============================================
export const recalculateAll = async () => {
  const [teamResult, studentResult] = await Promise.all([
    recalculateAllTeamPoints(),
    recalculateAllStudentPoints(),
  ]);

  return {
    success: teamResult.success && studentResult.success,
    teams: teamResult,
    students: studentResult,
  };
};