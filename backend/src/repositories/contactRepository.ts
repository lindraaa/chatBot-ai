import { query } from '../db';

export interface ContactSubmission {
  id: string;
  session_id?: string;
  name: string;
  email: string;
  phone?: string;
  conversation_summary: string;
  unanswered_question: string;
  created_at: Date;
}

export class ContactRepository {
  /**
   * Store a contact submission in the database
   */
  async storeContactSubmission(
    submission: Omit<ContactSubmission, 'id' | 'created_at'>
  ): Promise<ContactSubmission> {
    const result = await query(
      `INSERT INTO contact_submissions
       (session_id, name, email, phone, conversation_summary, unanswered_question, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, session_id, name, email, phone, conversation_summary, unanswered_question, created_at`,
      [
        submission.session_id || null,
        submission.name,
        submission.email,
        submission.phone || null,
        submission.conversation_summary,
        submission.unanswered_question,
      ]
    );

    console.log('✅ Contact submission stored:', result.rows[0].id);
    return result.rows[0];
  }

  /**
   * Get all contact submissions for a session
   */
  async getSubmissionsBySession(sessionId: string): Promise<ContactSubmission[]> {
    const result = await query(
      `SELECT id, session_id, name, email, phone, conversation_summary, unanswered_question, created_at
       FROM contact_submissions
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [sessionId]
    );
    return result.rows;
  }

  /**
   * Get all contact submissions (for admin)
   */
  async getAllSubmissions(limit: number = 100): Promise<ContactSubmission[]> {
    const result = await query(
      `SELECT id, session_id, name, email, phone, conversation_summary, unanswered_question, created_at
       FROM contact_submissions
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}
