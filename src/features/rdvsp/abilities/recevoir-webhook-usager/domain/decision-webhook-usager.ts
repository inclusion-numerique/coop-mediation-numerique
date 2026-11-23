import type { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'

/**
 * Bénéficiaire de La Coop rattaché à l'usager notifié. L'identifiant est
 * convoyé, jamais interprété : son sens appartient à la feature bénéficiaire.
 */
export type BeneficiaireLie = {
  readonly id: string
}

export type DecisionWebhookUsager =
  | { readonly _tag: 'ignorer'; readonly raison: RaisonIgnoreUsager }
  | { readonly _tag: 'mettreAJour' }
  | { readonly _tag: 'anonymiserEtSupprimer' }

type RaisonIgnoreUsager = 'creationDeferee' | 'usagerNonSuivi'

/**
 * Que faire d'une notification portant sur un usager.
 *
 * Une création n'est jamais suivie d'effet. Un usager que RDV Service Public
 * vient de créer n'est encore rattaché à aucun rendez-vous, donc à aucun
 * médiateur : La Coop n'aurait aucun moyen de décider à qui il appartient. Il
 * entrera par la synchronisation, quand le contexte sera là.
 *
 * Une mise à jour n'est appliquée que si l'usager est déjà rattaché à un
 * bénéficiaire. Autrement dit, La Coop ne tient à jour que ce qu'elle a des
 * raisons de détenir.
 *
 * Une suppression, elle, s'applique toujours : c'est un effacement demandé chez
 * le tiers, et les fiches qui en descendent doivent suivre.
 */
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
