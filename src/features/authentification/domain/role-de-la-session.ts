import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const RoleDeLaSession = defineModel(
  z.enum(['User', 'Admin']).brand('RoleDeLaSession'),
)

export type RoleDeLaSession = Model.TypeOf<typeof RoleDeLaSession>
