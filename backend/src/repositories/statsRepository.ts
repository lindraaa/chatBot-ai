import { query } from '../db';

export interface TopicStats {
  topic: string;
  count: number;
}

export interface SessionStats {
  totalSessions: number;
  totalQuestions: number;
  questionsByTopic: TopicStats[];
}

export class StatsRepository {
  /**
   * Get total number of chat sessions
   */
  async getTotalSessions(): Promise<number> {
    const result = await query(
      `SELECT COUNT(DISTINCT session_id) as total
       FROM messages
       WHERE role = 'user'`
    );
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Get total number of questions (user messages)
   */
  async getTotalQuestions(): Promise<number> {
    const result = await query(`SELECT COUNT(*) as total FROM messages WHERE role = 'user'`);
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Get questions grouped by topic
   */
  async getQuestionsByTopic(): Promise<TopicStats[]> {
    const result = await query(
      `SELECT topic, COUNT(*) as count
       FROM messages
       WHERE role = 'user'
       GROUP BY topic
       ORDER BY count DESC`
    );
    return result.rows.map((row: any) => ({
      topic: row.topic,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get comprehensive stats
   */
  async getStats(): Promise<SessionStats> {
    const [totalSessions, totalQuestions, questionsByTopic] = await Promise.all([
      this.getTotalSessions(),
      this.getTotalQuestions(),
      this.getQuestionsByTopic(),
    ]);

    return {
      totalSessions,
      totalQuestions,
      questionsByTopic,
    };
  }
}

