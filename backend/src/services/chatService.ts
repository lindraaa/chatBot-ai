// Service layer for Chat operations
import { N8nService } from './n8nService';
import { SessionRepository } from '../repositories/sessionRepository';

const n8nService = new N8nService();
const sessionRepository = new SessionRepository();

export interface Session {
  id: string;
  startedAt: Date;
  messageCount: number;
}

export interface ChatMessage {
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  sessionId?: string;
}

export class ChatService {
  // Create new chat session via n8n and save to DB
  async createSession(): Promise<Session> {
    const n8nResponse = await n8nService.createChatSession();

    if (n8nResponse.success && n8nResponse.data?.data?.sessionId) {
      const sessionId = n8nResponse.data.data.sessionId;

      // Save to database
      await sessionRepository.createSession(sessionId);

      return {
        id: sessionId,
        startedAt: new Date(n8nResponse.data.data.startedAt || new Date()),
        messageCount: n8nResponse.data.data.messageCount || 0,
      };
    }

    throw new Error('Failed to create session from n8n');
  }

  // Send message and get AI response via n8n, increment counter in DB
  async sendMessage(sessionId: string, userMessage: string): Promise<ChatMessage> {
    const n8nResponse = await n8nService.processChatMessage(sessionId, userMessage);

    if (n8nResponse.success && n8nResponse.data?.data?.response) {
      // Increment message count in database
      await sessionRepository.incrementMessageCount(sessionId);

      return {
        sessionId,
        userMessage,
        aiResponse: n8nResponse.data.data.response,
        timestamp: new Date(),
      };
    }

    throw new Error('Failed to process message from n8n');
  }

  // Submit contact form and send email via n8n
  async submitContact(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      // Send to n8n workflow for email processing
      const n8nResponse = await n8nService.handleContactForm(formData);

      if (!n8nResponse.success) {
        console.error('n8n contact form processing failed:', n8nResponse.error);
      }

      return {
        success: true,
        message: 'Contact form submitted successfully',
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return {
        success: false,
        message: 'Failed to submit contact form',
      };
    }
  }
}
