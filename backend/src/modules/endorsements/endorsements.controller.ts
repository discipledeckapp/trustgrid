import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EndorsementsService, CreateEndorsementDto } from './endorsements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Endorsements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workers/:workerId/endorsements')

export class EndorsementsController {
  constructor(private readonly endorsementsService: EndorsementsService) {}

  @Post()
  @ApiOperation({ summary: 'Add an endorsement for a worker' })
  async addEndorsement(
    @Param('workerId') workerId: string,
    @Body() dto: CreateEndorsementDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.endorsementsService.addEndorsement(
      workerId,
      user.institutionId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all endorsements for a worker' })
  async listEndorsements(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.endorsementsService.listEndorsements(workerId, user.institutionId);
  }

  @Delete(':endorsementId')
  @ApiOperation({ summary: 'Revoke an endorsement' })
  async revokeEndorsement(
    @Param('workerId') _workerId: string,
    @Param('endorsementId') endorsementId: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.endorsementsService.revokeEndorsement(
      endorsementId,
      user.institutionId,
      user.sub,
      body.reason,
    );
  }
}
