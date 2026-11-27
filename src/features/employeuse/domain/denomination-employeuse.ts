import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const DenominationEmployeuse = defineModel(
  z.string().trim().min(1).brand('DenominationEmployeuse'),
)

export type DenominationEmployeuse = Model.TypeOf<typeof DenominationEmployeuse>
