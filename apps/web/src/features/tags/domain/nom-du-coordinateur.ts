import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDuCoordinateur = defineModel(
  z.string().trim().min(1).brand('NomDuCoordinateur'),
)

export type NomDuCoordinateur = Model.TypeOf<typeof NomDuCoordinateur>
