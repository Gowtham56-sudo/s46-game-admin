import { useState } from 'react';
import type { GameState, QuestionsData, QuizQuestion } from '../types';
import ParticipantsPanel from './ParticipantsPanel';
import {
  Play,
  Eye,
  SkipForward,
  RotateCcw,
  Trophy,
  Volume2,
  ExternalLink,
  Flag,
  Radio,
  Sparkles,
} from 'lucide-react';
import { playSynthPreset } from '../utils/soundEngine';

interface Props {
  gameState: GameState;
  questions: QuestionsData;
  onSendAction: (action: string, payload?: Record<string, unknown>) => void;
}

export default function AdminDashboard({ gameState, questions, onSendAction }: Props) {
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerNameInput, setWinnerNameInput] = useState(gameState.winnerName || 'John');
  const [winnerScoreInput, setWinnerScoreInput] = useState(gameState.winnerScore || '150 pts');
  const [winnerMsgInput, setWinnerMsgInput] = useState(gameState.winnerMessage || 'Congratulations on winning s46 entertainment Quiz!');

  const roundQuestions = questions[`round${gameState.currentRound}` as keyof QuestionsData] || [];
  const currentQ = roundQuestions[gameState.currentQuestionIndex];
  const totalRQuestions = roundQuestions.length;

  const handleAnnounceWinner = () => {
    onSendAction('ANNOUNCE_WINNER', {
      winnerName: winnerNameInput,
      winnerScore: winnerScoreInput,
      winnerMessage: winnerMsgInput,
    });
    setShowWinnerModal(false);
  };

  const handleReplayAudio = () => {
    if (gameState.currentRound === 2 && currentQ && 'synthPreset' in currentQ) {
      const q = currentQ as { synthPreset?: string; audioUrl?: string };
      playSynthPreset(q.synthPreset || 'windows', q.audioUrl);
      onSendAction('REPLAY_AUDIO');
    }
  };

  const handleSelectWinner = (name: string, score: string) => {
    setWinnerNameInput(name);
    setWinnerScoreInput(score);
    setShowWinnerModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Current Live Event Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Broadcast Active
              </span>
              <span className="text-slate-400 text-sm font-medium">
                {gameState.settings.companyName}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {gameState.settings.eventName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/play"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Audience Screen (/play)</span>
            </a>
          </div>
        </div>

        {/* Dashboard Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Stage</span>
            <div className="text-lg md:text-xl font-black text-blue-400 mt-1 capitalize tracking-tight">
              {gameState.stage.replace('_', ' ')}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Round</span>
            <div className="text-lg md:text-xl font-black text-indigo-400 mt-1">
              Round {gameState.currentRound} of 3
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Question Progress</span>
            <div className="text-lg md:text-xl font-black text-cyan-400 mt-1">
              {gameState.currentQuestionIndex + 1} / {totalRQuestions || 6}
            </div>
          </div>

        </div>
      </div>

      {/* Main Game Control Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-400" />
          <span>Live Host Game Controls</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Start / Reset Event */}
          <button
            onClick={() => onSendAction('START_GAME')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white font-bold transition-all gap-2 cursor-pointer"
          >
            <RotateCcw className="w-6 h-6 text-blue-400" />
            <span className="text-sm">Start Waiting Screen</span>
          </button>

          {/* Start Current Round */}
          <button
            onClick={() => onSendAction('START_ROUND')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 font-bold transition-all gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 text-indigo-400" />
            <span className="text-sm">Start Round Intro</span>
          </button>

          {/* Start Question */}
          <button
            onClick={() => onSendAction('START_QUESTION')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-bold transition-all gap-2 shadow-lg shadow-blue-600/30 cursor-pointer col-span-2 md:col-span-1"
          >
            <Play className="w-6 h-6 fill-current" />
            <span className="text-sm">Start Question</span>
          </button>

          {/* Reveal Answer */}
          <button
            onClick={() => onSendAction('REVEAL_ANSWER')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-bold transition-all gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer col-span-2 md:col-span-1"
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm">Reveal Correct Answer</span>
          </button>
        </div>

        {/* Secondary Workflow Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onSendAction('NEXT_QUESTION')}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-sm cursor-pointer border border-slate-700"
          >
            <SkipForward className="w-4 h-4 text-cyan-400" />
            <span>Next Question</span>
          </button>

          <button
            onClick={() => onSendAction('NEXT_ROUND')}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-sm cursor-pointer border border-slate-700"
          >
            <SkipForward className="w-4 h-4 text-indigo-400" />
            <span>Next Round ({gameState.currentRound < 3 ? gameState.currentRound + 1 : 'Winner'})</span>
          </button>


          {gameState.currentRound === 2 && (
            <button
              onClick={handleReplayAudio}
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/80 font-bold transition-all text-sm cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Replay Audio Snippet</span>
            </button>
          )}

          <button
            onClick={() => setShowWinnerModal(true)}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black transition-all text-sm cursor-pointer shadow-lg shadow-amber-600/20 col-span-2 md:col-span-1"
          >
            <Trophy className="w-4 h-4" />
            <span>Announce Winner</span>
          </button>

          <button
            onClick={() => onSendAction('END_GAME')}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold transition-all text-sm cursor-pointer"
          >
            <Flag className="w-4 h-4" />
            <span>End Game</span>
          </button>
        </div>
      </div>

      {/* Live Participants & Leaderboard */}
      <ParticipantsPanel
        onAnnounceWinner={handleSelectWinner}
        currentRound={gameState.currentRound}
        currentQuestionIndex={gameState.currentQuestionIndex}
      />

      {/* Current Question Inspector Preview Card */}
      {currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">
              Host Reference View • Round {gameState.currentRound} Question {gameState.currentQuestionIndex + 1}
            </span>
            <span className="text-xs text-blue-400 font-semibold bg-blue-950/60 border border-blue-800 px-3 py-1 rounded-full">
              Correct Answer Preview
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-white">
              {'question' in currentQ ? (currentQ as { question: string }).question : currentQ.title}
            </h3>

            {'options' in currentQ && (
              <div className="grid grid-cols-2 gap-3">
                {(currentQ as unknown as QuizQuestion).options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between ${
                      i === (currentQ as unknown as QuizQuestion).correctAnswerIndex
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + i)}. {opt}</span>
                    {i === (currentQ as unknown as QuizQuestion).correctAnswerIndex && (
                      <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        CORRECT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-emerald-300 font-bold text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>
                Correct Answer:{' '}
                {'correctAnswer' in currentQ
                  ? (currentQ as { correctAnswer: string }).correctAnswer
                  : (currentQ as QuizQuestion).options[(currentQ as QuizQuestion).correctAnswerIndex]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Winner Announcement Modal */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <Trophy className="w-8 h-8" />
              <h3 className="text-2xl font-black text-white">Announce Winner</h3>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Enter the winner's details to trigger the celebratory winner screen on the projector!
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Winner Name
                </label>
                <input
                  type="text"
                  value={winnerNameInput}
                  onChange={(e) => setWinnerNameInput(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Score / Points (Optional)
                </label>
                <input
                  type="text"
                  value={winnerScoreInput}
                  onChange={(e) => setWinnerScoreInput(e.target.value)}
                  placeholder="e.g. 150 Points"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Congratulations Message
                </label>
                <input
                  type="text"
                  value={winnerMsgInput}
                  onChange={(e) => setWinnerMsgInput(e.target.value)}
                  placeholder="e.g. Congratulations on winning s46 entertainment Quiz!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWinnerModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAnnounceWinner}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Trigger Winner Screen 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
