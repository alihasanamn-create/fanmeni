// ============================================
// FILE: src/utils/programExcelUtils.js
// PURPOSE: Excel import/export for programs
// ============================================

import * as XLSX from "xlsx";
import { POINTS } from "../firebase/collections";

// ============================================
// EXPORT PROGRAMS
// ============================================
// NOTE: callers pass a third "moduleType" argument; it is not used for the sheet.
export const exportProgramsToExcel = (programs, filename) => {
  const sorted = [...programs].sort((a, b) => {
    const aCode = parseInt(a.code) || 999;
    const bCode = parseInt(b.code) || 999;
    return aCode - bCode;
  });

  const data = sorted.map((p) => ({
    Code: p.code || "",
    "Program Name": p.name || p.program || "",
    Category: p.category || "",
    Type: p.type || "",
    "Participants Per Team": p.participantsPerTeam || p.count || 1,
    "1st Place Points": p.points?.first || 0,
    "2nd Place Points": p.points?.second || 0,
    "3rd Place Points": p.points?.third || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 15 },
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Programs");

  const timestamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);

  return { success: true, count: data.length };
};

// ============================================
// DOWNLOAD TEMPLATE
// ============================================
export const downloadProgramTemplate = (moduleType) => {
  const template = [
    {
      Code: "001",
      "Program Name": moduleType === "sports" ? "100m Sprint" : "Essay Writing",
      Category: "Bidaya",
      Type: "Individual",
      "Participants Per Team": 1,
    },
    {
      Code: "002",
      "Program Name": moduleType === "sports" ? "Football" : "Group Song",
      Category: "Thaniya",
      Type: "Group",
      "Participants Per Team": 11,
    },
    {
      Code: "003",
      "Program Name": moduleType === "sports" ? "Kabaddi" : "Debate",
      Category: "General",
      Type: "Personal Group",
      "Participants Per Team": 3,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
  ];

  const instructions = [
    { Field: "Code", Required: "No", Notes: "Program code (auto-generated if empty)" },
    { Field: "Program Name", Required: "Yes", Notes: "Full name of program" },
    { Field: "Category", Required: "Yes", Notes: "Bidaya, Thaniya, or General" },
    { Field: "Type", Required: "Yes", Notes: "Individual, Personal Group, Group, or General" },
    { Field: "Participants Per Team", Required: "Yes", Notes: "Number (default 1)" },
    { Field: "", Required: "", Notes: "" },
    { Field: "Points Info", Required: "Auto", Notes: "Points are auto-calculated based on type:" },
    { Field: "Individual", Required: "", Notes: "🥇 5  🥈 3  🥉 1" },
    { Field: "Personal Group", Required: "", Notes: "🥇 5  🥈 3  🥉 1 (shared)" },
    { Field: "Group", Required: "", Notes: "🥇 7  🥈 5  🥉 3" },
    { Field: "General", Required: "", Notes: "🥇 15  🥈 7  🥉 5" },
  ];

  const instructSheet = XLSX.utils.json_to_sheet(instructions);
  instructSheet["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Programs");
  XLSX.utils.book_append_sheet(workbook, instructSheet, "Instructions");

  const moduleName = moduleType === "sports" ? "riyadha" : "arts";
  XLSX.writeFile(workbook, `${moduleName}_programs_template.xlsx`);
  return { success: true };
};

// ============================================
// PARSE EXCEL FILE
// ============================================
export const parseProgramExcel = (file, moduleType) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const parsed = [];
        const errors = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2;

          const name = row["Program Name"]?.toString().trim();
          if (!name) {
            errors.push(`Row ${rowNum}: Missing Program Name`);
            return;
          }

          // Normalize category
          let category = (row["Category"]?.toString() || "Bidaya").trim();
          const catLower = category.toLowerCase();
          if (catLower === "bidaya") category = "Bidaya";
          else if (catLower === "thaniya") category = "Thaniya";
          else if (catLower === "general") category = "General";
          else {
            errors.push(`Row ${rowNum}: Invalid Category "${category}"`);
            return;
          }

          // Normalize type
          let type = (row["Type"]?.toString() || "Individual").trim();
          const validTypes = ["Individual", "Personal Group", "Group", "General"];
          const matchedType = validTypes.find(
            (t) => t.toLowerCase() === type.toLowerCase()
          );
          if (!matchedType) {
            errors.push(`Row ${rowNum}: Invalid Type "${type}"`);
            return;
          }
          type = matchedType;

          const points = POINTS[type] || {};
          const participantsPerTeam = parseInt(row["Participants Per Team"]) || 1;

          parsed.push({
            code: row["Code"]?.toString() || "",
            name: name,
            program: name,
            category: category,
            type: type,
            participantsPerTeam: participantsPerTeam,
            count: participantsPerTeam,
            moduleType: moduleType,
            points: {
              first: points.first || 0,
              second: points.second || 0,
              third: points.third || 0,
              shared: points.shared || false,
            },
          });
        });

        resolve({ success: true, data: parsed, errors, total: rows.length });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    };

    reader.onerror = () => reject({ success: false, error: "Failed to read file" });
    reader.readAsArrayBuffer(file);
  });
};