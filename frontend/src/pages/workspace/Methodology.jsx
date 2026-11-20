import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function Methodology() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-xs text-[#A1ACBA]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
          Help & Audit Methodology
        </h1>
        <p className="text-sm text-[#A1ACBA] mt-1">
          A transparent review of AppCheck's static analysis, scoring algorithms, and ML pipelines.
        </p>
      </div>

      {/* 1. Core Principles */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#67C99A]" />
          <span>Non-Destructive Static Analysis Philosophy</span>
        </h3>
        <p className="leading-relaxed">
          AppCheck does not dynamically execute or install uploaded APK files. We unpack the APK archive container, decompile the compiled binary XML manifest (AXML), and inspect DEX structural headers. This completely eliminates execution risk while providing an immediate view of declared capabilities.
        </p>
      </div>

      {/* 2. Mathematical Risk Scoring Engine */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <Layers size={18} className="text-[#79B8FF]" />
          <span>Documented Risk Scoring Methodology (0–100)</span>
        </h3>
        <p className="leading-relaxed">
          Scores are not arbitrary permission counts. They are calculated through a multi-factor heuristic model:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
          <div className="p-3 rounded-xl bg-[#121720] border border-[#171F2B]">
            <span className="text-[#E87575] font-bold">Critical Severity (+35 pts)</span>
            <p className="text-[#A1ACBA] mt-1 font-sans">Debuggable application flags or full SMS exfiltration clusters.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121720] border border-[#171F2B]">
            <span className="text-[#E9B96A] font-bold">High Severity (+20 pts)</span>
            <p className="text-[#A1ACBA] mt-1 font-sans">System alert window overlays or unauthenticated exported services.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121720] border border-[#171F2B]">
            <span className="text-[#79B8FF] font-bold">Medium Severity (+10 pts)</span>
            <p className="text-[#A1ACBA] mt-1 font-sans">Cleartext HTTP traffic allowed or outdated target SDK (&lt; API 31).</p>
          </div>
          <div className="p-3 rounded-xl bg-[#121720] border border-[#171F2B]">
            <span className="text-[#A1ACBA] font-bold">Category Damping (0.4x)</span>
            <p className="text-[#A1ACBA] mt-1 font-sans">Repeated findings in the same category are damped to avoid score inflation.</p>
          </div>
        </div>

        <p className="pt-2 leading-relaxed">
          Classification Thresholds: <strong>0–25</strong> (Safe/Low Risk), <strong>26–55</strong> (Medium Risk), <strong>56–100</strong> (High/Critical Risk).
        </p>
      </div>

      {/* 3. Machine Learning Pipeline */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <Cpu size={18} className="text-[#79B8FF]" />
          <span>Machine Learning Intelligence (Drebin & CICAndMal2017)</span>
        </h3>
        <p className="leading-relaxed">
          Our machine learning classifier utilizes a Random Forest model trained on verified Android malware and benign application permission schemas. It maps 26 distinct permission and component dimensions to evaluate non-linear patterns of abuse (such as concurrent requests for boot completion, phone state reading, and background location).
        </p>
      </div>

      {/* 4. Limitations & Disclaimers */}
      <div className="bg-[#121720] rounded-2xl p-6 border border-[#171F2B] space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <Info size={18} className="text-[#E9B96A]" />
          <span>Audit Limitations & Legal Disclaimer</span>
        </h3>
        <p className="leading-relaxed text-[#A1ACBA]">
          "AppCheck provides first-level static security analysis. It cannot guarantee that an application is completely safe or conclusively determine malicious behavior."
        </p>
        <p className="leading-relaxed text-[#A1ACBA]">
          Static checks cannot analyze encrypted code dynamically loaded from remote servers after installation or native assembly binaries (.so files) executing outside Dalvik/ART. Always practice defense-in-depth.
        </p>
      </div>
    </div>
  );
}
