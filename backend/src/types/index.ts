// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    details?: string;
    status: number;
  };
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

// Example data structure
export interface ExampleData {
  timestamp: string;
  environment: string | undefined;
}
