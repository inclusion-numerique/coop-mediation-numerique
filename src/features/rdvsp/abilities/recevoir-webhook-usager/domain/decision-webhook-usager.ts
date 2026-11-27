import type { BeneficiaireId } from '../../../domain/identifiants/beneficiaire-id'
import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'

export type BeneficiaireLie = {
  readonly id: BeneficiaireId
}

export type DecisionWebhookUsager =
  | { readonly _tag: 'ignorer'; readonly raison: RaisonIgnoreUsager }
  | { readonly _tag: 'mettreAJour' }
  | { readonly _tag: 'anonymiserEtSupprimer' }

export type RaisonIgnoreUsager = 'creationDeferee' | 'usagerNonSuivi'

export const decisionPourWebhookUsager = ({
  evenement,
  beneficiairesLies,
}: {
  evenement: EvenementWebhook
  beneficiairesLies: readonly BeneficiaireLie[]
}): DecisionWebhookUsager => {
  if (evenement === 'created') {
    return { _tag: 'ignorer', raison: 'creationDeferee' }
  }

  if (evenement === 'destroyed') {
    return { _tag: 'anonymiserEtSupprimer' }
  }

  return beneficiairesLies.length === 0
    ? { _tag: 'ignorer', raison: 'usagerNonSuivi' }
    : { _tag: 'mettreAJour' }
}
