import { query } from '../db';

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export class VectorRepository {
  async search(
    embedding: number[],
    limit: number,
    similarityThreshold: number
  ): Promise<RetrievedChunk[]> {
    const vector = `[${embedding.join(',')}]`;
    const result = await query(
      `SELECT id, document_id, content, metadata, similarity
       FROM match_document_chunks($1::vector, $2, $3)`,
      [vector, limit, similarityThreshold]
    );

    return result.rows as RetrievedChunk[];
  }
}
