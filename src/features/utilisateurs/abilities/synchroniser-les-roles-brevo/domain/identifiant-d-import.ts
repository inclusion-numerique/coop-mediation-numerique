import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const IdentifiantDImport = defineModel(
  z.number().int().positive().brand('IdentifiantDImport'),
)

export type IdentifiantDImport = Model.TypeOf<typeof IdentifiantDImport>
