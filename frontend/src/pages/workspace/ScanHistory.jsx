import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  AlertOctagon,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge';
import { api } from '../../services/api';

export default function ScanHistory({ onSelectScan, onNavigate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans();
      setScans(data);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (e, scanId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this scan record and associated reports?')) {
      return;
    }

    setDeletingId(scanId);
    try {
      await api.deleteScan(scanId);
      setScans(scans.filter((s) => s.id !== scanId));
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredScans = scans.filter((s) => {
    const app = s.application;
    const matchesSearch =
      (app.app_name && app.app_name.toLowerCase().includes(search.toLowerCase())) ||
      app.package_name.toLowerCase().includes(search.toLowerCase()) ||
      app.sha256_hash.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === 'ALL' ||
      (s.risk_assessment && s.risk_assessment.risk_level.toUpperCase() === riskFilter.toUpperCase());

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
            Historical Scan Archives
          </h1>
          <p className="text-sm text-[#A1ACBA] mt-1">
            Persisted records and audit history tied to your account.
          </p>
        </div>

        <button
          onClick={() => onNavigate('scanner')}
          className="flex items-center gap-1.5 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <UploadCloud size={15} />
          <span>New APK Scan</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#171F2B] p-3.5 rounded-xl border border-[#171F2B]">
        <div className="relative flex-1">
          <Search size={16} className="absolute inset-y-0 left-3 my-auto text-[#A1ACBA]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by app name, package, or SHA-256 hash..."
            className="w-full bg-[#121720] text-xs text-[#F5F7FA] pl-9 pr-3 py-2 rounded-lg border border-[#171F2B] focus:outline-none focus:border-[#79B8FF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#A1ACBA]" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#121720] text-xs text-[#F5F7FA] px-3 py-2 rounded-lg border border-[#171F2B] focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="SAFE">Safe / Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>
      </div>

      {/* Scans List Table */}
      <div className="bg-[#171F2B] rounded-2xl border border-[#171F2B] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#A1ACBA]">
            <div className="w-6 h-6 border-2 border-[#79B8FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading scan history records...
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A1ACBA] space-y-3">
            <p>No historical scans found matching your search.</p>
            <button
              onClick={() => onNavigate('scanner')}
              className="text-[#79B8FF] font-semibold hover:underline"
            >
              Scan an application now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#121720]">
            {filteredScans.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectScan(s.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121720]/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#121720] border border-[#171F2B] flex items-center justify-center text-[#79B8FF] shrink-0 font-bold text-xs">
                    APK
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F7FA] group-hover:text-[#79B8FF] transition-colors">
                      {s.application.app_name || s.application.package_name}
                    </h3>
                    <p className="text-xs font-mono text-[#A1ACBA] mt-0.5">{s.application.package_name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#A1ACBA]/70 mt-1">
                      <span>Hash: {s.application.sha256_hash.slice(0, 16)}...</span>
                      <span>•</span>
                      <span>Date: {new Date(s.started_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Target SDK: {s.application.target_sdk || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <RiskBadge
                    level={s.risk_assessment?.risk_level || 'SAFE'}
                    score={s.risk_assessment?.score}
                  />

                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    disabled={deletingId === s.id}
                    title="Delete Scan Record"
                    className="p-2 rounded-lg bg-[#121720] text-[#A1ACBA] hover:text-[#E87575] hover:bg-[#E87575]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>

                  <ChevronRight size={16} className="text-[#A1ACBA] group-hover:text-[#79B8FF] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
