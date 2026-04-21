// Utility functions for managing chat messages storage

interface StoredMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const MESSAGES_STORAGE_PREFIX = 'chatbot_messages_';
const STORAGE_EXPIRY_PREFIX = 'chatbot_expiry_';

export const storageUtils = {
  // Get storage key for a specific session
  getStorageKey: (sessionId: string): string => {
    return `${MESSAGES_STORAGE_PREFIX}${sessionId}`;
  },

  // Get expiry key for a specific session
  getExpiryKey: (sessionId: string): string => {
    return `${STORAGE_EXPIRY_PREFIX}${sessionId}`;
  },

  // Save messages for a session
  saveMessages: (sessionId: string, messages: StoredMessage[]) => {
    const key = storageUtils.getStorageKey(sessionId);
    const expiryKey = storageUtils.getExpiryKey(sessionId);

    // Store messages
    localStorage.setItem(key, JSON.stringify(messages));

    // Store expiry time (30 minutes from now)
    const expiryTime = new Date().getTime() + (30 * 60 * 1000);
    localStorage.setItem(expiryKey, expiryTime.toString());
  },

  // Get messages for a session
  getMessages: (sessionId: string): StoredMessage[] | null => {
    const key = storageUtils.getStorageKey(sessionId);
    const expiryKey = storageUtils.getExpiryKey(sessionId);

    // Check if storage has expired
    const expiryTimeStr = localStorage.getItem(expiryKey);
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr);
      if (new Date().getTime() > expiryTime) {
        // Storage has expired, clear it
        storageUtils.clearMessages(sessionId);
        return null;
      }
    }

    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Error parsing stored messages:', error);
        return null;
      }
    }
    return null;
  },

  // Clear messages for a session
  clearMessages: (sessionId: string) => {
    const key = storageUtils.getStorageKey(sessionId);
    const expiryKey = storageUtils.getExpiryKey(sessionId);
    localStorage.removeItem(key);
    localStorage.removeItem(expiryKey);
  },

  // Clear all chat messages (when user logs out or session expires)
  clearAllMessages: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(MESSAGES_STORAGE_PREFIX) || key.startsWith(STORAGE_EXPIRY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },
};
