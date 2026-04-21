import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Send message to chatbot
  sendMessage: (message: string, sessionId?: string) =>
    apiClient.post('/chat/message', { message, sessionId }),

  // Get chat history
  getChatHistory: (sessionId: string) =>
    apiClient.get(`/chat/history/${sessionId}`),

  // Create new session
  createSession: () =>
    apiClient.post('/chat/session', {}),

  // Upload PDF (admin)
  uploadPDF: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/admin/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get statistics (admin) - single request
  getStatistics: () =>
    apiClient.get('/admin/stats'),

  // Stream real-time statistics (admin) via SSE
  streamStatistics: (onData: (stats: any) => void, onError?: (error: any) => void): (() => void) => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/admin/stats/stream`);

    eventSource.onmessage = (event) => {
      try {
        const stats = JSON.parse(event.data);
        onData(stats);
      } catch (error) {
        console.error('Error parsing stats data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      if (onError) {
        onError(error);
      }
    };

    // Return a cleanup function to close the connection
    return () => {
      eventSource.close();
    };
  },

  // Submit contact form (when chatbot can't answer)
  submitContactForm: (data: {
    name: string;
    email: string;
    phone: string;
    question: string;
    conversationContext: string;
  }) =>
    apiClient.post('/chat/contact-form', data),
};
