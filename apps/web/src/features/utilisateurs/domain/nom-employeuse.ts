import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomEmployeuse = defineModel(
  z.string().trim().min(1).brand('NomEmployeuse'),
)

export type NomEmployeuse = Model.TypeOf<typeof NomEmployeuse>
