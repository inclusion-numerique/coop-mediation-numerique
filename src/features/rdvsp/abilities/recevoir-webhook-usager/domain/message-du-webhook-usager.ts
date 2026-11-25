import type { ResultatWebhookUsager } from './recevoir-webhook-usager'

export const messageDuWebhookUsager = (
  resultat: ResultatWebhookUsager,
): string =>
  resultat._tag === 'traite'
    ? `usager ${resultat.action}`
    : `notification usager ignorée : ${resultat.raison}`
