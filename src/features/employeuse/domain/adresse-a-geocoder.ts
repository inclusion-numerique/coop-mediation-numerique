import { z } from 'zod'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'

export const AdresseAGeocoder = defineModel(
  z
    .object({
      voie: z
        .string()
        .trim()
        .nullish()
        .transform((value) => value || null),
      commune: z.string().trim().min(1),
      codePostal: CodePostal.schema
        .nullish()
        .transform((value) => value ?? null),
      codeInsee: CodeInsee.schema.nullish().transform((value) => value ?? null),
    })
    .brand('AdresseAGeocoder'),
)

export type AdresseAGeocoder = Model.TypeOf<typeof AdresseAGeocoder>
