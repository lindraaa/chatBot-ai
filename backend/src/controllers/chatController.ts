import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { ContactService } from '../services/contactService';

const chatService = new ChatService();
const contactService = new ContactService();

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
    const { sessionId, userMessage } = req.body;

    if (!sessionId || !userMessage) {
      res.status(400).json({ status: 'error', message: 'Missing sessionId or userMessage' });
      return;
    }

    const chatMessage = await chatService.sendMessage(sessionId, userMessage);

    res.status(200).json({
      status: 'success',
      data: {
        message: chatMessage.aiResponse,
        couldNotAnswer: chatMessage.noAnswerFound,
        topic: chatMessage.topic,
        sessionId: chatMessage.sessionId,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to send message', error: String(error) });
  }
};

// Submit contact form endpoint
export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, sessionId, question, conversationContext } = req.body;

    if (!name || !email || !sessionId) {
      res.status(400).json({ status: 'error', message: 'Missing required fields' });
      return;
    }

    console.log('Contact form submission:', { name, email, phone, sessionId, question });

    const result = await contactService.submitContactForm({
      name,
      email,
      phone,
      sessionId,
      question,
      conversationContext,
    });

    res.status(200).json({
      status: 'success',
      message: 'Contact form submitted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to submit contact form', error: String(error) });
  }
};
