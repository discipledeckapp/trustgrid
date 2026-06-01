# AWS Rekognition — Face Liveness Setup

TrustGrid uses Amazon Rekognition Face Liveness to confirm a selfie is taken from a live person (not a photo of a photo). This is pathway 1 of 3 verification methods.

## IAM Policy

Create an IAM user with this policy (minimal permissions):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rekognition:CreateFaceLivenessSession",
        "rekognition:GetFaceLivenessSessionResults"
      ],
      "Resource": "*"
    }
  ]
}
```

## Environment Variables (add to Render)

```
AWS_ACCESS_KEY_ID=<IAM user access key>
AWS_SECRET_ACCESS_KEY=<IAM user secret key>
AWS_REGION=eu-west-1
```

Use `eu-west-1` (Ireland) — closest region to Nigeria with Rekognition Face Liveness support.

## How it works in TrustGrid

1. Frontend calls `POST /api/v1/identity/liveness/create-session`
2. Backend creates a Rekognition Face Liveness session → returns `sessionId`
3. Frontend (LivenessCheck component) captures webcam selfie
4. Frontend calls `POST /api/v1/identity/workers/:id/verify` with `livePhotoBase64` + `livenessSessionId`
5. Backend calls `GetFaceLivenessSessionResults` → gets reference image + confidence score
6. If `confidence > 80%` → liveness passed, reference image used as profile photo
7. If liveness fails or not configured → falls back to photo upload pathway (PARTIALLY_VERIFIED)

## Cost

- $0.01 per liveness check (AWS free tier: 10,000 checks/month free for 12 months)
- At 1,000 verifications/month → $0 during free tier, $10/month after
