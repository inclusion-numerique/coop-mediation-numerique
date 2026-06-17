import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Une commune de résidence est toujours complète (commune + code postal + code
 * INSEE). L'absence de commune se modélise par `CommuneResidence | null` au
 * niveau du champ, pas par une valeur du value object : le constructeur est
 * donc strict. La normalisation « champs incomplets → null » est une affaire de
 * frontière (formulaire, base).
 */
export const CommuneResidence = defineModel(
  z
    .object({
      commune: z.string().trim().min(1),
      codePostal: z.string().trim().min(1),
      codeInsee: z.string().trim().min(1),
      adresse: z.string().trim().min(1).optional(),
    })
    .brand('CommuneResidence'),
)

export type CommuneResidence = Model.TypeOf<typeof CommuneResidence>
