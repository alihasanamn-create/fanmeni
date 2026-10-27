
import React, { useState, useEffect, useMemo } from "react";
import { UserPlus, Shield, Save, Trash2, User, CheckCircle, AlertCircle, Search, Palette, Trophy, FileDown, FileUp } from "lucide-react";
import { setDocument, deleteDocument } from "../firebase/firestore";
import { generateCandidatesExcel } from "../utils/excelGenerators";
import { downloadCandidatesTemplate, parseCandidatesExcel } from "../utils/excelUtils";
import Modal from "../components/ui/Modal";
import { COLLECTIONS } from "../firebase/collections";
import { useStudents } from "../hooks/useStudents";
import { usePrograms } from "../hooks/usePrograms";

export default function CandidatesDashboard() {
  const { students, loading: studentsLoading } = useStudents();
  const { programs: artsPrograms, loading: artsLoading } = usePrograms("arts");
  const { programs: riyadhaPrograms, loading: riyadhaLoading } = usePrograms("sports");
  
  const [moduleType, setModuleType] = useState("arts");
  const [activeCategory, setActiveCategory] = useState("Bidaya");
  const [activeType, setActiveType] = useState("Individual");
  const [programmeId, setProgrammeId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const programs = moduleType === "arts" ? artsPrograms : riyadhaPrograms;
  const programsLoading = moduleType === "arts" ? artsLoading : riyadhaLoading;

  const filteredPrograms = useMemo(() => 
    programs.filter(p => String(p.category || "").trim().toLowerCase() === activeCategory.toLowerCase() && 
                        String(p.type || "").trim().toLowerCase() === activeType.toLowerCase()), 
    [programs, activeCategory, activeType]
  );

  const handleExport = () => {
    if (!programmeId) {
      setMessage({ type: "error", text: "Please select a programme to export." });
      return;
    }
    // In a real app, you'd filter candidates by the selected programmeId
    generateCandidatesExcel([], programs, moduleType, { festivalName: "FANMENI" }, []);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await parseCandidatesExcel(file, programs, [], students);
      if (!result.success) throw new Error(result.error);
      for (const pid in result.data) {
        await setDocument(COLLECTIONS.PARTICIPANTS, pid, result.data[pid]);
      }
      setMessage({ type: "success", text: "✅ Assignments imported successfully!" });
      setIsImportModalOpen(false);
    } catch (err) {
      setMessage({ type: "error", text: "Import failed: " + err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Candidate Assignments</h1>
          <p className="text-sm text-slate-500">Admin bulk assignment and Excel management</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <section className="rounded-3xl border bg-white p-5 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold">Module</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setModuleType("arts")} className={`p-2 rounded-xl border font-bold ${moduleType === 'arts' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white'}`}>Arts</button>
                <button onClick={() => setModuleType("riyadha")} className={`p-2 rounded-xl border font-bold ${moduleType === 'riyadha' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white'}`}>Riyadha</button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Programme</label>
              <select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} className="w-full mt-2 p-3 border rounded-xl">
                <option value="">Select Programme</option>
                {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button onClick={() => downloadCandidatesTemplate(programs, [])} className="flex items-center justify-center gap-2 p-3 border rounded-xl text-sm font-medium hover:bg-gray-50"><FileDown size={16} /> Template</button>
              <button onClick={() => setIsImportModalOpen(true)} className="flex items-center justify-center gap-2 p-3 border rounded-xl text-sm font-medium hover:bg-gray-50"><FileUp size={16} /> Import</button>
              <button onClick={handleExport} className="flex items-center justify-center gap-2 p-3 border rounded-xl text-sm font-medium hover:bg-gray-50"><FileDown size={16} /> Export</button>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            {/* Table content here */}
            <div className="p-12 text-center text-gray-400">Select a programme to manage candidates.</div>
          </section>
        </div>

        <Modal open={isImportModalOpen} title="Import Assignments" onClose={() => setIsImportModalOpen(false)}>
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-gray-600">Upload .xlsx file to bulk assign candidates.</p>
            <input type="file" accept=".xlsx" onChange={handleImport} className="hidden" id="imp-file" />
            <label htmlFor="imp-file" className="px-6 py-3 bg-indigo-600 text-white rounded-xl cursor-pointer font-bold block w-max mx-auto">
              {importing ? "Importing..." : "Select File"}
            </label>
          </div>
        </Modal>
      </div>
    </main>
  );
}
