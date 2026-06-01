import {
  Controller, Get, Post, Body, Param,
  UseGuards, Version, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AssignmentsService } from './assignments.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')

export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Get my assignments (worker view)' })
  async getMyAssignments(@CurrentUser() user: CurrentUserPayload) {
    return this.assignmentsService.getMyAssignments(user.sub, user.institutionId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment detail' })
  async getDetail(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.assignmentsService.getAssignmentDetail(id, user.institutionId)
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an assignment (worker action)' })
  async accept(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.assignmentsService.acceptAssignment(id, user.sub, user.institutionId)
  }

  @Post(':id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline an assignment (worker action)' })
  async decline(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.declineAssignment(id, user.sub, user.institutionId, body.reason)
  }

  @Post(':id/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in to an active assignment' })
  async checkIn(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.assignmentsService.checkIn(id, user.sub, user.institutionId)
  }

  @Post(':id/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out of an assignment (marks completed)' })
  async checkOut(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.assignmentsService.checkOut(id, user.sub, user.institutionId)
  }
}
