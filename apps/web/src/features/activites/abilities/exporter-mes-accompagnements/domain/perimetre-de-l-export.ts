import type { CoordinateurId, MediateurId } from '../../../domain'

export type Demandeur = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
  readonly equipe: readonly MediateurId[]
}

export const mediateursAutorises = ({
  mediateurId,
  equipe,
}: Demandeur): readonly MediateurId[] => [
  ...(mediateurId === null ? [] : [mediateurId]),
  ...equipe,
]

export const perimetreDeLExport = (
  autorises: readonly MediateurId[],
  filtre: readonly MediateurId[],
): readonly MediateurId[] =>
  filtre.length === 0
    ? autorises
    : autorises.filter((mediateurId) => filtre.includes(mediateurId))

export const estUnExportPersonnel = (
  { mediateurId }: Demandeur,
  autorises: readonly MediateurId[],
): boolean =>
  mediateurId !== null &&
  autorises.length === 1 &&
  autorises.includes(mediateurId)
