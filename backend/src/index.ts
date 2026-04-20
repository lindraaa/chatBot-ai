import 'dotenv/config';
import app from './app';

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, (): void => {
  console.log(
    `[${NODE_ENV}] Server is running on http://localhost:${PORT}`
  );
});

// Handle graceful shutdown
process.on('SIGTERM', (): void => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close((): void => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
