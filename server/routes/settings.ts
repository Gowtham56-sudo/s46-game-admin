import express from 'express';
import { getGameState, updateGameState } from '../db.js';
import { broadcastState } from '../sse.js';

const router = express.Router();

router.put('/', (req, res) => {
  const newSettings = req.body;
  const currentState = getGameState();
  
  const updatedState = { 
    ...currentState, 
    settings: {
      ...currentState.settings,
      ...newSettings
    },
    lastUpdated: Date.now() 
  };
  
  updateGameState(updatedState);
  broadcastState(updatedState);
  
  res.json({ settings: updatedState.settings });
});

export default router;
