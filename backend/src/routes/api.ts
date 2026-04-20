import { Router, Request, Response } from 'express';
import adminRoutes from './admin';
import chatRoutes from './chat';

const router: Router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

export default router;
