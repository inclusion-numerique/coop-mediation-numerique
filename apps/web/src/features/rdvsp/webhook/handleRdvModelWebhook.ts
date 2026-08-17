import { lireNotificationRdv } from '../abilities/recevoir-webhook-rdv/implementation/api/lire-notification-rdv'
import { rapprocherBeneficiairesDuRdv } from '../abilities/recevoir-webhook-rdv/implementation/beneficiaire/rapprocher-beneficiaires-du-rdv.adapter'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from '../abilities/recevoir-webhook-rdv/implementation/prisma/webhook-rdv.prisma'
import { recevoirWebhookRdv } from '../abilities/recevoir-webhook-rdv/implementation/recevoir-webhook-rdv'
import { EvenementWebhook } from '../domain/evenement-webhook'
import type { RdvspWebhookEvent } from './rdvWebhook'

const journaliser = (message: string) => {
  // biome-ignore lint/suspicious/noConsole: journal de webhook, conservé le temps de la mise en production
  console.log(`[rdvsp webhook] ${message}`)
}

const recevoir = recevoirWebhookRdv({
  lireNotification: lireNotificationRdv,
  comptePourWebhook,
  rdvConnuParId,
  enregistrer: enregistrerRdvDeLaNotification,
  supprimer: supprimerRdvDeLaNotification,
  rapprocherBeneficiaires: rapprocherBeneficiairesDuRdv(journaliser),
})

/**
 * Adaptateur de transition entre la route et l'ability. Il ne fait plus que
 * journaliser : la décision, la lecture et l'écriture vivent dans la feature.
 */
export const handleRdvModelWebhook = async ({
  data,
  event,
}: {
  data: unknown
  event: RdvspWebhookEvent
}) => {
  const resultat = await recevoir({
    evenement: EvenementWebhook(event),
    payload: data,
  })

  journaliser(
    resultat._tag === 'traite'
      ? `rendez-vous ${resultat.action}`
      : `notification ignorée : ${resultat.raison}`,
  )
}
