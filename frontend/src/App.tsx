import { useState, useEffect } from 'react'
import apiClient from './api/client'
import './App.css'

interface HealthCheckData {
  status: string
  timestamp: string
}

function App(): JSX.Element {
  const [backendStatus, setBackendStatus] = useState<string>('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect((): void => {
    const checkBackendHealth = async (): Promise<void> => {
      try {
        const response = await apiClient.get<HealthCheckData>('/health')
        setBackendStatus(`Backend is ${response.data.status}`)
        setError(null)
      } catch (err) {
        setBackendStatus('Offline')
        setError(err instanceof Error ? err.message : 'Failed to connect to backend')
      }
    }

    checkBackendHealth()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>chatBot-ai</h1>
        <p>React + Vite + TypeScript Frontend</p>
      </header>

      <main className="main">
        <section className="status">
          <h2>Backend Status</h2>
          <p className={backendStatus.includes('offline') ? 'error' : 'success'}>
            {backendStatus}
          </p>
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="info">
          <h2>Getting Started</h2>
          <ul>
            <li>Frontend is running on <code>http://localhost:5173</code></li>
            <li>Backend is running on <code>http://localhost:3000</code></li>
            <li>API calls are proxied to <code>/api</code></li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
