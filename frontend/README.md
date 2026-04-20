# chatBot-ai Frontend

React + Vite + TypeScript web application for chatBot-ai

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Available variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Development

Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

Output goes to `dist/` directory

## Preview

Preview production build locally:

```bash
npm run preview
```

## Linting

Check code style:

```bash
npm run lint
```

## Features

- ⚡ Vite for fast development and optimized builds
- 🎨 React 18 with hooks
- 📘 Full TypeScript support with strict mode
- 🔗 Axios API client with interceptors
- 🚀 Automatic API proxy in development
- 🎯 ESLint and Prettier configured
- ❌ No `any` types - enforce explicit TypeScript types

## Project Structure

```
src/
├── main.tsx           # Entry point
├── App.tsx            # Root component
├── App.css            # Component styles
├── index.css          # Global styles
├── api/
│   └── client.ts      # Axios client with interceptors
├── components/        # Reusable React components
├── pages/             # Page components
└── hooks/             # Custom React hooks
```

## API Integration

The frontend uses Vite's proxy configuration to route `/api` requests to the backend during development:

```
Frontend: http://localhost:5173
Backend: http://localhost:3000

Request: http://localhost:5173/api/health
Proxied to: http://localhost:3000/api/health
```

## Backend Connection

The backend health check is automatically called on app load to verify the connection. The status is displayed in the main content area.

## Best Practices

- ✅ No `any` types - enforce explicit TypeScript types
- ✅ Centralized API client with interceptors
- ✅ Environment-based configuration
- ✅ Strict TypeScript mode enabled
- ✅ ESLint and Prettier for code quality
- ✅ Component-based architecture
