import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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
