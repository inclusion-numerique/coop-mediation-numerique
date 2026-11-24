import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import { journaliserWebhook } from '../../../implementations/webhook/journal-du-webhook.mutation'
import { recevoirWebhookUsager } from '../domain/recevoir-webhook-usager'
import { lireNotificationUsager } from './api/notification-usager.params'
import {
  anonymiserEtSupprimerUsager,
  beneficiairesLiesAUsager,
  mettreAJourUsager,
} from './prisma/webhook-usager.mutation'

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
