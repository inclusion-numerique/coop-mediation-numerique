import { MediateurId } from '../../../../domain/mediateur-id'
import type { DemandeurDeLExport } from '../../domain/demandeur-de-l-export'

type MediateurCoordonne = { readonly mediateurId: string }

export type CompteDuDemandeur = {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly mediateursCoordonnes: readonly MediateurCoordonne[]
    readonly ancienMediateursCoordonnes: readonly MediateurCoordonne[]
  } | null
}

const coordonnesDe = ({
  mediateursCoordonnes,
  ancienMediateursCoordonnes,
}: NonNullable<CompteDuDemandeur['coordinateur']>): readonly MediateurId[] =>
  [...mediateursCoordonnes, ...ancienMediateursCoordonnes].map(
    ({ mediateurId }) => MediateurId(mediateurId),
  )

export const demandeurDeLExport = ({
  mediateur,
  coordinateur,
}: CompteDuDemandeur): DemandeurDeLExport | null => {
  if (mediateur !== null && coordinateur !== null)
    return {
      _tag: 'MediateurEtCoordinateur',
      mediateurId: MediateurId(mediateur.id),
      coordonnes: coordonnesDe(coordinateur),
    }
  if (mediateur !== null)
    return { _tag: 'Mediateur', mediateurId: MediateurId(mediateur.id) }
  if (coordinateur !== null)
    return { _tag: 'Coordinateur', coordonnes: coordonnesDe(coordinateur) }
  return null
}
