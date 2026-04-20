# Cincinnati Hotel AI Chatbot - Full Stack Application

A production-ready hotel information chatbot system for Cincinnati Hotel. This full-stack web application features a React + Vite frontend with Material UI and a Node.js + Express backend, built with TypeScript and modern best practices.

## 🏨 System Overview

This platform simulates a real-life hotel information chatbot where guests can chat with an AI assistant that answers questions about the hotel's facilities, rooms, prices, and services based on an uploaded PDF document.

### Two User Roles:
- **Admin** – Upload/update hotel information PDF and view usage statistics
- **User** – Chat with the hotel's AI assistant and ask questions about the hotel

## 📁 Project Structure

```
chatBot-ai/
├── backend/          # Node.js + Express API server
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/         # React + Vite web application
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── README.md
```

Each directory is an **independent git repository** with its own:
- `.git/` folder
- `package.json` and dependencies
- TypeScript configuration
- ESLint and Prettier setup
- Environment variables

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 Documentation

- **[Backend Documentation](./backend/README.md)** - API setup, routes, and development guide
- **[Frontend Documentation](./frontend/README.md)** - React app setup, components, and API integration

## ✨ Features

### Backend
- Express.js REST API
- CORS middleware configured
- Centralized error handling
- Request logging middleware
- Type-safe TypeScript with strict mode
- PDF document processing and storage
- Chat history management
- Email notifications for unresolved queries

### Frontend
- React 18 with hooks
- Vite for fast development and builds
- Material UI (MUI) components library
- Axios HTTP client with interceptors
- API proxy configuration for development
- Two distinct interfaces: Admin Dashboard & User Chat
- Real-time statistics dashboard
- Responsive Material Design

## 📋 Functional Requirements

### User Side (Chat Interface)
- **Landing Page**: Two buttons to select between Admin and Regular User modes
- **Chat Interface**: Real-time conversation with Cincinnati Hotel chatbot
- **Knowledge Base**: Chatbot answers based exclusively on uploaded PDF content
- **Fallback Handling**: 
  - Polite response when information isn't available
  - Contact form to collect: Name, Phone, Email
  - Email notification sent to idan@tauga.ai with conversation context and unanswered question

### Admin Side (Dashboard)
- **PDF Upload**: Upload and replace single PDF document (knowledge base)
- **Statistics Dashboard**:
  - Total number of chat sessions
  - Questions asked per topic/category
  - Chat activity analytics
- **No Authentication**: Simple access via "Admin" button on landing page

## 🛠 Development

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### API Integration

The frontend automatically proxies `/api` requests to the backend:
- Frontend request: `http://localhost:5173/api/health`
- Proxied to: `http://localhost:3000/api/health`

Backend health check is displayed on the frontend homepage.

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## ✅ Code Quality

Both projects include:
- **TypeScript strict mode** - Strict type checking
- **No `any` types** - ESLint rule enforces explicit types
- **ESLint** - Code style and best practices
- **Prettier** - Code formatting
- **Environment-based config** - .env.example templates

## 🔍 Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## 🔗 API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Example Endpoint
```
GET /api/example
```

Response:
```json
{
  "message": "This is an example endpoint",
  "data": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "environment": "development"
  }
}
```

## 🎯 Best Practices Implemented

✅ **TypeScript Strict Mode** - Both projects use strict type checking  
✅ **No `any` Types** - ESLint enforces explicit types  
✅ **Separation of Concerns** - Frontend and backend are independent repos  
✅ **Environment Configuration** - .env.example files provided  
✅ **Error Handling** - Centralized error handler on backend  
✅ **API Client** - Axios wrapper with interceptors on frontend  
✅ **CORS Configuration** - Properly configured for local development  
✅ **Modular Structure** - Well-organized folder structure  
✅ **Code Quality** - ESLint and Prettier configured  

## 📋 Next Steps

1. **Install dependencies** for both backend and frontend
2. **Set up environment variables** by copying .env.example to .env
3. **Start the development servers** in separate terminals
4. **Open** `http://localhost:5173` in your browser
5. **Verify** the backend connection status displayed on the page
6. **Start building** your application!

## 🤝 Contributing

- Follow the code style enforced by ESLint and Prettier
- Maintain TypeScript strict mode compliance
- Add proper type annotations instead of using `any`
- Update README.md files with new features or changes
- Test API endpoints with the frontend client

---


