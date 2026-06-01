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
import { IncidentsService, CreateIncidentDto, ResolveIncidentDto } from './incidents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incidents')

export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Report an incident against a worker or vendor' })
  async create(
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.incidentsService.create(dto, user.institutionId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List incidents' })
  async list(
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.incidentsService.list(user.institutionId, status, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident detail' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.incidentsService.getById(id, user.institutionId);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve an incident' })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveIncidentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.incidentsService.resolve(id, user.institutionId, dto, user.sub);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to an incident' })
  async addNote(
    @Param('id') id: string,
    @Body() body: { content: string; isInternal?: boolean },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.incidentsService.addNote(
      id,
      user.institutionId,
      body.content,
      user.sub,
      body.isInternal ?? false,
    );
  }
}
