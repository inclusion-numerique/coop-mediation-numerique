import { z } from 'zod'

/**
 * Filtres d'export lus depuis la query string. La liste des bénéficiaires ne
 * supporte qu'une recherche libre (cf. `ExportBeneficiairesFilters`).
 */
export const ExportBeneficiairesFilterValidations = z.object({
  recherche: z.string().optional(),
})
