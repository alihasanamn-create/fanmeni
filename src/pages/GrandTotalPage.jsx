
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase";

function TopperCard({ title, data }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 text-center min-h-72">
      <h2 className="font-black text-[#8458B3]">{title}</h2>

      {data && (
        <>
          {data.photo && (
            <img
              src={data.photo}
              alt={data.name}
              className="w-20 h-20 rounded-full mx-auto mt-3 object-cover"
            />
          )}

          <h1 className="text-5xl font-black text-[#8458B3] mt-3">
            {data.points}
          </h1>

          <p className="font-bold text-sm">POINTS</p>
          <h3 className="font-bold mt-2">{data.name}</h3>
          <p>{data.code}</p>

          <div className="bg-[#8458B3] text-white rounded-xl mt-2 py-1">
            {data.team}
          </div>
        </>
      )}
    </div>
  );
}

export default function GrandTotalPage() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [demerits, setDemerits] = useState([]);

  useEffect(() => {
    const resultsQuery = query(
      collection(db, "results"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeResults = onSnapshot(
      resultsQuery,
      (snapshot) => {
        setResults(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading results:", error);
      }
    );

    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        setStudents(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading students:", error);
      }
    );

    const unsubscribeDemerits = onSnapshot(
      collection(db, "artsDemerits"),
      (snapshot) => {
        setDemerits(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading Arts demerits:", error);
      }
    );

    return () => {
      unsubscribeResults();
      unsubscribeStudents();
      unsubscribeDemerits();
    };
  }, []);

  function point(position, grade) {
    let points = 0;

    if (position === "first") points += 5;
    if (position === "second") points += 3;
    if (position === "third") points += 1;

    if (grade === "A") points += 5;
    if (grade === "B") points += 3;
    if (grade === "C") points += 1;

    return points;
  }

  const personal = {};
  const grossTeams = {};

  results.forEach((result) => {
    const placements = [
      ["first", result.positions?.first, result.firstGrade],
      ["second", result.positions?.second, result.secondGrade],
      ["third", result.positions?.third, result.thirdGrade],
    ];

    placements.forEach(([position, studentName, grade]) => {
      if (!studentName) return;

      const student = students.find(
        (item) => item.name === studentName
      );

      if (!student) return;

      const points = point(position, grade);

      personal[student.id] = {
        ...student,
        points: (personal[student.id]?.points || 0) + points,
      };

      if (student.team) {
        grossTeams[student.team] =
          (grossTeams[student.team] || 0) + points;
      }
    });

    (result.additionalGrades || []).forEach((gradeEntry) => {
      const student = students.find(
        (item) => item.name === gradeEntry.name
      );

      if (!student) return;

      const points = point("", gradeEntry.grade);

      personal[student.id] = {
        ...student,
        points: (personal[student.id]?.points || 0) + points,
      };

      if (student.team) {
        grossTeams[student.team] =
          (grossTeams[student.team] || 0) + points;
      }
    });
  });

  // Accumulate saved Arts demerits separately.
  // Each point deducts 3 marks; no result documents are modified.
  const teamDemerits = {};
  const teamDeductions = {};

  demerits.forEach((demerit) => {
    if (demerit.category !== "arts") return;

    const teamName = demerit.teamName;
    const points = Number(demerit.points) || 0;

    if (!teamName || points <= 0) return;

    teamDemerits[teamName] =
      (teamDemerits[teamName] || 0) + points;

    teamDeductions[teamName] =
      (teamDeductions[teamName] || 0) + points * 3;
  });

  // The gross total is never overwritten, so penalties are not
  // repeatedly deducted when Firestore sends another snapshot.
  const teams = Object.fromEntries(
    Object.entries(grossTeams).map(([teamName, grossPoints]) => [
      teamName,
      grossPoints - (teamDeductions[teamName] || 0),
    ])
  );

  const toppers = Object.values(personal).sort(
    (a, b) => b.points - a.points
  );

  const fanmeni = toppers[0];

  const bidaya = toppers.find(
    (student) => student.category === "Bidaya"
  );

  const thaniya = toppers.find(
    (student) => student.category === "Thaniya"
  );

  const sortedTeams = Object.entries(teams).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] p-4 md:p-6 overflow-auto">
      <h1 className="text-3xl md:text-5xl font-black text-[#8458B3]">
        FANMENI TOTAL
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Team totals reflect recorded Arts demerit deductions.
        Individual contestant points and original results are unchanged.
      </p>

      {/* TEAM TOTALS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {sortedTeams.map(([team, points]) => (
          <div
            key={team}
            className="bg-[#8458B3] text-white rounded-3xl p-6 shadow-xl text-center"
          >
            <h2 className="text-2xl md:text-3xl font-black">
              {team}
            </h2>

            <h1 className="text-5xl md:text-6xl font-black mt-3">
              {points}
            </h1>

            <p>NET POINTS</p>

            {(teamDeductions[team] || 0) > 0 && (
              <div className="mt-4 rounded-xl bg-white/15 p-3">
                <p className="text-sm">
                  Gross points: {grossTeams[team] || 0}
                </p>
                <p className="text-sm">
                  Demerits: {teamDemerits[team] || 0}
                </p>
                <p className="font-bold">
                  Deducted: −{teamDeductions[team]} marks
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TOPPERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <TopperCard title="Fanmeni Topper" data={fanmeni} />
        <TopperCard title="Bidaya Topper" data={bidaya} />
        <TopperCard title="Thaniya Topper" data={thaniya} />
      </div>

      {/* LATEST RESULTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6 pb-10">
        {results.slice(0, 6).map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-3xl shadow-xl p-5"
          >
            <h2 className="font-black text-[#8458B3] text-xl">
              {result.program}
            </h2>

            {[
              ["1st", result.positions?.first, result.firstGrade],
              ["2nd", result.positions?.second, result.secondGrade],
              ["3rd", result.positions?.third, result.thirdGrade],
            ].map(([place, studentName, grade]) => {
              const student = students.find(
                (item) => item.name === studentName
              );

              return (
                <div key={place} className="mt-3">
                  <b>
                    {place} {grade || ""}
                  </b>
                  <p>{student?.name || studentName || "—"}</p>
                  <p>{student?.code || ""}</p>
                  <p>{student?.team || ""}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
