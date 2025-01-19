import { Router, Request, Response } from 'express';
import path from 'path';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/calls', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/calls.html'));
});

export default router; 