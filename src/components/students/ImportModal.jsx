// ============================================
// FILE: src/components/students/ImportModal.jsx
// PURPOSE: Excel import modal
// ============================================

import { useState } from "react";
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from "lucide-react";
import { parseExcelFile, downloadStudentTemplate } from "../../utils/excelUtils";
import { addDocument } from "../../firebase/firestore";
import { COLLECTIONS } from "../../firebase/collections";

export default function ImportModal({ isOpen, onClose, teams }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState(null);

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
      const parseResult = await parseExcelFile(selectedFile, teams);
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
      const student = preview[i];
      const res = await addDocument(COLLECTIONS.STUDENTS, student);
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
    downloadStudentTemplate(teams);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Import Students</h2>
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
          {/* Success Result */}
          {result && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">
                Import Complete!
              </h3>
              <p className="text-emerald-700">
                ✅ {result.success} students added
                {result.failed > 0 && ` • ❌ ${result.failed} failed`}
              </p>
            </div>
          )}

          {/* Instructions */}
          {!result && !preview && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download the template file below</li>
                  <li>Fill in your students data</li>
                  <li>Team names must match your existing teams exactly</li>
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

              {teams.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  ⚠️ Create teams before importing students!
                </div>
              )}
            </div>
          )}

          {/* File Upload */}
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

          {/* Parsing */}
          {parsing && (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Parsing file...</p>
            </div>
          )}

          {/* Errors */}
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

          {/* Preview */}
          {preview && preview.length > 0 && !result && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preview ({preview.length} students ready to import)
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Chest</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Class</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.slice(0, 20).map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{s.chestNumber}</td>
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="px-3 py-2">
                          {s.class}{s.division && `-${s.division}`}
                        </td>
                        <td className="px-3 py-2">{s.teamName}</td>
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

          {/* Import Progress */}
          {importing && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-900">
                  Importing...
                </span>
                <span className="text-sm text-emerald-700">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
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
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition"
            >
              {importing ? "Importing..." : `Import ${preview.length} Students`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}