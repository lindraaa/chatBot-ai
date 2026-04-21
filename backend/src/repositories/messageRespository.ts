import { query } from '../db';
import statsEventBus from '../events/statsEventBus';

export interface MessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'ai';
  content: string;
  topic: string;
  is_unknown: boolean;
  created_at: Date;
}

export class MessageRepository {
  /**
   * Store a message in the database
   */
  async storeMessage(message: Omit<MessageRecord, 'id' | 'created_at'>): Promise<MessageRecord> {
    const result = await query(
      `INSERT INTO messages (session_id, role, content, topic, is_unknown, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, session_id, role, content, topic, is_unknown, created_at`,
      [
        message.session_id,
        message.role,
        message.content,
        message.topic,
        message.is_unknown,
      ]
    );

    const storedMessage = result.rows[0];

    // Emit event for real-time stats updates
    statsEventBus.emitMessageStored({
      sessionId: storedMessage.session_id,
      role: storedMessage.role,
      topic: storedMessage.topic,
    });

    return storedMessage;
  }

  /**
   * Get all messages for a session
   */
  async getMessagesBySession(sessionId: string): Promise<MessageRecord[]> {
    const result = await query(
      `SELECT id, session_id, role, content, topic, is_unknown, created_at
       FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  }

  /**
   * Get unanswered questions (messages where is_unknown is true) for a session
   */
  async getUnansweredQuestionsBySession(sessionId: string): Promise<MessageRecord[]> {
    const result = await query(
      `SELECT id, session_id, role, content, topic, is_unknown, created_at
       FROM messages WHERE session_id = $1 AND is_unknown = true ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  }
}