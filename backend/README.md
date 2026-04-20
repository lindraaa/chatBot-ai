# chatBot-ai Backend

Node.js + Express + TypeScript API server for chatBot-ai

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
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Output goes to `dist/` directory

## Production

Build and run the production server:

```bash
npm run build
npm start
```

## Linting

Check code style:

```bash
npm run lint
```

## API Endpoints

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

## Project Structure

```
src/
├── index.ts           # Server entry point
├── app.ts             # Express app setup
├── middleware/        # Express middleware
├── routes/            # API routes
├── controllers/       # Route controllers
├── utils/             # Utility functions
└── types/             # TypeScript types
```

## Best Practices

- ✅ No `any` types - enforce explicit TypeScript types
- ✅ Centralized error handling
- ✅ CORS configured for frontend
- ✅ Environment-based configuration
- ✅ Strict TypeScript mode enabled
