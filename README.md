# chatBot-ai - Full Stack Application

Complete full-stack web application with React + Vite frontend and Node.js + Express backend, built with TypeScript and modern best practices.

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
- Health check and example endpoints

### Frontend
- React 18 with hooks
- Vite for fast development and builds
- Axios HTTP client with interceptors
- API proxy configuration for development
- Automatic backend health check
- Responsive design with CSS

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


