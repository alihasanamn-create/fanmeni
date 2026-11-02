
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  ClipboardList,
  Trophy,
  Activity,
  TrendingUp,
  Medal,
  Calendar,
  Bell,
  UserPlus,
  Radio,
  BarChart3,
  Settings,
  Download,
} from "lucide-react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useTeams } from "../hooks/useTeams";
import { useStudents } from "../hooks/useStudents";
import { usePrograms } from "../hooks/usePrograms";
import { useResults } from "../hooks/useResults";
import { useCandidates } from "../hooks/useCandidates";
import { useSettings } from "../hooks/useSettings";

export default function AdminDashboard() {
  const { teams } = useTeams();
  const { students } = useStudents();
  const { programs: artsPrograms } = usePrograms("arts");
  const { programs: sportsPrograms } = usePrograms("sports");
  const { results } = useResults();
  const { candidates } = useCandidates();
  const { settings } = useSettings();

  const [artsPenalties, setArtsPenalties] = useState([]);
  const [sportsPenalties, setSportsPenalties] = useState([]);
  const [demeritTab, setDemeritTab] = useState("arts");
  const [penaltyTeam, setPenaltyTeam] = useState("");
  const [demeritPoints, setDemeritPoints] = useState("1");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [savingPenalty, setSavingPenalty] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState("");

  useEffect(() => {
    const artsQuery = query(collection(db, "artsDemerits"), orderBy("createdAt", "desc"));
    const sportsQuery = query(collection(db, "riyadaDemerits"), orderBy("createdAt", "desc"));

    const unsubscribeArts = onSnapshot(artsQuery, (snapshot) => {
      setArtsPenalties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Could not load Arts demerits:", error));

    const unsubscribeSports = onSnapshot(sportsQuery, (snapshot) => {
      setSportsPenalties(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Could not load Riyadha demerits:", error));

    return () => { unsubscribeArts(); unsubscribeSports(); };
  }, []);

  async function addDemerit(event) {
    event.preventDefault();
    const isArts = demeritTab === "arts";
    const collectionName = isArts ? "artsDemerits" : "riyadaDemerits";
    const team = teams.find((item) => item.id === penaltyTeam);
    const points = Number(demeritPoints);

    if (!team) { setPenaltyMessage("Please select a team."); return; }
    if (!Number.isSafeInteger(points) || points < 1) {
      setPenaltyMessage("Enter a positive whole number of demerit points."); return;
    }
    if (!penaltyReason.trim()) { setPenaltyMessage("Please enter a reason."); return; }

    setSavingPenalty(true);
    setPenaltyMessage("");
    try {
      await addDoc(collection(db, collectionName), {
        teamId: team.id,
        teamName: team.name,
        points,
        deduction: points * 3,
        reason: penaltyReason.trim(),
        category: isArts ? "arts" : "riyada",
        moduleType: isArts ? "arts" : "sports",
        createdAt: serverTimestamp(),
      });
      setPenaltyTeam("");
      setDemeritPoints("1");
      setPenaltyReason("");
      setPenaltyMessage(`Saved: ${points} demerit point(s), deducting ${points * 3} ${isArts ? "Arts" : "Riyadha"} marks.`);
    } catch (error) {
      console.error("Could not save demerit:", error);
      setPenaltyMessage("Could not save the penalty. Check permissions and try again.");
    } finally { setSavingPenalty(false); }
  }

  const allPrograms = [...artsPrograms, ...sportsPrograms];
  const publishedResults = results.filter((result) => result.status !== "draft");
  const publishedProgramIds = new Set(
    publishedResults.map((result) => result.programId)
  );

  const completionPercentage = allPrograms.length
    ? Math.round((publishedProgramIds.size / allPrograms.length) * 100)
    : 0;

  let daysRemaining = 0;
  if (settings.endDate) {
    const end = new Date(settings.endDate);
    const now = new Date();
    daysRemaining = Math.max(
      0,
      Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    );
  }

  const assignedProgramIds = new Set(candidates.map((candidate) => candidate.programId));
  const pendingResults = [...assignedProgramIds].filter(
    (id) => !publishedProgramIds.has(id)
  ).length;

  // Calculate separate deductions by team ID. Base points remain untouched in Firestore.
  const sumDeductions = (items) => items.reduce((acc, item) => {
    const key = item.teamId || item.teamName;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + (Number(item.points) || 0) * 3;
    return acc;
  }, {});
  const artsDeductions = sumDeductions(artsPenalties);
  const riyadhaDeductions = sumDeductions(sportsPenalties);

  // pointsCalculator stores artsPoints and sportsPoints independently. Never deduct from totalPoints twice.
  const artsLeaderboard = teams.map((team) => ({
    ...team,
    baseTotal: Number(team.artsPoints ?? team.totalPoints) || 0,
    deduction: artsDeductions[team.id] || artsDeductions[team.name] || 0,
  })).map((team) => ({ ...team, displayedTotal: team.baseTotal - team.deduction }))
    .sort((a, b) => b.displayedTotal - a.displayedTotal);
  const riyadhaLeaderboard = teams.map((team) => ({
    ...team,
    baseTotal: Number(team.sportsPoints) || 0,
    deduction: riyadhaDeductions[team.id] || riyadhaDeductions[team.name] || 0,
  })).map((team) => ({ ...team, displayedTotal: team.baseTotal - team.deduction }))
    .sort((a, b) => b.displayedTotal - a.displayedTotal);

  const leaderboard = artsLeaderboard.slice(0, 5);
  const champion = artsLeaderboard[0];
  const riyadhaChampion = riyadhaLeaderboard[0];

  const recentActivity = [...publishedResults]
    .sort((a, b) => {
      const at = a.updatedAt?.toMillis?.() || 0;
      const bt = b.updatedAt?.toMillis?.() || 0;
      return bt - at;
    })
    .slice(0, 5)
    .map((result) => ({
      id: result.id,
      text: `Result published for ${result.programName}`,
      subtext: result.category,
    }));

  const maxPoints = Math.max(1, ...leaderboard.map((team) => team.displayedTotal));
  const totalDemerits = artsPenalties.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
  const totalDeduction = totalDemerits * 3;
  const riyadhaDemeritsTotal = sportsPenalties.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
  const riyadhaDeduction = riyadhaDemeritsTotal * 3;
  const shownDemerits = demeritTab === "arts" ? artsPenalties : sportsPenalties;
  const shownTotalDemerits = demeritTab === "arts" ? totalDemerits : riyadhaDemeritsTotal;
  const shownTotalDeduction = demeritTab === "arts" ? totalDeduction : riyadhaDeduction;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to {settings.festivalName || "FANMENI"} • Live overview
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <StatCard title="Students" value={students.length} icon={Users} color="emerald" />
        <StatCard title="Teams" value={teams.length} icon={Shield} color="blue" />
        <StatCard title="Programs" value={allPrograms.length} icon={ClipboardList} color="amber" />
        <StatCard title="Completed" value={publishedResults.length} icon={Trophy} color="green" />
      </motion.div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <Link to="/students" className="px-3 py-2.5 bg-emerald-600 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-emerald-700 transition text-center">
            Add Student
          </Link>
          <Link to="/arts" className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center">
            Add Program
          </Link>
          <Link to="/results" className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center">
            Publish Results
          </Link>
          <Link to="/live-publish" className="px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center">
            Live Publish
          </Link>
        </div>
      </div>

      {/* SEPARATE ARTS / RIYADHA DEMERIT MANAGEMENT */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Demerit Points</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Arts and Riyadha penalties are stored separately. Each demerit point deducts 3 marks from that championship only. Original results and base scores are not changed.
        </p>
        <div className="flex gap-2 mb-5">
          <button type="button" onClick={() => { setDemeritTab("arts"); setPenaltyMessage(""); }} className={`px-4 py-2 rounded-xl font-bold ${demeritTab === "arts" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200"}`}>Arts Demerits</button>
          <button type="button" onClick={() => { setDemeritTab("riyada"); setPenaltyMessage(""); }} className={`px-4 py-2 rounded-xl font-bold ${demeritTab === "riyada" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200"}`}>Riyadha Demerits</button>
        </div>
        <form onSubmit={addDemerit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Team</label>
            <select required value={penaltyTeam} onChange={(event) => setPenaltyTeam(event.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3">
              <option value="">Select a team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Demerit points</label>
            <input type="number" min="1" step="1" required value={demeritPoints} onChange={(event) => setDemeritPoints(event.target.value)} className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3" />
            <p className="text-xs text-red-600 mt-1">Deduction: {(Number(demeritPoints) > 0 ? Number(demeritPoints) : 0) * 3} marks</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Reason</label>
            <input type="text" required maxLength={300} value={penaltyReason} onChange={(event) => setPenaltyReason(event.target.value)} placeholder="Enter the reason for the penalty" className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={savingPenalty} className={`w-full md:w-auto rounded-xl ${demeritTab === "arts" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 text-white font-bold px-5 py-3`}>
              {savingPenalty ? "Saving..." : `Record ${demeritTab === "arts" ? "Arts" : "Riyadha"} Demerit`}
            </button>
            {penaltyMessage && <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">{penaltyMessage}</p>}
          </div>
        </form>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4"><p className="text-xs text-gray-500">Total {demeritTab === "arts" ? "Arts" : "Riyadha"} demerits</p><p className="text-2xl font-black text-red-600">{shownTotalDemerits}</p></div>
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4"><p className="text-xs text-gray-500">Total marks deducted</p><p className="text-2xl font-black text-red-600">{shownTotalDeduction}</p></div>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-3">{demeritTab === "arts" ? "Arts" : "Riyadha"} penalty history</h3>
        {shownDemerits.length === 0 ? <p className="text-sm text-gray-400">No {demeritTab === "arts" ? "Arts" : "Riyadha"} demerits recorded.</p> : (
          <div className="space-y-2">{shownDemerits.map((penalty) => (
            <div key={penalty.id} className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div><p className="font-bold text-gray-900 dark:text-white">{penalty.teamName || "Unknown team"}</p><p className="text-sm text-gray-500">{penalty.reason}</p></div>
              <div className="sm:text-right"><p className="font-black text-red-600">−{(Number(penalty.points) || 0) * 3} marks</p><p className="text-xs text-gray-500">{Number(penalty.points) || 0} demerit point(s)</p></div>
            </div>
          ))}</div>
        )}
      </section>

      {/* FESTIVAL PROGRESS */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5 mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Festival Progress
        </h3>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
              Completed Programs
            </span>
            <span className="text-xs md:text-sm font-bold">
              {publishedResults.length} / {allPrograms.length}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-emerald-600"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <ProgressBox icon={TrendingUp} value={`${completionPercentage}%`} label="Complete" color="text-emerald-600" />
          <ProgressBox icon={Calendar} value={daysRemaining > 0 ? daysRemaining : "—"} label={daysRemaining > 0 ? "Days Left" : "Set date"} color="text-blue-600" />
          <ProgressBox icon={Bell} value={pendingResults} label="Pending" color="text-amber-600" />
        </div>
      </section>

      {/* LEADERBOARD + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
              Team Leaderboard
            </h3>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No teams yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((team, index) => {
                const percentage = Math.max(0, (team.displayedTotal / maxPoints) * 100);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={team.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {index < 3 ? (
                          <span className="text-base">{medals[index]}</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        )}
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {team.name}
                        </span>
                      </div>
                      <span className="font-black text-sm" style={{ color: team.color }}>
                        {team.displayedTotal}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-gray-500">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* CHAMPION CARD */}
      {champion && (
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-sm p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Medal className="w-7 h-7 md:w-8 md:h-8 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider">Arts / FANMENI Champion</p>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white truncate">
                {champion.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leading with {champion.displayedTotal} points after Arts demerits
              </p>
            </div>
            <Link to="/team-points" className="hidden sm:flex px-4 py-2 bg-yellow-500 text-white text-sm font-bold rounded-xl hover:bg-yellow-600 transition flex-shrink-0">
              View All
            </Link>
          </div>
        </section>
      )}

     

      {/* QUICK NAVIGATION */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 md:p-5">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          <QuickNav to="/teams" label="Teams" icon={Shield} color="bg-blue-500" />
          <QuickNav to="/students" label="Students" icon={Users} color="bg-emerald-500" />
          <QuickNav to="/candidates" label="Candidates" icon={UserPlus} color="bg-purple-500" />
          <QuickNav to="/results" label="Results" icon={Trophy} color="bg-amber-500" />
          <QuickNav to="/live-publish" label="Live" icon={Radio} color="bg-red-500" />
          <QuickNav to="/analytics" label="Analytics" icon={BarChart3} color="bg-cyan-500" />
          <QuickNav to="/pdf" label="Downloads" icon={Download} color="bg-orange-500" />
          <QuickNav to="/settings" label="Settings" icon={Settings} color="bg-slate-500" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs md:text-sm text-gray-500 font-medium truncate">{title}</p>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ProgressBox({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center p-2.5 md:p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
      <Icon className={`w-4 h-4 md:w-5 md:h-5 mx-auto mb-1 ${color}`} />
      <p className="text-base md:text-lg font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-[9px] md:text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function QuickNav({ to, label, icon: Icon, color }) {
  return (
    <Link to={to} className="group flex flex-col items-center p-2.5 md:p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-300 transition">
      <div className={`w-8 h-8 md:w-10 md:h-10 ${color} rounded-lg flex items-center justify-center mb-1.5 group-hover:scale-110 transition`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <span className="text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}
