// Service layer for Chat operations
import { N8nService } from './n8nService';
import { SessionRepository } from '../repositories/sessionRepository';
import { MessageRepository } from '../repositories/messageRespository';

const n8nService = new N8nService();
const sessionRepository = new SessionRepository();
const messageRepository = new MessageRepository();

export interface Session {
  id: string;
  startedAt: Date;
}

export interface ChatMessage {
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  topic: string;
  noAnswerFound?: boolean;
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
      };
    }

    throw new Error('Failed to create session from n8n');
  }

  // Send message and get AI response via n8n, increment counter in DB
  async sendMessage(sessionId: string, userMessage: string): Promise<ChatMessage> {
    const n8nResponse = await n8nService.processChatMessage(sessionId, userMessage);
    console.log('n8nResponse in sendMessage:', n8nResponse);
    if (n8nResponse.success && n8nResponse.data?.data?.aiResponse) {
      // Increment message count in database
        const topic = n8nResponse.data.data.topic;
      const aiResponse = n8nResponse.data.data.aiResponse;
      const noAnswerFound = n8nResponse.data.data.noAnswerFound || false;
      const timestamp = new Date();

      // Store user message
      await messageRepository.storeMessage({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
        topic,
        is_unknown: noAnswerFound,
      });

      // Store AI response
      await messageRepository.storeMessage({
        session_id: sessionId,
        role: 'ai',
        content: aiResponse,
        topic,
        is_unknown: false,
      });
      await sessionRepository.incrementMessageCount(sessionId);

      return {
        sessionId,
        userMessage,
        aiResponse: n8nResponse.data.data.aiResponse,
        topic: n8nResponse.data.data.topic,
        noAnswerFound,
      };
    }

    throw new Error('Failed to process message from n8n');
  }
}
