// ============================================
// FILE: src/utils/pdfGenerators.js
// PURPOSE: Beautiful PDF generators for all reports
// ============================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================
// HELPER: Add header to PDF
// ============================================
const addHeader = (doc, settings, title, subtitle) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top gradient bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 8, "F");

  // Festival name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(settings.festivalName || "FANMENI", 14, 25);

  // Tagline
  if (settings.tagline) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(settings.tagline, 14, 32);
  }

  // Right side: School name + date
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const rightX = pageWidth - 14;
  if (settings.schoolName) {
    doc.text(settings.schoolName, rightX, 25, { align: "right" });
  }
  doc.text(new Date().toLocaleDateString("en-GB"), rightX, 32, {
    align: "right",
  });

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(14, 38, pageWidth - 14, 38);

  // Report title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 50);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 57);
  }

  return 65; // Return next Y position
};

// ============================================
// HELPER: Add footer
// ============================================
const addFooter = (doc, settings) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400

    doc.text(
      `${settings.festivalName || "FANMENI"} • ${new Date().toLocaleDateString("en-GB")}`,
      14,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: "right" }
    );
  }
};

// ============================================
// COMMON TABLE STYLE
// ============================================
const tableStyle = {
  headStyles: {
    fillColor: [16, 185, 129],
    textColor: [255, 255, 255],
    fontStyle: "bold",
    fontSize: 10,
  },
  bodyStyles: {
    fontSize: 9,
    textColor: [30, 41, 59],
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
  styles: {
    cellPadding: 4,
    lineColor: [226, 232, 240],
    lineWidth: 0.1,
  },
  margin: { left: 14, right: 14 },
};

// ============================================
// 1. TEAMS PDF
// ============================================
export const generateTeamsPDF = (teams, students, settings) => {
  const doc = new jsPDF();
  let startY = addHeader(
    doc,
    settings,
    "Teams Report",
    `${teams.length} teams • ${students.length} total students`
  );

  const sortedTeams = [...teams].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  // Teams Summary Table
  const summaryData = sortedTeams.map((team, i) => {
    const memberCount = students.filter((s) => s.teamId === team.id).length;
    const bidayaCount = students.filter(
      (s) => s.teamId === team.id && s.category === "Bidaya"
    ).length;
    const thaniyaCount = students.filter(
      (s) => s.teamId === team.id && s.category === "Thaniya"
    ).length;

    return [
      i + 1,
      team.name,
      memberCount,
      bidayaCount,
      thaniyaCount,
      team.captain || "-",
      team.totalPoints || 0,
    ];
  });

  autoTable(doc, {
    startY,
    head: [
      ["#", "Team Name", "Total", "Bidaya", "Thaniya", "Captain", "Points"],
    ],
    body: summaryData,
    ...tableStyle,
  });

  // Detailed team-wise students (each team on new section)
  sortedTeams.forEach((team) => {
    const teamStudents = students
      .filter((s) => s.teamId === team.id)
      .sort((a, b) => {
        const aNum = parseInt(a.chestNumber) || 999;
        const bNum = parseInt(b.chestNumber) || 999;
        return aNum - bNum;
      });

    if (teamStudents.length === 0) return;

    doc.addPage();
    let y = addHeader(doc, settings, team.name, `${teamStudents.length} members`);

    // Color header bar
    const rgb = hexToRgb(team.color || "#10b981");
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Team: ${team.name}  •  Points: ${team.totalPoints || 0}`, 18, y + 5.5);
    y += 12;

    autoTable(doc, {
      startY: y,
      head: [["Chest #", "Name", "Class", "Category", "Adm #", "Points"]],
      body: teamStudents.map((s) => [
        s.chestNumber || "-",
        s.name,
        s.class || "-",
        s.category || "-",
        s.admissionNumber || "-",
        s.totalPoints || 0,
      ]),
      ...tableStyle,
      headStyles: {
        ...tableStyle.headStyles,
        fillColor: [rgb.r, rgb.g, rgb.b],
      },
    });
  });

  addFooter(doc, settings);
  doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_Teams.pdf`);
};

// ============================================
// 2. STUDENTS PDF
// ============================================
export const generateStudentsPDF = (students, teams, settings) => {
  const doc = new jsPDF("l"); // landscape
  let startY = addHeader(
    doc,
    settings,
    "Students List",
    `Total ${students.length} students`
  );

  const sorted = [...students].sort((a, b) => {
    const aNum = parseInt(a.chestNumber) || 999;
    const bNum = parseInt(b.chestNumber) || 999;
    return aNum - bNum;
  });

  autoTable(doc, {
    startY,
    head: [
      [
        "SL",
        "Chest #",
        "Name",
        "Class",
        "Category",
        "Team",
        "Captain",
        "Adm #",
        "Points",
      ],
    ],
    body: sorted.map((s, i) => {
      const team = teams.find((t) => t.id === s.teamId);
      return [
        i + 1,
        s.chestNumber || "-",
        s.name,
        s.class || "-",
        s.category || "-",
        team?.name || "-",
        team?.captain || "-",
        s.admissionNumber || "-",
        s.totalPoints || 0,
      ];
    }),
    ...tableStyle,
  });

  addFooter(doc, settings);
  doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_Students.pdf`);
};

// ============================================
// 3. PROGRAMS PDF (Arts or Sports)
// ============================================
export const generateProgramsPDF = (programs, moduleType, settings) => {
  const doc = new jsPDF();
  const title = moduleType === "sports" ? "Sports Programs" : "Arts Programs";

  let startY = addHeader(
    doc,
    settings,
    title,
    `${programs.length} programs registered`
  );

  const sorted = [...programs].sort((a, b) => {
    const aCode = parseInt(a.code) || 999;
    const bCode = parseInt(b.code) || 999;
    return aCode - bCode;
  });

  autoTable(doc, {
    startY,
    head: [
      ["Code", "Program Name", "Category", "Type", "Max/Team", "1st", "2nd", "3rd"],
    ],
    body: sorted.map((p) => [
      p.code || "-",
      p.name || p.program,
      p.category,
      p.type,
      p.participantsPerTeam || p.count || 1,
      p.points?.first || 0,
      p.points?.second || 0,
      p.points?.third || 0,
    ]),
    ...tableStyle,
  });

  addFooter(doc, settings);
  doc.save(
    `${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${moduleType === "sports" ? "Sports" : "Arts"}_Programs.pdf`
  );
};

// ============================================
// 4. RESULTS PDF (Arts or Sports)
// ============================================
export const generateResultsPDF = (results, moduleType, settings, teams) => {
  const doc = new jsPDF();
  const title = moduleType === "sports" ? "Sports Results" : "Arts Results";

  const filteredResults = results.filter(
    (r) => r.moduleType === moduleType && r.status !== "draft"
  );

  let startY = addHeader(
    doc,
    settings,
    title,
    `${filteredResults.length} published results`
  );

  if (filteredResults.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text("No published results yet.", 14, startY);
    addFooter(doc, settings);
    doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title}.pdf`);
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();

  filteredResults.forEach((r, idx) => {
    if (idx > 0) {
      startY += 4;
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
    }

    // Program header block
    doc.setFillColor(240, 253, 250); // emerald-50
    doc.rect(14, startY, pageWidth - 28, 14, "F");
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(14, startY, 14, startY + 14);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${r.programCode ? "#" + r.programCode + " - " : ""}${r.programName}`,
      18,
      startY + 6
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${r.category} • ${r.type} • ${resultTypeLabel(r.resultType)}`,
      18,
      startY + 11
    );

    startY += 18;

    // Winners table
    const winnersData = [];

    if (r.resultType !== "grades_only") {
      const posEmojis = { first: "1st", second: "2nd", third: "3rd" };
      ["first", "second", "third"].forEach((pos) => {
        const winners = r.positions?.[pos] || [];
        winners.forEach((w) => {
          const team = teams.find((t) => t.id === w.teamId);
          winnersData.push([
            posEmojis[pos],
            w.chestNumber || "-",
            w.studentName || w.teamName || "-",
            team?.name || "-",
            w.grade || "-",
          ]);
        });
      });
    }

    // Additional grades
    (r.additionalGrades || []).forEach((g) => {
      const team = teams.find((t) => t.id === g.teamId);
      winnersData.push([
        "Grade",
        g.chestNumber || "-",
        g.studentName || g.teamName || "-",
        team?.name || "-",
        g.grade || "-",
      ]);
    });

    if (winnersData.length > 0) {
      autoTable(doc, {
        startY,
        head: [["Position", "Chest #", "Name", "Team", "Grade"]],
        body: winnersData,
        ...tableStyle,
        margin: { left: 14, right: 14 },
      });

      startY = doc.lastAutoTable.finalY + 6;
    } else {
      startY += 4;
    }
  });

  addFooter(doc, settings);
  doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.pdf`);
};

// ============================================
// 5. CANDIDATES PDF (Arts or Sports)
// ============================================
export const generateCandidatesPDF = (candidates, programs, moduleType, settings, teams) => {
  const doc = new jsPDF();
  const title = moduleType === "sports" ? "Sports Candidates" : "Arts Candidates";

  const filteredCandidates = candidates.filter((c) => {
    const program = programs.find((p) => p.id === c.programId);
    return program?.moduleType === moduleType;
  });

  let startY = addHeader(
    doc,
    settings,
    title,
    `${filteredCandidates.length} programs with assigned candidates`
  );

  if (filteredCandidates.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text("No candidates assigned yet.", 14, startY);
    addFooter(doc, settings);
    doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.pdf`);
    return;
  }

  filteredCandidates.forEach((c, idx) => {
    if (idx > 0) {
      startY += 6;
      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }
    }

    // Program title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(
      `${c.programCode ? "#" + c.programCode + " - " : ""}${c.programName}`,
      14,
      startY
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`${c.category} • ${c.type} • ${c.totalCandidates} candidates`, 14, startY + 4);

    startY += 8;

    // Team-wise candidates
    const rows = [];
    Object.entries(c.teamCandidates || {}).forEach(([teamId, teamStudents]) => {
      const team = teams.find((t) => t.id === teamId);
      teamStudents.forEach((s) => {
        rows.push([
          team?.name || "-",
          s.chestNumber || "-",
          s.studentName,
          s.class || "-",
        ]);
      });
    });

    autoTable(doc, {
      startY,
      head: [["Team", "Chest #", "Name", "Class"]],
      body: rows,
      ...tableStyle,
    });

    startY = doc.lastAutoTable.finalY;
  });

  addFooter(doc, settings);
  doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.pdf`);
};

// ============================================
// 6. PERSONAL POINTS PDF
// ============================================
export const generatePersonalPointsPDF = (students, teams, settings, category = "All") => {
  const doc = new jsPDF();

  let filtered = [...students].filter((s) => (s.totalPoints || 0) > 0);
  if (category !== "All") {
    filtered = filtered.filter((s) => s.category === category);
  }
  filtered.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const title = category === "All"
    ? "Personal Points - Overall"
    : `Personal Points - ${category}`;

  let startY = addHeader(
    doc,
    settings,
    title,
    `${filtered.length} participants ranked by points`
  );

  autoTable(doc, {
    startY,
    head: [["Rank", "Chest #", "Name", "Category", "Team", "Points"]],
    body: filtered.map((s, i) => {
      const team = teams.find((t) => t.id === s.teamId);
      return [
        i + 1,
        s.chestNumber || "-",
        s.name,
        s.category || "-",
        team?.name || "-",
        s.totalPoints || 0,
      ];
    }),
    ...tableStyle,
  });

  addFooter(doc, settings);
  doc.save(
    `${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_Personal_Points_${category}.pdf`
  );
};

// ============================================
// 7. TEAM POINTS PDF (Grand Total)
// ============================================
export const generateTeamPointsPDF = (teams, students, results, settings) => {
  const doc = new jsPDF();
  const sorted = [...teams].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  let startY = addHeader(
    doc,
    settings,
    "Team Grand Total",
    `${teams.length} teams competing`
  );

  const publishedResults = results.filter((r) => r.status !== "draft");

  const rows = sorted.map((team, i) => {
    let firstCount = 0, secondCount = 0, thirdCount = 0;
    publishedResults.forEach((r) => {
      (r.positions?.first || []).forEach((w) => {
        if (w.teamId === team.id) firstCount++;
      });
      (r.positions?.second || []).forEach((w) => {
        if (w.teamId === team.id) secondCount++;
      });
      (r.positions?.third || []).forEach((w) => {
        if (w.teamId === team.id) thirdCount++;
      });
    });

    const memberCount = students.filter((s) => s.teamId === team.id).length;

    return [
      i + 1,
      team.name,
      memberCount,
      firstCount,
      secondCount,
      thirdCount,
      team.totalPoints || 0,
    ];
  });

  autoTable(doc, {
    startY,
    head: [["Rank", "Team", "Members", "1st", "2nd", "3rd", "Total Points"]],
    body: rows,
    ...tableStyle,
  });

  addFooter(doc, settings);
  doc.save(`${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_Team_Points.pdf`);
};

// ============================================
// HELPERS
// ============================================
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 16, g: 185, b: 129 };
}

function resultTypeLabel(type) {
  const labels = {
    position_grade: "Position + Grade",
    positions_only: "Positions Only",
    grades_only: "Grades Only",
  };
  return labels[type] || "";
}