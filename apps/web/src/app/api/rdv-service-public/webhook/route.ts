import { handleRdvModelWebhook } from '@app/web/features/rdvsp/webhook/handleRdvModelWebhook'
import { handleUserModelWebhook } from '@app/web/features/rdvsp/webhook/handleUserModelWebhook'
import {
  RdvspWebhookModel,
  RdvspWebhookPayload,
  RdvspWebhookRdvData,
  RdvspWebhookUserData,
} from '@app/web/features/rdvsp/webhook/rdvWebhook'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

const logDebug = ServerWebAppConfig.RdvServicePublic.log.webhook.debug

const outputLog = (label: string, payload: unknown) => {
  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`[rdvsp webhook] ${label}: ${JSON.stringify(payload)}`)
}

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as RdvspWebhookPayload

    // Validate the structure
    if (!body.data || !body.meta) {
      if (logDebug) outputLog('Invalid webhook payload structure', body)
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 },
      )
    }

    // Route to appropriate handler based on model type
    // Using type assertions because TypeScript cannot narrow discriminated unions with nested discriminants
    switch (body.meta.model) {
      case RdvspWebhookModel.Rdv:
        if (logDebug) outputLog('Processing RDV webhook', body.meta)
        await handleRdvModelWebhook({
          data: body.data as RdvspWebhookRdvData,
          event: body.meta.event,
        })
        break

      case RdvspWebhookModel.User:
        if (logDebug) outputLog('Processing User webhook', body.meta)
        await handleUserModelWebhook({
          data: body.data as RdvspWebhookUserData,
          event: body.meta.event,
        })
        break

      default: {
        // We no-op on models we don't need to sync
        if (logDebug) outputLog('No-op on model', body.meta)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error('[rdvsp webhook] Error processing webhook:', error)
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    )
  }
}
