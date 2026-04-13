import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentTenant } from '../auth/decorators/current-tenant';
import { Public } from '../auth/decorators/public';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscribe')
  async subscribe(
    @CurrentTenant() tenantId: string,
    @Body() body: { priceId: string; baseUrl: string },
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.billingService.createCheckoutSession(
      tenantId,
      body.priceId,
      body.baseUrl,
    );
  }

  @Get('subscription')
  async getSubscription(@CurrentTenant() tenantId: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.billingService.getSubscription(tenantId);
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody ?? req.body;
    return this.billingService.handleWebhook(payload, signature);
  }

  @Get('invoices')
  async getInvoices(@CurrentTenant() tenantId: string) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    return this.billingService.getInvoices(tenantId);
  }

  @Post('portal')
  async getPortal(
    @CurrentTenant() tenantId: string,
    @Body() body: { returnUrl: string },
  ) {
    if (!tenantId) throw new ForbiddenException('No tenant context');
    const url = await this.billingService.getPortalUrl(tenantId, body.returnUrl);
    return { url };
  }
}
