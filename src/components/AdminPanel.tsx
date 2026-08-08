import { useState, useEffect, useCallback } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import QuestionManagement from './QuestionManagement';
import EventSettingsTab from './EventSettingsTab';
import ParticipantsPanel from './ParticipantsPanel';
import type { GameState, QuestionsData, EventSettings } from '../types';
import { DEFAULT_QUESTIONS, DEFAULT_SETTINGS } from '../data/defaultQuestions';
import { LayoutDashboard, FileQuestion, Settings, LogOut, Tv, Users } from 'lucide-react';
import { API_BASE } from '../config';

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nextgen_admin_token'));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants' | 'questions' | 'settings'>('dashboard');

  const [gameState, setGameState] = useState<GameState>({
    stage: 'waiting',
    currentRound: 1,
    currentQuestionIndex: 0,
    isTimerRunning: false,
    timeLeft: 10,
    totalTime: 10,
    winnerName: '',
    winnerScore: '',
    winnerMessage: '',
    settings: DEFAULT_SETTINGS,
    lastUpdated: Date.now(),
    audioPlaying: false,
  });

  const [questions, setQuestions] = useState<QuestionsData>(DEFAULT_QUESTIONS);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      const data = await res.json();
      if (data.gameState) setGameState(data.gameState);
      if (data.questions) setQuestions(data.questions);
    } catch (e) {
      console.error('Failed to fetch admin state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();

    // Subscribe to SSE for instant synchronization with live Audience Screen
    const eventSource = new EventSource(`${API_BASE}/api/state/stream`);
    eventSource.onmessage = (event) => {
      try {
        const updatedState = JSON.parse(event.data) as GameState;
        setGameState(updatedState);
      } catch (e) {}
    };

    const interval = setInterval(fetchState, 2500);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [fetchState]);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('nextgen_admin_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('nextgen_admin_token');
  };

  const handleSendAction = async (action: string, payload?: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_BASE}/api/state/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (data.gameState) setGameState(data.gameState);
    } catch (e) {
      console.error('Action failed:', e);
    }
  };

  const handleUpdateSettings = async (newSettings: EventSettings) => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.settings) {
        setGameState((prev) => ({ ...prev, settings: data.settings }));
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-blue-400 font-bold text-lg animate-pulse">
          Loading Admin Control Center...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Admin Top Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center p-1">
              <img src="/logos/nav-logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">s46 entertainment</span>
              <h1 className="text-base font-extrabold text-white leading-none">Admin Control Panel</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Live Controls</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'participants'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Participants & Points</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileQuestion className="w-4 h-4" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/play"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Audience View</span>
            </a>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex border-t border-slate-800 bg-slate-900/90 px-4 py-2 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Controls
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${
              activeTab === 'participants' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Participants
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${
              activeTab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            gameState={gameState}
            questions={questions}
            onSendAction={handleSendAction}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsPanel
            currentRound={gameState.currentRound}
            currentQuestionIndex={gameState.currentQuestionIndex}
            onAnnounceWinner={(name, score) => {
              handleSendAction('ANNOUNCE_WINNER', {
                winnerName: name,
                winnerScore: score,
                winnerMessage: 'Congratulations on winning s46 entertainment Quiz!',
              });
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionManagement
            questions={questions}
            onRefreshQuestions={fetchState}
          />
        )}

        {activeTab === 'settings' && (
          <EventSettingsTab
            settings={gameState.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>
    </div>
  );
}
