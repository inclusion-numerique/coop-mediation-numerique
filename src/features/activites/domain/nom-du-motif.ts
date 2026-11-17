import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDuMotif = defineModel(
  z.string().trim().min(1).brand('NomDuMotif'),
)

export type NomDuMotif = Model.TypeOf<typeof NomDuMotif>
