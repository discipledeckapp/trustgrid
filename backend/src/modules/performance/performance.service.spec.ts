import { PerformanceService } from './performance.service'

describe('PerformanceService', () => {
  it('records a completed assignment review without incrementing deployment counts again', async () => {
    const prisma = {
      serviceRequest: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'request-1',
          requesterId: 'resident-1',
          status: 'COMPLETED',
          assignment: { assignmentWorkers: [{ workerId: 'worker-1' }] },
        }),
      },
      workerProfile: {
        findFirst: jest.fn().mockResolvedValue({ id: 'worker-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      vendorProfile: { findFirst: jest.fn() },
      performanceReview: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'review-1' }),
        findMany: jest.fn().mockResolvedValue([{ overallRating: 5 }]),
      },
    }
    const trustScore = { emitEvent: jest.fn().mockResolvedValue(undefined) }
    const service = new PerformanceService(prisma as any, trustScore as any)

    await service.submitReview(
      { serviceRequestId: 'request-1', workerId: 'worker-1', overallRating: 5 },
      'institution-1',
      'admin-1',
      'INSTITUTION_ADMIN',
    )

    expect(prisma.workerProfile.update).toHaveBeenCalledTimes(1)
    expect(prisma.workerProfile.update).toHaveBeenCalledWith({
      where: { id: 'worker-1' },
      data: { averageRating: 5 },
    })
    expect(trustScore.emitEvent).toHaveBeenCalledTimes(1)
    expect(trustScore.emitEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RATING_SUBMITTED' }),
    )
  })
})
