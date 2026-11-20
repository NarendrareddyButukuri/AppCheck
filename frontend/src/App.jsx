import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MotionBackground from './components/MotionBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import DashboardOverview from './pages/workspace/DashboardOverview';
import Scanner from './pages/workspace/Scanner';
import ScanResults from './pages/workspace/ScanResults';
import ScanHistory from './pages/workspace/ScanHistory';
import ReportsList from './pages/workspace/ReportsList';
import Settings from './pages/workspace/Settings';
import Methodology from './pages/workspace/Methodology';

function MainRouter() {
  const { isAuthenticated, loading } = useAuth();
  
  // Current screen state: 'login' | 'register' | 'forgot-password' | 'landing' | 'workspace'
  const [screen, setScreen] = useState('login');
  // Workspace active tab
  const [workspaceTab, setWorkspaceTab] = useState('overview');
  // Selected scan id for results viewing
  const [selectedScanId, setSelectedScanId] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // STEP 1 MANDATORY: First screen must be login!
        setScreen('login');
      } else {
        // If authenticated and on auth screen, go to landing as requested!
        if (screen === 'login' || screen === 'register' || screen === 'forgot-password') {
          setScreen('landing');
        }
      }
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E13] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-2 border-[#79B8FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-[#A1ACBA] uppercase tracking-wider">
          Initializing AppCheck Security Engine...
        </p>
      </div>
    );
  }

  // Handle navigation requests
  const handleNavigate = (targetScreen, options = {}) => {
    if (targetScreen === 'scanner') {
      setScreen('workspace');
      setWorkspaceTab('scanner');
      return;
    }
    if (targetScreen === 'overview' || targetScreen === 'history' || targetScreen === 'reports' || targetScreen === 'settings' || targetScreen === 'methodology') {
      setScreen('workspace');
      setWorkspaceTab(targetScreen);
      return;
    }
    if (targetScreen === 'results' && options.scanId) {
      setSelectedScanId(options.scanId);
      setScreen('workspace');
      setWorkspaceTab('results');
      return;
    }
    setScreen(targetScreen);
  };

  const handleScanCompleted = (scanId) => {
    setSelectedScanId(scanId);
    setScreen('workspace');
    setWorkspaceTab('results');
  };

  const handleSelectScan = (scanId) => {
    setSelectedScanId(scanId);
    setScreen('workspace');
    setWorkspaceTab('results');
  };

  return (
    <div className="relative min-h-screen bg-[#0B0E13] overflow-x-hidden selection:bg-[#79B8FF]/20 selection:text-[#79B8FF]">
      {/* Canvas-based futuristic motion background */}
      <MotionBackground />

      {/* Screen Router */}
      {!isAuthenticated ? (
        <>
          {screen === 'login' && <Login onNavigate={handleNavigate} />}
          {screen === 'register' && <Register onNavigate={handleNavigate} />}
          {screen === 'forgot-password' && <ForgotPassword onNavigate={handleNavigate} />}
        </>
      ) : (
        <>
          {screen === 'landing' && <Landing onNavigate={handleNavigate} />}
          {screen === 'workspace' && (
            <WorkspaceLayout currentTab={workspaceTab} onNavigate={(tab) => setWorkspaceTab(tab)}>
              {workspaceTab === 'overview' && (
                <DashboardOverview
                  onNavigate={handleNavigate}
                  onSelectScan={handleSelectScan}
                />
              )}
              {workspaceTab === 'scanner' && (
                <Scanner onScanComplete={handleScanCompleted} />
              )}
              {workspaceTab === 'results' && selectedScanId && (
                <ScanResults
                  scanId={selectedScanId}
                  onNavigateBack={() => setWorkspaceTab('history')}
                />
              )}
              {workspaceTab === 'history' && (
                <ScanHistory
                  onSelectScan={handleSelectScan}
                  onNavigate={handleNavigate}
                />
              )}
              {workspaceTab === 'reports' && (
                <ReportsList onSelectScan={handleSelectScan} />
              )}
              {workspaceTab === 'settings' && (
                <Settings onNavigate={handleNavigate} />
              )}
              {workspaceTab === 'methodology' && <Methodology />}
            </WorkspaceLayout>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
