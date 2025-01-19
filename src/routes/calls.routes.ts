import { Router, Request, Response } from 'express';
import { twiml } from 'twilio';
import pino from 'pino';

const router: Router = Router();
const logger = pino();

// Store recent calls in memory (in production, use a database)
const recentCalls = new Map<string, {
  to: string,
  status: string,
  timestamp: Date,
  duration?: number
}>();

router.get('/list', (req: Request, res: Response) => {
  const calls = Array.from(recentCalls.entries())
    .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime())
    .slice(0, 10);

  res.render('partials/calls-list', { calls });
});

export const updateCallStatus = (callSid: string, status: string, duration?: number) => {
  if (recentCalls.has(callSid)) {
    const call = recentCalls.get(callSid)!;
    call.status = status;
    if (duration) call.duration = duration;
    recentCalls.set(callSid, call);
  }
};

export default router; 