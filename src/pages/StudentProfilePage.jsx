// ============================================
// FILE: src/pages/StudentProfilePage.jsx
// PURPOSE: Public student profile with programs + results
// ============================================

import { Link, useParams, useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Shield,
  GraduationCap,
  Trophy,
  Palette,
  Award,
  Home,
  Hash,
} from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useResults } from "../hooks/useResults";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, loading: studentsLoading } = useStudents();
  const { results, loading: resultsLoading } = useResults();
  const { teams } = useTeams();
  const { settings } = useSettings();

  const student = students.find((s) => s.id === studentId);
  const team = teams.find((t) => t.id === student?.teamId);

  const loading = studentsLoading || resultsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Student Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            This student profile doesn&apos;t exist.
          </p>
          <Link
            to="/students-public"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Find results where this student appears
  const studentResults = [];

  results
    .filter((r) => r.status !== "draft")
    .forEach((r) => {
      ["first", "second", "third"].forEach((pos) => {
        const winners = r.positions?.[pos] || [];
        winners.forEach((w) => {
          if (
            w.studentId === student.id ||
            w.studentIds?.includes(student.id)
          ) {
            studentResults.push({
              ...r,
              position: pos,
              grade: w.grade,
            });
          }
        });
      });

      // Additional grades
      (r.additionalGrades || []).forEach((g) => {
        if (g.studentId === student.id) {
          studentResults.push({
            ...r,
            position: null,
            grade: g.grade,
            isAdditional: true,
          });
        }
      });
    });

  const assignedPrograms = student.assignedPrograms || [];
  const primaryColor = team?.color || "#10b981";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar */}
      <PublicNavbar settings={settings} />

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Cover with team color */}
          <div
            className="h-32 md:h-40 relative"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Info */}
          <div className="px-6 pb-6 -mt-16 md:-mt-20 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Photo */}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-white bg-gray-100 overflow-hidden shadow-xl flex-shrink-0">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 md:pb-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                  {student.name}
                </h1>

                <div className="flex flex-wrap gap-2 mt-3">
                  {student.chestNumber && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                      <Hash className="w-3 h-3" />
                      {student.chestNumber}
                    </span>
                  )}
                  {student.category && (
                    <span
                      className={
                        student.category === "Bidaya"
                          ? "inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                          : "inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                      }
                    >
                      {student.category}
                    </span>
                  )}
                  {team && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: team.color }}
                    >
                      <Shield className="w-3 h-3" />
                      {team.name}
                    </span>
                  )}
                  {student.class && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      <GraduationCap className="w-3 h-3" />
                      Class {student.class}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatBox
            label="Total Points"
            value={student.totalPoints || 0}
            icon={Trophy}
            color="amber"
          />
          <StatBox
            label="Programs"
            value={assignedPrograms.length}
            icon={Palette}
            color="purple"
          />
          <StatBox
            label="Awards Won"
            value={studentResults.filter((r) => !r.isAdditional).length}
            icon={Award}
            color="emerald"
          />
        </div>

        {/* Assigned Programs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Assigned Programs ({assignedPrograms.length})
          </h2>

          {assignedPrograms.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No programs assigned yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedPrograms.map((prog, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {prog.programCode && (
                          <span className="text-xs font-mono font-bold text-gray-500">
                            {prog.programCode}
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                          {prog.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {prog.programName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        {prog.moduleType === "sports" ? (
                          <Trophy className="w-3 h-3" />
                        ) : (
                          <Palette className="w-3 h-3" />
                        )}
                        {prog.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Won */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Awards & Grades ({studentResults.length})
          </h2>

          {studentResults.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No awards yet. Keep participating!
            </p>
          ) : (
            <div className="space-y-2">
              {studentResults.map((r, idx) => {
                const posEmoji =
                  r.position === "first"
                    ? "🥇"
                    : r.position === "second"
                    ? "🥈"
                    : r.position === "third"
                    ? "🥉"
                    : "📜";

                const posLabel =
                  r.position === "first"
                    ? "1st Place"
                    : r.position === "second"
                    ? "2nd Place"
                    : r.position === "third"
                    ? "3rd Place"
                    : "Additional Grade";

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="text-3xl">{posEmoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {r.programCode && (
                          <span className="text-xs font-mono font-bold text-gray-500">
                            {r.programCode}
                          </span>
                        )}
                        <span className="text-xs bg-white px-1.5 py-0.5 rounded font-medium border">
                          {r.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {r.programName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{posLabel}</p>
                    </div>
                    {r.grade && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5">Grade</div>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-black text-lg">
                          {r.grade}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PUBLIC NAVBAR
// ============================================
function PublicNavbar({ settings }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
              {settings.festivalName?.[0] || "F"}
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900">
              {settings.festivalName || "FANMENI"}
            </h1>
            <p className="text-xs text-gray-500">
              {settings.tagline || "Festival Portal"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/students-public"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Search
          </Link>
          <Link
            to="/"
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  const colors = {
    amber: "from-amber-500 to-orange-600 text-amber-600 bg-amber-50",
    purple: "from-purple-500 to-pink-600 text-purple-600 bg-purple-50",
    emerald: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50",
  };
  const [, textColor, bgColor] = colors[color].split(" ");

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${textColor}`} />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}