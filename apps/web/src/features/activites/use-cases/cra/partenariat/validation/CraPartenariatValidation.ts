import z from 'zod'

const natureValues = [
  'ParcoursUsager',
  'Subvention',
  'CoordinationDepartementale',
  'RDVElu',
  'Autre',
] as const

export type NaturePartenariatValue = (typeof natureValues)[number]

const echelonTerritorialValues = [
  'Communal',
  'Intercommunal',
  'Departemental',
  'Regional',
  'National',
] as const

export type EchelonTerritorialValue = (typeof echelonTerritorialValues)[number]

const typeStructurePartenairesValues = [
  'Commune',
  'Epci',
  'Departement',
  'Region',
  'Association',
  'Entreprise',
  'Hub',
  'Etat',
  'Groupement',
  'Autre',
] as const

export type TypeStructurePartenairesValue =
  (typeof typeStructurePartenairesValues)[number]

export const CraPartenariatValidation = z
  .object({
    id: z.string().uuid().nullish(), // defined if update, nullish if create
    coordinateurId: z.string().uuid(), // owner of the CRA
    date: z
      .string({ required_error: 'Veuillez renseigner une date' })
      .date('Veuillez renseigner une date valide'),
    nom: z.string().nullish(),
    naturePartenariat: z
      .array(z.enum(natureValues), {
        required_error:
          'Veuillez renseigner au moins une nature de partenariat',
      })
      .min(1, 'Veuillez renseigner au moins une nature de partenariat'),
    naturePartenariatAutre: z.string().nullish(),
    echelonTerritorial: z.enum(echelonTerritorialValues).nullish(),
    structuresPartenaires: z
      .array(
        z.object({
          nom: z.string({
            required_error:
              'Veuillez renseigner le nom de la structure partenaire',
          }),
          type: z.enum(typeStructurePartenairesValues, {
            required_error:
              'Veuillez renseigner le type de la structure partenaire',
          }),
          typeAutre: z.string().nullish(),
        }),
      )
      .min(1, 'Au moins une structure partenaire est requise'),
    tags: z.array(z.object({ id: z.string().uuid() })).default([]),
    notes: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.naturePartenariat.includes('Autre') &&
      !data.naturePartenariatAutre?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['natureAutre'],
        message: 'Veuillez préciser la nature de l’événement',
      })
    }

    data.structuresPartenaires.forEach((structure, index) => {
      if (structure.type === 'Autre' && !structure.typeAutre?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['structuresPartenaires', index, 'typeAutre'],
          message: 'Veuillez préciser le type de structure',
        })
      }
    })
  })

export type CraPartenariatData = z.infer<typeof CraPartenariatValidation>
