import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const IdentifiantDImport = defineModel(
  z.number().int().positive().brand('IdentifiantDImport'),
)

export type IdentifiantDImport = Model.TypeOf<typeof IdentifiantDImport>
