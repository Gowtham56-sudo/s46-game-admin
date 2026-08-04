import express from 'express';
import { getGameState, updateGameState, getQuestions } from '../db.js';
import { broadcastState, addClient } from '../sse.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    gameState: getGameState(),
    questions: getQuestions(),
  });
});

router.get('/stream', (req, res) => {
  addClient(res);
});

router.post('/action', (req, res) => {
  const { action, payload } = req.body;
  const currentState = getGameState();
  const questions = getQuestions();
  let updatedState = { ...currentState, lastUpdated: Date.now() };

  try {
    switch (action) {
      case 'START_GAME':
        updatedState.stage = 'waiting';
        break;
      case 'START_ROUND':
        updatedState.stage = 'round_intro';
        break;
      case 'START_QUESTION':
        updatedState.stage = 'question';
        break;
      case 'REVEAL_ANSWER':
        updatedState.stage = 'reveal';
        break;
      case 'NEXT_QUESTION':
        const currentRoundQuestions = questions[`round${updatedState.currentRound}` as keyof typeof questions];
        if (updatedState.currentQuestionIndex < currentRoundQuestions.length - 1) {
          updatedState.currentQuestionIndex += 1;
          updatedState.stage = 'question'; // Or 'round_intro' depending on flow
        } else {
          updatedState.stage = 'round_end';
        }
        break;
      case 'NEXT_ROUND':
        if (updatedState.currentRound < 3) {
          updatedState.currentRound = (updatedState.currentRound + 1) as 1 | 2 | 3;
          updatedState.currentQuestionIndex = 0;
          updatedState.stage = 'round_intro';
        } else {
          updatedState.stage = 'winner';
        }
        break;
      case 'ANNOUNCE_WINNER':
        updatedState.stage = 'winner';
        updatedState.winnerName = (payload?.winnerName as string) || '';
        updatedState.winnerScore = (payload?.winnerScore as string) || '';
        updatedState.winnerMessage = (payload?.winnerMessage as string) || '';
        break;
      case 'END_GAME':
        updatedState.stage = 'game_over';
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }

    updateGameState(updatedState);
    broadcastState(updatedState);
    res.json({ gameState: updatedState });
  } catch (err) {
    console.error('Error handling action', err);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

export default router;
