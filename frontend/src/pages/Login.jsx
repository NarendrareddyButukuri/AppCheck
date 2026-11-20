import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      // Navigate to landing page after login as required by Step 4!
      onNavigate('landing');
    } catch (err) {
      setError(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 z-10">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <BrandLogo size="lg" showTagline={true} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA] mt-4">
            Security Intelligence Sign In
          </h1>
          <p className="text-sm text-[#A1ACBA] mt-1">
            Authenticate to audit application permissions and risk vectors.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#171F2B]/90 backdrop-blur-md border border-[#79B8FF]/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#E87575]/10 border border-[#E87575]/30 flex items-start gap-3 text-sm text-[#E87575]">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Input */}
            <div>
              <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-2">
                Work or Personal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="analyst@appcheck.io"
                  className={`w-full bg-[#121720] border ${
                    fieldErrors.email ? 'border-[#E87575]' : 'border-[#171F2B] focus:border-[#79B8FF]'
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-[#E87575] mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#A1ACBA] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-[#79B8FF] hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A1ACBA]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="••••••••••••"
                  className={`w-full bg-[#121720] border ${
                    fieldErrors.password ? 'border-[#E87575]' : 'border-[#171F2B] focus:border-[#79B8FF]'
                  } rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F5F7FA] placeholder-[#A1ACBA]/40 focus:outline-none focus:ring-1 focus:ring-[#79B8FF] transition-all`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A1ACBA] hover:text-[#F5F7FA] focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-[#E87575] mt-1.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#121720] border-[#171F2B] text-[#79B8FF] focus:ring-[#79B8FF] focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 text-xs text-[#A1ACBA] cursor-pointer select-none">
                Keep session active on this workstation
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#79B8FF]/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0B0E13] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to AppCheck</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t border-[#121720]/80">
            <p className="text-xs text-[#A1ACBA] mb-2 font-medium">Quick Test Credentials:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('analyst@appcheck.io');
                  setPassword('Security2026!AppCheck');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#121720] text-[#79B8FF] hover:bg-[#121720]/80 border border-[#79B8FF]/20"
              >
                Autofill Demo Analyst
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation to Sign Up */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#A1ACBA]">
            Don't have an AppCheck account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-medium text-[#79B8FF] hover:underline focus:outline-none"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
