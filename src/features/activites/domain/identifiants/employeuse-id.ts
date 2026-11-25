import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const EmployeuseId = defineModel(
  z.number().int().positive().brand('EmployeuseId'),
)

export type EmployeuseId = Model.TypeOf<typeof EmployeuseId>

export const EmployeuseIdTextuel = z.coerce.number().pipe(EmployeuseId.schema)
