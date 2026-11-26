import { z } from 'zod'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'

export const AdresseEmployeuse = defineModel(
  z
    .object({
      voie: z
        .string()
        .trim()
        .min(1)
        .nullish()
        .transform((value) => value ?? null),
      codePostal: CodePostal.schema,
      codeInsee: CodeInsee.schema,
      commune: z.string().trim().min(1),
    })
    .brand('AdresseEmployeuse'),
)

export type AdresseEmployeuse = Model.TypeOf<typeof AdresseEmployeuse>
