import express from 'express';
import { getParticipants, addParticipant, updateParticipant, updateParticipantScore } from '../db.js';
import { broadcastParticipants } from '../sse.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ participants: getParticipants() });
});

router.post('/', (req, res) => {
  const { id, fullName } = req.body;
  
  if (!id || !fullName) {
    res.status(400).json({ error: 'id and fullName are required' });
    return;
  }

  const newParticipant = {
    id,
    fullName,
    joinedAt: Date.now(),
    lastActive: Date.now(),
    score: 0,
    currentAnswer: null,
    currentAnswerTime: null,
    totalAnswersCount: 0
  };

  addParticipant(newParticipant);
  broadcastParticipants(getParticipants());
  
  res.status(201).json({ participant: newParticipant });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  updateParticipant(id, updates);
  broadcastParticipants(getParticipants());
  
  res.json({ success: true });
});

router.post('/:id/score', (req, res) => {
  const { id } = req.params;
  const { scoreChange } = req.body;
  
  if (typeof scoreChange !== 'number') {
    res.status(400).json({ error: 'scoreChange must be a number' });
    return;
  }

  updateParticipantScore(id, scoreChange);
  broadcastParticipants(getParticipants());
  
  res.json({ success: true });
});

export default router;
