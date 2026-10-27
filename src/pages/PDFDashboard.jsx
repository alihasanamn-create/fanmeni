// ============================================
// FILE: src/pages/PDFDashboard.jsx
// PURPOSE: Downloads center - PDF + Excel
// ============================================

import { useState } from "react";
import {
  Download,
  FileText,
  Users,
  Shield,
  Palette,
  Trophy,
  UserPlus,
  Award,
  ClipboardList,
  Sparkles,
  FileSpreadsheet,
  FileArchive,
} from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { usePrograms } from "../hooks/usePrograms";
import { useResults } from "../hooks/useResults";
import { useCandidates } from "../hooks/useCandidates";
import { useSettings } from "../hooks/useSettings";

// PDF generators
import {
  generateTeamsPDF,
  generateStudentsPDF,
  generateProgramsPDF,
  generateResultsPDF,
  generateCandidatesPDF,
  generatePersonalPointsPDF,
  generateTeamPointsPDF,
} from "../utils/pdfGenerators";

// Excel generators
import {
  generateTeamsExcel,
  generateStudentsExcel,
  generateProgramsExcel,
  generateResultsExcel,
  generateCandidatesExcel,
  generatePersonalPointsExcel,
  generateTeamPointsExcel,
  generateFullReportExcel,
} from "../utils/excelGenerators";

export default function PDFDashboard() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { results } = useResults();
  const { candidates } = useCandidates();
  const { settings } = useSettings();

  const [generating, setGenerating] = useState("");

  const publishedResults = results.filter((r) => r.status !== "draft");
  const allPrograms = [...artsPrograms, ...sportsPrograms];

  const handleDownload = async (key, fn) => {
    setGenerating(key);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      fn();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setTimeout(() => setGenerating(""), 500);
    }
  };

  const sections = [
    {
      title: "👥 People",
      color: "emerald",
      items: [
        {
          key: "teams",
          title: "Teams Report",
          description: "All teams with members and points breakdown",
          icon: Shield,
          count: teams.length,
          countLabel: "teams",
          disabled: teams.length === 0,
          pdfAction: () => generateTeamsPDF(teams, students, settings),
          excelAction: () => generateTeamsExcel(teams, students, settings),
        },
        {
          key: "students",
          title: "Students List",
          description: "Complete list of all students with details",
          icon: Users,
          count: students.length,
          countLabel: "students",
          disabled: students.length === 0,
          pdfAction: () => generateStudentsPDF(students, teams, settings),
          excelAction: () => generateStudentsExcel(students, teams, settings),
        },
      ],
    },
    {
      title: "🎨 Programs",
      color: "purple",
      items: [
        {
          key: "arts-programs",
          title: "Arts Programs",
          description: "All arts programs with points structure",
          icon: Palette,
          count: artsPrograms.length,
          countLabel: "programs",
          disabled: artsPrograms.length === 0,
          pdfAction: () => generateProgramsPDF(artsPrograms, "arts", settings),
          excelAction: () => generateProgramsExcel(artsPrograms, "arts", settings),
        },
        {
          key: "sports-programs",
          title: "Sports Programs",
          description: "All sports programs with points structure",
          icon: Trophy,
          count: sportsPrograms.length,
          countLabel: "programs",
          disabled: sportsPrograms.length === 0,
          pdfAction: () =>
            generateProgramsPDF(sportsPrograms, "sports", settings),
          excelAction: () =>
            generateProgramsExcel(sportsPrograms, "sports", settings),
        },
      ],
    },
    {
      title: "🎯 Candidates",
      color: "blue",
      items: [
        {
          key: "arts-candidates",
          title: "Arts Candidates",
          description: "Assigned candidates for all arts programs",
          icon: UserPlus,
          count: candidates.filter((c) => {
            const p = allPrograms.find((x) => x.id === c.programId);
            return p?.moduleType === "arts";
          }).length,
          countLabel: "programs",
          disabled: candidates.length === 0,
          pdfAction: () =>
            generateCandidatesPDF(
              candidates,
              allPrograms,
              "arts",
              settings,
              teams
            ),
          excelAction: () =>
            generateCandidatesExcel(
              candidates,
              allPrograms,
              "arts",
              settings,
              teams
            ),
        },
        {
          key: "sports-candidates",
          title: "Sports Candidates",
          description: "Assigned candidates for all sports programs",
          icon: UserPlus,
          count: candidates.filter((c) => {
            const p = allPrograms.find((x) => x.id === c.programId);
            return p?.moduleType === "sports";
          }).length,
          countLabel: "programs",
          disabled: candidates.length === 0,
          pdfAction: () =>
            generateCandidatesPDF(
              candidates,
              allPrograms,
              "sports",
              settings,
              teams
            ),
          excelAction: () =>
            generateCandidatesExcel(
              candidates,
              allPrograms,
              "sports",
              settings,
              teams
            ),
        },
      ],
    },
    {
      title: "🏆 Results",
      color: "amber",
      items: [
        {
          key: "arts-results",
          title: "Arts Results",
          description: "All published arts results with winners",
          icon: Award,
          count: publishedResults.filter((r) => r.moduleType === "arts").length,
          countLabel: "results",
          disabled: publishedResults.length === 0,
          pdfAction: () =>
            generateResultsPDF(results, "arts", settings, teams),
          excelAction: () =>
            generateResultsExcel(results, "arts", settings, teams),
        },
        {
          key: "sports-results",
          title: "Sports Results",
          description: "All published sports results with winners",
          icon: Award,
          count: publishedResults.filter((r) => r.moduleType === "sports")
            .length,
          countLabel: "results",
          disabled: publishedResults.length === 0,
          pdfAction: () =>
            generateResultsPDF(results, "sports", settings, teams),
          excelAction: () =>
            generateResultsExcel(results, "sports", settings, teams),
        },
      ],
    },
    {
      title: "📊 Points & Rankings",
      color: "pink",
      items: [
        {
          key: "team-points",
          title: "Team Grand Total",
          description: "Overall team rankings with detailed stats",
          icon: Trophy,
          count: teams.length,
          countLabel: "teams",
          disabled: teams.length === 0,
          pdfAction: () =>
            generateTeamPointsPDF(teams, students, results, settings),
          excelAction: () =>
            generateTeamPointsExcel(teams, students, results, settings),
        },
        {
          key: "personal-all",
          title: "Personal Points (All)",
          description: "Overall individual ranking of all participants",
          icon: Award,
          count: students.filter((s) => (s.totalPoints || 0) > 0).length,
          countLabel: "students",
          disabled: students.length === 0,
          pdfAction: () =>
            generatePersonalPointsPDF(students, teams, settings, "All"),
          excelAction: () =>
            generatePersonalPointsExcel(students, teams, settings, "All"),
        },
        {
          key: "personal-bidaya",
          title: "Personal Points (Bidaya)",
          description: "Junior category individual ranking",
          icon: Award,
          count: students.filter(
            (s) => s.category === "Bidaya" && (s.totalPoints || 0) > 0
          ).length,
          countLabel: "students",
          disabled: students.length === 0,
          pdfAction: () =>
            generatePersonalPointsPDF(students, teams, settings, "Bidaya"),
          excelAction: () =>
            generatePersonalPointsExcel(students, teams, settings, "Bidaya"),
        },
        {
          key: "personal-thaniya",
          title: "Personal Points (Thaniya)",
          description: "Senior category individual ranking",
          icon: Award,
          count: students.filter(
            (s) => s.category === "Thaniya" && (s.totalPoints || 0) > 0
          ).length,
          countLabel: "students",
          disabled: students.length === 0,
          pdfAction: () =>
            generatePersonalPointsPDF(students, teams, settings, "Thaniya"),
          excelAction: () =>
            generatePersonalPointsExcel(students, teams, settings, "Thaniya"),
        },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Downloads
            </h1>
            <p className="text-sm text-gray-500">
              Generate PDF or Excel reports
            </p>
          </div>
        </div>

        {/* SUPER DOWNLOAD - Full Report */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-5 md:p-6 shadow-xl mb-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileArchive className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-black">
                Complete Festival Report
              </h3>
              <p className="text-sm text-white/90 mt-1">
                All-in-one Excel with Teams, Students, Programs, Results & Points
              </p>
            </div>
            <button
              onClick={() =>
                handleDownload("full-report", () =>
                  generateFullReportExcel(
                    teams,
                    students,
                    artsPrograms,
                    sportsPrograms,
                    results,
                    candidates,
                    settings
                  )
                )
              }
              disabled={generating === "full-report"}
              className="w-full md:w-auto px-6 py-3 bg-white text-emerald-700 font-black rounded-xl shadow-lg hover:shadow-2xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating === "full-report" ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5" />
                  Download Full Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Teams" value={teams.length} icon={Shield} />
          <StatCard label="Students" value={students.length} icon={Users} />
          <StatCard label="Programs" value={allPrograms.length} icon={ClipboardList} />
          <StatCard label="Results" value={publishedResults.length} icon={Award} />
        </div>

        {/* PDF Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 px-1">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {section.items.map((item) => (
                  <DownloadCard
                    key={item.key}
                    item={item}
                    generating={generating}
                    color={section.color}
                    onPDF={() => handleDownload(`${item.key}-pdf`, item.pdfAction)}
                    onExcel={() => handleDownload(`${item.key}-excel`, item.excelAction)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 md:p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-900">
            <p className="font-bold mb-1">📄 About Reports</p>
            <p className="text-emerald-700 text-xs md:text-sm">
              PDFs are branded and formatted for printing. Excel files include multiple sheets and are perfect for further analysis. All reports use real-time data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DOWNLOAD CARD (with PDF + Excel buttons)
// ============================================
function DownloadCard({ item, generating, color, onPDF, onExcel }) {
  const Icon = item.icon;

  const colors = {
    emerald: {
      bg: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      pdfBtn: "from-emerald-500 to-teal-600",
      excelBtn: "from-emerald-600 to-green-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      pdfBtn: "from-purple-500 to-pink-600",
      excelBtn: "from-purple-600 to-fuchsia-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      pdfBtn: "from-blue-500 to-indigo-600",
      excelBtn: "from-blue-600 to-cyan-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      pdfBtn: "from-amber-500 to-orange-600",
      excelBtn: "from-amber-600 to-yellow-600",
    },
    pink: {
      bg: "bg-pink-50",
      icon: "bg-pink-100 text-pink-600",
      pdfBtn: "from-pink-500 to-rose-600",
      excelBtn: "from-pink-600 to-red-600",
    },
  };

  const c = colors[color] || colors.emerald;
  const isPdfGenerating = generating === `${item.key}-pdf`;
  const isExcelGenerating = generating === `${item.key}-excel`;

  return (
    <div
      className={
        item.disabled
          ? "bg-white rounded-2xl border border-gray-100 p-4 opacity-60"
          : "bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
      }
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-gray-900">{item.count}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            {item.countLabel}
          </div>
        </div>
      </div>

      <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">
        {item.title}
      </h3>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">
        {item.description}
      </p>

      {item.disabled ? (
        <div className="w-full py-2 bg-gray-100 text-gray-400 font-semibold rounded-xl text-xs text-center">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* PDF Button */}
          <button
            onClick={onPDF}
            disabled={isPdfGenerating || isExcelGenerating}
            className={`py-2 bg-gradient-to-r ${c.pdfBtn} text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-1`}
          >
            {isPdfGenerating ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                PDF
              </>
            )}
          </button>

          {/* Excel Button */}
          <button
            onClick={onExcel}
            disabled={isPdfGenerating || isExcelGenerating}
            className={`py-2 bg-gradient-to-r ${c.excelBtn} text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-1`}
          >
            {isExcelGenerating ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="text-lg md:text-2xl font-black text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}