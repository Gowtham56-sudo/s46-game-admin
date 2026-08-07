import { useState, useEffect } from 'react';
import { Users, Award, Plus, Minus, Trophy, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

interface ParticipantData {
  id: string;
  fullName: string;
  joinedAt: number;
  lastActive: number;
  score: number;
  currentAnswer: string | null;
  currentAnswerTime: number | null;
  totalAnswersCount: number;
}

interface Props {
  onAnnounceWinner: (name: string, score: string) => void;
  currentRound: number;
  currentQuestionIndex: number;
}

export default function ParticipantsPanel({ onAnnounceWinner, currentRound }: Props) {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/participants');
      const data = await res.json();
      if (data.participants) {
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAdjustPoints = async (fullName: string, delta: number) => {
    setAdjustingId(fullName);
    try {
      await fetch('/api/participants/adjust-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, delta }),
      });
      await fetchParticipants();
    } catch (err) {
      console.error('Points adjust failed:', err);
    } finally {
      setAdjustingId(null);
    }
  };

  const handleRemoveAll = async () => {
    if (!window.confirm("Are you sure you want to remove ALL participants? This action cannot be undone.")) return;
    try {
      await fetch('/api/participants/remove-all', { method: 'POST' });
      await fetchParticipants();
    } catch (err) {
      console.error('Failed to remove participants:', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold text-xs uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Live Leaderboard & Responses</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Participants & Points Tracker
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span><strong>{participants.length}</strong> Checked-In Audience</span>
          </div>
          <button
            onClick={fetchParticipants}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer"
            title="Refresh Participants"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRemoveAll}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl transition-all border border-rose-800 cursor-pointer text-sm font-bold flex items-center gap-2"
            title="Remove All Participants"
          >
            Remove All
          </button>
        </div>
      </div>

      {/* Participants Table */}
      {participants.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="font-extrabold text-base text-slate-300">No participants checked in yet.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Audience members checking in on <code className="text-blue-400 bg-slate-950 px-2 py-0.5 rounded">/play</code> will automatically appear here with their live points.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-black uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Participant Name</th>
                <th className="py-3 px-4 text-center">Round {currentRound} Answer</th>
                <th className="py-3 px-4 text-center">Total Points</th>
                <th className="py-3 px-4 text-right">Host Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
              {participants.map((p, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {rank === 1 && <Trophy className="w-5 h-5 text-amber-400" />}
                        {rank === 2 && <Trophy className="w-5 h-5 text-slate-300" />}
                        {rank === 3 && <Trophy className="w-5 h-5 text-amber-700" />}
                        <span className={`font-black ${isTop3 ? 'text-white text-base' : 'text-slate-400'}`}>
                          #{rank}
                        </span>
                      </div>
                    </td>

                    {/* Participant Name */}
                    <td className="py-4 px-4 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.fullName}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          {p.totalAnswersCount} responses
                        </span>
                      </div>
                    </td>

                    {/* Current Answer */}
                    <td className="py-4 px-4 text-center">
                      {p.currentAnswer ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 border border-blue-700/80 text-blue-300 font-bold text-xs rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{p.currentAnswer}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Waiting...</span>
                        </span>
                      )}
                    </td>

                    {/* Total Points */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-lg text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
                        <Award className="w-4 h-4" />
                        <span>{p.score} pts</span>
                      </span>
                    </td>

                    {/* Quick Host Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAdjustPoints(p.fullName, 10)}
                          disabled={adjustingId === p.fullName}
                          className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Add +10 points"
                        >
                          <Plus className="w-3 h-3" />
                          <span>10 pts</span>
                        </button>

                        <button
                          onClick={() => handleAdjustPoints(p.fullName, -10)}
                          disabled={adjustingId === p.fullName}
                          className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Deduct 10 points"
                        >
                          <Minus className="w-3 h-3" />
                          <span>10 pts</span>
                        </button>

                        <button
                          onClick={() => onAnnounceWinner(p.fullName, `${p.score} pts`)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-md"
                          title="Declare as Grand Winner"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Winner</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
