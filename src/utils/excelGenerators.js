
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const downloadWorkbook = (sheets, filename) => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name));
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
};

const safeName = (settings) => String(settings?.festivalName || "FANMENI").replace(/[\\/:*?"<>|]/g, "_");

/**
 * Exports current candidate assignments to an Excel file
 */
export const generateCandidatesExcel = (candidates = [], programs = [], moduleType, settings = {}, teams = []) => {
  const data = [["Program Code", "Program Name", "Team", "Chest Number", "Candidate Name"]];
  
  programs.forEach(prog => {
    const progCandidates = candidates.filter(c => c.programId === prog.id);
    progCandidates.forEach(c => {
      data.push([
        prog.code || prog.programmeCode, 
        prog.name || prog.title || prog.program, 
        c.teamName || "Unassigned", 
        c.chestNumber, 
        c.name || c.studentName
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Assignments");
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${settings.festivalName || 'Fest'}_Assignments.xlsx`);
};

export const generateTeamsExcel = (teams = [], students = [], settings = {}) => {
  downloadWorkbook([{ name: "Teams", rows: [["Team", "Code", "Students", "Total Points"], ...teams.map((team) => [team.name || "", team.code || "", students.filter((student) => student.teamId === team.id).length, team.totalPoints || 0])]}], `${safeName(settings)}_teams.xlsx`);
};

export const generateStudentsExcel = (students = [], teams = [], settings = {}) => {
  const names = new Map(teams.map((team) => [team.id, team.name]));
  downloadWorkbook([{ name: "Students", rows: [["Chest Number", "Name", "Class", "Division", "Category", "Team", "Points"], ...students.map((student) => [student.chestNumber || "", student.name || student.studentName || "", student.class || "", student.division || "", student.category || "", student.teamName || names.get(student.teamId) || "", student.totalPoints || 0])]}], `${safeName(settings)}_students.xlsx`);
};

export const generateProgramsExcel = (programs = [], module = "arts", settings = {}) => {
  downloadWorkbook([{ name: "Programs", rows: [["Code", "Program", "Category", "Type", "Module"], ...programs.map((program) => [program.code || "", program.name || program.title || program.program || "", program.category || "", program.type || "", module])]}], `${safeName(settings)}_${module}_programs.xlsx`);
};

export const generateResultsExcel = (results = [], module = "arts", settings = {}) => {
  const filtered = results.filter((result) => (result.moduleType || result.module || "arts") === module);
  downloadWorkbook([{ name: "Results", rows: [["Program", "Position", "Winner", "Team", "Points"], ...filtered.flatMap((result) => (result.winners || result.results || []).map((winner, index) => [result.programName || result.programmeName || "", winner.position || index + 1, winner.name || winner.studentName || "", winner.teamName || "", winner.points || ""]))]}], `${safeName(settings)}_${module}_results.xlsx`);
};

export const generatePersonalPointsExcel = (students = [], teams = [], settings = {}, category = "All") => {
  const names = new Map(teams.map((team) => [team.id, team.name]));
  const filtered = students.filter((student) => category === "All" || student.category === category).sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  downloadWorkbook([{ name: "Personal Points", rows: [["Rank", "Student", "Category", "Team", "Points"], ...filtered.map((student, index) => [index + 1, student.name || student.studentName || "", student.category || "", student.teamName || names.get(student.teamId) || "", student.totalPoints || 0])]}], `${safeName(settings)}_personal_points_${category}.xlsx`);
};

export const generateTeamPointsExcel = (teams = [], students = [], results = [], settings = {}) => {
  const sorted = [...teams].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  downloadWorkbook([{ name: "Team Points", rows: [["Rank", "Team", "Points", "Students"], ...sorted.map((team, index) => [index + 1, team.name || "", team.totalPoints || 0, students.filter((student) => student.teamId === team.id).length])]}], `${safeName(settings)}_team_points.xlsx`);
};

export const generateFullReportExcel = (teams = [], students = [], artsPrograms = [], sportsPrograms = [], results = [], candidates = [], settings = {}) => {
  downloadWorkbook([
    { name: "Teams", rows: [["Team", "Points"], ...teams.map((team) => [team.name || "", team.totalPoints || 0])] },
    { name: "Students", rows: [["Chest", "Name", "Team", "Points"], ...students.map((student) => [student.chestNumber || "", student.name || student.studentName || "", student.teamName || "", student.totalPoints || 0])] },
    { name: "Arts Programs", rows: [["Code", "Program"], ...artsPrograms.map((program) => [program.code || "", program.name || program.title || ""]) ] },
    { name: "Sports Programs", rows: [["Code", "Program"], ...sportsPrograms.map((program) => [program.code || "", program.name || program.title || ""]) ] },
  ], `${safeName(settings)}_full_report.xlsx`);
};
