import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomUsage = defineModel(z.string().trim().min(1).brand('NomUsage'))

export type NomUsage = Model.TypeOf<typeof NomUsage>

export type IdentiteSirene = {
  readonly nomUsage: NomUsage | null
  readonly synchronisation: Date | null
}
