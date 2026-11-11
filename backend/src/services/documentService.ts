import pdfParse from 'pdf-parse';
import { getSupabaseClient } from '../supabase';
import { DocumentRepository, DocumentRecord } from '../repositories/documentRepository';
import { GeminiEmbeddingService } from './geminiEmbeddingService';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CHUNK_SIZE = 3000;
const CHUNK_OVERLAP = 300;

export interface PdfUploadResult {
  success: true;
  message: string;
  filename: string;
  documentId: string;
  chunkCount: number;
  storagePath: string;
}

export class DocumentService {
  private readonly repository = new DocumentRepository();
  private readonly embeddings = new GeminiEmbeddingService();
  private readonly bucket = process.env.SUPABASE_STORAGE_BUCKET || 'hotel-documents';

  async uploadPdf(file: Express.Multer.File): Promise<PdfUploadResult> {
    this.validateFile(file);

    const storagePath = `${Date.now()}-${this.safeFileName(file.originalname)}`;
    const supabase = getSupabaseClient();
    const document = await this.repository.createDocument({
      fileName: file.originalname,
      storagePath,
      fileSize: file.size,
      mimeType: 'application/pdf',
    });
    let chunkCount = 0;

    try {
      const upload = await supabase.storage.from(this.bucket).upload(storagePath, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });
      if (upload.error) {
        throw new Error(`Supabase Storage upload failed: ${upload.error.message}`);
      }

      const parsed = await pdfParse(file.buffer);
      const text = parsed.text.replace(/\s+/g, ' ').trim();
      if (!text) {
        throw new Error('The PDF does not contain extractable text');
      }

      const contents = this.chunkText(text);
      chunkCount = contents.length;
      const chunks = [];
      for (let index = 0; index < contents.length; index += 1) {
        chunks.push({
          index,
          content: contents[index],
          embedding: await this.embeddings.embed(contents[index]),
          metadata: { fileName: file.originalname, chunkIndex: index },
        });
      }

      await this.repository.insertChunks(document.id, chunks);
      await this.repository.updateStatus(document.id, 'ready');
    } catch (error) {
      await this.repository.updateStatus(document.id, 'failed', String(error));
      await supabase.storage.from(this.bucket).remove([storagePath]);
      throw error;
    }

    await this.removePreviousDocuments(document.id);

    return {
      success: true,
      message: 'PDF uploaded and indexed successfully',
      filename: file.originalname,
      documentId: document.id,
      chunkCount,
      storagePath,
    };
  }

  async getDocuments(): Promise<DocumentRecord[]> {
    return this.repository.getAllDocuments();
  }

  async getDocument(id: string): Promise<DocumentRecord | null> {
    return this.repository.getDocument(id);
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.repository.getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    const supabase = getSupabaseClient();
    const removal = await supabase.storage.from(this.bucket).remove([document.storage_path]);
    if (removal.error) {
      throw new Error(`Supabase Storage deletion failed: ${removal.error.message}`);
    }
    await this.repository.deleteDocument(id);
  }

  private async removePreviousDocuments(currentDocumentId: string): Promise<void> {
    const previousDocuments = await this.repository.getAllDocuments();

    for (const previousDocument of previousDocuments) {
      if (previousDocument.id !== currentDocumentId) {
        await this.deleteDocument(previousDocument.id);
      }
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new Error('No file or file buffer provided');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('PDF exceeds the 50MB size limit');
    }
    if (file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are supported');
    }
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE, text.length);
      const chunk = text.slice(start, end).trim();
      if (chunk) {
        chunks.push(chunk);
      }
      if (end === text.length) {
        break;
      }
      start = end - CHUNK_OVERLAP;
    }
    return chunks;
  }

  private safeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  }
}
