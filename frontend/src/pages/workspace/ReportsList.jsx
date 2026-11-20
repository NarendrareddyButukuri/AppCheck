import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function ReportsList({ onSelectScan }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const data = await api.getReportsList();
        setReports(data);
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownload = async (scanId) => {
    setDownloadingId(scanId);
    try {
      const blob = await api.downloadReportPdf(scanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AppCheck_Security_Audit_${scanId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
          Generated Security Reports
        </h1>
        <p className="text-sm text-[#A1ACBA] mt-1">
          Exportable PDF audit documentation compiled by the AppCheck ReportLab engine.
        </p>
      </div>

      <div className="bg-[#171F2B] rounded-2xl border border-[#171F2B] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#A1ACBA]">
            <div className="w-6 h-6 border-2 border-[#79B8FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading generated reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A1ACBA] space-y-2">
            <FileText size={32} className="mx-auto text-[#79B8FF]/40 mb-3" />
            <p className="font-semibold text-[#F5F7FA]">No PDF reports compiled yet.</p>
            <p>PDF security dossiers are automatically compiled upon completing an APK scan.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#121720]">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#121720]/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#79B8FF]/10 text-[#79B8FF] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F7FA]">
                      Security Audit Document (ID: {r.id.slice(0, 8)})
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[#A1ACBA] font-mono mt-0.5">
                      <span>Format: {r.report_type}</span>
                      <span>•</span>
                      <span>Size: {(r.file_size_bytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>Date: {new Date(r.generated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectScan(r.scan_id)}
                    className="text-xs text-[#79B8FF] hover:underline px-3 py-1.5 rounded-lg bg-[#121720] border border-[#171F2B] cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownload(r.scan_id)}
                    disabled={downloadingId === r.scan_id}
                    className="flex items-center gap-1.5 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{downloadingId === r.scan_id ? 'Downloading...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
