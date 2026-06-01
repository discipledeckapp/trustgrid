-- Remove identity numbers captured by the legacy public onboarding flow.
-- Existing applicants must resubmit verification so values are encrypted and hashed.
UPDATE "onboarding_applications"
SET "formData" = jsonb_set(
  "formData",
  '{step3}',
  COALESCE("formData"->'step3', '{}'::jsonb) - 'idNumber',
  true
)
WHERE "formData"->'step3' ? 'idNumber';
