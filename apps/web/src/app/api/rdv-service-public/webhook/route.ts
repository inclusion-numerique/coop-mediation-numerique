import { traiterNotificationRdv } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/implementation/recevoir-webhook-rdv.binding'
import { traiterNotificationUsager } from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/implementation/recevoir-webhook-usager.binding'
import type { NotificationWebhook } from '@app/web/features/rdvsp/domain/notification-webhook'
import { lireNotificationWebhook } from '@app/web/features/rdvsp/implementation/webhook/lire-notification-webhook'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

const logDebug = ServerWebAppConfig.RdvServicePublic.log.webhook.debug

const tracer = (message: string) => {
  if (logDebug) {
    // biome-ignore lint/suspicious/noConsole: journal de webhook, conservé le temps de la mise en production
    console.log(`[rdvsp webhook] ${message}`)
  }
}

const traiter = async (notification: NotificationWebhook): Promise<void> => {
  if (notification._tag === 'ignoree') {
    tracer(`modèle non traité : ${notification.modele}`)
    return
  }

  tracer(`traitement d'une notification ${notification._tag}`)

  const { evenement, donnees } = notification

  await (notification._tag === 'rdv'
    ? traiterNotificationRdv({ evenement, donnees })
    : traiterNotificationUsager({ evenement, donnees }))
}

/**
 * Route de notification de RDV Service Public.
 *
 * Elle lit l'enveloppe et aiguille — c'est tout ce qu'une route fait ici. Le
 * contenu de `data` n'est pas validé à ce niveau : chaque ability valide la
 * forme qu'elle attend, et renonce proprement si elle a changé.
 */
export const POST = async (request: NextRequest) => {
  try {
    const notification = lireNotificationWebhook(await request.json())

    if (notification === null) {
      tracer('enveloppe de notification illisible')

      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 },
      )
    }

    await traiter(notification)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: journal de webhook, conservé le temps de la mise en production
    console.error('[rdvsp webhook] Error processing webhook:', error)
    Sentry.captureException?.(error)

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    )
  }
}
