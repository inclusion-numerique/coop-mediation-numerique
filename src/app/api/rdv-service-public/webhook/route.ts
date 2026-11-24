import { type NextRequest, NextResponse } from 'next/server'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
import { traiterNotificationRdvAvec } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/implementations/recevoir-webhook-rdv.binding'
import { traiterNotificationUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/recevoir-webhook-usager.binding'
import { aiguillerNotificationWebhook } from '@/features/rdvsp/domain/webhook/aiguiller-notification-webhook'
import { journaliserWebhook } from '@/features/rdvsp/implementations/webhook/journal-du-webhook.mutation'
import { lireNotificationWebhook } from '@/features/rdvsp/implementations/webhook/notification-webhook.params'
import {
  ENTETE_SIGNATURE_WEBHOOK,
  signatureValide,
} from '@/features/rdvsp/implementations/webhook/signature-du-webhook.middleware'

const traiter = aiguillerNotificationWebhook({
  traiterRdv: traiterNotificationRdvAvec(
    creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
  ),
  traiterUsager: traiterNotificationUsager,
  journaliser: journaliserWebhook,
})

export const POST = async (request: NextRequest) => {
  try {
    const corpsBrut = await request.text()

    if (
      !signatureValide({
        corpsBrut,
        signature: request.headers.get(ENTETE_SIGNATURE_WEBHOOK),
        secret: environnementServeur.RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
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
    signaler(error)

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    )
  }
}
