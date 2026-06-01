import {
  Controller, Get, Post, Body, Param, Headers,
  RawBodyRequest, Req, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { BillingService, PLANS, VERIFICATION_FEES, EVENT_FEES } from './billing.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator'
import type { Request } from 'express'

@ApiTags('Billing & Payments')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'Get all pricing plans (subscriptions, verification, events)' })
  getPlans() {
    return this.billingService.getPricingPlans()
  }

  @Get('status')
  @ApiOperation({ summary: 'Check if Paystack is configured' })
  getStatus() {
    return { configured: this.billingService.isConfigured() }
  }

  // ── Paystack webhook (no auth — Paystack signs with HMAC) ─────────────────

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook endpoint — receives payment events' })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.billingService.handleWebhook(body, signature)
    return { received: true }
  }

  // ── Callback redirect after payment ──────────────────────────────────────

  @Get('callback')
  @ApiOperation({ summary: 'Paystack payment callback URL — verifies and redirects' })
  async handleCallback(@Query('reference') reference: string) {
    if (!reference) return { status: 'error', message: 'No reference provided' }

    const result = await this.billingService.verifyPayment(reference)
    return result
  }

  // ── Protected — institution payments ──────────────────────────────────────

  @Post('subscribe/:plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate institution subscription payment via Paystack' })
  async subscribe(
    @Param('plan') plan: string,
    @Body() body: { email: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.billingService.initiateSubscription(
      user.institutionId,
      plan as keyof typeof PLANS,
      body.email,
    )
  }

  @Post('verify-worker')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay for worker identity verification' })
  async payVerification(
    @Body() body: { workerId: string; tier: string; email: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.billingService.initiateVerificationPayment(
      body.workerId,
      user.institutionId,
      body.tier as keyof typeof VERIFICATION_FEES,
      body.email,
    )
  }

  @Post('event-module')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay for convention/event staffing module' })
  async payEvent(
    @Body() body: { size: string; eventName: string; email: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.billingService.initiateEventPayment(
      user.institutionId,
      body.size as keyof typeof EVENT_FEES,
      body.eventName,
      body.email,
    )
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a payment by reference' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.billingService.verifyPayment(reference)
  }
}
