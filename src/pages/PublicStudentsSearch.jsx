// ============================================
// FILE: src/pages/PublicStudentsSearch.jsx
// PURPOSE: Public search page for student profiles
// ============================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Home, Shield, Hash, Trophy } from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { useTeams } from "../hooks/useTeams";
import { useSettings } from "../hooks/useSettings";

export default function PublicStudentsSearch() {
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const { students, loading } = useStudents();
  const { teams } = useTeams();
  const { settings } = useSettings();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.chestNumber?.toString().includes(search);
    const matchesTeam = !filterTeam || s.teamId === filterTeam;
    const matchesCategory = !filterCategory || s.category === filterCategory;
    return matchesSearch && matchesTeam && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
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

          <Link
            to="/"
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Find Your Profile
          </h1>
          <p className="text-gray-500">
            Search by name or chest number to view your programs and points
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or chest number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="Bidaya">Bidaya</option>
              <option value="Thaniya">Thaniya</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Showing <b>{filteredStudents.length}</b> of {students.length} students
          </p>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-500">Try different search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStudents.map((student) => {
              const team = teams.find((t) => t.id === student.teamId);
              return (
                <Link
                  key={student.id}
                  to={`/student/${student.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  {/* Team color header */}
                  <div
                    className="h-16 relative"
                    style={{
                      background: team
                        ? `linear-gradient(135deg, ${team.color}, ${team.color}cc)`
                        : "linear-gradient(135deg, #64748b, #475569)",
                    }}
                  >
                    <div className="absolute -bottom-8 left-4">
                      <div className="w-16 h-16 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="pt-10 p-4">
                    <h3 className="font-bold text-gray-900 truncate">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono font-semibold">
                        {student.chestNumber || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {team && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: team.color }}
                        ></div>
                      )}
                      <span className="text-xs text-gray-600 truncate">
                        {team?.name || "No team"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span
                        className={
                          student.category === "Bidaya"
                            ? "text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium"
                            : "text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-medium"
                        }
                      >
                        {student.category || "—"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Trophy className="w-3 h-3" />
                        <span className="font-bold">
                          {student.totalPoints || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}