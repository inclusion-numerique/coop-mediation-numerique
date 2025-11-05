import z from 'zod'

const typeEvenementValues = [
  'GrandPublic',
  'National',
  'InclusionNumerique',
  'NecLocal',
  'Autre',
] as const

export type TypeEvenementValue = (typeof typeEvenementValues)[number]

const organisateursValues = [
  'MaStructure',
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

export type OrganisateursValue = (typeof organisateursValues)[number]

const echelonTerritorialValues = [
  'Communal',
  'Intercommunal',
  'Departemental',
  'Regional',
  'National',
] as const

export type EchelonTerritorialValue = (typeof echelonTerritorialValues)[number]

export const CraEvenementValidation = z
  .object({
    id: z.string().uuid().nullish(), // defined if update, nullish if create
    coordinateurId: z.string().uuid(), // owner of the CRA
    date: z
      .string({ required_error: 'Veuillez renseigner une date' })
      .date('Veuillez renseigner une date valide'),
    participants: z.coerce
      .number()
      .int({ message: 'Veuillez renseigner un nombre entier' })
      .min(0, 'Le nombre de participants doit être positif'),
    nom: z.string().nullish(),
    typeEvenement: z.enum(typeEvenementValues, {
      required_error: 'Veuillez renseigner un type d’événement',
    }),
    typeEvenementAutre: z.string().nullish(),
    organisateurs: z
      .array(z.enum(organisateursValues), {
        required_error: 'Veuillez renseigner au moins un organisateur',
      })
      .min(1, 'Veuillez renseigner au moins un organisateur'),
    organisateurAutre: z.string().nullish(),
    echelonTerritorial: z.enum(echelonTerritorialValues).nullish(),
    tags: z.array(z.object({ id: z.string().uuid() })).default([]),
    notes: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.typeEvenement === 'Autre' && !data.typeEvenementAutre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typeEvenementAutre'],
        message: 'Veuillez préciser le type d’événement',
      })
    }

    if (
      data.organisateurs.includes('Autre') &&
      !data.organisateurAutre?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['organisateurAutre'],
        message: 'Veuillez préciser l’organisateur',
      })
    }
  })

export type CraEvenementData = z.infer<typeof CraEvenementValidation>
