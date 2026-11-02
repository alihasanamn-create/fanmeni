// ============================================
// 4. RESULTS PDF (Arts or Sports)
// ============================================
export const generateResultsPDF = (results, moduleType, settings, teams) => {
  const doc = new jsPDF("l");
  const title = moduleType === "sports" ? "Sports Results" : "Arts Results";

  // Sort by the time the result was first entered.
  const filteredResults = results
    .filter((r) => r.moduleType === moduleType && r.status !== "draft")
    .sort((a, b) => getResultEntryTime(a) - getResultEntryTime(b));

  let startY = addHeader(
    doc,
    settings,
    title,
    `${filteredResults.length} published results • oldest entry first`
  );

  if (filteredResults.length === 0) {
    doc.setFontSize(12);
    doc.text("No published results yet.", 14, startY);
    addFooter(doc, settings);
    doc.save(
      `${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title}.pdf`
    );
    return;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const teamsList = teams || [];

  filteredResults.forEach((r, idx) => {
    if (idx > 0) startY += 3;

    if (startY > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      startY = 14;
    }

    // Program summary table
    autoTable(doc, {
      startY,
      head: [["Sl.no", "Date / Time", "Program Name", "Category"]],
      body: [[
        idx + 1,
        formatResultEntryDate(r),
        r.programName || "-",
        r.category || "-"
      ]],
      theme: "grid",
      margin: { left: margin, right: margin },
      tableWidth: usableWidth,
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 1.2,
        overflow: "linebreak",
        lineColor: [210, 220, 225],
        lineWidth: 0.15,
        valign: "middle"
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 1.2
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 30 },
        2: { cellWidth: usableWidth * 0.58 },
        3: { cellWidth: "auto" }
      }
    });

    startY = doc.lastAutoTable.finalY + 1;

    const winnersData = [];

    // Position results
    if (r.resultType !== "grades_only") {
      const positions = [
        ["first", "1st"],
        ["second", "2nd"],
        ["third", "3rd"]
      ];

      positions.forEach(([key, label]) => {
        (r.positions?.[key] || []).forEach((w) => {
          const team = teamsList.find((t) => t.id === w.teamId);

          winnersData.push([
            label,
            w.grade || "-",
            getCandidateCode(w),
            w.studentName || w.teamName || "-",
            team?.name || w.teamName || "-",
            getWinnerPoints(w)
          ]);
        });
      });
    }

    // Additional grade-only entries
    (r.additionalGrades || []).forEach((g) => {
      const team = teamsList.find((t) => t.id === g.teamId);

      winnersData.push([
        "-",
        g.grade || "-",
        getCandidateCode(g),
        g.studentName || g.teamName || "-",
        team?.name || g.teamName || "-",
        getWinnerPoints(g)
      ]);
    });

    if (winnersData.length > 0) {
      autoTable(doc, {
        startY,
        head: [[
          "Position",
          "Grade",
          "Code No",
          "Contestant Name",
          "Team",
          "Point"
        ]],
        body: winnersData,
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: usableWidth,
        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: 1.1,
          overflow: "linebreak",
          lineColor: [220, 226, 232],
          lineWidth: 0.12,
          valign: "middle"
        },
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
          cellPadding: 1.1
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 19, halign: "center" },
          1: { cellWidth: 14, halign: "center" },
          2: { cellWidth: 23, halign: "center" },
          3: { cellWidth: usableWidth * 0.40 },
          4: { cellWidth: usableWidth * 0.25 },
          5: { cellWidth: 15, halign: "center" }
        }
      });

      startY = doc.lastAutoTable.finalY + 4;
    } else {
      startY += 3;
    }
  });

  addFooter(doc, settings);

  doc.save(
    `${(settings.festivalName || "FANMENI").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.pdf`
  );
};

// Supports Firestore timestamps, Date objects, numbers and date strings.
function getResultEntryTime(result) {
  const value =
    result?.createdAt ??
    result?.created_at ??
    result?.entryDate ??
    result?.date;

  if (value == null) return Number.MAX_SAFE_INTEGER;

  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();

  if (typeof value === "number") {
    return value < 1e12 ? value * 1000 : value;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed)
    ? parsed
    : Number.MAX_SAFE_INTEGER;
}

function formatResultEntryDate(result) {
  const time = getResultEntryTime(result);

  if (time === Number.MAX_SAFE_INTEGER) return "-";

  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  )}`;
}

// IMPORTANT: Show candidate codes only.
// Update the field names here if your database uses a different code property.
function getCandidateCode(candidate) {
  return (
    candidate?.codeNo ??
    candidate?.candidateCode ??
    candidate?.studentCode ??
    candidate?.code ??
    "-"
  );
}

function getWinnerPoints(winner) {
  if (winner?.points != null) return winner.points;
  if (winner?.point != null) return winner.point;
  return "-";
}