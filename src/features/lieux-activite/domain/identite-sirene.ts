import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomUsage = defineModel(z.string().trim().min(1).brand('NomUsage'))

export type NomUsage = Model.TypeOf<typeof NomUsage>

export type IdentiteSirene = {
  readonly nomUsage: NomUsage | null
  readonly synchronisation: Date | null
}
