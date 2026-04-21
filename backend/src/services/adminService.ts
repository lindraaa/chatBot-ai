import { StatsRepository, SessionStats } from '../repositories/statsRepository';
import { FileRepository } from '../repositories/fileRepository';
import { N8nService } from './n8nService';

// Service layer for Admin operations

export interface PdfUploadResponse {
  success: boolean;
  message: string;
  filename: string;
  n8n_file_id: string;
}

export class AdminService {
  private statsRepository: StatsRepository;
  private fileRepository: FileRepository;
  private n8nService: N8nService;

  constructor() {
    this.statsRepository = new StatsRepository();
    this.fileRepository = new FileRepository();
    this.n8nService = new N8nService();
  }

  // Upload PDF
  async uploadPdf(file: Express.Multer.File): Promise<PdfUploadResponse> {
    if (!file || !file.buffer) {
      throw new Error('No file or file buffer provided');
    }

    // Delete existing files before uploading new one
    const existingFiles = await this.fileRepository.getAllFiles();
    for (const existingFile of existingFiles) {
      if (existingFile.n8n_file_id) {
        // Delete from Google Drive via n8n
        await this.n8nService.deleteFile(existingFile.n8n_file_id);
      }
      // Delete from database
      await this.fileRepository.deleteFile(existingFile.id);
    }

    // Create file record in database
    const fileRecord = await this.fileRepository.createFile({
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
    });

    try {
      const result = await this.n8nService.uploadFile(file.buffer, file.originalname);

      if (!result.success) {
        throw new Error(result.error || result.message);
      }

      // Update file record with n8n response data
      const n8nFileId = result.data?.fileId || result.data?.id;
      if (n8nFileId) {
        await this.fileRepository.updateFile(fileRecord.id, {
          n8n_file_id: n8nFileId,
        });
      }

      return {
        success: true,
        message: 'PDF uploaded successfully',
        filename: file.originalname,
        n8n_file_id: n8nFileId,
      };
    } catch (error) {
      // Clean up database record on upload failure
      await this.fileRepository.deleteFile(fileRecord.id);
      throw error;
    }
  }

  // Get all uploaded files
  async getUploadedFiles() {
    return this.fileRepository.getAllFiles();
  }

  // Get file by ID
  async getFileById(fileId: string) {
    return this.fileRepository.getFile(fileId);
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Delete from n8n if we have the n8n file ID
    if (file.n8n_file_id) {
      await this.n8nService.deleteFile(file.n8n_file_id);
    }

    // Delete from database
    await this.fileRepository.deleteFile(fileId);
  }

  // Get dashboard statistics
  async getStats(): Promise<SessionStats> {
    return this.statsRepository.getStats();
  }
}
