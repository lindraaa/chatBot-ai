import { Response } from 'express';
import statsEventBus from '../events/statsEventBus';
import { StatsRepository, SessionStats } from '../repositories/statsRepository';

interface ConnectedClient {
  res: Response;
  id: string;
  connectedAt: Date;
}

/**
 * Real-time Stats Service
 *
 * Listens to stats events, batches them, recalculates stats,
 * and broadcasts updates to connected SSE clients.
 */
class RealtimeStatsService {
  private static instance: RealtimeStatsService;
  private statsRepository: StatsRepository;
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private batchQueue: Set<string> = new Set();
  private batchTimeout: NodeJS.Timeout | null = null;
  private cachedStats: SessionStats | null = null;
  private readonly BATCH_INTERVAL_MS = 500; // Batch events every 500ms

  private constructor() {
    this.statsRepository = new StatsRepository();
    this.setupEventListeners();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RealtimeStatsService {
    if (!RealtimeStatsService.instance) {
      RealtimeStatsService.instance = new RealtimeStatsService();
    }
    return RealtimeStatsService.instance;
  }

  /**
   * Setup event listeners for stats updates
   */
  private setupEventListeners(): void {
    // Listen for message stored events
    statsEventBus.on('message:stored', (data) => {
      this.queueStatsUpdate('message:stored');
    });

    // Listen for session created events
    statsEventBus.on('session:created', (data) => {
      this.queueStatsUpdate('session:created');
    });

    // Listen for session updated events
    statsEventBus.on('session:updated', (data) => {
      this.queueStatsUpdate('session:updated');
    });
  }

  /**
   * Queue a stats update and schedule batch processing
   */
  private queueStatsUpdate(eventType: string): void {
    this.batchQueue.add(eventType);

    // If no batch timeout is set, schedule one
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_INTERVAL_MS);
    }
  }

  /**
   * Process batched updates by recalculating stats and broadcasting
   */
  private async processBatch(): Promise<void> {
    try {
      // Clear the batch timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
      }

      // Clear the queue
      this.batchQueue.clear();

      // Recalculate stats
      const stats = await this.statsRepository.getStats();

      // Update cache
      this.cachedStats = stats;

      // Broadcast to all connected clients
      this.broadcastStats(stats);
    } catch (error) {
      console.error('Error processing batch stats update:', error);
    }
  }

  /**
   * Register a new SSE client connection
   */
  registerClient(res: Response, clientId: string): void {
    const client: ConnectedClient = {
      res,
      id: clientId,
      connectedAt: new Date(),
    };

    this.connectedClients.set(clientId, client);

    // Send cached stats immediately if available
    if (this.cachedStats) {
      this.sendStatsToClient(res, this.cachedStats);
    }

    // Setup client disconnection handler
    res.on('close', () => {
      this.unregisterClient(clientId);
    });

    console.log(
      `📊 SSE client registered: ${clientId}. Total clients: ${this.connectedClients.size}`
    );
  }

  /**
   * Unregister a disconnected SSE client
   */
  private unregisterClient(clientId: string): void {
    this.connectedClients.delete(clientId);
    console.log(
      `📊 SSE client disconnected: ${clientId}. Total clients: ${this.connectedClients.size}`
    );
  }

  /**
   * Broadcast stats to all connected clients
   */
  private broadcastStats(stats: SessionStats): void {
    const disconnectedClients: string[] = [];

    this.connectedClients.forEach((client, clientId) => {
      if (!this.sendStatsToClient(client.res, stats)) {
        // Mark for cleanup if send failed
        disconnectedClients.push(clientId);
      }
    });

    // Clean up disconnected clients
    disconnectedClients.forEach((clientId) => {
      this.unregisterClient(clientId);
    });

    if (this.connectedClients.size > 0) {
      console.log(
        `📊 Broadcasted stats to ${this.connectedClients.size} client(s)`
      );
    }
  }

  /**
   * Send stats to a single client
   */
  private sendStatsToClient(res: Response, stats: SessionStats): boolean {
    try {
      const data = `data: ${JSON.stringify(stats)}\n\n`;
      res.write(data);
      return true;
    } catch (error) {
      console.error('Error sending stats to client:', error);
      return false;
    }
  }

  /**
   * Get cached stats
   */
  getCachedStats(): SessionStats | null {
    return this.cachedStats;
  }

  /**
   * Get current number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

export default RealtimeStatsService.getInstance();
