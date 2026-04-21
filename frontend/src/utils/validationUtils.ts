// Validation utility functions

export const validationUtils = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (basic validation - at least 10 digits)
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  },

  // Validate name (non-empty, at least 2 characters)
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2;
  },

  // Get validation error messages
  getEmailError: (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!validationUtils.isValidEmail(email)) return 'Please enter a valid email address';
    return null;
  },

  getPhoneError: (phone: string): string | null => {
    if (!phone) return 'Phone is required';
    if (!validationUtils.isValidPhone(phone)) return 'Phone must have at least 10 digits';
    return null;
  },

  getNameError: (name: string): string | null => {
    if (!name) return 'Name is required';
    if (!validationUtils.isValidName(name)) return 'Name must be at least 2 characters';
    return null;
  },
};
