import express from 'express';
import { env } from './config/env';
import cors from 'cors';
import path from 'path';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import 'dotenv/config';

const app = express();

// Middleware
setupMiddleware(app);
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// API Routes
setupRoutes(app);

// Serve index.html for all other routes
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(env.PORT || 3000, () => {
  logger.info(`Server running at http://localhost:${env.PORT || 3000}`);
});

