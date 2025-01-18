import { Router, Request, Response } from 'express';
import { twiml } from 'twilio';
import { webhook } from 'twilio';

const router: Router = Router();
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';

// Middleware to validate Twilio requests
const twilioWebhook = webhook({ validate: true, authToken: twilioAuthToken });

// Handle incoming SMS
router.post('/', twilioWebhook, (req: Request, res: Response) => {
  const messagingResponse = new twiml.MessagingResponse();
  const incomingMessage = req.body.Body;

  // Generate response
  messagingResponse.message(`You said: ${incomingMessage}`);

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(messagingResponse.toString());
});

export default router;
