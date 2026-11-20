import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  FileCheck,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  Activity,
  User as UserIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function WorkspaceLayout({ currentTab, onNavigate, children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const h = await api.getSystemHealth();
        setSystemHealth(h);
      } catch (e) {
        console.warn('System health probe failed:', e);
      }
    }
    fetchHealth();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scanner', label: 'New Scan', icon: UploadCloud },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'reports', label: 'Security Reports', icon: FileCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'methodology', label: 'Help & Methodology', icon: HelpCircle },
  ];

  return (
    <div className="relative min-h-screen bg-[#0B0E13] text-[#F5F7FA] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121720] border-b border-[#171F2B] z-30">
        <BrandLogo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#171F2B] text-[#A1ACBA]"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#121720]/95 backdrop-blur-md border-r border-[#171F2B] p-4 shrink-0 z-20 md:min-h-screen`}
      >
        <div className="hidden md:block mb-8 px-2 pt-2">
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#79B8FF]/15 text-[#79B8FF] border border-[#79B8FF]/30 shadow-sm'
                    : 'text-[#A1ACBA] hover:text-[#F5F7FA] hover:bg-[#171F2B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-[#79B8FF]' : 'text-[#A1ACBA]'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#79B8FF]" />}
              </button>
            );
          })}
        </nav>

        {/* Operational Status Pill */}
        <div className="mt-6 p-3 rounded-xl bg-[#171F2B]/80 border border-[#171F2B] text-xs font-mono">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#A1ACBA]">Engine Status</span>
            <span className="inline-flex items-center gap-1 text-[#67C99A] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#67C99A] animate-pulse" />
              {systemHealth?.status || 'Online'}
            </span>
          </div>
          <div className="text-[11px] text-[#A1ACBA]/70 truncate">
            ML Core: {systemHealth?.ml_service || 'Active'}
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div className="mt-4 pt-4 border-t border-[#171F2B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#79B8FF]/15 border border-[#79B8FF]/30 flex items-center justify-center text-[#79B8FF] shrink-0 font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#F5F7FA] truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-[#A1ACBA] truncate font-mono">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              onNavigate('login');
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#A1ACBA] hover:text-[#E87575] hover:bg-[#171F2B] transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#171F2B] bg-[#0B0E13]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#F5F7FA] capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Workspace'}
            </h2>
            <span className="text-xs font-mono text-[#A1ACBA] hidden sm:inline-block">
              / Authenticated Session
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs text-[#A1ACBA] hover:text-[#79B8FF] px-2.5 py-1.5 rounded-lg bg-[#171F2B] border border-[#171F2B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Product Page</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-1.5 bg-[#79B8FF] hover:bg-[#93C5FD] text-[#0B0E13] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <UploadCloud size={14} />
              <span>Scan APK</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
