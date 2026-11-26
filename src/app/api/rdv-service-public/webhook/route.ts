import { type NextRequest, NextResponse } from 'next/server'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { signaler } from '@/configuration/telemetry/serveur'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import type { UsagerExterneAFusionner } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/usager-externe'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import { MediateurId as MediateurDuBeneficiaire } from '@/features/beneficiaire/domain/mediateur-id'
import { messageDuWebhookRdv } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/domain/message-du-webhook-rdv'
import { recevoirWebhookRdv } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/domain/recevoir-webhook-rdv'
import { lireNotificationRdv } from '@/features/rdvsp/abilities/recevoir-webhook-rdv/implementations/api/notification-rdv.params'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  organisationConnue,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from '@/features/rdvsp/abilities/recevoir-webhook-rdv/implementations/prisma/webhook-rdv.mutation'
import { messageDuWebhookUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/domain/message-du-webhook-usager'
import { recevoirWebhookUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/domain/recevoir-webhook-usager'
import { lireNotificationUsager } from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/api/notification-usager.params'
import {
  anonymiserEtSupprimerUsager,
  beneficiairesLiesAUsager,
  mettreAJourUsager,
} from '@/features/rdvsp/abilities/recevoir-webhook-usager/implementations/prisma/webhook-usager.mutation'
import { aiguillerNotificationWebhook } from '@/features/rdvsp/domain/webhook/aiguiller-notification-webhook'
import { rapprocherLesBeneficiaires } from '@/features/rdvsp/implementations/prisma/rapprocher-les-beneficiaires.adapter'
import { lireLesUsagersARapprocher } from '@/features/rdvsp/implementations/prisma/usagers-a-rapprocher.query'
import { journaliserWebhook } from '@/features/rdvsp/implementations/webhook/journal-du-webhook.mutation'
import { lireNotificationWebhook } from '@/features/rdvsp/implementations/webhook/notification-webhook.params'
import {
  ENTETE_SIGNATURE_WEBHOOK,
  signatureValide,
} from '@/features/rdvsp/implementations/webhook/signature-du-webhook.middleware'

const creerOuFusionnerLesUsagers = async ({
  usagers,
  mediateurId,
}: {
  usagers: UsagerExterneAFusionner[]
  mediateurId: string
}) => {
  const fusion = await creerOuFusionnerDepuisUsagerExterne({
    lireLeBeneficiaireLie,
    trouverUnDoublon,
    communeDeLAdresse,
    mettreAJourLeBeneficiaire,
    creerLeBeneficiaire,
  })({
    usagers,
    mediateurId: MediateurDuBeneficiaire(mediateurId),
    maintenant: new Date(),
  })
  return fusion.success ? fusion.data : { merges: [], skipped: [] }
}

const recevoirLeRdv = recevoirWebhookRdv({
  lireNotification: lireNotificationRdv,
  comptePourWebhook,
  rdvConnuParId,
  organisationConnue,
  enregistrer: enregistrerRdvDeLaNotification,
  supprimer: supprimerRdvDeLaNotification,
  lireLesUsagersARapprocher,
  rapprocherLesBeneficiaires: rapprocherLesBeneficiaires(
    creerOuFusionnerLesUsagers,
  ),
})

const recevoirLUsager = recevoirWebhookUsager({
  lireNotification: lireNotificationUsager,
  beneficiairesLies: beneficiairesLiesAUsager,
  mettreAJour: mettreAJourUsager,
  anonymiserEtSupprimer: anonymiserEtSupprimerUsager,
})

const traiter = aiguillerNotificationWebhook({
  traiterRdv: async ({ evenement, donnees }) =>
    journaliserWebhook(
      messageDuWebhookRdv(await recevoirLeRdv({ evenement, payload: donnees })),
    ),
  traiterUsager: async ({ evenement, donnees }) =>
    journaliserWebhook(
      messageDuWebhookUsager(
        await recevoirLUsager({ evenement, payload: donnees }),
      ),
    ),
  journaliser: journaliserWebhook,
})

export const POST = async (request: NextRequest) => {
  try {
    const corpsBrut = await request.text()

    if (
      !signatureValide({
        corpsBrut,
        signature: request.headers.get(ENTETE_SIGNATURE_WEBHOOK),
        secret: environnementServeur().RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
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
