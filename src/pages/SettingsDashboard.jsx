
import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../hooks/useSettings";
import { setDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export default function SettingsDashboard() {
  const { settings, loading } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result = await setDocument(COLLECTIONS.SETTINGS, "festival", form);
    setSaving(false);
    if (result.success) toast.success("Festival settings saved.");
    else toast.error(result.error || "Could not save settings.");
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading settings…</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <form onSubmit={saveSettings} className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white"><Settings /></span>
          <div><h1 className="text-2xl font-black text-slate-900">Festival Settings</h1><p className="text-sm text-slate-500">Update the public festival name and branding.</p></div>
        </header>
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700">Festival name
            <input value={form.festivalName || ""} onChange={(e) => setForm({ ...form, festivalName: e.target.value })} className="mt-2 w-full rounded-xl border px-4 py-3" required />
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">Tagline
            <input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>
          <button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"><Save size={18} />{saving ? "Saving…" : "Save settings"}</button>
        </section>
      </form>
    </main>
  );
}
