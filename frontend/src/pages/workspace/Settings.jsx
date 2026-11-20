import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Moon,
  Sun,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Settings({ onNavigate }) {
  const { user, logout, refreshUser } = useAuth();
  
  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Theme preference
  const [theme, setTheme] = useState('dark');

  // Delete account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileLoading(true);
    try {
      await api.updateProfile(fullName);
      await refreshUser();
      setProfileMessage('Profile information successfully updated.');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPwMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" in capital letters to confirm permanent account purge.');
      return;
    }

    if (!window.confirm('FINAL WARNING: This will permanently wipe your account, all scans, and all reports.')) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.deleteAccount('DELETE');
      await logout();
      onNavigate('login');
    } catch (err) {
      setDeleteError(err.message || 'Account deletion failed.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">Account & System Settings</h1>
        <p className="text-sm text-[#A1ACBA] mt-1">
          Manage your personal credentials, theme, active sessions, and data retention preferences.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <UserIcon size={18} className="text-[#79B8FF]" />
          <span>Profile Information</span>
        </div>

        {profileMessage && (
          <div className="p-3 rounded-xl bg-[#67C99A]/10 border border-[#67C99A]/30 text-xs text-[#67C99A] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
              Email Address (Read-only)
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full bg-[#121720] border border-[#171F2B] rounded-xl px-3.5 py-2 text-xs text-[#A1ACBA] font-mono cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
              Full Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl px-3.5 py-2 text-xs text-[#F5F7FA] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            {profileLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* 2. Change Password */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <KeyRound size={18} className="text-[#79B8FF]" />
          <span>Change Password (Argon2id Hashing)</span>
        </div>

        {pwMessage && (
          <div className="p-3 rounded-xl bg-[#67C99A]/10 border border-[#67C99A]/30 text-xs text-[#67C99A] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{pwMessage}</span>
          </div>
        )}

        {pwError && (
          <div className="p-3 rounded-xl bg-[#E87575]/10 border border-[#E87575]/30 text-xs text-[#E87575] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl px-3.5 py-2 text-xs text-[#F5F7FA] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
              New Secure Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl px-3.5 py-2 text-xs text-[#F5F7FA] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1ACBA] uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#121720] border border-[#171F2B] focus:border-[#79B8FF] rounded-xl px-3.5 py-2 text-xs text-[#F5F7FA] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 3. Theme & Appearance */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Moon size={18} className="text-[#79B8FF]" />
          <span>Interface Appearance</span>
        </div>
        <p className="text-xs text-[#A1ACBA]">Select your preferred motion and contrast theme:</p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'border-[#79B8FF] bg-[#121720] text-[#79B8FF]'
                : 'border-[#171F2B] bg-[#121720]/50 text-[#A1ACBA]'
            }`}
          >
            <Moon size={16} />
            <span>Futuristic Dark (#0B0E13)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'border-[#79B8FF] bg-[#121720] text-[#79B8FF]'
                : 'border-[#171F2B] bg-[#121720]/50 text-[#A1ACBA]'
            }`}
          >
            <Sun size={16} />
            <span>Refined Light</span>
          </button>
        </div>
      </div>

      {/* 4. Data Retention & Privacy Policy */}
      <div className="bg-[#171F2B] rounded-2xl p-6 border border-[#171F2B] space-y-3 text-xs text-[#A1ACBA]">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Database size={18} className="text-[#79B8FF]" />
          <span>Data Retention & Security Policies</span>
        </div>
        <p className="leading-relaxed">
          Uploaded APK files are temporarily buffered to extract manifest declarations and feature vectors. Scans, permissions, findings, and ReportLab PDF documents persist in PostgreSQL with account-level isolation. You maintain total data sovereignty.
        </p>
      </div>

      {/* 5. Destructive Zone: Delete Account */}
      <div className="bg-[#E87575]/5 rounded-2xl p-6 border border-[#E87575]/25 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#E87575]">
          <ShieldAlert size={18} />
          <span>Permanent Account & Data Deletion</span>
        </div>
        <p className="text-xs text-[#A1ACBA] leading-relaxed">
          Permanently delete your account along with all associated APK scan logs, permissions, risk assessments, and compiled PDF reports. This operation cannot be reversed.
        </p>

        {deleteError && (
          <div className="p-3 rounded-xl bg-[#E87575]/15 border border-[#E87575]/30 text-xs text-[#E87575]">
            {deleteError}
          </div>
        )}

        <div className="space-y-3 max-w-md">
          <label className="block text-xs font-mono text-[#A1ACBA]">
            Type <strong className="text-[#E87575]">DELETE</strong> below to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-[#121720] border border-[#E87575]/30 focus:border-[#E87575] rounded-xl px-3.5 py-2 text-xs font-mono text-[#F5F7FA] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center gap-2 bg-[#E87575] hover:bg-[#F87171] text-[#0B0E13] font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{deleteLoading ? 'Purging Records...' : 'Permanently Delete Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
