import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Sse,
  ForbiddenException,
  MessageEvent,
} from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { CurrentTenant } from '../auth/decorators/current-tenant';
import { ChargersService } from './chargers.service';
import { CreateChargerDto, UpdateChargerDto } from './chargers.dto';

@Controller('chargers')
export class ChargersController {
  constructor(private readonly chargersService: ChargersService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.findAll(tenantId);
  }

  /**
   * SSE endpoint for real-time charger status updates.
   * Polls CitrineOS every 10 seconds and pushes status changes.
   */
  @Sse('stream')
  stream(@CurrentTenant() tenantId: string): Observable<MessageEvent> {
    if (!tenantId) throw new ForbiddenException('No tenant context');

    // Poll charger statuses every 10 seconds and emit via SSE
    return interval(10_000).pipe(
      map(async () => {
        try {
          const chargers = await this.chargersService.findAllWithStatus(tenantId);
          return {
            data: chargers,
          } as MessageEvent;
        } catch {
          return { data: [] } as MessageEvent;
        }
      }),
      // Unwrap the promise
      map((promise) => promise as unknown as MessageEvent),
    );
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.findOne(tenantId, id);
  }

  @Get(':id/status')
  getStatus(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.getChargerStatus(tenantId, id);
  }

  @Post(':id/action')
  executeAction(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { action: string; params?: Record<string, unknown> },
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.executeAction(tenantId, id, body.action, body.params);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChargerDto,
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateChargerDto,
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.chargersService.remove(tenantId, id);
  }
}
