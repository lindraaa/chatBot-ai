import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

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
