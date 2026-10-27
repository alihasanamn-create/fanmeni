import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Send, Users } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useStudents } from "../hooks/useStudents";
import { usePrograms } from "../hooks/usePrograms";
import { getTeamEntries, submitCandidateEntry } from "../services/candidateEntryService";
import { getProgrammeLimit, getProgrammeDivision, getPersonalLimit, PERSONAL_LIMITS } from "../constants/programmeLimits";

const CATEGORIES = ["Bidaya", "Thaniya", "General"];
const PROGRAM_TYPES = ["Individual", "Personal Group", "Group", "General"];
const normaliseCategory = (value) => String(value || "").trim().toLowerCase();
const normaliseType = (value) => String(value || "").trim().toLowerCase();

function programmeCategory(program) {
  return String(program?.category || program?.programCategory || program?.studentCategory || "").trim();
}

function programmeType(program) {
  return String(program?.type || program?.programType || "").trim();
}

function getStudentProgramMap(student, entries) {
  const map = new Map();
  (student.assignedPrograms || []).forEach((program) => {
    const id = program.programId || program.programmeId;
    if (!id) return;
    const code = String(program.programCode || program.programmeCode || program.code || "").toUpperCase();
    map.set(id, { programId: id, programCode: code, category: String(program.category || (code.startsWith("B") ? "Bidaya" : code.startsWith("T") ? "Thaniya" : "")).trim() });
  });
  entries.filter((entry) => (entry.status || "submitted") !== "rejected").forEach((entry) => {
    if (!(entry.studentIds || []).includes(student.id) || !entry.programmeId) return;
    map.set(entry.programmeId, { programId: entry.programmeId, programCode: String(entry.programmeCode || "").toUpperCase(), category: String(entry.category || "").trim() });
  });
  return map;
}

export default function CaptainCandidates() {
  const { user, profile } = useAuth();
  const { students, loading: studentsLoading } = useStudents(profile?.teamId || null);
  const { programs: artsPrograms, loading: artsLoading } = usePrograms("arts");
  const { programs: riyadhaPrograms, loading: riyadhaLoading } = usePrograms("sports");
  const [moduleType, setModuleType] = useState("arts");
  const [activeCategory, setActiveCategory] = useState("Bidaya");
  const [activeType, setActiveType] = useState("Individual");
  const [programmeId, setProgrammeId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [teamEntries, setTeamEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const programs = moduleType === "arts" ? artsPrograms : riyadhaPrograms;
  const programsLoading = moduleType === "arts" ? artsLoading : riyadhaLoading;

  useEffect(() => {
    let cancelled = false;
    async function loadEntries() {
      if (!profile?.teamId) return;
      setLoadingEntries(true);
      try {
        const entries = await getTeamEntries(profile.teamId);
        if (!cancelled) setTeamEntries(entries);
      } catch (error) {
        console.error("Unable to load team candidate assignments", error);
        if (!cancelled) setTeamEntries([]);
      } finally { if (!cancelled) setLoadingEntries(false); }
    }
    loadEntries();
    return () => { cancelled = true; };
  }, [profile?.teamId]);

  const filteredPrograms = useMemo(() => programs.filter((program) => normaliseCategory(programmeCategory(program)) === normaliseCategory(activeCategory) && normaliseType(programmeType(program)) === normaliseType(activeType)), [programs, activeCategory, activeType]);
  const programme = programs.find((p) => p.id === programmeId);
  const programmeCat = programmeCategory(programme) || activeCategory;
  const limit = getProgrammeLimit(programme?.code);
  const division = getProgrammeDivision(programme?.code);
  const personalLimit = getPersonalLimit(programmeCat, programme?.code);

  const teamProgrammeStudentIds = useMemo(() => {
    if (!programmeId) return new Set();
    const ids = new Set();
    teamEntries.filter((entry) => (entry.status || "submitted") !== "rejected" && entry.programmeId === programmeId).forEach((entry) => (entry.studentIds || []).forEach((id) => ids.add(id)));
    students.forEach((student) => (student.assignedPrograms || []).forEach((assigned) => { if ((assigned.programId || assigned.programmeId) === programmeId) ids.add(student.id); }));
    return ids;
  }, [programmeId, teamEntries, students]);

  const teamProgrammeCount = teamProgrammeStudentIds.size;
  const remainingTeamSlots = limit === Infinity ? Infinity : Math.max(0, limit - teamProgrammeCount);

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const categoryMatch = activeCategory === "General" || normaliseCategory(student.category) === normaliseCategory(activeCategory);
      if (!categoryMatch) return false;
      if (!term) return true;
      return `${student.name || ""} ${student.studentName || ""} ${student.chestNumber || ""} ${student.admissionNumber || ""}`.toLowerCase().includes(term);
    });
  }, [students, activeCategory, search]);

  const getPersonalUsage = (student) => {
    const map = getStudentProgramMap(student, teamEntries);
    let stage = 0; let nonStage = 0;
    for (const assigned of map.values()) {
      if (String(assigned.category || "").trim() !== programmeCat) continue;
      const assignedDivision = getProgrammeDivision(assigned.programCode);
      if (assignedDivision === "stage") stage += 1;
      if (assignedDivision === "nonStage") nonStage += 1;
    }
    const alreadyAssigned = programmeId ? map.has(programmeId) : false;
    const current = division === "stage" ? stage : division === "nonStage" ? nonStage : 0;
    const limits = PERSONAL_LIMITS[programmeCat];
    return { stage, nonStage, current, alreadyAssigned, stageLimit: limits?.stage ?? Infinity, nonStageLimit: limits?.nonStage ?? Infinity };
  };

  const resetSelection = () => { setProgrammeId(""); setSelectedIds([]); setMessage({ type: "", text: "" }); };
  const changeModule = (nextModule) => { setModuleType(nextModule); setActiveCategory("Bidaya"); setActiveType("Individual"); resetSelection(); };
  const changeCategory = (category) => { setActiveCategory(category); resetSelection(); };
  const changeType = (type) => { setActiveType(type); resetSelection(); };

  const toggleStudent = (student) => {
    setMessage({ type: "", text: "" });
    setSelectedIds((current) => {
      if (current.includes(student.id)) return current.filter((id) => id !== student.id);
      if (remainingTeamSlots !== Infinity && current.length >= remainingTeamSlots) {
        setMessage({ type: "error", text: `This programme allows ${limit} candidates per team. ${remainingTeamSlots} slot(s) remain.` });
        return current;
      }
      if (programme && personalLimit !== Infinity) {
        const usage = getPersonalUsage(student);
        if (usage.alreadyAssigned) { setMessage({ type: "error", text: `${student.name || "This student"} is already assigned to this programme.` }); return current; }
        if (usage.current >= personalLimit) { setMessage({ type: "error", text: `${student.name || "This student"} has reached the ${programmeCat} ${division === "stage" ? "stage" : "non-stage"} limit of ${personalLimit}.` }); return current; }
      }
      return [...current, student.id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programme || !selectedIds.length) { setMessage({ type: "error", text: "Select a programme and at least one candidate." }); return; }
    if (remainingTeamSlots !== Infinity && selectedIds.length > remainingTeamSlots) { setMessage({ type: "error", text: `Only ${remainingTeamSlots} candidate slot(s) remain for this programme in your team.` }); return; }
    setSubmitting(true); setMessage({ type: "", text: "" });
    try {
      const selectedStudents = students.filter((s) => selectedIds.includes(s.id));
      await submitCandidateEntry({ captainId: user.uid, captainName: profile?.name || "", teamId: profile.teamId, teamName: profile.teamName || "", module: moduleType, programme, students: selectedStudents });
      setTeamEntries((current) => [...current, { programmeId: programme.id, programmeCode: programme.code, category: programmeCat, studentIds: selectedIds, status: "submitted" }]);
      setSelectedIds([]); setMessage({ type: "success", text: "Candidates submitted for admin approval." });
    } catch (error) { setMessage({ type: "error", text: error.message || "Unable to submit candidates." }); }
    finally { setSubmitting(false); }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">
    <div className="mb-6"><p className="text-sm font-semibold text-emerald-600">Assign Candidates</p><h1 className="text-2xl font-extrabold text-slate-900">Assign Candidates</h1><p className="text-sm text-slate-500">Same programme criteria as admin, with only your team's existing students.</p></div>
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="h-fit rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><Users size={20} /></div><div><p className="text-xs text-slate-500">Your team</p><p className="font-bold">{profile?.teamName || profile?.teamId}</p></div></div>
        <label className="text-sm font-semibold">Module</label><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => changeModule("arts")} className={`rounded-xl border px-4 py-3 text-sm font-bold ${moduleType === "arts" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white text-slate-600"}`}>Arts</button><button type="button" onClick={() => changeModule("riyadha")} className={`rounded-xl border px-4 py-3 text-sm font-bold ${moduleType === "riyadha" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white text-slate-600"}`}>Riyadha</button></div>
        <label className="mt-5 block text-sm font-semibold">Category</label><div className="mt-2 grid grid-cols-3 gap-2">{CATEGORIES.map((category) => <button key={category} type="button" onClick={() => changeCategory(category)} className={`rounded-xl border px-2 py-3 text-sm font-bold ${activeCategory === category ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{category}</button>)}</div>
        <label className="mt-5 block text-sm font-semibold">Program Type</label><div className="mt-2 grid grid-cols-2 gap-2">{PROGRAM_TYPES.map((type) => <button key={type} type="button" onClick={() => changeType(type)} className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${activeType === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{type}</button>)}</div>
        <label className="mt-5 block text-sm font-semibold">Programme</label><div className="relative mt-2"><select value={programmeId} onChange={(e) => { setProgrammeId(e.target.value); setSelectedIds([]); setMessage({ type: "", text: "" }); }} disabled={programsLoading} className="w-full appearance-none rounded-xl border px-4 py-3 pr-10"><option value="">{programsLoading ? "Loading programmes…" : `Select ${activeCategory} programme (${filteredPrograms.length})`}</option>{filteredPrograms.map((p) => <option key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ""}{p.name || p.title || p.program}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-slate-400" size={18} /></div>
        {programme && <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>Module</span><b>{moduleType === "arts" ? "Arts" : "Riyadha"}</b></div><div className="mt-2 flex justify-between"><span>Category</span><b>{programmeCat}</b></div><div className="mt-2 flex justify-between"><span>Type</span><b>{programmeType(programme) || "—"}</b></div><div className="mt-2 flex justify-between"><span>Code</span><b>{programme.code || "—"}</b></div><div className="mt-2 flex justify-between"><span>Team candidates</span><b>{loadingEntries ? "…" : `${teamProgrammeCount} / ${limit === Infinity ? "∞" : limit}`}</b></div>{limit !== Infinity && <div className="mt-2 flex justify-between"><span>Team slots remaining</span><b>{remainingTeamSlots}</b></div>}{personalLimit !== Infinity && <div className="mt-2 flex justify-between"><span>Personal {division === "stage" ? "stage" : "non-stage"} limit</span><b>{personalLimit}</b></div>}</div>}
        {message.text && <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}
        <button disabled={submitting || !programme || !selectedIds.length || (remainingTeamSlots !== Infinity && remainingTeamSlots <= 0)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-50">{submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Submit for approval</button>
      </section>
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">{activeCategory} Candidates</h2><p className="text-xs text-slate-500">{activeCategory === "General" ? "All existing students in your team can be used for General programmes." : `Only ${activeCategory} students are shown.`}</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / chest no." className="rounded-xl border px-4 py-2.5 text-sm" /></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">{programme && <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700">Team: {teamProgrammeCount}/{limit === Infinity ? "∞" : limit}</span>}{programme && personalLimit !== Infinity && <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-purple-700">Personal: {division === "stage" ? "Stage" : "Non-stage"} max {personalLimit}</span>}<span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-600">Selected: {selectedIds.length}</span></div>
        <div className="mt-5 max-h-[560px] space-y-2 overflow-y-auto">{studentsLoading ? <div className="py-12 text-center text-sm">Loading students…</div> : visibleStudents.length === 0 ? <div className="py-12 text-center text-sm">No {activeCategory} students found in your team.</div> : visibleStudents.map((student) => {
          const selected = selectedIds.includes(student.id);
          const usage = programme ? getPersonalUsage(student) : { stage: 0, nonStage: 0, current: 0, alreadyAssigned: false, stageLimit: Infinity, nonStageLimit: Infinity };
          const personalBlocked = Boolean(programme && personalLimit !== Infinity && !selected && (usage.alreadyAssigned || usage.current >= personalLimit));
          const teamBlocked = Boolean(programme && !selected && remainingTeamSlots !== Infinity && selectedIds.length >= remainingTeamSlots);
          const disabled = personalBlocked || teamBlocked;
          return <button type="button" key={student.id} onClick={() => toggleStudent(student)} disabled={disabled} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? "border-emerald-300 bg-emerald-50" : "hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-50`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${selected ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>{selected ? <CheckCircle2 size={19} /> : student.chestNumber || "?"}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{student.name || student.studentName || "Unnamed student"}</span><span className="block text-xs text-slate-500">Chest No. {student.chestNumber || "—"}</span></span>{programme && personalLimit !== Infinity && <span className="shrink-0 text-right text-[10px] font-bold text-slate-500"><span className="block">Stage {usage.stage}/{usage.stageLimit === Infinity ? "∞" : usage.stageLimit}</span><span className="block">Non-stage {usage.nonStage}/{usage.nonStageLimit === Infinity ? "∞" : usage.nonStageLimit}</span></span>}<span className="shrink-0 text-xs font-bold">{selected ? "Selected" : usage.alreadyAssigned ? "Already assigned" : personalBlocked ? "Personal limit" : teamBlocked ? "Team limit" : "Select"}</span></button>;
        })}</div>
      </section>
    </form>
  </div></main>;
}
