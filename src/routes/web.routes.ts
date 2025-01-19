import { Router } from 'express';
import path from 'path';

const router = Router();

// Serve the landing page for all non-API routes
router.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

export default router; 