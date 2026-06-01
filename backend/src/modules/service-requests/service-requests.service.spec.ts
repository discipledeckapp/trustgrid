import { BadRequestException } from '@nestjs/common'
import { ServiceRequestsService } from './service-requests.service'

describe('ServiceRequestsService', () => {
  it('limits resident request lists to the resident who created them', async () => {
    const prisma = {
      serviceRequest: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    }
    const service = new ServiceRequestsService(prisma as any, {} as any)

    await service.list('institution-1', undefined, 1, 20, 'resident-1', 'RESIDENT')

    expect(prisma.serviceRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { institutionId: 'institution-1', requesterId: 'resident-1' },
      }),
    )
  })

  it('rejects assignment candidates that did not pass verified matching', async () => {
    const prisma = {
      workforceAssignment: { create: jest.fn() },
      serviceRequest: { update: jest.fn() },
    }
    const workforce = {
      findMatchingWorkers: jest.fn().mockResolvedValue([{ id: 'worker-allowed' }]),
    }
    const service = new ServiceRequestsService(prisma as any, workforce as any)
    jest.spyOn(service, 'getById').mockResolvedValue({
      id: 'request-1',
      institutionId: 'institution-1',
      title: 'Convention electricians',
      requiredSkills: ['Electrician'],
      minimumTrustScore: 60,
      categoryId: 'cat_electrical',
      workersNeeded: 2,
      status: 'SUBMITTED',
    } as any)

    await expect(
      service.assignWorkers('request-1', 'institution-1', ['worker-other-tenant'], 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.workforceAssignment.create).not.toHaveBeenCalled()
  })
})
