import type { RdvId } from '../../../domain/rdv-id'

/**
 * Le rendez-vous existe mais relève d'un autre compte RDV Service Public. Même
 * distinction que pour la mise à jour de statut : on ne confond pas un
 * rendez-vous inconnu avec celui d'un collègue.
 */
export type RdvNonAutorise = {
  readonly _tag: 'RdvNonAutorise'
  readonly rdvId: RdvId
}

export const RdvNonAutorise = (rdvId: RdvId): RdvNonAutorise => ({
  _tag: 'RdvNonAutorise',
  rdvId,
})
