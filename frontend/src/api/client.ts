import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config): typeof config => {
    // Add any custom headers or auth tokens here
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error): Promise<never> => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError): Promise<never> => {
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status} ${error.config?.url}`,
        error.response.data
      )
    } else if (error.request) {
      console.error('[API Error] No response received', error.request)
    } else {
      console.error('[API Error]', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
