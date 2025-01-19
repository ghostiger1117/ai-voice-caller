import { Router } from 'express';
import { getCallStatus, updateCallStatus } from '../controllers/callStatus.controller';

const router = Router();

router.get('/:callId', getCallStatus);
router.post('/:callId', updateCallStatus);

export default router;
