import { traiterNotificationRdv } from '@app/web/features/rdvsp/abilities/recevoir-webhook-rdv/implementation/recevoir-webhook-rdv.binding'
import { traiterNotificationUsager } from '@app/web/features/rdvsp/abilities/recevoir-webhook-usager/implementation/recevoir-webhook-usager.binding'
import type { NotificationWebhook } from '@app/web/features/rdvsp/domain/notification-webhook'
import { journaliserWebhook } from '@app/web/features/rdvsp/implementation/webhook/journal'
import { lireNotificationWebhook } from '@app/web/features/rdvsp/implementation/webhook/lire-notification-webhook'
import {
  ENTETE_SIGNATURE_WEBHOOK,
  signatureValide,
} from '@app/web/features/rdvsp/implementation/webhook/verifier-signature'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

const traiter = async (notification: NotificationWebhook): Promise<void> => {
  if (notification._tag === 'ignoree') {
    journaliserWebhook(`modèle non traité : ${notification.modele}`)
    return
  }

  journaliserWebhook(`traitement d'une notification ${notification._tag}`)

  const { evenement, donnees } = notification

  await (notification._tag === 'rdv'
    ? traiterNotificationRdv({ evenement, donnees })
    : traiterNotificationUsager({ evenement, donnees }))
}

/**
 * Route de notification de RDV Service Public.
 *
 * Elle authentifie l'envoi, lit l'enveloppe et aiguille — c'est tout ce qu'une
 * route fait ici. Le contenu de `data` n'est pas validé à ce niveau : chaque
 * ability valide la forme qu'elle attend, et renonce proprement si elle a
 * changé.
 *
 * La signature est vérifiée avant toute chose : sans elle, l'URL serait un point
 * d'écriture ouvert sur les rendez-vous et les usagers.
 */
export const POST = async (request: NextRequest) => {
  try {
    // Le corps brut, et pas l'objet analysé : la signature porte sur les octets
    // reçus, qu'une re-sérialisation ne reproduirait pas à l'identique.
    const corpsBrut = await request.text()

    if (
      !signatureValide({
        corpsBrut,
        signature: request.headers.get(ENTETE_SIGNATURE_WEBHOOK),
        secret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
      })
    ) {
      journaliserWebhook('signature refusée')

      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const notification = lireNotificationWebhook(JSON.parse(corpsBrut))

    if (notification === null) {
      journaliserWebhook('enveloppe de notification illisible')

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
