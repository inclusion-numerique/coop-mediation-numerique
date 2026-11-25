import type { ResultatWebhookRdv } from './recevoir-webhook-rdv'

export const messageDuWebhookRdv = (resultat: ResultatWebhookRdv): string =>
  resultat._tag === 'traite'
    ? `rendez-vous ${resultat.action}`
    : `notification ignorée : ${resultat.raison}`
