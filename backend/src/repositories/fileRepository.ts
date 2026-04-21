// Data access layer for files
import { query } from '../db';

export interface FileRecord {
  id: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  n8n_file_id?: string;
  uploaded_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class FileRepository {
  /**
   * Create a new file record in the database
   */
  async createFile(fileData: {
    file_name: string;
    file_size?: number;
    mime_type?: string;
    n8n_file_id?: string;
  }): Promise<FileRecord> {
    const result = await query(
      `INSERT INTO files (file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       RETURNING id, file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at`,
      [fileData.file_name, fileData.file_size, fileData.mime_type, fileData.n8n_file_id]
    );

    return result.rows[0];
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<FileRecord | null> {
    const result = await query(
      `SELECT id, file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at
       FROM files WHERE id = $1`,
      [fileId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all files
   */
  async getAllFiles(): Promise<FileRecord[]> {
    const result = await query(
      `SELECT id, file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at
       FROM files ORDER BY uploaded_at DESC`
    );

    return result.rows;
  }

  /**
   * Delete file by ID
   */
  async deleteFile(fileId: string): Promise<void> {
    await query(`DELETE FROM files WHERE id = $1`, [fileId]);
  }

  /**
   * Get file by n8n file ID
   */
  async getFileByN8nId(n8nFileId: string): Promise<FileRecord | null> {
    const result = await query(
      `SELECT id, file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at
       FROM files WHERE n8n_file_id = $1`,
      [n8nFileId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update file with n8n response data
   */
  async updateFile(
    fileId: string,
    updates: Partial<{
      file_size: number;
      mime_type: string;
      n8n_file_id: string;
    }>
  ): Promise<FileRecord> {
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.file_size !== undefined) {
      setClauses.push(`file_size = $${paramIndex++}`);
      params.push(updates.file_size);
    }
    if (updates.mime_type !== undefined) {
      setClauses.push(`mime_type = $${paramIndex++}`);
      params.push(updates.mime_type);
    }
    if (updates.n8n_file_id !== undefined) {
      setClauses.push(`n8n_file_id = $${paramIndex++}`);
      params.push(updates.n8n_file_id);
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(fileId);

    const result = await query(
      `UPDATE files SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, file_name, file_size, mime_type, n8n_file_id, uploaded_at, created_at, updated_at`,
      params
    );

    return result.rows[0];
  }
}
