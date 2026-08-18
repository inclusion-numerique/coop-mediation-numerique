import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import { journaliserWebhook } from '../../../implementation/webhook/journal'
import { lireNotificationUsager } from './api/lire-notification-usager'
import {
  anonymiserEtSupprimerUsager,
  beneficiairesLiesAUsager,
  mettreAJourUsager,
} from './prisma/webhook-usager.prisma'
import { recevoirWebhookUsager } from './recevoir-webhook-usager'

const recevoir = recevoirWebhookUsager({
  lireNotification: lireNotificationUsager,
  beneficiairesLies: beneficiairesLiesAUsager,
  mettreAJour: mettreAJourUsager,
  anonymiserEtSupprimer: anonymiserEtSupprimerUsager,
})

/**
 * Composition de l'ability avec ses adaptateurs réels, réduite à journaliser ce
 * qu'elle a décidé.
 */
export const traiterNotificationUsager = async ({
  evenement,
  donnees,
}: {
  evenement: EvenementWebhook
  donnees: unknown
}) => {
  const resultat = await recevoir({ evenement, payload: donnees })

  journaliserWebhook(
    resultat._tag === 'traite'
      ? `usager ${resultat.action}`
      : `notification usager ignorée : ${resultat.raison}`,
  )
}
