import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const EmployeuseId = defineModel(
  z.number().int().positive().brand('EmployeuseId'),
)

export type EmployeuseId = Model.TypeOf<typeof EmployeuseId>
