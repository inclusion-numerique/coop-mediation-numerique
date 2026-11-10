import { z } from 'zod'

const LieuAAjouterValidation = z.object({
  id: z.guid().nullish(),
  structureCartographieNationaleId: z.string().nullish(),
  nom: z.string().trim().min(1, 'Le lieu doit porter un nom'),
  siret: z.string().nullish(),
  adresse: z.string().trim().min(1, 'Le lieu doit porter une adresse'),
  commune: z.string().trim().min(1, 'Le lieu doit porter une commune'),
  codePostal: z.string().trim().min(1, 'Le lieu doit porter un code postal'),
  codeInsee: z.string().nullish(),
  banId: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
})

export const LieuxAAjouterValidation = z.object({
  lieux: z
    .array(LieuAAjouterValidation)
    .min(1, 'Veuillez sélectionner au moins un lieu d’activité'),
})

export type LieuxAAjouterData = z.infer<typeof LieuxAAjouterValidation>
