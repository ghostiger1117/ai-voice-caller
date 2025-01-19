import { Router } from 'express';
import { handleIncomingCall } from '../controllers/inbound.controller';

const router = Router();

router.post('/', handleIncomingCall);

router.get('/', (req, res) => {
  res.json({ message: 'Hello Inbound Route' });
});

export default router;
