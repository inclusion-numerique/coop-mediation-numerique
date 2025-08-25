import {
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import {
  type RdvStatus,
  rdvStatusValues,
} from '@app/web/rdv-service-public/rdvStatus'
import { Thematique } from '@prisma/client'
import z from 'zod'
import {
  TypeActiviteSlug,
  typeActiviteSlugValues,
} from '../../cra/fields/type-activite'

const isoDayRegex = /^\d{4}-\d{2}-\d{2}$/

const booleanStringValues = ['0', '1'] as const

type BooleanString = (typeof booleanStringValues)[number]

export type RdvStatusFilterValue = RdvStatus | 'tous'

const rdvStatusEnum = z.enum(['tous', ...rdvStatusValues] satisfies [
  RdvStatusFilterValue,
  ...RdvStatusFilterValue[],
])

export const ActivitesFilterValidations = {
  du: z.string().regex(isoDayRegex).optional(),
  au: z.string().regex(isoDayRegex).optional(),
  types: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.enum(typeActiviteSlugValues)),
    ])
    .optional(),
  rdvs: z
    .union([
      z
        .string()
        .transform((val) =>
          val.split(',').map((id) => id.trim() as RdvStatusFilterValue),
        ),
      z.array(rdvStatusEnum),
    ])
    .optional(),
  mediateurs: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.string().uuid()),
    ])
    .optional(),
  beneficiaires: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.string().uuid()),
    ])
    .optional(),
  communes: z
    .union([
      z.string().transform((val) => val.split(',').map((val) => val.trim())),
      z.array(z.string().length(5)),
    ])
    .optional(),
  departements: z
    .union([
      z.string().transform((val) => val.split(',').map((val) => val.trim())),
      z.array(z.string().max(3)),
    ])
    .optional(),
  lieux: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.string().uuid()),
    ])
    .optional(),
  conseiller_numerique: z.enum(booleanStringValues).optional(),
  thematiqueNonAdministratives: z
    .union([
      z.string().transform((val) => val.split(',').map((item) => item.trim())),
      z.array(z.enum(thematiquesNonAdministrativesValues)),
    ])
    .optional(),
  thematiqueAdministratives: z
    .union([
      z
        .string()
        .transform((val) => val.split(',').map((iitem) => iitem.trim())),
      z.array(z.enum(thematiquesAdministrativesValues)),
    ])
    .optional(),
  tags: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.string().uuid()),
    ])
    .optional(),
  rdv: z.enum(booleanStringValues).optional(),
}

export type ActivitesFilters = {
  du?: string // Iso date e.g. '2022-01-01'
  au?: string // Iso date e.g. '2022-01-01'
  types?: TypeActiviteSlug[]
  rdvs?: RdvStatusFilterValue[]
  mediateurs?: string[] // UUID of mediateurs
  beneficiaires?: string[] // UUID of beneficiaires
  communes?: string[] // Code INSEE des communes
  departements?: string[] // Code INSEE des départements
  lieux?: string[] // UUID des lieux d’activités
  conseiller_numerique?: BooleanString // (0 = non, 1 = oui)
  thematiqueNonAdministratives?: Thematique[]
  thematiqueAdministratives?: Thematique[]
  tags?: string[]
  rdv?: BooleanString // 0 = non, 1 = oui, donera les activites avec un id externe RDVSP
}

/**
 * Validate and sanitize search params for activites
 * This is required as some values are used for queries and must be validated
 */
export const validateActivitesFilters = <T extends ActivitesFilters>(
  searchParams: T,
): T => {
  const result = { ...searchParams }

  for (const key of Object.keys(ActivitesFilterValidations)) {
    const typedKey = key as keyof ActivitesFilters
    if (!(typedKey in result)) {
      continue
    }

    const validatedFilterValue = ActivitesFilterValidations[typedKey].safeParse(
      result[typedKey],
    )

    if (
      validatedFilterValue.success &&
      validatedFilterValue.data !== undefined
    ) {
      result[typedKey] = validatedFilterValue.data as BooleanString &
        TypeActiviteSlug[] &
        RdvStatusFilterValue[] &
        Thematique[] &
        string[]
    } else {
      delete result[typedKey]
    }
  }

  return result
}
