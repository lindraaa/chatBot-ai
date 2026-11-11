// Service layer for Chat operations
import { v4 as uuidv4 } from 'uuid';
import { SessionRepository } from '../repositories/sessionRepository';
import { MessageRepository } from '../repositories/messageRespository';
import { VectorRepository } from '../repositories/vectorRepository';
import { GeminiEmbeddingService } from './geminiEmbeddingService';
import { GeminiAnswerService } from './geminiAnswerService';

const sessionRepository = new SessionRepository();
const messageRepository = new MessageRepository();
const vectorRepository = new VectorRepository();
const embeddingService = new GeminiEmbeddingService();
const answerService = new GeminiAnswerService();

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
  // n8n remains available for other workflows; sessions are now created locally.
  async createSession(): Promise<Session> {
    const sessionId = uuidv4();
    const createdSession = await sessionRepository.createSession(sessionId);

    return {
      id: createdSession.id,
      startedAt: createdSession.started_at,
    };
  }

  // Retrieve context from Supabase pgvector and generate a grounded Gemini answer.
  async sendMessage(sessionId: string, userMessage: string): Promise<ChatMessage> {
    const session = await sessionRepository.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const embedding = await embeddingService.embed(userMessage);
    const searchLimit = Number(process.env.VECTOR_SEARCH_LIMIT || 5);
    const similarityThreshold = Number(process.env.VECTOR_SIMILARITY_THRESHOLD || 0.35);
    let chunks = await vectorRepository.search(
      embedding,
      searchLimit,
      similarityThreshold
    );
    if (!chunks.length && similarityThreshold > 0.35) {
      chunks = await vectorRepository.search(embedding, searchLimit, 0.35);
    }
    const history = (await messageRepository.getMessagesBySession(sessionId)).slice(-10);
    const generated = chunks.length
      ? await answerService.generateAnswer({
          question: userMessage,
          context: chunks.map((chunk) => chunk.content),
          history,
        })
      : {
          answer: "I don't have that information. Please contact the hotel directly.",
          topic: 'Other',
          noAnswerFound: true,
        };

    await messageRepository.storeMessage({
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      topic: generated.topic,
      is_unknown: generated.noAnswerFound,
    });
    await messageRepository.storeMessage({
      session_id: sessionId,
      role: 'ai',
      content: generated.answer,
      topic: generated.topic,
      is_unknown: false,
    });
    await sessionRepository.incrementMessageCount(sessionId);

    return {
      sessionId,
      userMessage,
      aiResponse: generated.answer,
      topic: generated.topic,
      noAnswerFound: generated.noAnswerFound,
    };
  }
}
