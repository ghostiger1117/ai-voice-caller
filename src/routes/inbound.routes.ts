import { Router } from 'express';
import { handleIncomingCall } from '../controllers/inbound.controller';

const router = Router();

router.post('/', handleIncomingCall);

export default router;
