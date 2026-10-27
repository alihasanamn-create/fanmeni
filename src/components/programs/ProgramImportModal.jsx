// ============================================
// FILE: src/components/programs/ProgramImportModal.jsx
// PURPOSE: Import programs from Excel
// ============================================

import { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from "lucide-react";
import { parseProgramExcel, downloadProgramTemplate } from "../../utils/programExcelUtils";
import { addDocument } from "../../firebase/firestore";
import { COLLECTIONS } from "../../firebase/collections";

export default function ProgramImportModal({ isOpen, onClose, moduleType }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState(null);

  const collectionName = moduleType === "sports" ? COLLECTIONS.SPORTS : COLLECTIONS.ARTS;
  const moduleLabel = moduleType === "sports" ? "Riyadha" : "Arts";
  const gradientClass = moduleType === "sports"
    ? "from-blue-500 to-indigo-600"
    : "from-purple-500 to-pink-600";

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setErrors(["Please select an Excel file (.xlsx or .xls)"]);
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setErrors([]);
    setPreview(null);

    try {
      const parseResult = await parseProgramExcel(selectedFile, moduleType);
      setPreview(parseResult.data);
      setErrors(parseResult.errors);
    } catch (err) {
      setErrors([err.error || "Failed to parse file"]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;

    setImporting(true);
    setProgress({ current: 0, total: preview.length });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < preview.length; i++) {
      const program = preview[i];
      const res = await addDocument(collectionName, program);
      if (res.success) success++;
      else failed++;
      setProgress({ current: i + 1, total: preview.length });
    }

    setImporting(false);
    setResult({ success, failed });
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setErrors([]);
    setResult(null);
    setProgress({ current: 0, total: 0 });
    onClose();
  };

  const handleDownloadTemplate = () => {
    downloadProgramTemplate(moduleType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center shadow-md`}>
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Import {moduleLabel} Programs
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {result && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">
                Import Complete!
              </h3>
              <p className="text-emerald-700">
                ✅ {result.success} programs added
                {result.failed > 0 && ` • ❌ ${result.failed} failed`}
              </p>
            </div>
          )}

          {!result && !preview && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download the template file below</li>
                  <li>Fill in your programs data</li>
                  <li>Points auto-calculated based on Type</li>
                  <li>Upload the completed file</li>
                </ol>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition font-medium"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          )}

          {!result && (
            <div>
              <label className="block">
                <div className="w-full py-10 border-2 border-dashed border-gray-300 rounded-2xl text-center hover:border-emerald-500 transition cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    {file ? file.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-500">.xlsx or .xls</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={parsing || importing}
                />
              </label>
            </div>
          )}

          {parsing && (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Parsing file...</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-red-900">
                  {errors.length} Warning{errors.length > 1 ? "s" : ""}:
                </h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {preview && preview.length > 0 && !result && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preview ({preview.length} programs ready)
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Code</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.slice(0, 20).map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono">{p.code || "—"}</td>
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2">{p.category}</td>
                        <td className="px-3 py-2">{p.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                    ...and {preview.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {importing && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-900">Importing...</span>
                <span className="text-sm text-emerald-700">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition"
          >
            {result ? "Close" : "Cancel"}
          </button>
          {preview && preview.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className={`px-6 py-2.5 bg-gradient-to-r ${gradientClass} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition`}
            >
              {importing ? "Importing..." : `Import ${preview.length} Programs`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}