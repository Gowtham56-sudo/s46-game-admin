import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { GameState, QuestionsData, EventSettings } from '../src/types';
import { DEFAULT_QUESTIONS, DEFAULT_SETTINGS } from '../src/data/defaultQuestions';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'game.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS game_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state JSON NOT NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    joinedAt INTEGER NOT NULL,
    lastActive INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    currentAnswer TEXT,
    currentAnswerTime INTEGER,
    totalAnswersCount INTEGER DEFAULT 0
  );
`);

// Insert initial state if not exists
const checkState = db.prepare('SELECT state FROM game_state WHERE id = 1').get() as { state: string } | undefined;

if (!checkState) {
  const initialState: GameState = {
    stage: 'waiting',
    currentRound: 1,
    currentQuestionIndex: 0,
    isTimerRunning: false,
    timeLeft: DEFAULT_SETTINGS.timerDurations.round1,
    totalTime: DEFAULT_SETTINGS.timerDurations.round1,
    winnerName: '',
    winnerScore: '',
    winnerMessage: '',
    settings: DEFAULT_SETTINGS,
    lastUpdated: Date.now(),
    audioPlaying: false,
  };
  
  db.prepare('INSERT INTO game_state (id, state) VALUES (1, ?)').run(JSON.stringify(initialState));
}

export function getGameState(): GameState {
  const row = db.prepare('SELECT state FROM game_state WHERE id = 1').get() as { state: string };
  return JSON.parse(row.state);
}

export function updateGameState(newState: GameState): void {
  db.prepare('UPDATE game_state SET state = ? WHERE id = 1').run(JSON.stringify(newState));
}

export function getQuestions(): QuestionsData {
  // Currently returning default questions. 
  // In a full implementation, you could store these in the DB.
  return DEFAULT_QUESTIONS;
}

export interface ParticipantData {
  id: string;
  fullName: string;
  joinedAt: number;
  lastActive: number;
  score: number;
  currentAnswer: string | null;
  currentAnswerTime: number | null;
  totalAnswersCount: number;
}

export function getParticipants(): ParticipantData[] {
  return db.prepare('SELECT * FROM participants ORDER BY score DESC').all() as ParticipantData[];
}

export function addParticipant(participant: ParticipantData): void {
  db.prepare(`
    INSERT OR REPLACE INTO participants (id, fullName, joinedAt, lastActive, score, currentAnswer, currentAnswerTime, totalAnswersCount)
    VALUES (@id, @fullName, @joinedAt, @lastActive, @score, @currentAnswer, @currentAnswerTime, @totalAnswersCount)
  `).run(participant);
}

export function updateParticipant(id: string, updates: Partial<ParticipantData>): void {
  const current = db.prepare('SELECT * FROM participants WHERE id = ?').get(id) as ParticipantData;
  if (!current) return;
  const updated = { ...current, ...updates, lastActive: Date.now() };
  addParticipant(updated);
}

export function updateParticipantScore(id: string, scoreChange: number): void {
  db.prepare('UPDATE participants SET score = score + ? WHERE id = ?').run(scoreChange, id);
}

export default db;
