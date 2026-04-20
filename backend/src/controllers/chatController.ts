import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';

const chatService = new ChatService();

// Create new session endpoint
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await chatService.createSession();
    res.status(201).json({ status: 'success', data: session });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create session', error: String(error) });
  }
};

// Send message endpoint
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({ status: 'error', message: 'Missing sessionId or message' });
      return;
    }

    const chatMessage = await chatService.sendMessage(sessionId, message);
    res.status(200).json({ status: 'success', data: chatMessage });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to send message', error: String(error) });
  }
};

// Submit contact form endpoint
export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message, sessionId } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ status: 'error', message: 'Missing required fields' });
      return;
    }

    const result = await chatService.submitContact({ name, email, message, sessionId });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to submit contact form', error: String(error) });
  }
};
