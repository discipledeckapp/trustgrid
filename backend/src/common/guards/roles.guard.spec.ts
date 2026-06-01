import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
  const context = (role?: string) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  }) as unknown as ExecutionContext

  it('allows routes without role metadata', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) }
    const guard = new RolesGuard(reflector as unknown as Reflector)

    expect(guard.canActivate(context())).toBe(true)
  })

  it('allows a user with an accepted role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['INSTITUTION_ADMIN']) }
    const guard = new RolesGuard(reflector as unknown as Reflector)

    expect(guard.canActivate(context('INSTITUTION_ADMIN'))).toBe(true)
  })

  it('rejects a user without an accepted role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['INSTITUTION_ADMIN']) }
    const guard = new RolesGuard(reflector as unknown as Reflector)

    expect(guard.canActivate(context('WORKER'))).toBe(false)
  })
})
