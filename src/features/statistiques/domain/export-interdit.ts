type MediateurCoordonne = { readonly mediateurId: string }

export type DemandeurDeLExport = {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly mediateursCoordonnes: readonly MediateurCoordonne[]
    readonly ancienMediateursCoordonnes: readonly MediateurCoordonne[]
  } | null
}

const idsDes = (mediateurs: readonly MediateurCoordonne[] = []) =>
  mediateurs.map(({ mediateurId }) => mediateurId)

export const exportInterdit = (
  { mediateur, coordinateur }: DemandeurDeLExport,
  mediateursExportes: readonly string[] | undefined,
): boolean => {
  if (mediateursExportes === undefined) return false
  const autorises = [
    ...(mediateur ? [mediateur.id] : []),
    ...idsDes(coordinateur?.mediateursCoordonnes),
    ...idsDes(coordinateur?.ancienMediateursCoordonnes),
  ]
  return !mediateursExportes.every((id) => autorises.includes(id))
}
