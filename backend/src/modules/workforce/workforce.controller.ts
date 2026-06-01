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

@ApiTags('Workforce Registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workers')

export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Post()
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

  @Get(':id')
  @ApiOperation({ summary: 'Get full worker trust profile' })
  async getWorker(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.getWorkerById(id, user.institutionId);
  }

  @Patch(':id/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update worker availability status' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.workforceService.updateAvailability(id, user.institutionId, body.isAvailable);
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
