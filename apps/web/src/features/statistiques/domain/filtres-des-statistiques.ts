import {
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/ui/libelles/thematique'
import {
  TypeActiviteSlug,
  typeActiviteSlugValues,
} from '@app/web/features/activites/ui/libelles/type-activite'
import {
  type RdvStatus,
  rdvStatusValues,
} from '@app/web/features/rdvsp/ui/rdv-status'
import {
  type ActiviteSource,
  activiteSourceValues,
} from '@app/web/features/statistiques/ui/filtres/source'
import { Thematique } from '@app/web/generated/prisma/browser'
import { CodeDepartement, CodeInsee } from '@app/web/libraries/insee'
import { valeursLues } from '@app/web/libraries/parametres-d-url'
import z from 'zod'

const isoDayRegex = /^\d{4}-\d{2}-\d{2}$/

const booleanStringValues = ['0', '1'] as const

type BooleanString = (typeof booleanStringValues)[number]

export type RdvStatusFilterValue = RdvStatus

const rdvStatusEnum = z.enum(
  rdvStatusValues satisfies [RdvStatusFilterValue, ...RdvStatusFilterValue[]],
)

const liste = <S extends z.ZodType>(element: S) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((valeur) => [...valeursLues(element, valeur)])

export const ActivitesFilterValidations = {
  du: z.string().regex(isoDayRegex).optional(),
  au: z.string().regex(isoDayRegex).optional(),
  types: liste(z.enum(typeActiviteSlugValues)).optional(),
  rdvs: liste(rdvStatusEnum).optional(),
  mediateurs: liste(z.guid()).optional(),
  beneficiaires: liste(z.guid()).optional(),
  communes: liste(CodeInsee.schema).optional(),
  departements: liste(CodeDepartement.schema).optional(),
  lieux: liste(z.guid()).optional(),
  conseiller_numerique: z.enum(booleanStringValues).optional(),
  demarches_administratives: z.enum(booleanStringValues).optional(),
  thematiqueNonAdministratives: liste(
    z.enum(thematiquesNonAdministrativesValues),
  ).optional(),
  thematiqueAdministratives: liste(
    z.enum(thematiquesAdministrativesValues),
  ).optional(),
  tags: liste(z.guid()).optional(),
  structuresEmployeuses: liste(z.string().regex(/^\d+$/)).optional(),
  rdv: z.enum(booleanStringValues).optional(),
  source: z.enum(activiteSourceValues).optional(),
}

export type ActivitesFilters = {
  du?: string
  au?: string
  types?: TypeActiviteSlug[]
  rdvs?: RdvStatusFilterValue[]
  mediateurs?: string[]
  beneficiaires?: string[]
  communes?: string[]
  departements?: string[]
  lieux?: string[]
  conseiller_numerique?: BooleanString
  demarches_administratives?: BooleanString
  thematiqueNonAdministratives?: Thematique[]
  thematiqueAdministratives?: Thematique[]
  tags?: string[]
  structuresEmployeuses?: string[]
  rdv?: BooleanString
  source?: ActiviteSource
}

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
        string[] &
        ActiviteSource
    } else {
      delete result[typedKey]
    }
  }

  return result
}
