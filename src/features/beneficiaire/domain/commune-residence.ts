import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const withoutSpaces = (value: string) => value.replace(/\s/g, '')

export const CommuneResidence = defineModel(
  z
    .object({
      commune: z.string().trim().min(1),
      codePostal: z.string().trim().min(1).transform(withoutSpaces),
      codeInsee: z.string().trim().min(1).transform(withoutSpaces),
      adresse: z.string().trim().min(1).optional(),
    })
    .brand('CommuneResidence'),
)

export type CommuneResidence = Model.TypeOf<typeof CommuneResidence>
