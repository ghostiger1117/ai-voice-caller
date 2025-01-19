import { Router } from 'express';
import { processAudio, generateResponse } from '../controllers/media.controller';

const router = Router();

router.post('/process', processAudio);
router.post('/generate', generateResponse);

export default router;
