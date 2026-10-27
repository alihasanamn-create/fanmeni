
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const text = (value) => String(value ?? "").trim();

export const downloadStudentTemplate = (teams = []) => {
  const rows = [
    ["Chest Number", "Name", "Class", "Division", "Category", "Team Name"],
    ["101", "Example Student", "10", "A", "Bidaya", teams[0]?.name || ""],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 15 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 24 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "student_import_template.xlsx");
};

export const parseExcelFile = async (file, teams = []) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject({ error: "Could not read this file." });
  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const teamByName = new Map(teams.map((team) => [text(team.name).toLowerCase(), team]));
      const errors = [];
      const data = rows.flatMap((row, index) => {
        const chestNumber = text(row["Chest Number"] || row["Chest No"]);
        const name = text(row.Name || row["Student Name"]);
        const teamName = text(row["Team Name"] || row.Team);
        const team = teamByName.get(teamName.toLowerCase());
        if (!chestNumber || !name || !teamName) {
          errors.push(`Row ${index + 2}: Chest Number, Name, and Team Name are required.`);
          return [];
        }
        if (teams.length && !team) {
          errors.push(`Row ${index + 2}: Team \"${teamName}\" was not found.`);
          return [];
        }
        return [{
          chestNumber,
          name,
          class: text(row.Class),
          division: text(row.Division),
          category: text(row.Category),
          teamId: team?.id || "",
          teamName,
        }];
      });
      resolve({ data, errors });
    } catch (error) {
      reject({ error: error.message || "The Excel file could not be parsed." });
    }
  };
  reader.readAsArrayBuffer(file);
});

export const exportStudentsToExcel = (students = [], teams = [], filename = "students") => {
  const teamById = new Map(teams.map((team) => [team.id, team.name || ""]));
  const rows = [
    ["Chest Number", "Name", "Class", "Division", "Category", "Team Name"],
    ...students.map((student) => [
      student.chestNumber || "",
      student.name || student.studentName || "",
      student.class || "",
      student.division || "",
      student.category || "",
      student.teamName || teamById.get(student.teamId) || "",
    ]),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${filename}.xlsx`);
};

/**
 * Downloads a blank Excel template for candidate assignments
 */
export const downloadCandidatesTemplate = (programs = [], teams = []) => {
  const data = [
    ["Program Code", "Team Name", "Chest Number"],
    ...programs.map(p => [p.code || p.programmeCode, "", ""])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Assignments");
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'candidate_assignment_template.xlsx');
};

/**
 * Parses an uploaded Excel file and returns mapped assignments
 */
export const parseCandidatesExcel = async (file, programs = [], teams = [], students = []) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const assignments = {};
        const errors = [];

        json.forEach((row, index) => {
          const progCode = String(row["Program Code"] || "").trim().toUpperCase();
          const teamName = String(row["Team Name"] || "").trim();
          const chestNo = String(row["Chest Number"] || "").trim();

          if (!progCode || !teamName || !chestNo) {
            errors.push(`Row ${index + 2}: Missing required fields.`);
            return;
          }

          const program = programs.find(p => (p.code || p.programmeCode)?.toUpperCase() === progCode);
          if (!program) {
            errors.push(`Row ${index + 2}: Invalid Program Code ${progCode}.`);
            return;
          }

          if (!assignments[program.id]) assignments[program.id] = {};
          assignments[program.id][chestNo] = { teamName, chestNo };
        });

        resolve({ success: true, data: assignments, errors });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
