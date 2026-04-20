import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import logger from './middleware/logger';
import apiRoutes from './routes/api';

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

// Health check endpoint (basic)
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'healthy' });
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
