import { Router } from 'express';
import { initiateCall, handleCallStatus } from '../controllers/outbound.controller';
import { generateTwiML } from '../controllers/twiml.controller';

const router = Router();

// These routes will be prefixed with /api/outbound
router.post('/call', initiateCall);
router.post('/status', handleCallStatus);
router.all('/twiml', generateTwiML);  // Accept both GET and POST requests

export default router;
