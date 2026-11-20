import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Strong password checker
  const checkPasswordStrength = (pass) => {
    return {
      length: pass.length >= 8,
      hasLetter: /[a-zA-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const strength = checkPasswordStrength(password);
  const isStrong = strength.length && strength.hasLetter && strength.hasNumber;

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (!isStrong) {
      errs.password = 'Password must meet security policy requirements (at least 8 chars with letters & numbers).';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      errs.terms = 'You must accept the terms of service and privacy policy.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await register(fullName, email, password, termsAccepted);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('landing');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
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
            Create AppCheck Account
          </h1>
          <p className="text-sm text-[#A1ACBA] mt-1">
            Access enterprise-grade Android permission audits and static ML analysis.
          </p>
        </div>

        <div className="bg-[#171F2B]/90 backdrop-blur-md border border-[#79B8FF]/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#E87575]/10 border border-[#E87575]/30 flex items-start gap-3 text-sm text-[#E87575]">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#67C99A]/10 border border-[#67C99A]/30 flex items-center gap-3 text-sm text-[#67C99A]">
              <CheckCircle size={18} className="shrink-0" />
              <span>Account created securely with Argon2id! Entering workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Security Analyst"
                  className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all"
                  disabled={loading}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs text-[#E87575] mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                Email Address
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
              {fieldErrors.email && (
                <p className="text-xs text-[#E87575] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A1ACBA] hover:text-[#F5F7FA]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password && (
                <div className="grid grid-cols-3 gap-1.5 mt-2 text-[11px] text-[#A1ACBA]">
                  <span className={strength.length ? 'text-[#67C99A]' : 'text-[#A1ACBA]/50'}>
                    ✓ 8+ Characters
                  </span>
                  <span className={strength.hasLetter ? 'text-[#67C99A]' : 'text-[#A1ACBA]/50'}>
                    ✓ Letters
                  </span>
                  <span className={strength.hasNumber ? 'text-[#67C99A]' : 'text-[#A1ACBA]/50'}>
                    ✓ Numbers
                  </span>
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-[#E87575] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all"
                  disabled={loading}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-[#E87575] mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Privacy acceptance */}
            <div className="pt-1">
              <label className="flex items-start cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-[#121720] border-[#171F2B] text-[#79B8FF] focus:ring-[#79B8FF]"
                />
                <span className="ml-2 text-xs text-[#A1ACBA] leading-tight">
                  I accept the{' '}
                  <span className="text-[#79B8FF] hover:underline">Terms of Service</span> and acknowledge
                  the evidence-based <span className="text-[#79B8FF] hover:underline">Privacy Policy</span>.
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="text-xs text-[#E87575] mt-1">{fieldErrors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0B0E13] border-t-transparent rounded-full animate-spin" />
                  <span>Registering Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-[#A1ACBA]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-medium text-[#79B8FF] hover:underline focus:outline-none"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
