// Data access layer for sessions
import { query } from '../db';

export interface SessionRecord {
  id: string;
  started_at: Date;
  message_count: number;
  created_at: Date;
  updated_at: Date;
}

export class SessionRepository {
  /**
   * Create a new session in the database
   */
  async createSession(sessionId: string): Promise<SessionRecord> {
    const result = await query(
      `INSERT INTO sessions (id, started_at, message_count, created_at, updated_at)
       VALUES ($1, NOW(), 0, NOW(), NOW())
       RETURNING id, started_at, message_count, created_at, updated_at`,
      [sessionId]
    );

    return result.rows[0];
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const result = await query(
      `SELECT id, started_at, message_count, created_at, updated_at FROM sessions WHERE id = $1`,
      [sessionId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update message count for a session
   */
  async incrementMessageCount(sessionId: string): Promise<void> {
    await query(
      `UPDATE sessions SET message_count = message_count + 1, updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );
  }

  /**
   * Get all sessions
   */
  async getAllSessions(): Promise<SessionRecord[]> {
    const result = await query(
      `SELECT id, started_at, message_count, created_at, updated_at FROM sessions ORDER BY created_at DESC`
    );

    return result.rows;
  }
}
