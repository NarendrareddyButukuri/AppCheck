import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCode,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { api } from '../../services/api';

export default function Scanner({ onScanComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setError('Invalid file format. Please upload an official Android application package (.apk).');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setError('File size exceeds the maximum limit of 150 MB.');
      return;
    }

    setSelectedFile(file);
  };

  const startScan = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setCurrentStage('Transmitting APK to sandbox worker...');
    setProgressPercent(20);

    try {
      setCurrentStage('Validating archive integrity & AndroidManifest.xml...');
      setProgressPercent(40);

      // Perform genuine backend analysis
      const result = await api.uploadAndScan(selectedFile);

      setCurrentStage('Static rules, ML prediction & report persistence complete.');
      setProgressPercent(100);

      // Transition to results page
      setTimeout(() => {
        onScanComplete(result.id);
      }, 600);
    } catch (err) {
      setError(err.message || 'Scan failed due to an unexpected backend parsing error.');
      setUploading(false);
    }
  };

  const loadSampleApk = async (filename) => {
    setError('');
    setCurrentStage('Fetching bundled test package...');
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) throw new Error('Could not load sample APK from assets.');
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'application/vnd.android.package-archive' });
      setSelectedFile(file);
    } catch (e) {
      setError(`Failed to load sample APK: ${e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
          Android APK Security Scanner
        </h1>
        <p className="text-sm text-[#A1ACBA] mt-1">
          Perform non-destructive static analysis, manifest verification, and Drebin-trained ML risk assessment.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#E87575]/10 border border-[#E87575]/30 flex items-start gap-3 text-sm text-[#E87575]">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-[#79B8FF] bg-[#79B8FF]/10'
            : selectedFile
            ? 'border-[#67C99A]/50 bg-[#171F2B]'
            : 'border-[#171F2B] hover:border-[#79B8FF]/40 bg-[#121720]/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".apk"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelected(e.target.files[0]);
            }
          }}
          className="hidden"
          disabled={uploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#171F2B] border border-[#79B8FF]/30 flex items-center justify-center text-[#79B8FF]">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-base font-semibold text-[#F5F7FA]">
                Drag and drop your Android APK file here
              </p>
              <p className="text-xs text-[#A1ACBA] mt-1">
                Only valid Android archive files (.apk) up to 150 MB are supported.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 bg-[#171F2B] hover:bg-[#1F2A3A] text-[#79B8FF] text-xs font-semibold px-5 py-2.5 rounded-xl border border-[#79B8FF]/30 transition-all cursor-pointer"
            >
              Browse Local Files
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#67C99A]/10 border border-[#67C99A]/30 flex items-center justify-center text-[#67C99A]">
              <FileCode size={32} />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[#F5F7FA] font-mono break-all max-w-md">
                {selectedFile.name}
              </h3>
              <p className="text-xs text-[#A1ACBA] mt-1">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            </div>

            {uploading ? (
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#79B8FF]">{currentStage}</span>
                  <span className="text-[#F5F7FA] font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121720] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#79B8FF] to-[#67C99A] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={startScan}
                  className="flex items-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  <span>Initiate Security Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2.5 rounded-xl bg-[#121720] text-[#A1ACBA] hover:text-[#E87575] border border-[#171F2B] transition-colors cursor-pointer"
                  title="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Test Samples */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B]">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA] mb-2">
          <Sparkles size={16} className="text-[#79B8FF]" />
          <span>Quick Verification APK Samples</span>
        </div>
        <p className="text-xs text-[#A1ACBA] mb-4 leading-relaxed">
          Don't have an APK on hand? Test the complete genuine end-to-end analysis pipeline with pre-compiled Android packages:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => loadSampleApk('sample_safe_calculator.apk')}
            disabled={uploading}
            className="flex items-start gap-3 p-4 rounded-xl bg-[#121720] border border-[#171F2B] hover:border-[#67C99A]/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#67C99A]/15 text-[#67C99A] flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#67C99A] transition-colors">
                Clean Calculator (Safe Sample)
              </p>
              <p className="text-[11px] text-[#A1ACBA] mt-0.5">
                Minimal permissions (Internet, Vibrate). Targets API 34. Non-debuggable.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadSampleApk('sample_high_risk_spyware.apk')}
            disabled={uploading}
            className="flex items-start gap-3 p-4 rounded-xl bg-[#121720] border border-[#171F2B] hover:border-[#E87575]/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E87575]/15 text-[#E87575] flex items-center justify-center shrink-0">
              <AlertCircle size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#E87575] transition-colors">
                Spyware / Flashlight (High Risk)
              </p>
              <p className="text-[11px] text-[#A1ACBA] mt-0.5">
                SMS interception, background location, overlay, dropper, debuggable flag.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Analysis Limitations Banner */}
      <div className="p-4 rounded-xl bg-[#121720]/60 border border-[#171F2B] text-xs text-[#A1ACBA] space-y-1.5 leading-relaxed">
        <p className="font-semibold text-[#F5F7FA]">Static Security Guarantee & Scope:</p>
        <p>
          AppCheck inspects the static manifest and bytecode structure. Files are evaluated in a memory-isolated execution container. We never install or execute APK binaries, ensuring safe evaluation of untrusted third-party packages.
        </p>
      </div>
    </div>
  );
}
