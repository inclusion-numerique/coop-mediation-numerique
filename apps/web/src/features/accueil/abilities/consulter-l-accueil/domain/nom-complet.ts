import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomComplet = defineModel(
  z.string().trim().min(1).brand('NomComplet'),
)

export type NomComplet = Model.TypeOf<typeof NomComplet>
