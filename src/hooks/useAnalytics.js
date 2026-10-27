// ============================================
// FILE: src/hooks/useAnalytics.js
// PURPOSE: Compute analytics from all data
// ============================================

import { useMemo } from "react";
import { useTeams } from "./useTeams";
import { useStudents } from "./useStudents";
import { usePrograms } from "./usePrograms";
import { useResults } from "./useResults";
import { useCandidates } from "./useCandidates";
import { POINTS } from "../firebase/collections";

export function useAnalytics() {
  const { teams, loading: teamsLoading } = useTeams();
  const { students, loading: studentsLoading } = useStudents();
  const { programs: artsPrograms, loading: artsLoading } = usePrograms("arts");
  const { programs: sportsPrograms, loading: sportsLoading } = usePrograms("sports");
  const { results, loading: resultsLoading } = useResults();
  const { candidates, loading: candidatesLoading } = useCandidates();

  const loading =
    teamsLoading ||
    studentsLoading ||
    artsLoading ||
    sportsLoading ||
    resultsLoading ||
    candidatesLoading;

  const analytics = useMemo(() => {
    if (loading) return null;

    const allPrograms = [...artsPrograms, ...sportsPrograms];
    const publishedResults = results.filter((r) => r.status !== "draft");
    const publishedProgramIds = new Set(publishedResults.map((r) => r.programId));

    // ========== OVERVIEW STATS ==========
    const overview = {
      totalStudents: students.length,
      totalTeams: teams.length,
      totalPrograms: allPrograms.length,
      totalArtsPrograms: artsPrograms.length,
      totalSportsPrograms: sportsPrograms.length,
      totalResults: publishedResults.length,
      draftResults: results.filter((r) => r.status === "draft").length,
      pendingResults: allPrograms.length - publishedProgramIds.size,
      totalCandidateAssignments: candidates.reduce(
        (sum, c) => sum + (c.totalCandidates || 0),
        0
      ),
      completionRate: allPrograms.length
        ? Math.round((publishedProgramIds.size / allPrograms.length) * 100)
        : 0,
    };

    // ========== TEAM LEADERBOARD ==========
    const teamLeaderboard = [...teams]
      .map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        points: t.totalPoints || 0,
        studentsCount: students.filter((s) => s.teamId === t.id).length,
      }))
      .sort((a, b) => b.points - a.points);

    // ========== TOP STUDENTS ==========
    const topStudents = [...students]
      .filter((s) => (s.totalPoints || 0) > 0)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 10)
      .map((s) => {
        const team = teams.find((t) => t.id === s.teamId);
        return {
          id: s.id,
          name: s.name,
          chestNumber: s.chestNumber,
          points: s.totalPoints || 0,
          category: s.category,
          teamName: team?.name || "—",
          teamColor: team?.color || "#64748b",
          photoUrl: s.photoUrl,
        };
      });

    // ========== CATEGORY BREAKDOWN ==========
    const categoryStats = {
      Bidaya: {
        students: students.filter((s) => s.category === "Bidaya").length,
        programs: allPrograms.filter((p) => p.category === "Bidaya").length,
        published: publishedResults.filter((r) => r.category === "Bidaya").length,
      },
      Thaniya: {
        students: students.filter((s) => s.category === "Thaniya").length,
        programs: allPrograms.filter((p) => p.category === "Thaniya").length,
        published: publishedResults.filter((r) => r.category === "Thaniya").length,
      },
      General: {
        students: 0, // No General students
        programs: allPrograms.filter((p) => p.category === "General").length,
        published: publishedResults.filter((r) => r.category === "General").length,
      },
    };

    // ========== ARTS vs SPORTS ==========
    const moduleBreakdown = [
      {
        name: "Arts",
        programs: artsPrograms.length,
        published: publishedResults.filter((r) => r.moduleType === "arts").length,
        pending:
          artsPrograms.length -
          publishedResults.filter((r) => r.moduleType === "arts").length,
        color: "#a855f7",
      },
      {
        name: "Sports",
        programs: sportsPrograms.length,
        published: publishedResults.filter((r) => r.moduleType === "sports")
          .length,
        pending:
          sportsPrograms.length -
          publishedResults.filter((r) => r.moduleType === "sports").length,
        color: "#3b82f6",
      },
    ];

    // ========== PROGRAM TYPE BREAKDOWN ==========
    const programTypes = ["Individual", "Personal Group", "Group", "General"];
    const typeBreakdown = programTypes.map((type) => ({
      name: type,
      count: allPrograms.filter((p) => p.type === type).length,
    }));

    // ========== GRADE DISTRIBUTION ==========
    const gradeStats = { A: 0, B: 0, C: 0 };
    publishedResults.forEach((r) => {
      ["first", "second", "third"].forEach((pos) => {
        (r.positions?.[pos] || []).forEach((w) => {
          if (w.grade && Object.prototype.hasOwnProperty.call(gradeStats, w.grade)) {
            gradeStats[w.grade]++;
          }
        });
      });
      (r.additionalGrades || []).forEach((g) => {
        if (g.grade && Object.prototype.hasOwnProperty.call(gradeStats, g.grade)) {
          gradeStats[g.grade]++;
        }
      });
    });

    // ========== TEAM STUDENT DISTRIBUTION ==========
    const teamStudents = teams.map((t) => ({
      name: t.name,
      color: t.color,
      count: students.filter((s) => s.teamId === t.id).length,
      bidaya: students.filter(
        (s) => s.teamId === t.id && s.category === "Bidaya"
      ).length,
      thaniya: students.filter(
        (s) => s.teamId === t.id && s.category === "Thaniya"
      ).length,
    }));

    // ========== RECENT RESULTS ==========
    const recentResults = [...publishedResults]
      .sort((a, b) => {
        const at = a.updatedAt?.toMillis?.() || 0;
        const bt = b.updatedAt?.toMillis?.() || 0;
        return bt - at;
      })
      .slice(0, 5);

    // ========== POINTS DISTRIBUTION BY POSITION ==========
    const positionCounts = {
      first: 0,
      second: 0,
      third: 0,
    };
    publishedResults.forEach((r) => {
      positionCounts.first += (r.positions?.first || []).length;
      positionCounts.second += (r.positions?.second || []).length;
      positionCounts.third += (r.positions?.third || []).length;
    });

    return {
      overview,
      teamLeaderboard,
      topStudents,
      categoryStats,
      moduleBreakdown,
      typeBreakdown,
      gradeStats,
      teamStudents,
      recentResults,
      positionCounts,
    };
  }, [
    teams,
    students,
    artsPrograms,
    sportsPrograms,
    results,
    candidates,
    loading,
  ]);

  return { analytics, loading };
}