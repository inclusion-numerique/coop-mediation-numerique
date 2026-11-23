import z from 'zod'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { valeursLues } from '@/libraries/parametres-d-url'

export type ActiviteSource = 'v1' | 'v2' | ''

const activiteSourceValues = [
  '',
  'v1',
  'v2',
] as const satisfies readonly ActiviteSource[]

const isoDayRegex = /^\d{4}-\d{2}-\d{2}$/

const booleanStringValues = ['0', '1'] as const

type BooleanString = (typeof booleanStringValues)[number]

const liste = <S extends z.ZodType<string, string>>(element: S) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((valeur) => [...valeursLues(element, valeur)])

export const ActivitesFilterValidations = {
  du: z.string().regex(isoDayRegex).optional(),
  au: z.string().regex(isoDayRegex).optional(),
  types: liste(z.string()).optional(),
  rdvs: liste(z.string()).optional(),
  mediateurs: liste(z.guid()).optional(),
  beneficiaires: liste(z.guid()).optional(),
  communes: liste(CodeInsee.schema).optional(),
  departements: liste(CodeDepartement.schema).optional(),
  lieux: liste(z.guid()).optional(),
  conseiller_numerique: z.enum(booleanStringValues).optional(),
  demarches_administratives: z.enum(booleanStringValues).optional(),
  thematiqueNonAdministratives: liste(z.string()).optional(),
  thematiqueAdministratives: liste(z.string()).optional(),
  tags: liste(z.guid()).optional(),
  structuresEmployeuses: liste(z.string().regex(/^\d+$/)).optional(),
  rdv: z.enum(booleanStringValues).optional(),
  source: z.enum(activiteSourceValues).optional(),
}

export type ActivitesFilters = {
  du?: string
  au?: string
  types?: string[]
  rdvs?: string[]
  mediateurs?: string[]
  beneficiaires?: string[]
  communes?: string[]
  departements?: string[]
  lieux?: string[]
  conseiller_numerique?: BooleanString
  demarches_administratives?: BooleanString
  thematiqueNonAdministratives?: string[]
  thematiqueAdministratives?: string[]
  tags?: string[]
  structuresEmployeuses?: string[]
  rdv?: BooleanString
  source?: ActiviteSource
}
