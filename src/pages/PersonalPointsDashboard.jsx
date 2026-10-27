// ============================================
// FILE: src/pages/PersonalPointsDashboard.jsx
// PURPOSE: Personal points ranking (cleaned)
// ============================================

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function PersonalPointsDashboard() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) =>
        setStudents(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        )
    );

    const unsubResults = onSnapshot(collection(db, "results"), (snapshot) =>
      setResults(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    return () => {
      unsubStudents();
      unsubResults();
    };
  }, []);

  /* POINTS */
  const positionPoints = { first: 5, second: 3, third: 1 };
  const gradePoints = { A: 5, B: 3, C: 1 };
  const personalPoints = {};

  /* HELPERS */
  function extractStudentName(value) {
    if (!value) return "";
    if (value.includes(" — ")) return value.split(" — ")[1];
    return value;
  }

  /* CALCULATE */
  results.forEach((result) => {
    ["first", "second", "third"].forEach((position) => {
      const winner = result.positions?.[position];
      if (!winner) return;

      const total =
        (positionPoints[position] || 0) +
        (gradePoints[result[`${position}Grade`]] || 0);

      /* INDIVIDUAL */
      if (result.type === "Individual") {
        const name = extractStudentName(winner);
        if (!personalPoints[name]) personalPoints[name] = 0;
        personalPoints[name] += total;
      }

      /* PERSONAL GROUP */
      if (result.type === "Personal Group") {
        const teamName = winner.split("_")[0];
        const groupKey = winner.split("_")[1];
        const candidateProgram = result;
        const participants =
          candidateProgram?.teams?.[teamName]?.[groupKey] || [];
        const splitPoints =
          participants.length > 0 ? total / participants.length : total;

        participants.forEach((participant) => {
          if (!personalPoints[participant]) personalPoints[participant] = 0;
          personalPoints[participant] += splitPoints;
        });
      }
    });

    /* ADDITIONAL */
    result.additionalGrades?.forEach((item) => {
      const name = extractStudentName(item.name);
      const points = gradePoints[item.grade] || 0;
      if (!personalPoints[name]) personalPoints[name] = 0;
      personalPoints[name] += points;
    });
  });

  /* FINAL LIST */
  const rankings = students
    .map((student) => ({
      ...student,
      points: personalPoints[student.name] || 0,
    }))
    .filter((student) => {
      if (filter === "All") return true;
      return student.category === filter;
    })
    .sort((a, b) => b.points - a.points);

  /* PDF */
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("FANMENI PERSONAL POINTS", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["SL NO", "CODE NO", "NAME", "TEAM", "POINTS"]],
      body: rankings.map((student, index) => [
        index + 1,
        student.code,
        student.name,
        student.team,
        student.points,
      ]),
    });

    doc.save("fanmeni_personal_points.pdf");
  }

  /* EXCEL */
  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      rankings.map((student, index) => ({
        "SL NO": index + 1,
        "CODE NO": student.code,
        NAME: student.name,
        TEAM: student.team,
        POINTS: student.points,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personal Points");
    XLSX.writeFile(workbook, "fanmeni_personal_points.xlsx");
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-[#8458B3]">
          Personal Points
        </h1>
        <p className="text-gray-500 mt-3">Realtime Personal Rankings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mt-10">
        {["All", "Bidaya", "Thaniya", "General"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
              filter === item ? "bg-[#8458B3] text-white" : "bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Export */}
      <div className="flex flex-wrap gap-5 mt-8">
        <button
          onClick={exportPDF}
          className="bg-red-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl"
        >
          Export PDF
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl"
        >
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-2xl mt-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8458B3] text-white">
              <tr>
                <th className="p-5 text-left">SL NO</th>
                <th className="p-5 text-left">CODE NO</th>
                <th className="p-5 text-left">NAME</th>
                <th className="p-5 text-left">TEAM</th>
                <th className="p-5 text-left">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b hover:bg-[#faf8ff]"
                >
                  <td className="p-5 font-bold">{index + 1}</td>
                  <td className="p-5">{student.code}</td>
                  <td className="p-5 font-semibold">{student.name}</td>
                  <td className="p-5">{student.team}</td>
                  <td className="p-5 text-[#8458B3] font-black text-xl">
                    {student.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}