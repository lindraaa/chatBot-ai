import { Router, Request, Response } from 'express';

const router: Router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Example endpoint
router.get('/example', (_req: Request, res: Response): void => {
  res.json({
    message: 'This is an example endpoint',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
});

export default router;
