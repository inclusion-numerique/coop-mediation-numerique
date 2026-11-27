import type { Result } from '@/libraries/result'
import type { EchecDeRecevoirWebhookRdv } from './errors'
import type { WebhookRdvTraite } from './recevoir-webhook-rdv'

const raisonDeLEchec: Record<EchecDeRecevoirWebhookRdv['_tag'], string> = {
  PayloadInexploitable: 'payloadInexploitable',
  AucunAgent: 'aucunAgent',
}

const messageDuTraitement = (traitement: WebhookRdvTraite): string => {
  if (traitement._tag === 'ignore') {
    return `notification ignorée : ${traitement.raison}`
  }

  return traitement._tag === 'enregistre' &&
    traitement.rapprochement._tag === 'echoue'
    ? `rendez-vous enregistre, merge bénéficiaires échoué (non bloquant) : ${traitement.rapprochement.message}`
    : `rendez-vous ${traitement._tag}`
}

export const messageDuWebhookRdv = (
  resultat: Result<WebhookRdvTraite, EchecDeRecevoirWebhookRdv>,
): string =>
  resultat.success
    ? messageDuTraitement(resultat.data)
    : `notification ignorée : ${raisonDeLEchec[resultat.error._tag]}`
