import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DemoRequestsService } from './demo-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Demo Requests')
@Controller('demo-requests')
export class DemoRequestsController {
  constructor(private readonly service: DemoRequestsService) {}

  /** Public — called by trustgrid.ng marketing site */
  @Post()
  @ApiOperation({ summary: 'Submit a demo request from the marketing site' })
  async create(
    @Body() body: {
      institutionName: string;
      institutionType?: string;
      name: string;
      role?: string;
      phone: string;
      email?: string;
      message?: string;
    },
  ) {
    return this.service.create(body);
  }

  /** Platform admin only */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'List all demo requests (platform admin)' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update demo request status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.notes);
  }
}
