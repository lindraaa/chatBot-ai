import { StatsRepository, SessionStats } from '../repositories/statsRepository';
import { DocumentService, PdfUploadResult } from './documentService';

// Service layer for Admin operations

export class AdminService {
  private statsRepository: StatsRepository;
  private documentService: DocumentService;

  constructor() {
    this.statsRepository = new StatsRepository();
    this.documentService = new DocumentService();
  }

  // Upload PDF
  async uploadPdf(file: Express.Multer.File): Promise<PdfUploadResult> {
    return this.documentService.uploadPdf(file);
  }

  // Get all uploaded files
  async getUploadedFiles() {
    return this.documentService.getDocuments();
  }

  // Get file by ID
  async getFileById(fileId: string) {
    return this.documentService.getDocument(fileId);
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    return this.documentService.deleteDocument(fileId);
  }

  // Get dashboard statistics
  async getStats(): Promise<SessionStats> {
    return this.statsRepository.getStats();
  }
}
