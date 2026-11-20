import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  FileText,
  Lock,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Database,
  Eye,
  CheckCircle2,
  Terminal,
  Activity,
  AlertTriangle
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function Landing({ onNavigate }) {
  const { user, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Does AppCheck install or run the uploaded APK on my device?",
      a: "No. AppCheck strictly performs non-destructive static security analysis on the server. The APK is never executed, installed, or permitted to open live sockets on the host environment, completely eliminating runtime risk."
    },
    {
      q: "How does the machine learning engine evaluate application risk?",
      a: "Our ML pipeline utilizes an ensemble Random Forest classifier trained on verified permission and component matrices derived from documented research datasets (Drebin & CICAndMal2017). It correlates permission clusters, exported components, and manifest flags to assess behavioral tendencies."
    },
    {
      q: "What is the difference between requested and granted permissions?",
      a: "An APK manifest declares every permission the application might ever request. On modern Android (API 23+), dangerous permissions like Location or Camera require explicit runtime consent from the user. AppCheck inspects the static manifest capabilities."
    },
    {
      q: "Can AppCheck revoke permissions from apps already installed on my smartphone?",
      a: "No. AppCheck is an independent intelligence and audit platform. It analyzes APK package files before you install them or during security reviews. You manage device permissions directly through your Android Settings."
    },
    {
      q: "How is my uploaded APK file and data handled?",
      a: "Uploaded APKs are isolated with cryptographic UUID identifiers, analyzed within private sandbox workers, and stored strictly under your authenticated account ownership. You retain the ability to delete scans and reports at any time."
    }
  ];

  return (
    <div className="relative min-h-screen text-[#F5F7FA] z-10 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0B0E13]/80 backdrop-blur-md border-b border-[#171F2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" showTagline={false} />
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-mono text-[#A1ACBA] bg-[#121720] px-3 py-1.5 rounded-lg border border-[#171F2B]">
              Authenticated as <strong className="text-[#F5F7FA]">{user?.full_name || user?.email}</strong>
            </span>
            <button
              onClick={() => onNavigate('workspace')}
              className="flex items-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#79B8FF]/20 cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={async () => {
                await logout();
                onNavigate('login');
              }}
              className="text-xs text-[#A1ACBA] hover:text-[#E87575] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171F2B] border border-[#79B8FF]/30 text-xs text-[#79B8FF] mb-8 font-medium">
              <Sparkles size={14} />
              <span>Android Security Intelligence Platform v1.0</span>
            </div>

            {/* Exact Required Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.15] max-w-4xl mx-auto">
              Understand what's happening inside your apps.
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="mt-6 text-lg sm:text-xl text-[#A1ACBA] max-w-3xl mx-auto leading-relaxed font-normal">
              Discover what your Android apps can access. Analyze permissions, identify potential security concerns and make more informed decisions.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('scanner')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] text-base font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#79B8FF]/25 cursor-pointer group"
              >
                <span>Start scanning</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#171F2B] hover:bg-[#1F2A3A] text-[#F5F7FA] text-base font-medium px-7 py-3.5 rounded-xl border border-[#79B8FF]/20 transition-all cursor-pointer"
              >
                <span>Explore how it works</span>
                <ChevronDown size={18} />
              </a>
            </div>

            {/* Animated Security Visualization */}
            <div className="mt-16 max-w-4xl mx-auto p-1.5 rounded-2xl bg-gradient-to-b from-[#79B8FF]/20 via-[#171F2B]/50 to-[#121720]/80 border border-[#79B8FF]/30 shadow-2xl shadow-black/80">
              <div className="bg-[#0B0E13]/90 rounded-xl p-6 sm:p-8 text-left font-mono text-xs border border-[#171F2B]">
                <div className="flex items-center justify-between pb-4 border-b border-[#171F2B] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#E87575]/80" />
                    <span className="w-3 h-3 rounded-full bg-[#E9B96A]/80" />
                    <span className="w-3 h-3 rounded-full bg-[#67C99A]/80" />
                    <span className="text-[#A1ACBA] ml-2 font-sans font-medium text-xs">AppCheck Static Security Engine Terminal</span>
                  </div>
                  <span className="text-[10px] text-[#67C99A] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#67C99A] animate-pulse" /> Live Analysis Core
                  </span>
                </div>
                
                <div className="space-y-2 text-[#A1ACBA]">
                  <p className="text-[#79B8FF]">$ appcheck analyze --apk sample_android_target.apk</p>
                  <p>✓ Archive verified: SHA-256 7f9a2b... Valid AndroidManifest.xml found.</p>
                  <p>✓ Decompiled binary AXML tree: 24 permissions, 4 activities, 2 services.</p>
                  <p className="text-[#E9B96A]">! Alert: Sensitive cluster detected (READ_SMS + SEND_SMS + INTERNET).</p>
                  <p className="text-[#E87575]">! Exposure: Unprotected exported Service (SyncService) declared without permission guard.</p>
                  <p className="text-[#79B8FF]">✓ Random Forest ML model evaluated with calibrated probability score.</p>
                  <p className="text-[#67C99A]">✓ Heuristic risk assessment completed. Score: 68/100 (HIGH RISK). Audit report generated.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PRODUCT INTRODUCTION */}
        <section className="py-16 sm:py-20 bg-[#121720]/60 border-y border-[#171F2B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs uppercase tracking-widest text-[#79B8FF] font-semibold mb-3">Product Overview</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
                Demystifying Android security through transparent static intelligence.
              </p>
              <p className="mt-4 text-[#A1ACBA] text-base leading-relaxed">
                Modern smartphone users frequently grant sensitive permissions without realizing the deep access capabilities granted. AppCheck inspects Android package structures to reveal what an application can actually do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#171F2B] p-6 rounded-2xl border border-[#171F2B] hover:border-[#79B8FF]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#79B8FF]/10 text-[#79B8FF] flex items-center justify-center mb-4">
                  <Eye size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">Pre-Installation Auditing</h3>
                <p className="text-sm text-[#A1ACBA] leading-relaxed">
                  Evaluate APK files before committing them to your physical hardware. Know whether a casual flashlight app requests full SMS and contact access.
                </p>
              </div>

              <div className="bg-[#171F2B] p-6 rounded-2xl border border-[#171F2B] hover:border-[#79B8FF]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#67C99A]/10 text-[#67C99A] flex items-center justify-center mb-4">
                  <Cpu size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">Evidence-Based Findings</h3>
                <p className="text-sm text-[#A1ACBA] leading-relaxed">
                  Every identified risk links directly to verifiable bytecode or manifest declarations. Zero fabricated warnings or exaggerated threats.
                </p>
              </div>

              <div className="bg-[#171F2B] p-6 rounded-2xl border border-[#171F2B] hover:border-[#79B8FF]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#E9B96A]/10 text-[#E9B96A] flex items-center justify-center mb-4">
                  <Database size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">Isolated Research Platform</h3>
                <p className="text-sm text-[#A1ACBA] leading-relaxed">
                  Architected with strict account segregation, PostgreSQL persistence, and dedicated worker analysis routines for everyday users and researchers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW APPCHECK WORKS */}
        <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs uppercase tracking-widest text-[#79B8FF] font-semibold mb-3">Analysis Pipeline</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
                How AppCheck analyzes your applications.
              </p>
              <p className="mt-4 text-[#A1ACBA] text-base">
                A multi-stage static verification pipeline executing purely on package structures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Package Ingestion",
                  desc: "APK archive verification, SHA-256 fingerprinting, and cryptographic UUID containment.",
                  icon: Layers
                },
                {
                  step: "02",
                  title: "Manifest Parsing",
                  desc: "Extraction of AndroidManifest.xml, intent filters, exported components, and target SDK definitions.",
                  icon: Search
                },
                {
                  step: "03",
                  title: "Static Rule & ML",
                  desc: "Heuristic rule matching alongside Random Forest evaluation on Drebin/CICAndMal2017 feature schemas.",
                  icon: Activity
                },
                {
                  step: "04",
                  title: "Explainable Report",
                  desc: "Mathematical risk scoring, permission categorization, and ReportLab PDF document compilation.",
                  icon: FileText
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="relative bg-[#171F2B] p-6 rounded-2xl border border-[#171F2B]">
                    <span className="text-3xl font-black text-[#79B8FF]/20 font-mono absolute top-4 right-4">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#79B8FF]/10 text-[#79B8FF] flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-[#F5F7FA] mb-2">{item.title}</h3>
                    <p className="text-xs text-[#A1ACBA] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: PERMISSION INTELLIGENCE */}
        <section className="py-20 sm:py-24 bg-[#121720]/60 border-y border-[#171F2B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-[#79B8FF] font-semibold mb-3">Subsystem Auditing</h2>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
                  Granular permission intelligence across 11 Android subsystems.
                </h3>
                <p className="mt-4 text-[#A1ACBA] text-sm leading-relaxed">
                  We maintain a structured knowledge base of normal, dangerous, signature, and special Android permissions. Permissions are grouped into high-impact categories:
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6 text-xs text-[#F5F7FA]">
                  {[
                    "Location (Fine, Coarse, Background)",
                    "Microphone & Audio Recording",
                    "Camera & Image Sensors",
                    "Contacts & Account Enumeration",
                    "Phone & Call Log History",
                    "SMS & 2FA Interception Vectors",
                    "Storage & Shared Media",
                    "System Overlay & Dropper Flags"
                  ].map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#171F2B] border border-[#171F2B]">
                      <CheckCircle2 size={14} className="text-[#67C99A] shrink-0" />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#79B8FF]/20 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#121720] mb-4">
                  <span className="text-xs font-semibold uppercase text-[#A1ACBA]">Permission Intelligence Preview</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E87575]/15 text-[#E87575] font-medium border border-[#E87575]/30">Dangerous</span>
                </div>
                <div className="space-y-3 font-sans">
                  <div>
                    <span className="font-mono text-xs text-[#79B8FF]">android.permission.ACCESS_FINE_LOCATION</span>
                    <p className="text-xs text-[#A1ACBA] mt-1">Allows precise physical location tracking via GPS and network towers.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#121720] text-xs text-[#E9B96A]">
                    <strong>Security Relevance:</strong> High risk of continuous spatial surveillance if paired with background location or network telemetry sockets.
                  </div>
                  <div className="text-[11px] font-mono text-[#A1ACBA]/70">
                    Evidence: &lt;uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" /&gt;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PRIVACY COMMITMENTS */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#67C99A]/10 text-[#67C99A] flex items-center justify-center mx-auto mb-6">
              <Lock size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Security & Privacy Commitments
            </h2>
            <p className="mt-4 text-[#A1ACBA] text-sm leading-relaxed">
              AppCheck operates under zero-trust static processing principles. Uploaded packages are isolated, never published or shared with third-party advertising networks, and can be permanently purged at the user's discretion.
            </p>
          </div>
        </section>

        {/* SECTION 6: FAQ */}
        <section className="py-20 sm:py-24 bg-[#121720]/60 border-t border-[#171F2B]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-xs uppercase tracking-widest text-[#79B8FF] font-semibold mb-2">FAQ</h2>
              <p className="text-3xl font-bold tracking-tight text-[#F5F7FA]">
                Frequently Asked Questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-[#171F2B] rounded-xl border border-[#171F2B] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-[#F5F7FA]">{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-[#79B8FF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-[#A1ACBA] leading-relaxed border-t border-[#121720]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E13] border-t border-[#171F2B] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo size="sm" showTagline={true} />
          <p className="text-xs text-[#A1ACBA]">
            © 2026 AppCheck Intelligence Core. All rights reserved. Non-destructive static analysis platform.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#79B8FF]">
            <button onClick={() => onNavigate('workspace')} className="hover:underline">Workspace</button>
            <button onClick={() => onNavigate('scanner')} className="hover:underline">New Scan</button>
            <button onClick={() => onNavigate('methodology')} className="hover:underline">Methodology</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
