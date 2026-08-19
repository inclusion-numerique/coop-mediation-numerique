import type { RdvId } from '../../../domain/rdv-id'

/**
 * Le rendez-vous existe mais relève d'un autre compte RDV Service Public.
 *
 * Distinct de `RdvIntrouvable` à dessein : ici La Coop connaît le rendez-vous et
 * refuse d'agir dessus, là elle ne le connaît pas. Les confondre reviendrait à
 * laisser un médiateur sonder l'existence des rendez-vous de ses collègues.
 */
export type RdvNonAutorise = {
  readonly _tag: 'RdvNonAutorise'
  readonly rdvId: RdvId
}

export const RdvNonAutorise = (rdvId: RdvId): RdvNonAutorise => ({
  _tag: 'RdvNonAutorise',
  rdvId,
})
