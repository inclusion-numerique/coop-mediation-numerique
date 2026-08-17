import { lireNotificationUsager } from '../abilities/recevoir-webhook-usager/implementation/api/lire-notification-usager'
import {
  anonymiserEtSupprimerUsager,
  beneficiairesLiesAUsager,
  mettreAJourUsager,
} from '../abilities/recevoir-webhook-usager/implementation/prisma/webhook-usager.prisma'
import { recevoirWebhookUsager } from '../abilities/recevoir-webhook-usager/implementation/recevoir-webhook-usager'
import { EvenementWebhook } from '../domain/evenement-webhook'
import type { RdvspWebhookEvent } from './rdvWebhook'

const recevoir = recevoirWebhookUsager({
  lireNotification: lireNotificationUsager,
  beneficiairesLies: beneficiairesLiesAUsager,
  mettreAJour: mettreAJourUsager,
  anonymiserEtSupprimer: anonymiserEtSupprimerUsager,
})

/**
 * Adaptateur de transition entre la route et l'ability, réduit à journaliser.
 */
export const handleUserModelWebhook = async ({
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

  // biome-ignore lint/suspicious/noConsole: journal de webhook, conservé le temps de la mise en production
  console.log(
    `[rdvsp webhook] ${
      resultat._tag === 'traite'
        ? `usager ${resultat.action}`
        : `notification usager ignorée : ${resultat.raison}`
    }`,
  )
}
