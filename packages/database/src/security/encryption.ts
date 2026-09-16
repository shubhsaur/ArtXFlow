import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Resolves and normalizes an encryption key into a 32-byte Buffer suitable for AES-256.
 */
function deriveKey(secretKey?: string): Buffer {
  const key = secretKey || process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'Encryption key not provided and ENCRYPTION_KEY environment variable is not set',
    );
  }
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypts a plaintext string using authenticated AES-256-GCM.
 * Output format: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptCredential(plaintext: string, secretKey?: string): string {
  const key = deriveKey(secretKey);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a formatted ciphertext string using authenticated AES-256-GCM.
 * Throws an error if tampering, invalid format, or incorrect key is detected.
 */
export function decryptCredential(encryptedData: string, secretKey?: string): string {
  const key = deriveKey(secretKey);
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted credential format: expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  if (!ivHex || !authTagHex || ciphertextHex === undefined) {
    throw new Error('Invalid encrypted credential components');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`);
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH} bytes`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  try {
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error(
      `Decryption failed: authentication failed or payload tampered (${(err as Error).message})`,
    );
  }
}
