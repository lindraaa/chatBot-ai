# Local PostgreSQL Docker Setup

This directory contains a Docker setup for running PostgreSQL locally during development.

## Quick Start

1. **Start the PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

2. **Connect to the database:**
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres` (default, or set `DB_USER` in `.env`)
   - Password: `postgres` (default, or set `DB_PASSWORD` in `.env`)
   - Database: `chatbot_db` (default, or set `DB_NAME` in `.env`)

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

4. **Remove everything including data:**
   ```bash
   docker-compose down -v
   ```

## Environment Variables

Configure PostgreSQL by creating a `.env` file in the backend directory:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chatbot_db
```

These values are used both by Docker and your Node.js backend connection string.

## Troubleshooting

- **Port already in use:** Change the port in `docker-compose.yml` from `5432:5432` to `5433:5432`
- **Check container status:** `docker ps`
- **View logs:** `docker logs chatbot-postgres-local`
- **Connect via psql:** `docker exec -it chatbot-postgres-local psql -U postgres`
