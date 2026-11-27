import type { Rdv } from '../../../domain/rdv/rdv'
import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'

export type RdvConnu = {
  readonly rdv: Rdv
  readonly compteRenduRegle: boolean
}

export type RaisonIgnore =
  | 'dejaSupprime'
  | 'horsFenetreDeSynchronisation'
  | 'reglageDuCompteRenduPreserve'

export type DecisionWebhookRdv =
  | { readonly _tag: 'enregistrer' }
  | { readonly _tag: 'supprimer' }
  | { readonly _tag: 'ignorer'; readonly raison: RaisonIgnore }

const webhookRdvModifie = (connu: Rdv, recu: Rdv): boolean =>
  connu.statutPresence !== recu.statutPresence ||
  connu.duree !== recu.duree ||
  (connu.collectif ? connu.nom : null) !== (recu.collectif ? recu.nom : null) ||
  connu.debut.getTime() !== recu.debut.getTime() ||
  connu.fin.getTime() !== recu.fin.getTime() ||
  connu.organisationId !== recu.organisationId ||
  (connu.motif?.id ?? null) !== (recu.motif?.id ?? null) ||
  (connu.lieu?.id ?? null) !== (recu.lieu?.id ?? null)

export const decisionPourWebhookRdv = ({
  evenement,
  recu,
  connu,
  synchroniserDepuis,
}: {
  evenement: EvenementWebhook
  recu: Rdv
  connu: RdvConnu | null
  synchroniserDepuis: Date | null
}): DecisionWebhookRdv => {
  if (evenement === 'destroyed') {
    return connu === null
      ? { _tag: 'ignorer', raison: 'dejaSupprime' }
      : { _tag: 'supprimer' }
  }

  if (synchroniserDepuis !== null && recu.debut < synchroniserDepuis) {
    return connu === null
      ? { _tag: 'ignorer', raison: 'horsFenetreDeSynchronisation' }
      : { _tag: 'supprimer' }
  }

  if (
    connu !== null &&
    connu.compteRenduRegle &&
    !webhookRdvModifie(connu.rdv, recu)
  ) {
    return { _tag: 'ignorer', raison: 'reglageDuCompteRenduPreserve' }
  }

  return { _tag: 'enregistrer' }
}
