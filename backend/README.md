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
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only Supabase service role key
- `SUPABASE_STORAGE_BUCKET` - Storage bucket for uploaded PDFs
- `GEMINI_API_KEY` - Gemini API key used to create embeddings
- `GEMINI_EMBEDDING_MODEL` - Gemini embedding model (default: `gemini-embedding-001`)

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## PDF vector upload

The `POST /api/admin/upload-pdf` endpoint accepts a multipart `file` field. It
uploads the PDF to Supabase Storage, extracts its text, creates Gemini
embeddings, and stores the chunks in Supabase Postgres with `pgvector`.

Before using the endpoint:

1. Create a Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.
2. Configure the Supabase and Gemini variables in `.env`.
3. Run the database migrations with `npm run migrate:up`.

The database migration creates the `documents` and `document_chunks` tables and
the `match_document_chunks` similarity-search function. The chat endpoint does
not use these vectors yet; this is the upload and indexing phase.

Uploading a new PDF is replacement-based: the new PDF is fully uploaded and
indexed first. Once it is ready, previous documents, their Storage objects, and
their cascaded vector chunks are deleted. If indexing fails, the previous
document remains available.

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
