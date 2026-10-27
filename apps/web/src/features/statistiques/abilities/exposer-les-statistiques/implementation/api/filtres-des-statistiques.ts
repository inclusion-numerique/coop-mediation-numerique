import {
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { typeActiviteSlugValues } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { z } from 'zod'

const listeDe = <Element extends z.ZodType<string, string>>(element: Element) =>
  z
    .union([
      z.string().transform((val) => val.split(',').map((item) => item.trim())),
      z.array(z.string()),
    ])
    .pipe(z.array(element))
    .optional()

export const FiltresDesStatistiquesValidation = z
  .object({
    ...ActivitesFilterValidations,
    types: listeDe(z.enum(typeActiviteSlugValues)),
    thematiqueNonAdministratives: listeDe(
      z.enum(thematiquesNonAdministrativesValues),
    ),
    thematiqueAdministratives: listeDe(
      z.enum(thematiquesAdministrativesValues),
    ),
  })
  .default({}) satisfies z.ZodType<ActivitesFilters>
