import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { z } from 'zod'
import {
  STATUTS_DE_RENDEZ_VOUS,
  THEMATIQUES_ADMINISTRATIVES,
  THEMATIQUES_NON_ADMINISTRATIVES,
  TYPES_D_ACTIVITE,
} from './valeurs-des-filtres'

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
    types: listeDe(z.enum(TYPES_D_ACTIVITE)),
    rdvs: listeDe(z.enum(STATUTS_DE_RENDEZ_VOUS)),
    thematiqueNonAdministratives: listeDe(
      z.enum(THEMATIQUES_NON_ADMINISTRATIVES),
    ),
    thematiqueAdministratives: listeDe(z.enum(THEMATIQUES_ADMINISTRATIVES)),
  })
  .default({}) satisfies z.ZodType<ActivitesFilters>
