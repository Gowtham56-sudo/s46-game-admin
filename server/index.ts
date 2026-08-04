import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import stateRoutes from './routes/state.js';
import settingsRoutes from './routes/settings.js';
import participantsRoutes from './routes/participants.js';
import { getGameState, updateGameState } from './db.js';
import { broadcastState } from './sse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/state', stateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/participants', participantsRoutes);

// Server static files in production if needed
// app.use(express.static(path.join(__dirname, '../dist')));


app.listen(PORT, () => {
  console.log(`Live Game Backend running on http://localhost:${PORT}`);
});
