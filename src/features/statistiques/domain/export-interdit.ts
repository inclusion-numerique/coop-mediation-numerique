import type { MediateurId } from './mediateur-id'

export type DemandeurDeLExport =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | {
      readonly _tag: 'Coordinateur'
      readonly coordonnes: readonly MediateurId[]
    }
  | {
      readonly _tag: 'MediateurEtCoordinateur'
      readonly mediateurId: MediateurId
      readonly coordonnes: readonly MediateurId[]
    }

const mediateursAutorises = (
  demandeur: DemandeurDeLExport,
): readonly MediateurId[] => {
  if (demandeur._tag === 'Mediateur') return [demandeur.mediateurId]
  if (demandeur._tag === 'Coordinateur') return demandeur.coordonnes
  return [demandeur.mediateurId, ...demandeur.coordonnes]
}

export const exportInterdit = (
  demandeur: DemandeurDeLExport,
  mediateursExportes: readonly MediateurId[],
): boolean => {
  const autorises = mediateursAutorises(demandeur)
  return !mediateursExportes.every((id) => autorises.includes(id))
}
