// ============================================
// FILE: src/components/students/StudentsTable.jsx
// PURPOSE: Table with multi-select checkboxes
// ============================================

import { User, Edit2, Trash2, CheckSquare, Square } from "lucide-react";

export default function StudentsTable({
  students,
  onEdit,
  onDelete,
  teams,
  selectedIds = [],
  onToggleSelect,
}) {
  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No students found
        </h3>
        <p className="text-gray-500">Add your first student to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {onToggleSelect && (
                <th className="px-4 py-3 w-12"></th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Chest #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Points
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const team = getTeam(student.teamId);
              const isSelected = selectedIds.includes(student.id);
              return (
                <tr
                  key={student.id}
                  className={
                    isSelected
                      ? "bg-emerald-50 hover:bg-emerald-100 transition"
                      : "hover:bg-gray-50 transition"
                  }
                >
                  {onToggleSelect && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleSelect(student.id)}
                        className={
                          isSelected
                            ? "w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center shadow-sm"
                            : "w-6 h-6 border-2 border-gray-300 rounded-md flex items-center justify-center hover:border-emerald-500 transition"
                        }
                      >
                        {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                      </button>
                    </td>
                  )}

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-11 h-9 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-sm font-mono">
                      {student.chestNumber || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        {student.admissionNumber && (
                          <p className="text-xs text-gray-500">
                            Adm: {student.admissionNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">
                      {student.class || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {team ? (
                      <div className="inline-flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {team.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No team</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        student.category === "Bidaya"
                          ? "inline-flex px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md"
                          : "inline-flex px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-md"
                      }
                    >
                      {student.category || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-emerald-600">
                      {student.totalPoints || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(student)}
                        className="w-8 h-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition text-gray-500"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition text-gray-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}