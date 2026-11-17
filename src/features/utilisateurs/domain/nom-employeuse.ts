import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NomEmployeuse = defineModel(
  z.string().trim().min(1).brand('NomEmployeuse'),
)

export type NomEmployeuse = Model.TypeOf<typeof NomEmployeuse>
