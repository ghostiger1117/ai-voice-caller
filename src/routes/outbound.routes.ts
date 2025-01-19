import { Router } from 'express';
import { initiateCall, handleCallStatus } from '../controllers/outbound.controller';

const router = Router();

router.post('/call', initiateCall);
router.post('/status', handleCallStatus);

export default router;
