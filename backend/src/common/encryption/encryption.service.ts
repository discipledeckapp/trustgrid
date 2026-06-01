/**
 * EncryptionService — AES-256-GCM Field-Level Encryption
 *
 * Used to protect PII fields in IdentityVerification records.
 *
 * Design principles:
 * - AES-256-GCM (authenticated encryption — both confidentiality and integrity)
 * - Random 96-bit IV per encryption (never reuse IVs)
 * - Stored format: base64(iv:ciphertext:authTag) — fully self-contained
 * - Key sourced from ENCRYPTION_KEY env var (32-byte hex string)
 * - Graceful degradation: if key not configured, data is stored as plaintext
 *   with a warning — never silently fail in a way that blocks the product
 *
 * Data stored encrypted (per NDPR data minimisation):
 *   - Legal name (first + last from NIMC)
 *   - Date of birth
 *   - Gender
 *   - NIMC profile photo (base64) — for display on Trust Passport
 *
 * Data NEVER stored:
 *   - NIN plaintext (only SHA-256 hash)
 *   - Religion, education, marital status (irrelevant to workforce context)
 *   - Next of kin details
 *   - Residential address
 *   - Biometric signature
 *   - Parent names
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH  = 12   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16   // 128-bit auth tag

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name)
  private key:        Buffer | null = null
  private hmacSecret: Buffer | null = null   // separate secret for ID number hashing

  constructor(private readonly config: ConfigService) {
    const keyHex = this.config.get<string>('ENCRYPTION_KEY')
    if (keyHex && keyHex.length >= 64) {
      this.key = Buffer.from(keyHex.slice(0, 64), 'hex')
      this.logger.log('Field encryption enabled (AES-256-GCM)')
    } else {
      this.logger.warn(
        'ENCRYPTION_KEY not configured or too short — PII fields stored without encryption. ' +
        'Set a 32-byte (64 hex char) key in production.',
      )
    }

    // ID_HASH_SECRET: separate from ENCRYPTION_KEY so key rotation is independent
    // Falls back to ENCRYPTION_KEY if not separately configured
    const hashSecret = this.config.get<string>('ID_HASH_SECRET') ?? keyHex
    if (hashSecret && hashSecret.length >= 32) {
      this.hmacSecret = Buffer.from(hashSecret.slice(0, 64), 'hex')
      this.logger.log('HMAC-SHA256 ID hashing enabled (rainbow-table resistant)')
    } else {
      this.logger.warn(
        'ID_HASH_SECRET not configured — falling back to plain SHA-256 for ID hashing. ' +
        'This is vulnerable to rainbow table attacks in production. Set ID_HASH_SECRET.',
      )
    }
  }

  isEnabled(): boolean {
    return this.key !== null
  }

  /**
   * Encrypt a string value.
   * Returns: base64-encoded "iv:ciphertext:authTag"
   * If encryption key is not configured, returns the plaintext with a warning prefix.
   */
  encrypt(plaintext: string): string {
    if (!this.key) {
      return `UNENCRYPTED:${plaintext}`
    }

    const iv         = randomBytes(IV_LENGTH)
    const cipher     = createCipheriv(ALGORITHM, this.key, iv)
    const encrypted  = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag    = cipher.getAuthTag()

    // Format: base64(iv) + ':' + base64(ciphertext) + ':' + base64(authTag)
    return [
      iv.toString('base64'),
      encrypted.toString('base64'),
      authTag.toString('base64'),
    ].join(':')
  }

  /**
   * Decrypt a previously encrypted value.
   * Returns null if decryption fails (tampered data, wrong key, etc.)
   */
  decrypt(ciphertext: string): string | null {
    if (!ciphertext) return null

    // Handle unencrypted fallback
    if (ciphertext.startsWith('UNENCRYPTED:')) {
      return ciphertext.slice(12)
    }

    if (!this.key) {
      this.logger.warn('Cannot decrypt: ENCRYPTION_KEY not configured')
      return null
    }

    try {
      const parts = ciphertext.split(':')
      if (parts.length !== 3) throw new Error('Invalid ciphertext format')

      const iv         = Buffer.from(parts[0], 'base64')
      const encrypted  = Buffer.from(parts[1], 'base64')
      const authTag    = Buffer.from(parts[2], 'base64')

      const decipher = createDecipheriv(ALGORITHM, this.key, iv)
      decipher.setAuthTag(authTag)

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
      return decrypted.toString('utf8')
    } catch (err: any) {
      this.logger.warn({ err: err.message }, 'decryption_failed — data may be tampered or key rotated')
      return null
    }
  }

  /**
   * Encrypt a JSON-serialisable object.
   */
  encryptObject(obj: Record<string, unknown>): string {
    return this.encrypt(JSON.stringify(obj))
  }

  /**
   * Decrypt a JSON object.
   */
  decryptObject<T>(ciphertext: string): T | null {
    const plaintext = this.decrypt(ciphertext)
    if (!plaintext) return null
    try {
      return JSON.parse(plaintext) as T
    } catch {
      return null
    }
  }

  /**
   * Hash an identity number (NIN, BVN, RC number) for deduplication.
   *
   * Uses HMAC-SHA256 with a server-side secret (ID_HASH_SECRET).
   *
   * Why HMAC instead of plain SHA-256?
   * ─────────────────────────────────
   * NIN is exactly 11 digits → only ~100 billion possible values.
   * An attacker with the database COULD precompute SHA-256(0000000000) through
   * SHA-256(99999999999) and recover every NIN in seconds (rainbow table attack).
   *
   * HMAC-SHA256 with a secret key makes this impossible:
   *   hash = HMAC-SHA256(secret_key, "12345678901")
   * Without the secret key, the attacker cannot compute the hashes.
   * Even with the database, NINs remain protected.
   *
   * The hash is still deterministic: same NIN + same key = same hash every time.
   * Deduplication still works perfectly.
   *
   * Falls back to plain SHA-256 if ID_HASH_SECRET is not configured
   * (logs a warning — deduplication still works, just less secure).
   */
  hashIdNumber(idNumber: string): string {
    if (this.hmacSecret) {
      return createHmac('sha256', this.hmacSecret)
        .update(idNumber.trim())
        .digest('hex')
    }

    // Fallback — plain SHA-256 (still deduplicates, but rainbow-table vulnerable)
    const { createHash } = require('crypto')
    return createHash('sha256').update(idNumber.trim()).digest('hex')
  }

  isEnabled(): boolean {
    return this.key !== null
  }
}
