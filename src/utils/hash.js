import crypto from 'crypto';

/**
 * Generate a hash for a given file path or code string
 * @param {string} input - The file path or code string
 * @returns {string} - The generated hash
 */
export function generateHash(input) {
  const content = fs.readFileSync(input);
  return crypto.createHash('sha256').update(content).digest('hex');
}