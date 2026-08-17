import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import { lireNotificationRdv } from './api/lire-notification-rdv'
import { rapprocherBeneficiairesDuRdv } from './beneficiaire/rapprocher-beneficiaires-du-rdv.adapter'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from './prisma/webhook-rdv.prisma'
import { recevoirWebhookRdv } from './recevoir-webhook-rdv'

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
 * Composition de l'ability avec ses adaptateurs réels, appelée par la route de
 * notification. Elle ne fait rien de plus que journaliser ce que l'ability a
 * décidé : la lecture, la décision et l'écriture vivent dans la feature.
 */
export const traiterNotificationRdv = async ({
  evenement,
  donnees,
}: {
  evenement: EvenementWebhook
  donnees: unknown
}) => {
  const resultat = await recevoir({ evenement, payload: donnees })

  journaliser(
    resultat._tag === 'traite'
      ? `rendez-vous ${resultat.action}`
      : `notification ignorée : ${resultat.raison}`,
  )
}
