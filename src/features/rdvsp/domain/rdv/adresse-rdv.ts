import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AdresseRdv = defineModel(
  z.string().trim().min(1).brand('AdresseRdv'),
)

export type AdresseRdv = Model.TypeOf<typeof AdresseRdv>
