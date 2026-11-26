import { z } from 'zod'

const LieuActiviteInputValidation = z.object({
  id: z.guid().nullish(),
  structureCartographieNationaleId: z.string().nullish(),
  nom: z.string().min(1, 'Veuillez renseigner le nom du lieu'),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit comporter 14 chiffres')
    .nullish(),
  adresse: z.string().min(1, 'Veuillez renseigner une adresse'),
  commune: z.string().min(1),
  codePostal: z.string().min(1),
  codeInsee: z.string().nullish(),
  banId: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
})

export const RenseignerLieuxActiviteValidation = z.object({
  lieux: z
    .array(LieuActiviteInputValidation, {
      error: 'Veuillez renseigner au moins un lieu d’activité',
    })
    .min(1, 'Veuillez renseigner au moins un lieu d’activité'),
})

export type RenseignerLieuxActiviteData = z.infer<
  typeof RenseignerLieuxActiviteValidation
>
