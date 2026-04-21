import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import realtimeStatsService from '../services/realtimeStatsService';

const adminService = new AdminService();

// Upload PDF endpoint
export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ status: 'error', message: 'No file provided' });
      return;
    }

    const result = await adminService.uploadPdf(file);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to upload PDF', error: String(error) });
  }
};

// Get PDF status endpoint
export const getPdfStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await adminService.getPdfStatus();
    res.status(200).json({ status: 'success', data: status });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve PDF status', error: String(error) });
  }
};

// Get dashboard statistics endpoint
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve statistics', error: String(error) });
  }
};

// Stream real-time statistics via SSE
export const streamStats = (req: Request, res: Response): void => {
  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Generate unique client ID
    const clientId = `sse-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Register this client with the realtime stats service
    realtimeStatsService.registerClient(res, clientId);

    // Keep connection alive with periodic comments
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (error) {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30 second heartbeat

    // Cleanup on request error or close
    res.on('error', () => {
      clearInterval(heartbeatInterval);
    });
  } catch (error) {
    console.error('Error streaming stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to stream statistics', error: String(error) });
  }
};
