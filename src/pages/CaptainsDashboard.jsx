import { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, ShieldCheck, UserRound, Users, Power, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTeams } from "../hooks/useTeams";
import { createCaptain, getCaptains, setCaptainActive } from "../services/captainService";

const MODULES = [{ value: "arts", label: "Arts" }, { value: "riyadha", label: "Riyadha" }];

export default function CaptainsDashboard() {
  const { teams, loading: teamsLoading } = useTeams();
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", password: "", teamId: "", module: "arts" });

  const teamMap = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);

  const loadCaptains = async () => {
    try {
      setLoading(true);
      setCaptains(await getCaptains());
    } catch (error) {
      toast.error(error.message || "Unable to load captains.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCaptains(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createCaptain({ ...form, teamName: teamMap[form.teamId]?.name || "" });
      toast.success("Captain created.");
      setShowForm(false);
      await loadCaptains();
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (captain) => {
    try {
      await setCaptainActive(captain.id, !captain.active);
      await loadCaptains();
      toast.success("Status updated.");
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><KeyRound /></div>
            <h1 className="text-2xl font-bold">Captains</h1>
          </div>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus size={16}/> Add Captain</button>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm divide-y">
          {captains.map(captain => (
            <div key={captain.id} className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><UserRound size={20}/></div>
                <div><h3 className="font-bold">{captain.name}</h3><p className="text-xs text-gray-500">{captain.teamName} · {captain.module}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(captain)} className={`px-4 py-2 rounded-xl text-sm font-bold ${captain.active ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{captain.active ? 'Disable' : 'Enable'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
