import { z } from 'zod'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '../filtres/parametres-de-la-barre'

type MediateurCoordonne = { readonly mediateurId: string }

export type DemandeurDeLExport = {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly mediateursCoordonnes: readonly MediateurCoordonne[]
    readonly ancienMediateursCoordonnes: readonly MediateurCoordonne[]
  } | null
}

const ExportValidation = z.object(ActivitesFilterValidations)

export const filtresDeLExport = (
  parametres: Readonly<Record<string, string>>,
): ActivitesFilters | null => {
  const lus = ExportValidation.safeParse(parametres)
  return lus.success ? lus.data : null
}

const idsDes = (mediateurs: readonly MediateurCoordonne[] = []) =>
  mediateurs.map(({ mediateurId }) => mediateurId)

export const exportInterdit = (
  { mediateur, coordinateur }: DemandeurDeLExport,
  mediateursExportes: readonly string[] | undefined,
): boolean => {
  if (mediateursExportes === undefined || !mediateur?.id) return false
  const autorises = [
    mediateur.id,
    ...idsDes(coordinateur?.mediateursCoordonnes),
    ...idsDes(coordinateur?.ancienMediateursCoordonnes),
  ]
  return !mediateursExportes.some((id) => autorises.includes(id))
}
