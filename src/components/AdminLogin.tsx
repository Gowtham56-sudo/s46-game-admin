import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock, Mail, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { API_BASE } from '../config';

interface Props {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('admin@s46.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (err) {
      setError('Connection error. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('admin@s46.com');
    setPassword('admin123');
    onLoginSuccess('nextgen_admin_valid_token_2026');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 mb-4 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            s46 entertainment Admin Control Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Host & Organizer Event Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin@s46.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 mb-3">Default Credentials: admin@s46.com / admin123</p>
          <button
            onClick={handleQuickLogin}
            type="button"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick Login as Host</span>
          </button>
        </div>
      </div>
    </div>
  );
}
