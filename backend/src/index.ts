import 'dotenv/config';
import app from './app';
import { initializeDatabase, verifyConnection, closeDatabase } from './db';

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    initializeDatabase();

    // Verify database connection
    const connected = await verifyConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    const server = app.listen(PORT, (): void => {
      console.log(
        `[${NODE_ENV}] Server is running on http://localhost:${PORT}`
      );
    });

    // Handle graceful shutdown
    process.on('SIGTERM', (): void => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async (): Promise<void> => {
        await closeDatabase();
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', (): void => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(async (): Promise<void> => {
        await closeDatabase();
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
