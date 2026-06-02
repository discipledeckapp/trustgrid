import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkforceService } from './workforce.service';
import { CreateWorkerDto, WorkerFilterDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Workforce Registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')

export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Post()
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR')
  @ApiOperation({ summary: 'Onboard a new worker to the institution registry' })
  async createWorker(
    @Body() dto: CreateWorkerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.createWorker(dto, user.institutionId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List workers in the institution registry with filters' })
  async listWorkers(
    @Query() filter: WorkerFilterDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.listWorkers(user.institutionId, filter);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get my worker profile(s)' })
  getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.workforceService.getMyProfile(user.sub);
  }

  @Post('me/profile')
  @ApiOperation({ summary: 'Create my global worker profile (self-service, any role)' })
  createMyProfile(
    @Body() dto: { primarySkill: string; skills?: string[]; bio?: string; yearsExperience?: number; categoryIds?: string[]; hourlyRate?: number; dailyRate?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.createMyProfile(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full worker trust profile' })
  async getWorker(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.getWorkerById(id, user.institutionId, user.sub, user.role);
  }

  @Patch(':id/availability')
  @Roles('INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'WORKER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update worker availability status' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.updateAvailability(
      id,
      user.institutionId,
      body.isAvailable,
      user.sub,
      user.role,
    );
  }

  @Get(':id/matched-requests')
  @ApiOperation({ summary: 'Find service requests this worker qualifies for' })
  async getMatchedRequests(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return { workerId: id, message: 'Post-MVP: matched requests for worker' };
  }
}
