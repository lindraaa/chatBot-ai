// Utility functions for managing cookies

const SESSION_COOKIE_NAME = 'hotel_chatbot_session';
const COOKIE_EXPIRY_MINUTES = 30;

export const cookieUtils = {
  // Set a cookie with session ID
  setSessionCookie: (sessionId: string, expiryMinutes: number = COOKIE_EXPIRY_MINUTES) => {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    const cookieString = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expiryDate.toUTCString()}; path=/`;
    document.cookie = cookieString;
  },

  // Get session ID from cookie
  getSessionCookie: (): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === SESSION_COOKIE_NAME) {
        return value;
      }
    }
    return null;
  },

  // Clear session cookie
  clearSessionCookie: () => {
    const cookieString = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = cookieString;
  },

  // Check if session exists
  hasSessionCookie: (): boolean => {
    return cookieUtils.getSessionCookie() !== null;
  },
};
