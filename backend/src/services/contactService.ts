import { N8nService } from './n8nService';
import { ContactRepository } from '../repositories/contactRepository';
import { MessageRepository } from '../repositories/messageRespository';

const n8nService = new N8nService();
const contactRepository = new ContactRepository();
const messageRepository = new MessageRepository();

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  sessionId: string;
  question?: string;
  conversationContext?: string;
}

export class ContactService {
  /**
   * Submit contact form: store in DB and send email via n8n
   */
  async submitContactForm(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
    try {
      // Get conversation history for this session
      const messages = await messageRepository.getMessagesBySession(formData.sessionId);
      const conversationSummary = formData.conversationContext || messages
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');

      // Get unanswered questions from database
      const unansweredQuestions = await messageRepository.getUnansweredQuestionsBySession(formData.sessionId);
      const unansweredQuestionsSummary = formData.question || unansweredQuestions
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');

      // Store in database
      await contactRepository.storeContactSubmission({
        session_id: formData.sessionId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        conversation_summary: conversationSummary,
        unanswered_question: unansweredQuestionsSummary,
      });

      // Send email via n8n
      const emailResponse = await n8nService.handleContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        conversationSummary,
        unansweredQuestion: unansweredQuestionsSummary
      });

      if (!emailResponse.success) {
        console.error('❌ Email sending failed:', emailResponse.error);
        return {
          success: false,
          message: 'Form submitted but email notification failed',
        };
      }

      console.log('✅ Contact form submitted and email sent');
      return {
        success: true,
        message: 'Contact form submitted successfully. We will be in touch!',
      };
    } catch (error) {
      console.error('❌ Error submitting contact form:', error);
      return {
        success: false,
        message: 'Failed to submit contact form',
      };
    }
  }

  /**
   * Get all contact submissions for a session (admin use)
   */
  async getSubmissionsBySession(sessionId: string): Promise<any[]> {
    return await contactRepository.getSubmissionsBySession(sessionId);
  }

  /**
   * Get all submissions (admin use)
   */
  async getAllSubmissions(limit?: number): Promise<any[]> {
    return await contactRepository.getAllSubmissions(limit);
  }

  /**
   * Get unanswered questions for a session
   */
  async getUnansweredQuestionsBySession(sessionId: string): Promise<any[]> {
    return await messageRepository.getUnansweredQuestionsBySession(sessionId);
  }
}
