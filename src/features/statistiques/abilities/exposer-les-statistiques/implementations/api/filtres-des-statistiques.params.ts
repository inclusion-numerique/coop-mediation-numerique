import { z } from 'zod'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  STATUTS_DE_RENDEZ_VOUS,
  THEMATIQUES_ADMINISTRATIVES,
  THEMATIQUES_NON_ADMINISTRATIVES,
  TYPES_D_ACTIVITE,
} from './valeurs-des-filtres.params'

const JOUR = /^\d{4}-\d{2}-\d{2}$/

const UN_OU_ZERO = ['0', '1'] as const

const valeursLues = <S extends z.ZodType>(
  schema: S,
  valeur: string | readonly string[],
): readonly z.output<S>[] =>
  [valeur]
    .flat()
    .flatMap((liste) => liste.split(','))
    .map((element) => element.trim())
    .filter((element) => element !== '')
    .flatMap((element) => {
      const lue = schema.safeParse(element)
      return lue.success ? [lue.data] : []
    })

const liste = <S extends z.ZodType<string, string>>(element: S) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((valeur) => [...valeursLues(element, valeur)])

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
    du: z.string().regex(JOUR).optional(),
    au: z.string().regex(JOUR).optional(),
    mediateurs: liste(z.guid()).optional(),
    beneficiaires: liste(z.guid()).optional(),
    communes: liste(CodeInsee.schema).optional(),
    departements: liste(CodeDepartement.schema).optional(),
    lieux: liste(z.guid()).optional(),
    conseiller_numerique: z.enum(UN_OU_ZERO).optional(),
    demarches_administratives: z.enum(UN_OU_ZERO).optional(),
    tags: liste(z.guid()).optional(),
    structuresEmployeuses: liste(z.string().regex(/^\d+$/)).optional(),
    rdv: z.enum(UN_OU_ZERO).optional(),
    source: z.enum(['', 'v1', 'v2']).optional(),
    types: listeDe(z.enum(TYPES_D_ACTIVITE)),
    rdvs: listeDe(z.enum(STATUTS_DE_RENDEZ_VOUS)),
    thematiqueNonAdministratives: listeDe(
      z.enum(THEMATIQUES_NON_ADMINISTRATIVES),
    ),
    thematiqueAdministratives: listeDe(z.enum(THEMATIQUES_ADMINISTRATIVES)),
  })
  .default({})
