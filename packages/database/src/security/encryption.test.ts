import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptCredential, decryptCredential } from './encryption';

describe('Encryption Utility (AES-256-GCM)', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;
  const testKey = 'super-secret-encryption-key-for-testing-at-least-32-chars';

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = testKey;
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  it('successfully encrypts and decrypts a secret token', () => {
    const secret = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = encryptCredential(secret);

    expect(encrypted).not.toBe(secret);
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decryptCredential(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('supports custom secret key overriding environment variable', () => {
    const customKey = 'another-super-secret-key-that-is-at-least-32-chars-long';
    const secret = 'hashnode_token_abc_xyz';

    const encrypted = encryptCredential(secret, customKey);
    const decrypted = decryptCredential(encrypted, customKey);

    expect(decrypted).toBe(secret);
  });

  it('produces distinct ciphertexts for identical plaintext due to random IVs', () => {
    const secret = 'identical_secret_token_12345';
    const enc1 = encryptCredential(secret);
    const enc2 = encryptCredential(secret);

    expect(enc1).not.toBe(enc2);
    expect(decryptCredential(enc1)).toBe(secret);
    expect(decryptCredential(enc2)).toBe(secret);
  });

  it('fails decryption when decrypted with a different key', () => {
    const key1 = 'key-one-which-is-at-least-32-chars-long-12345';
    const key2 = 'key-two-which-is-at-least-32-chars-long-67890';
    const secret = 'my_api_key_secret';

    const encrypted = encryptCredential(secret, key1);

    expect(() => decryptCredential(encrypted, key2)).toThrow(/Decryption failed/);
  });

  it('detects tampering in ciphertext', () => {
    const secret = 'tamper_proof_secret_value';
    const encrypted = encryptCredential(secret);
    const [iv, authTag, ciphertext] = encrypted.split(':');

    // Flip last character of ciphertext
    const tamperedCiphertext = ciphertext.slice(0, -1) + (ciphertext.slice(-1) === 'a' ? 'b' : 'a');
    const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;

    expect(() => decryptCredential(tampered)).toThrow(/Decryption failed/);
  });

  it('detects tampering in auth tag', () => {
    const secret = 'tamper_proof_secret_value';
    const encrypted = encryptCredential(secret);
    const [iv, authTag, ciphertext] = encrypted.split(':');

    // Flip first character of auth tag
    const tamperedAuthTag = (authTag[0] === 'a' ? 'b' : 'a') + authTag.slice(1);
    const tampered = `${iv}:${tamperedAuthTag}:${ciphertext}`;

    expect(() => decryptCredential(tampered)).toThrow(/Decryption failed/);
  });

  it('rejects malformed encrypted payload strings', () => {
    expect(() => decryptCredential('not-a-valid-encrypted-string')).toThrow(
      /Invalid encrypted credential format/,
    );
    expect(() => decryptCredential('iv:tag')).toThrow(/Invalid encrypted credential format/);
    expect(() => decryptCredential('::')).toThrow(/Invalid encrypted credential components/);
  });

  it('throws error when no encryption key is available', () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encryptCredential('secret')).toThrow(/Encryption key not provided/);
  });
});
