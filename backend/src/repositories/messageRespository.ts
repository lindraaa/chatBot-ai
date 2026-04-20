import { query } from '../db';

export interface MessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'ai';
  content: string;
  topic: string;
  created_at: Date;
}

export class MessageRepository {
  /**
   * Store a message in the database
   */
  async storeMessage(message: Omit<MessageRecord, 'id' | 'created_at'>): Promise<MessageRecord> {
    const result = await query(
      `INSERT INTO messages (session_id, role, content, topic, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, session_id, role, content, topic, created_at`,
      [
        message.session_id,
        message.role,
        message.content,
        message.topic,
      ]
    );
    return result.rows[0];
  }

  /**
   * Get all messages for a session
   */
  async getMessagesBySession(sessionId: string): Promise<MessageRecord[]> {
    const result = await query(
      `SELECT id, session_id, role, content, topic, created_at
       FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  }
}