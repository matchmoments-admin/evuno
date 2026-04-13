import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentTenant } from '../auth/decorators/current-tenant';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('chargerId') chargerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.sessionsService.findAll(tenantId, {
      chargerId,
      startDate,
      endDate,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('stats')
  getStats(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string,
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.sessionsService.getStats(
      tenantId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Post(':id/end')
  endSession(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { costAmount: string; costCurrency: string; customerCountry: string },
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.sessionsService.endSession(
      tenantId,
      id,
      body.costAmount,
      body.costCurrency,
      body.customerCountry,
    );
  }

  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.sessionsService.findOne(tenantId, id);
  }
}
