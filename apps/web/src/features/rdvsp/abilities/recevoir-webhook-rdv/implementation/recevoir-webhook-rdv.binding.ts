import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import { journaliserWebhook } from '../../../implementation/webhook/journal'
import { lireNotificationRdv } from './api/lire-notification-rdv'
import { rapprocherBeneficiairesDuRdv } from './beneficiaire/rapprocher-beneficiaires-du-rdv.adapter'
import {
  comptePourWebhook,
  enregistrerRdvDeLaNotification,
  organisationConnue,
  rdvConnuParId,
  supprimerRdvDeLaNotification,
} from './prisma/webhook-rdv.prisma'
import { recevoirWebhookRdv } from './recevoir-webhook-rdv'

const recevoir = recevoirWebhookRdv({
  lireNotification: lireNotificationRdv,
  comptePourWebhook,
  rdvConnuParId,
  organisationConnue,
  enregistrer: enregistrerRdvDeLaNotification,
  supprimer: supprimerRdvDeLaNotification,
  rapprocherBeneficiaires: rapprocherBeneficiairesDuRdv(journaliserWebhook),
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

  journaliserWebhook(
    resultat._tag === 'traite'
      ? `rendez-vous ${resultat.action}`
      : `notification ignorée : ${resultat.raison}`,
  )
}
