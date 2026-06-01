import { WorkforceService } from './workforce.service'

describe('WorkforceService', () => {
  it('only returns fully verified workers for assignment matching', async () => {
    const prisma = {
      workerProfile: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    }
    const service = new WorkforceService(prisma as any, {} as any)

    await service.findMatchingWorkers('institution-1', ['Electrician'], 60, 'cat_electrical')

    expect(prisma.workerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          institutionId: 'institution-1',
          isActive: true,
          isAvailable: true,
          verificationStatus: 'FULLY_VERIFIED',
          trustScore: { gte: 60 },
        }),
      }),
    )
  })
})
