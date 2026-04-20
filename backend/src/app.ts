import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import logger from './middleware/logger';
import apiRoutes from './routes/api';
import { query } from './db';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(logger);

// Routes
app.use('/api', apiRoutes);

// Health check endpoint with database status
app.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    await query('SELECT NOW()');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: String(error) });
  }
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
