import { query } from '../db';

export type DocumentStatus = 'processing' | 'ready' | 'failed';

export interface DocumentRecord {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export class DocumentRepository {
  async createDocument(data: {
    fileName: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
  }): Promise<DocumentRecord> {
    const result = await query(
      `INSERT INTO documents (file_name, storage_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_name, storage_path, file_size, mime_type, status, error_message, created_at, updated_at`,
      [data.fileName, data.storagePath, data.fileSize, data.mimeType]
    );
    return result.rows[0] as DocumentRecord;
  }

  async updateStatus(id: string, status: DocumentStatus, errorMessage?: string): Promise<void> {
    await query(
      `UPDATE documents
       SET status = $1, error_message = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, errorMessage || null, id]
    );
  }

  async insertChunks(
    documentId: string,
    chunks: Array<{ index: number; content: string; embedding: number[]; metadata: Record<string, unknown> }>
  ): Promise<void> {
    for (const chunk of chunks) {
      const vector = `[${chunk.embedding.join(',')}]`;
      await query(
        `INSERT INTO document_chunks (document_id, chunk_index, content, embedding, metadata)
         VALUES ($1, $2, $3, $4::vector, $5::jsonb)`,
        [documentId, chunk.index, chunk.content, vector, JSON.stringify(chunk.metadata)]
      );
    }
  }

  async getAllDocuments(): Promise<DocumentRecord[]> {
    const result = await query(
      `SELECT id, file_name, storage_path, file_size, mime_type, status, error_message, created_at, updated_at
       FROM documents ORDER BY created_at DESC`
    );
    return result.rows as DocumentRecord[];
  }

  async getDocument(id: string): Promise<DocumentRecord | null> {
    const result = await query(
      `SELECT id, file_name, storage_path, file_size, mime_type, status, error_message, created_at, updated_at
       FROM documents WHERE id = $1`,
      [id]
    );
    return (result.rows[0] as DocumentRecord | undefined) || null;
  }

  async deleteDocument(id: string): Promise<void> {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  }
}
