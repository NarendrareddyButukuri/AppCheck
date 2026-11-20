import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Layers,
  ArrowRight,
  UploadCloud,
  FileText,
  Activity,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge';
import { api } from '../../services/api';

export default function DashboardOverview({ onNavigate, onSelectScan }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-8 h-8 border-2 border-[#79B8FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#A1ACBA] font-mono">Querying security records from PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-[#E87575]/10 border border-[#E87575]/30 text-[#E87575] max-w-xl mx-auto my-8">
        <h3 className="font-bold text-base mb-1">Failed to Load Dashboard</h3>
        <p className="text-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-1.5 bg-[#E87575] text-[#0B0E13] font-semibold text-xs rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Exact required behavior: If no scans yet, display professionally designed empty state!
  if (!stats || stats.total_scans === 0) {
    return (
      <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#171F2B] border border-[#79B8FF]/30 flex items-center justify-center text-[#79B8FF] mb-6 shadow-lg shadow-[#79B8FF]/10">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#F5F7FA]">No Applications Scanned Yet</h2>
        <p className="text-sm text-[#A1ACBA] mt-2 leading-relaxed">
          Your personal security audit workspace is initialized. Upload your first Android APK package to run static manifest analysis, permission intelligence, and machine learning risk assessment.
        </p>
        <button
          onClick={() => onNavigate('scanner')}
          className="mt-8 flex items-center gap-2.5 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 cursor-pointer"
        >
          <UploadCloud size={18} />
          <span>Start Your First Scan</span>
        </button>

        <div className="mt-12 p-4 rounded-xl bg-[#121720] border border-[#171F2B] text-left w-full text-xs font-mono text-[#A1ACBA]">
          <div className="flex items-center gap-2 text-[#79B8FF] font-sans font-semibold mb-2">
            <Info size={14} /> Ready to test with bundled sample APKs
          </div>
          <p>You can test with our built-in Clean Calculator APK or High-Risk Spyware APK on the Scanner tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="bg-[#171F2B] p-5 rounded-2xl border border-[#171F2B] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1ACBA]">Total Scans</span>
            <Layers size={18} className="text-[#79B8FF]" />
          </div>
          <p className="text-3xl font-extrabold text-[#F5F7FA] font-mono">{stats.total_scans}</p>
          <span className="text-[11px] text-[#A1ACBA] mt-1 block">Verified database records</span>
        </div>

        {/* Safe Classifications */}
        <div className="bg-[#171F2B] p-5 rounded-2xl border border-[#171F2B] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#67C99A]">Safe Profiles</span>
            <ShieldCheck size={18} className="text-[#67C99A]" />
          </div>
          <p className="text-3xl font-extrabold text-[#67C99A] font-mono">{stats.safe_count}</p>
          <span className="text-[11px] text-[#A1ACBA] mt-1 block">Low risk (score ≤ 25)</span>
        </div>

        {/* Medium Risk */}
        <div className="bg-[#171F2B] p-5 rounded-2xl border border-[#171F2B] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E9B96A]">Medium Risk</span>
            <AlertTriangle size={18} className="text-[#E9B96A]" />
          </div>
          <p className="text-3xl font-extrabold text-[#E9B96A] font-mono">{stats.medium_risk_count}</p>
          <span className="text-[11px] text-[#A1ACBA] mt-1 block">Moderate capability exposures</span>
        </div>

        {/* High Risk */}
        <div className="bg-[#171F2B] p-5 rounded-2xl border border-[#171F2B] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E87575]">High / Critical</span>
            <AlertOctagon size={18} className="text-[#E87575]" />
          </div>
          <p className="text-3xl font-extrabold text-[#E87575] font-mono">{stats.high_risk_count}</p>
          <span className="text-[11px] text-[#A1ACBA] mt-1 block">Elevated vulnerability vectors</span>
        </div>
      </div>

      {/* Operational Engine Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#121720] border border-[#171F2B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#67C99A]/10 text-[#67C99A] flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-xs text-[#A1ACBA]">System & Database Availability</p>
              <p className="text-sm font-bold text-[#F5F7FA]">{stats.system_availability} Operational</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#67C99A]/15 text-[#67C99A] border border-[#67C99A]/30">
            Healthy
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#121720] border border-[#171F2B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#79B8FF]/10 text-[#79B8FF] flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <p className="text-xs text-[#A1ACBA]">Machine Learning Model</p>
              <p className="text-sm font-bold text-[#F5F7FA]">
                {stats.ml_model_name ? `${stats.ml_model_name} (v${stats.ml_model_version || '1.0'})` : 'Active'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#79B8FF]/15 text-[#79B8FF] border border-[#79B8FF]/30">
            {stats.ml_model_availability ? 'Drebin / CIC Trained' : 'Rule Fallback'}
          </span>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-[#171F2B] rounded-2xl border border-[#171F2B] overflow-hidden">
        <div className="p-5 border-b border-[#121720] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Recent Security Audits</h3>
            <p className="text-xs text-[#A1ACBA] mt-0.5">Authentic inspection records from your account</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-[#79B8FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All History</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-[#121720] overflow-x-auto">
          {stats.recent_scans.map((scan) => (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan.id)}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#121720]/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#121720] border border-[#171F2B] flex items-center justify-center text-[#79B8FF] shrink-0 font-bold text-sm">
                  APK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F7FA] group-hover:text-[#79B8FF] transition-colors">
                    {scan.application.app_name || scan.application.package_name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[#A1ACBA] font-mono mt-0.5">
                    <span>{scan.application.package_name}</span>
                    <span>•</span>
                    <span>v{scan.application.version_name || '1.0'}</span>
                    <span>•</span>
                    <span>{new Date(scan.started_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <RiskBadge
                  level={scan.risk_assessment?.risk_level || 'SAFE'}
                  score={scan.risk_assessment?.score}
                />
                <ChevronRight size={16} className="text-[#A1ACBA] group-hover:text-[#79B8FF] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Findings Preview */}
      {stats.recent_findings && stats.recent_findings.length > 0 && (
        <div className="bg-[#171F2B] rounded-2xl border border-[#171F2B] p-5">
          <h3 className="text-base font-bold text-[#F5F7FA] mb-4">Latest Extracted Vulnerability Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recent_findings.map((finding) => (
              <div key={finding.id} className="p-4 rounded-xl bg-[#121720] border border-[#171F2B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#79B8FF] font-semibold">{finding.rule_id}</span>
                  <RiskBadge level={finding.severity} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-[#F5F7FA]">{finding.title}</h4>
                <p className="text-xs text-[#A1ACBA] line-clamp-2 leading-relaxed">{finding.description}</p>
                <div className="text-[11px] font-mono text-[#A1ACBA]/70 truncate">
                  Evidence: {finding.evidence || 'Manifest parameter'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
