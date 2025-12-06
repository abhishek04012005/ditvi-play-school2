import crypto from 'crypto';

/**
 * Hash a password using SHA-256 with salt
 * @param password - The plain text password
 * @param salt - The salt from environment variables
 * @returns The hashed password
 */
export const hashPassword = (password: string, salt: string): string => {
  try {
    // Combine password with salt
    const combined = password + salt;
    
    // Create SHA-256 hash
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify a password against a stored hash
 * @param password - The plain text password to verify
 * @param storedHash - The stored hash from database
 * @param salt - The salt from environment variables
 * @returns true if password matches, false otherwise
 */
export const verifyPassword = (password: string, storedHash: string, salt: string): boolean => {
  try {
    const hash = hashPassword(password, salt);
    return hash === storedHash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Generate a secure random password
 * @param length - Length of password (default: 12)
 * @returns A random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
