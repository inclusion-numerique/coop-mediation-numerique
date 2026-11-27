import type { MediateurId } from '../../../domain'

export type CourrielDuMediateurIllisible = {
  readonly _tag: 'CourrielDuMediateurIllisible'
  readonly mediateurId: MediateurId
}

export const CourrielDuMediateurIllisible = (
  mediateurId: MediateurId,
): CourrielDuMediateurIllisible => ({
  _tag: 'CourrielDuMediateurIllisible',
  mediateurId,
})

export type EchecDeAccepterLesInvitationsEnAttente =
  CourrielDuMediateurIllisible
