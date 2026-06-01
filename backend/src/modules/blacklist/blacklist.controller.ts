import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { BlacklistService, BlacklistWorkerDto, UnblacklistDto } from './blacklist.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('Blacklist Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Get()
  @ApiOperation({ summary: 'List all blacklisted workers in the institution' })
  getBlacklist(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blacklistService.getBlacklist(
      user.institutionId,
      Number(page) || 1,
      Number(limit) || 20,
    )
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Blacklist a worker — suspends them, applies trust penalty, and notifies them via SMS/WhatsApp',
    description: 'Workers have a right to know they are blacklisted and the reason. Notification is sent by default.',
  })
  blacklistWorker(
    @Body() dto: BlacklistWorkerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blacklistService.blacklistWorker(dto, user.institutionId, user.sub)
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a worker from the blacklist — reinstates them and notifies them' })
  unblacklistWorker(
    @Body() dto: UnblacklistDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.blacklistService.unblacklistWorker(dto, user.institutionId, user.sub)
  }
}
