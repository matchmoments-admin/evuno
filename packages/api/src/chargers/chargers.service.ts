import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { chargers } from '@evuno/db';
import { CitrineOSClient } from '@evuno/ocpp';
import { DatabaseService } from '../database/database.service';
import { CreateChargerDto, UpdateChargerDto } from './chargers.dto';

@Injectable()
export class ChargersService {
  private ocpp: CitrineOSClient;

  constructor(private readonly database: DatabaseService) {
    this.ocpp = new CitrineOSClient(
      process.env.CITRINEOS_API_URL ?? 'http://localhost:8081',
    );
  }

  async findAll(tenantId: string) {
    return this.database.withTenant(tenantId, async (tx) => {
      return tx.select().from(chargers);
    });
  }

  /**
   * Returns chargers with live OCPP status from CitrineOS.
   */
  async findAllWithStatus(tenantId: string) {
    const chargerList = await this.findAll(tenantId);

    const withStatus = await Promise.all(
      chargerList.map(async (charger) => {
        const status = await this.ocpp.getChargerStatus(charger.ocppId);
        return {
          ...charger,
          liveStatus: status.status,
          liveErrorCode: status.errorCode,
          liveTimestamp: status.timestamp,
        };
      }),
    );

    return withStatus;
  }

  async findOne(tenantId: string, id: string) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .select()
        .from(chargers)
        .where(eq(chargers.id, id));
      if (results.length === 0) throw new NotFoundException('Charger not found');
      return results[0];
    });
  }

  async getChargerStatus(tenantId: string, id: string) {
    const charger = await this.findOne(tenantId, id);
    return this.ocpp.getChargerStatus(charger.ocppId);
  }

  async executeAction(
    tenantId: string,
    id: string,
    action: string,
    params?: Record<string, unknown>,
  ) {
    const charger = await this.findOne(tenantId, id);

    switch (action) {
      case 'remoteStart':
        return this.ocpp.remoteStartTransaction(
          charger.ocppId,
          (params?.connectorId as number) ?? 1,
          (params?.idTag as string) ?? 'evuno-operator',
        );
      case 'remoteStop':
        return this.ocpp.remoteStopTransaction(
          charger.ocppId,
          (params?.transactionId as number) ?? 0,
        );
      case 'reset':
        return this.ocpp.resetCharger(
          charger.ocppId,
          (params?.type as 'Soft' | 'Hard') ?? 'Soft',
        );
      case 'unlock':
        return this.ocpp.unlockConnector(
          charger.ocppId,
          (params?.connectorId as number) ?? 1,
        );
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
  }

  async create(tenantId: string, dto: CreateChargerDto) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .insert(chargers)
        .values({
          tenantId,
          ocppId: dto.ocppId,
          name: dto.name,
          locationLat: dto.locationLat,
          locationLng: dto.locationLng,
          locationAddress: dto.locationAddress,
          locationCity: dto.locationCity,
          locationCountry: dto.locationCountry,
          level: dto.level,
          powerKw: dto.powerKw,
          connectorType: dto.connectorType,
          isPublic: dto.isPublic,
          pricePerKwh: dto.pricePerKwh,
          priceCurrency: dto.priceCurrency,
        })
        .returning();
      return results[0];
    });
  }

  async update(tenantId: string, id: string, dto: UpdateChargerDto) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .update(chargers)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(chargers.id, id))
        .returning();
      if (results.length === 0) throw new NotFoundException('Charger not found');
      return results[0];
    });
  }

  async remove(tenantId: string, id: string) {
    return this.database.withTenant(tenantId, async (tx) => {
      const results = await tx
        .delete(chargers)
        .where(eq(chargers.id, id))
        .returning();
      if (results.length === 0) throw new NotFoundException('Charger not found');
      return results[0];
    });
  }
}
