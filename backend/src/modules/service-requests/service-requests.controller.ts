import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceRequestsService, CreateServiceRequestDto } from './service-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Service Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service-requests')

export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service request' })
  async create(
    @Body() dto: CreateServiceRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.create(dto, user.institutionId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List service requests' })
  async list(
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.list(
      user.institutionId,
      status,
      Number(page) || 1,
      Number(limit) || 20,
      user.sub,
      user.role,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request detail' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.getById(id, user.institutionId, user.sub, user.role);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft service request' })
  async submit(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.submit(id, user.institutionId);
  }

  @Get(':id/matched-workers')
  @ApiOperation({ summary: 'Get workers who qualify for this request' })
  async getMatchedWorkers(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.getMatchedWorkers(id, user.institutionId);
  }

  @Post(':id/assign')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign workers to this service request' })
  async assignWorkers(
    @Param('id') id: string,
    @Body() body: { workerIds: string[] },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.assignWorkers(
      id,
      user.institutionId,
      body.workerIds,
      user.sub,
    );
  }

  @Post(':id/complete')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a service request as completed' })
  async complete(
    @Param('id') id: string,
    @Body() body: { completionNotes?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.complete(id, user.institutionId, body.completionNotes);
  }

  @Post('mobilise')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emergency mobilisation — instantly find available verified workers and create urgent request',
  })
  async mobilise(
    @Body() body: {
      skill: string
      description: string
      locationAddress?: string
      minimumTrustScore?: number
      workersNeeded?: number
      urgency?: 'NORMAL' | 'HIGH' | 'CRITICAL'
    },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceRequestsService.mobilise(body, user.institutionId, user.sub);
  }
}
