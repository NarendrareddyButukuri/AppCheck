import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { api } from '../services/api';

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      // In local dev/test environment, if demo token returned in data, populate for seamless testing
      if (res.data && res.data.demo_reset_token) {
        setResetToken(res.data.demo_reset_token);
      }
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken.trim()) {
      setError('Reset token is required.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setMessage(res.message);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 z-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <BrandLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] mt-2">
            Password Recovery
          </h1>
          <p className="text-sm text-[#A1ACBA] mt-1">
            Secure single-use cryptographic token reset workflow.
          </p>
        </div>

        <div className="bg-[#171F2B]/90 backdrop-blur-md border border-[#79B8FF]/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#E87575]/10 border border-[#E87575]/30 flex items-start gap-3 text-sm text-[#E87575]">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-2">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@appcheck.io"
                    className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-[#A1ACBA] mt-2 leading-relaxed">
                  We will transmit a cryptographic reset token if this address exists in our database.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? 'Issuing Token...' : 'Send Recovery Token'}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#79B8FF]/10 border border-[#79B8FF]/30 text-xs text-[#79B8FF] mb-3">
                {message || 'If registered, your reset token has been generated.'}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                  Single-Use Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste received token"
                    className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF]"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Set New Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#67C99A]/10 border border-[#67C99A]/30 flex items-center justify-center mx-auto text-[#67C99A]">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">Password Updated</h3>
              <p className="text-xs text-[#A1ACBA] leading-relaxed">
                Your credentials have been securely refreshed using Argon2id. You can now authenticate.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold py-2.5 px-4 rounded-xl transition-all"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          <div className="pt-5 mt-5 border-t border-[#121720]/80 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#A1ACBA] hover:text-[#79B8FF] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
