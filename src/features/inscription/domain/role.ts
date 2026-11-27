import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const roles = ['Mediateur', 'Coordinateur'] as const

export const Role = defineModel(z.enum(roles).brand('Role'))

export type Role = Model.TypeOf<typeof Role>
