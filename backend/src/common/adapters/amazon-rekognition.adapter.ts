/**
 * Amazon Rekognition Adapter — Liveness Detection Only
 *
 * Used to confirm the person presenting the selfie is a real, live human
 * (anti-spoofing). Not used for face comparison — Prembly handles that
 * internally via NIN/BVN with face endpoints.
 *
 * Flow:
 *  1. Backend calls createLivenessSession() → returns sessionId
 *  2. Frontend runs AWS Amplify FaceLivenessDetector with that sessionId
 *  3. Backend calls getLivenessResult(sessionId) → confidence + referenceImage
 *  4. referenceImage (high-quality, liveness-confirmed) is forwarded to Prembly NIN+face
 *
 * If AWS credentials are not configured:
 *  → isConfigured() returns false
 *  → IdentityService skips liveness, sets verificationLevel to IDENTITY_CONFIRMED
 *    (not BIOMETRIC_CONFIRMED) and carries on without blocking
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand,
} from '@aws-sdk/client-rekognition'

export interface LivenessSessionResult {
  sessionId: string
}

export interface LivenessCheckResult {
  isLive: boolean
  confidence: number          // 0–100 (Rekognition scale)
  referenceImageBase64?: string  // base64 JPEG — forward to Prembly for face match
  status: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'ERROR'
  error?: string
}

// Confidence threshold below which we do not accept as live
const LIVENESS_THRESHOLD = 75

@Injectable()
export class AmazonRekognitionAdapter {
  private readonly logger = new Logger(AmazonRekognitionAdapter.name)
  private client: RekognitionClient | null = null

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!(
      this.config.get('AWS_ACCESS_KEY_ID') &&
      this.config.get('AWS_SECRET_ACCESS_KEY')
    )
  }

  private getClient(): RekognitionClient | null {
    if (!this.isConfigured()) {
      this.logger.warn('AWS credentials not configured — liveness check unavailable')
      return null
    }
    if (this.client) return this.client
    this.client = new RekognitionClient({
      region: this.config.get<string>('AWS_REGION') ?? 'eu-west-1',
      credentials: {
        accessKeyId:     this.config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    })
    return this.client
  }

  /**
   * Step 1 of liveness flow.
   * Returns a sessionId the frontend passes to FaceLivenessDetector.
   */
  async createLivenessSession(): Promise<LivenessSessionResult | null> {
    const client = this.getClient()
    if (!client) return null

    try {
      // No settings required — defaults to FaceMovementAndLightChallenge which is most accurate
      const response = await client.send(new CreateFaceLivenessSessionCommand({}))

      this.logger.log({ sessionId: response.SessionId }, 'liveness_session_created')
      return { sessionId: response.SessionId! }
    } catch (err: any) {
      this.logger.warn({ err: err.name }, 'liveness_session_create_failed')
      return null
    }
  }

  /**
   * Step 3 of liveness flow — call after frontend completes the check.
   * Returns the confidence score and a reference image for face comparison.
   */
  async getLivenessResult(sessionId: string): Promise<LivenessCheckResult> {
    const client = this.getClient()
    if (!client) {
      return { isLive: false, confidence: 0, status: 'ERROR', error: 'AWS_NOT_CONFIGURED' }
    }

    try {
      const response = await client.send(
        new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId }),
      )

      const status   = response.Status as LivenessCheckResult['status']
      const confidence = response.Confidence ?? 0
      const isLive   = status === 'SUCCEEDED' && confidence >= LIVENESS_THRESHOLD

      // Extract the reference image (Buffer → base64)
      let referenceImageBase64: string | undefined
      if (response.ReferenceImage?.S3Object) {
        // S3-backed — consumer needs to download; we flag it
        referenceImageBase64 = undefined
      } else if (response.ReferenceImage?.Bytes) {
        referenceImageBase64 = Buffer.from(response.ReferenceImage.Bytes).toString('base64')
      }

      this.logger.log({
        sessionId,
        status,
        confidence: confidence.toFixed(1),
        isLive,
        hasReferenceImage: !!referenceImageBase64,
      }, 'liveness_result')

      return { isLive, confidence, referenceImageBase64, status }
    } catch (err: any) {
      const code = err.name ?? 'UNKNOWN_ERROR'
      this.logger.warn({ sessionId, code }, 'liveness_result_fetch_failed')

      return { isLive: false, confidence: 0, status: 'ERROR', error: code }
    }
  }
}
