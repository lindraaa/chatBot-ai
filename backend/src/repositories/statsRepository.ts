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

export interface StatsFilters {
  createdAt?: {
    startDate?: Date;
    endDate?: Date;
  };
  topic?: string;
}

export class StatsRepository {
  /**
   * Get total number of chat sessions with optional filters
   */
  async getTotalSessions(filters?: StatsFilters): Promise<number> {
    let sql = `
      SELECT COUNT(DISTINCT session_id) as total
      FROM messages
      WHERE role = 'user'
    `;
    const params: unknown[] = [];

    if (filters?.createdAt?.startDate) {
      sql += ` AND created_at >= $${params.length + 1}`;
      params.push(filters.createdAt.startDate);
    }

    if (filters?.createdAt?.endDate) {
      sql += ` AND created_at <= $${params.length + 1}`;
      params.push(filters.createdAt.endDate);
    }

    if (filters?.topic) {
      sql += ` AND topic = $${params.length + 1}`;
      params.push(filters.topic);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Get total number of questions (user messages)
   */
  async getTotalQuestions(filters?: StatsFilters): Promise<number> {
    let sql = `SELECT COUNT(*) as total FROM messages WHERE role = 'user'`;
    const params: unknown[] = [];

    if (filters?.createdAt?.startDate) {
      sql += ` AND created_at >= $${params.length + 1}`;
      params.push(filters.createdAt.startDate);
    }

    if (filters?.createdAt?.endDate) {
      sql += ` AND created_at <= $${params.length + 1}`;
      params.push(filters.createdAt.endDate);
    }

    if (filters?.topic) {
      sql += ` AND topic = $${params.length + 1}`;
      params.push(filters.topic);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Get questions grouped by topic with optional filters
   */
  async getQuestionsByTopic(filters?: StatsFilters): Promise<TopicStats[]> {
    let sql = `
      SELECT topic, COUNT(*) as count
      FROM messages
      WHERE role = 'user'
    `;
    const params: unknown[] = [];

    if (filters?.createdAt?.startDate) {
      sql += ` AND created_at >= $${params.length + 1}`;
      params.push(filters.createdAt.startDate);
    }

    if (filters?.createdAt?.endDate) {
      sql += ` AND created_at <= $${params.length + 1}`;
      params.push(filters.createdAt.endDate);
    }

    if (filters?.topic) {
      sql += ` AND topic = $${params.length + 1}`;
      params.push(filters.topic);
    }

    sql += ` GROUP BY topic ORDER BY count DESC`;

    const result = await query(sql, params);
    return result.rows.map((row: any) => ({
      topic: row.topic,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get comprehensive stats with optional filters
   */
  async getStats(filters?: StatsFilters): Promise<SessionStats> {
    const [totalSessions, totalQuestions, questionsByTopic] = await Promise.all([
      this.getTotalSessions(filters),
      this.getTotalQuestions(filters),
      this.getQuestionsByTopic(filters),
    ]);

    return {
      totalSessions,
      totalQuestions,
      questionsByTopic,
    };
  }
}
