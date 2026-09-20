export type GameStage =
  | 'waiting'
  | 'round_intro'
  | 'question'
  | 'reveal'
  | 'round_end'
  | 'winner'
  | 'game_over';

export type RoundType = 1 | 2 | 3;

export interface AudioQuestion {
  id: string;
  questionNumber: number;
  title: string;
  audioUrl?: string; // Optional custom MP3/WAV URL
  synthPreset?: 'windows' | 'retro' | 'ringtone' | 'dialup' | 'sci_fi' | '8bit' | 'piano';
  hint?: string;
  correctAnswer: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number; // 0, 1, 2, 3
  explanation?: string;
}

export interface ConnectionsQuestion {
  id: string;
  questionNumber: number;
  title: string;
  images: string[]; // 4 image URLs
  correctAnswer: string;
  hint?: string;
}

export interface QuestionsData {
  round1: ConnectionsQuestion[];
  round2: AudioQuestion[];
  round3: ConnectionsQuestion[];
}

export interface EventSettings {
  eventName: string;
  companyName: string;
  gameTitle: string;
  logoUrl?: string;
  themeColor: 'blue' | 'purple' | 'emerald' | 'amber';
  timerDurations: {
    round1: number;
    round2: number;
    round3: number;
  };
}

export interface GameState {
  stage: GameStage;
  currentRound: RoundType;
  currentQuestionIndex: number; // 0-based index inside the current round array
  winnerName: string;
  winnerScore?: string;
  winnerMessage?: string;
  settings: EventSettings;
  lastUpdated: number;
  audioPlaying: boolean;
  isTimerRunning: boolean;
  timeLeft: number;
  totalTime: number;
}

export interface AdminAuth {
  isAuthenticated: boolean;
  token?: string;
}
