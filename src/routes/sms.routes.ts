import { Router } from 'express';
import { handleIncomingSMS, sendSMS } from '../controllers/sms.controller';

const router = Router();

router.post('/incoming', handleIncomingSMS);
router.post('/send', sendSMS);

export default router;
