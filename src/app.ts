import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import pino from 'pino';
import { env } from './config/env';
import { createOutboundCall } from './services/twilio.service';
import cors from 'cors';
import smsRoutes from './routes/sms.routes';

import outboundRoutes from './routes/outbound.routes';
import inboundRoutes from './routes/inbound.routes';
import path from 'path';
import callStatusRoutes from './routes/callStatus.routes';
import mediaRoutes from './routes/media.routes';

// Configure logger
import { logger } from './utils/logger';

const app: Application = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// Static files for audio
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, 'Unhandled Error');
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});


// Routes
app.use('/sms', smsRoutes);
app.use('/outbound', outboundRoutes); // Outbound call routes
app.use('/media', mediaRoutes); // Media routes
app.use('/inbound', inboundRoutes);   // Inbound call handling routes
app.use('/call-status', callStatusRoutes);


// Outbound Call Endpoint
// app.post('/make-call', async (req: Request, res: Response): Promise<void> => {
//   try {
//     logger.info({ body: req.body }, 'Received make-call request');
    
//     const { to, message } = req.body;

//     if (typeof to !== 'string' || typeof message !== 'string') {
//       logger.warn({ body: req.body }, 'Invalid input received');
//       res.status(400).json({ error: 'Invalid input: "to" and "message" must be strings.' });
//       return;
//     }

//     const callSid = await createOutboundCall(to, message);
//     logger.info({ callSid }, 'Call initiated successfully');
//     res.status(200).json({ message: 'Call initiated successfully!', callSid });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     logger.error({ error, errorMessage }, 'Error in /make-call');
//     res.status(500).json({ error: 'Failed to initiate the call.', details: errorMessage });
//   }
// });

// Health Check Endpoint
app.get('/health', (req: Request, res: Response): void => {
  logger.info('Health check requested');
  res.status(200).json({ status: 'UP', message: 'Service is running.' });
});

// Start the server
app.listen(env.PORT, (): void => {
  logger.info({ 
    port: env.PORT,
    nodeEnv: process.env.NODE_ENV 
  }, `Server is running on http://localhost:${env.PORT}`);
});
