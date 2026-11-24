import { z } from 'zod'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '../../domain/filtres-des-activites'

const ExportValidation = z.object(ActivitesFilterValidations)

export const filtresDeLExport = (
  parametres: Readonly<Record<string, string>>,
): ActivitesFilters | null => {
  const lus = ExportValidation.safeParse(parametres)
  return lus.success ? lus.data : null
}
