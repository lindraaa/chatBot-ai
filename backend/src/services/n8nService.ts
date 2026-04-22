// n8n Service for workflow automation


export interface N8nWebhookPayload {
  [key: string]: any;
}

export interface N8nWorkflowResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class N8nService {
  private baseUrl: string;
  private webhookKey: string;

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.webhookKey = process.env.N8N_WEBHOOK_KEY || '';
  }

  /**
   * Trigger an n8n workflow via webhook
   * @param workflowId - The n8n workflow ID or webhook path
   * @param payload - Data to send to the workflow
   */
  async triggerWorkflow(
    workflowId: string,
    payload: N8nWebhookPayload
  ): Promise<N8nWorkflowResponse> {
    try {
      const url = `${this.baseUrl}/webhook/${workflowId}`;
      console.log('🔗 Calling n8n webhook:', url);
      console.log('📦 Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.webhookKey && { 'X-Webhook-Key': this.webhookKey }),
        },
        body: JSON.stringify(payload),
      });

      console.log('📨 n8n Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ n8n Error:', errorText);
        return {
          success: false,
          message: `n8n workflow failed with status ${response.status}`,
          error: errorText,
        };
      }

      const data = await response.json();
      console.log('✅ n8n Response Data:', data);
      return {
        success: true,
        message: 'Workflow triggered successfully',
        data,
      };
    } catch (error) {
      console.log('❌ n8n Error:', error);
      return {
        success: false,
        message: 'Failed to trigger n8n workflow',
        error: String(error),
      };
    }
  }

  /**
   * Create chat session via n8n
   */
  async createChatSession(): Promise<N8nWorkflowResponse> {
    return this.triggerWorkflow('create-session', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Process chat message via n8n
   */
  async processChatMessage(sessionId: string, userMessage: string): Promise<N8nWorkflowResponse> {
    return this.triggerWorkflow('process-message', {
      sessionId,
      userMessage,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle contact form submission via n8n (send email)
   */
  async handleContactForm(formData: {
    name: string;
    email: string;
    phone: string;
    conversationSummary: string;
    unansweredQuestion: string;
  }): Promise<N8nWorkflowResponse> {
    return this.triggerWorkflow('handle-contact-form', {
      ...formData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Upload file via n8n
   * @param file - File buffer to upload
   * @param fileName - Original file name
   */
  async uploadFile(file: Buffer, fileName: string): Promise<N8nWorkflowResponse> {
    try {
      const url = `${this.baseUrl}/webhook/upload-file`;
      const base64File = file.toString('base64');

      console.log('🔗 Uploading file to n8n:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.webhookKey && { 'X-Webhook-Key': this.webhookKey }),
        },
        body: JSON.stringify({
          fileName,
          file: base64File,
          mimeType: 'application/pdf',
        }),
      });

      console.log('📨 n8n Upload Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ n8n Upload Error:', errorText);
        return {
          success: false,
          message: `n8n file upload failed with status ${response.status}`,
          error: errorText,
        };
      }

      const data = await response.json();
      console.log('✅ n8n Upload Response Data:', data);
      return {
        success: true,
        message: 'File uploaded successfully',
        data,
      };
    } catch (error) {
      console.log('❌ n8n Upload Error:', error);
      return {
        success: false,
        message: 'Failed to upload file to n8n',
        error: String(error),
      };
    }
  }

  /**
   * Delete file via n8n
   * @param id - File ID to delete
   */
  async deleteFile(id: string): Promise<N8nWorkflowResponse> {
    return this.triggerWorkflow('file-delete', {
      id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Delete Pinecone namespace via n8n
   * @param namespace - Pinecone namespace to delete
   * @param deleteAll - Whether to delete all vectors in the namespace
   */
  async deletePineconeNamespace(namespace: string, deleteAll: boolean = true): Promise<N8nWorkflowResponse> {
    return this.triggerWorkflow('delete-pinecone', {
      namespace,
      deleteAll,
      timestamp: new Date().toISOString(),
    });
  }
}