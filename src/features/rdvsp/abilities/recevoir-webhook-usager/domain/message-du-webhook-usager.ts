import type { Result } from '@/libraries/result'
import type { EchecDeRecevoirWebhookUsager } from './errors'
import type { WebhookUsagerTraite } from './webhook-usager-traite'

const messageDuTraitement = (traitement: WebhookUsagerTraite): string =>
  traitement._tag === 'ignore'
    ? `notification usager ignorée : ${traitement.raison}`
    : `usager ${traitement._tag}`

export const messageDuWebhookUsager = (
  resultat: Result<WebhookUsagerTraite, EchecDeRecevoirWebhookUsager>,
): string =>
  resultat.success
    ? messageDuTraitement(resultat.data)
    : 'notification usager ignorée : payloadInexploitable'
