import { LogOut, Shield, Users, Palette, Trophy, Lock, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { logout } from "../services/authService";
import { useStudents } from "../hooks/useStudents";

export default function CaptainDashboardSecure() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { students, loading } = useStudents(profile?.teamId || null);

  if (loading) return <div className="min-h-screen grid place-items-center bg-gray-50"><div className="text-sm text-gray-500">Loading your team…</div></div>;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-semibold text-emerald-600">FANMENI • Captain Portal</p><h1 className="mt-1 text-2xl font-black text-gray-900 md:text-3xl">Welcome, {profile?.name || user?.displayName || "Captain"}</h1><p className="mt-1 text-sm text-gray-500">Assign your team's existing students to Arts and Riyadha programmes.</p></div>
          <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"><LogOut className="h-4 w-4" /> Sign out</button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoCard icon={Shield} label="My Team" value={profile?.teamName || profile?.teamId || "Not assigned"} />
          <InfoCard icon={Users} label="My Students" value={students.length} />
        </section>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ClipboardList className="h-5 w-5" /></div><div><h2 className="font-bold text-gray-900">Candidate Assignment</h2><p className="text-sm text-gray-500">Assign existing students from your team to Arts or Riyadha programmes.</p></div></div>
            <button onClick={() => navigate("/captain/candidates")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><ClipboardList className="h-4 w-4" /> Assign Candidates</button>
          </div>
          {students.length === 0 ? <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500">No students are currently assigned to this team.</div> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{students.map((student) => <div key={student.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="font-bold text-gray-900">{student.name || student.studentName || "Unnamed student"}</p><p className="mt-1 text-xs text-gray-500">Chest No: {student.chestNumber ?? student.chestNo ?? "—"}</p></div>)}</div>}
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-3"><Palette className="h-5 w-5 text-emerald-700"/><span className="font-bold text-emerald-800">Arts Assignment</span></div><p className="mt-1 text-sm text-emerald-700">Select programmes and assign students from your team.</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-emerald-700"/><span className="font-bold text-emerald-800">Riyadha Assignment</span></div><p className="mt-1 text-sm text-emerald-700">Select Riyadha programmes and assign students from your team.</p></div></div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><Lock className="h-5 w-5 shrink-0" /><span>You cannot create students or candidates. You can only assign existing students from your own team. All submissions require admin approval.</span></div>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) { return <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 font-bold text-gray-900">{value}</p></div></div></div>; }
