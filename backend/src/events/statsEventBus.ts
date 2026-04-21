import { EventEmitter } from 'events';

/**
 * Stats Event Bus
 *
 * A centralized EventEmitter for stats-related events.
 * This allows repositories and services to emit events when data changes,
 * enabling real-time stats updates across the application.
 */
class StatsEventBus extends EventEmitter {
  private static instance: StatsEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100); // Increase limit to support multiple listeners
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StatsEventBus {
    if (!StatsEventBus.instance) {
      StatsEventBus.instance = new StatsEventBus();
    }
    return StatsEventBus.instance;
  }

  /**
   * Emit a message stored event
   */
  emitMessageStored(data: {
    sessionId: string;
    role: 'user' | 'ai';
    topic?: string;
  }): void {
    this.emit('message:stored', data);
  }

  /**
   * Emit a session created event
   */
  emitSessionCreated(data: { sessionId: string }): void {
    this.emit('session:created', data);
  }

  /**
   * Emit a session updated event (message count incremented)
   */
  emitSessionUpdated(data: { sessionId: string }): void {
    this.emit('session:updated', data);
  }
}

export default StatsEventBus.getInstance();
