import { OnboardingService } from './onboarding.service'

describe('OnboardingService', () => {
  it('stores encrypted identity data during public onboarding', async () => {
    const prisma = {
      onboardingApplication: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'app-1',
          status: 'DRAFT',
          formData: { step1: { phone: '08000000000' } },
        }),
        update: jest.fn().mockResolvedValue({ id: 'app-1' }),
      },
    }
    const encryption = {
      encrypt: jest.fn().mockReturnValue('encrypted-id'),
      hashIdNumber: jest.fn().mockReturnValue('hashed-id'),
    }
    const service = new OnboardingService(prisma as any, {} as any, encryption as any, {} as any)

    await service.saveWorkerVerification(
      { applicationId: 'app-1', idType: 'NIN', idNumber: '12345678901' },
      'institution-1',
    )

    const update = prisma.onboardingApplication.update.mock.calls[0][0]
    expect(update.data.formData.step3).toEqual({
      idType: 'NIN',
      idNumberEncrypted: 'encrypted-id',
      idNumberHash: 'hashed-id',
      status: 'PENDING',
    })
    expect(JSON.stringify(update)).not.toContain('12345678901')
  })
})
